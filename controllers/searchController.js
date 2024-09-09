const parseNumber = require("../utils/parseNumber");
const Contacts_V5 = require("../models/Contacts");
const SavedItem = require("../models/SavedItem");

const searchController = {
  search: async (req, res) => {
    try {
      const userId = req.user.userId;

      const { filters = {}, excludedFilters = {} } = req.body;

      const query = {};
      const limit = filters.limit || 25;
      const page = filters.currentPage || 1;
      const viewType = filters.viewType || "total";

      let results = [];
      const counts = { total: "63M", new: 0, saved: 0 };
      const conditions = [];
      const exclusionConditions = [];

      const addCondition = (field, operator, values) => {
        if (values && values.length > 0) {
          conditions.push({ [field]: { [operator]: values } });
        }
      };

      const addExclusionCondition = (field, operator, values) => {
        if (values && values.length > 0) {
          exclusionConditions.push({ [field]: { [operator]: values } });
        }
      };

      // Apply filters
      // location country
      if (Array.isArray(filters.countries)) {
        addCondition(
          "_source.person_location_country",
          "$in",
          filters.countries
        );
      }

      if (Array.isArray(excludedFilters.countries)) {
        addExclusionCondition(
          "_source.person_location_country",
          "$nin",
          excludedFilters.countries
        );
      }

      // job title
      if (Array.isArray(filters.jobTitle)) {
        addCondition("_source.person_title", "$in", filters.jobTitle);
      }

      if (Array.isArray(excludedFilters.jobTitle)) {
        addExclusionCondition(
          "_source.person_title",
          "$nin",
          excludedFilters.jobTitle
        );
      }

      // seniority
      if (Array.isArray(filters.seniority)) {
        addCondition(
          "_source.person_seniority",
          "$in",
          filters.seniority.map((s) => s.toLowerCase())
        );
      }

      if (Array.isArray(excludedFilters.seniority)) {
        addExclusionCondition(
          "_source.person_seniority",
          "$nin",
          excludedFilters.seniority.map((s) => s.toLowerCase())
        );
      }

      // industry
      if (Array.isArray(filters.industry)) {
        addCondition(
          "_source.organization_industries",
          "$in",
          filters.industry.map((i) => i.toLowerCase())
        );
      }

      if (Array.isArray(excludedFilters.industry)) {
        addExclusionCondition(
          "_source.organization_industries",
          "$nin",
          excludedFilters.industry.map((i) => i.toLowerCase())
        );
      }

      // email status
      if (Array.isArray(filters.emailStatus)) {
        addCondition(
          "_source.person_email_status_cd",
          "$in",
          filters.emailStatus
        );
      }

      if (Array.isArray(excludedFilters.emailStatus)) {
        addExclusionCondition(
          "_source.person_email_status_cd",
          "$nin",
          excludedFilters.emailStatus
        );
      }

      // person name
      if (Array.isArray(filters.personName)) {
        addCondition("_source.person_name", "$in", filters.personName);
      }

      if (Array.isArray(excludedFilters.personName)) {
        addExclusionCondition(
          "_source.person_name",
          "$nin",
          excludedFilters.personName
        );
      }

      // Handle ranges for employees and revenue
      const handleRange = (field, ranges) => {
        return ranges
          .map((range) => {
            const [minStr, maxStr] = range
              .replace(/and/g, "-")
              .split("-")
              .map((s) => s.trim());
            const min = parseNumber(minStr);
            const max = parseNumber(maxStr);
            if (isNaN(min)) return null;
            return isNaN(max)
              ? { [field]: { $gte: min } }
              : { [field]: { $gte: min, $lte: max } };
          })
          .filter(Boolean);
      };

      const handleExclusionRange = (field, ranges) => {
        return ranges
          .map((range) => {
            const [minStr, maxStr] = range
              .replace(/and/g, "-")
              .split("-")
              .map((s) => s.trim());
            const min = parseNumber(minStr);
            const max = parseNumber(maxStr);

            if (isNaN(min)) return null;
            if (isNaN(max)) {
              return {
                $or: [{ [field]: { $lt: min } }, { [field]: { $gt: min } }],
              };
            }
            return {
              $or: [{ [field]: { $lt: min } }, { [field]: { $gt: max } }],
            };
          })
          .filter(Boolean);
      };

      if (
        Array.isArray(filters.employeeRange) &&
        filters.employeeRange.length > 0
      ) {
        conditions.push({
          $or: handleRange(
            "_source.organization_num_current_employees",
            filters.employeeRange
          ),
        });
      }

      if (
        Array.isArray(excludedFilters.employeeRange) &&
        excludedFilters.employeeRange.length > 0
      ) {
        exclusionConditions.push({
          $or: handleExclusionRange(
            "_source.organization_num_current_employees",
            excludedFilters.employeeRange
          ),
        });
      }

      // Applying revenue range filters similarly
      if (
        Array.isArray(filters.revenueRange) &&
        filters.revenueRange.length > 0
      ) {
        conditions.push({
          $or: handleRange(
            "_source.organization_revenue_in_thousands_int",
            filters.revenueRange
          ),
        });
      }

      if (
        Array.isArray(excludedFilters.revenueRange) &&
        excludedFilters.revenueRange.length > 0
      ) {
        exclusionConditions.push({
          $or: handleExclusionRange(
            "_source.organization_revenue_in_thousands_int",
            excludedFilters.revenueRange
          ),
        });
      }

      // Email Type Filter
      if (Array.isArray(filters.emailType) && filters.emailType.length > 0) {
        const regexConditions = filters.emailType.map((ext) => ({
          "_source.person_email": { $regex: `${ext}$`, $options: "i" },
        }));

        // Use $or to match any of the provided email extensions
        conditions.push({ $or: regexConditions });
      }

      // Email Type Exclusion Filter
      if (
        Array.isArray(excludedFilters.emailType) &&
        excludedFilters.emailType.length > 0
      ) {
        const emailTypeExclusions = excludedFilters.emailType.map((ext) => ({
          "_source.person_email": { $not: new RegExp(`${ext}$`, "i") },
        }));

        // Use $and with exclusion conditions to ensure all are excluded
        exclusionConditions.push({ $and: emailTypeExclusions });
      }

      // Apply all conditions
      if (conditions.length > 0) {
        query.$and = conditions;
      }

      if (exclusionConditions.length > 0) {
        query.$and = [...(query.$and || []), ...exclusionConditions];
      }

      // Calculate saved items count
      const savedItemsDoc = await SavedItem.findOne({ userId }).exec();
      const savedItemsIds = savedItemsDoc?.items || [];
      counts.saved = savedItemsIds.length;

      // Count the total number of matching documents
      counts.total = await Contacts_V5.countDocuments(query).exec();

      if (viewType === "saved") {
        if (savedItemsIds.length === 0) {
          return res.status(200).json([]);
        }

        results = await Contacts_V5.find({
          _id: { $in: savedItemsIds },
          ...query,
        })
          .skip((page - 1) * limit)
          .limit(limit)
          .exec();
      } else if (viewType === "total") {
        // Exclude saved items from the total list
        if (savedItemsIds.length > 0) {
          query._id = { $nin: savedItemsIds };
        }

        results = await Contacts_V5.find(query)
          .skip((page - 1) * limit)
          .limit(limit)
          .exec();
      }

      res.status(200).json({
        results,
        counts,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Something went wrong" });
    }
  },
};

module.exports = searchController;
