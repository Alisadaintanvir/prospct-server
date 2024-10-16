const parseNumber = require("../utils/parseNumber");
const Contacts_V5 = require("../models/Contacts");
const SavedItem = require("../models/SavedItem");
const List = require("../models/List");

const searchController = {
  search: async (req, res) => {
    try {
      const { userId } = req.user;
      const { filters = {}, excludedFilters = {} } = req.body;
      const { limit = 25, currentPage = 1, viewType = "total" } = filters;
      const query = {};
      const conditions = [];
      const exclusionConditions = [];

      const addCondition = (field, operator, values) => {
        if (Array.isArray(values) && values.length > 0) {
          conditions.push({ [field]: { [operator]: values } });
        }
      };

      const addExclusionCondition = (field, operator, values) => {
        if (Array.isArray(values) && values.length > 0) {
          exclusionConditions.push({ [field]: { [operator]: values } });
        }
      };

      // Apply filters
      // location country
      addCondition("_source.person_location_country", "$in", filters.countries);

      addExclusionCondition(
        "_source.person_location_country",
        "$nin",
        excludedFilters.countries
      );

      // job title
      addCondition("_source.person_title", "$in", filters.jobTitle);

      addExclusionCondition(
        "_source.person_title",
        "$nin",
        excludedFilters.jobTitle
      );

      // seniority
      addCondition(
        "_source.person_seniority",
        "$in",
        filters.seniority.map((s) => s.toLowerCase())
      );

      addExclusionCondition(
        "_source.person_seniority",
        "$nin",
        excludedFilters.seniority.map((s) => s.toLowerCase())
      );

      // industry
      addCondition(
        "_source.organization_industries",
        "$in",
        filters.industry.map((i) => i.toLowerCase())
      );

      addExclusionCondition(
        "_source.organization_industries",
        "$nin",
        excludedFilters.industry.map((i) => i.toLowerCase())
      );

      // email status
      addCondition(
        "_source.person_email_status_cd",
        "$in",
        filters.emailStatus
      );

      addExclusionCondition(
        "_source.person_email_status_cd",
        "$nin",
        excludedFilters.emailStatus
      );

      // person name
      addCondition("_source.person_name", "$in", filters.personName);

      addExclusionCondition(
        "_source.person_name",
        "$nin",
        excludedFilters.personName
      );

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

      // List Filter - Include
      const [includeListIds, excludeListIds] = await Promise.all([
        List.find({ userId, name: { $in: filters.list } }).select("_id"),
        List.find({ userId, name: { $in: excludedFilters.list } }).select(
          "_id"
        ),
      ]);

      const [includedSavedItemIds, excludedSavedItemIds] = await Promise.all([
        fetchSavedItemsByListIds(
          userId,
          includeListIds.map((list) => list._id)
        ),
        fetchSavedItemsByListIds(
          userId,
          excludeListIds.map((list) => list._id)
        ),
      ]);

      if (includedSavedItemIds.length > 0)
        conditions.push({ _id: { $in: includedSavedItemIds } });
      if (excludedSavedItemIds.length > 0)
        exclusionConditions.push({ _id: { $nin: excludedSavedItemIds } });

      // Combine all conditions
      if (conditions.length > 0) query.$and = conditions;
      if (exclusionConditions.length > 0)
        query.$and = [...(query.$and || []), ...exclusionConditions];

      // Execute queries
      const [savedItemsDoc, totalCount] = await Promise.all([
        SavedItem.find({ userId }).select("itemId"),
        Contacts_V5.countDocuments(query),
      ]);

      // Calculate saved items count
      const savedItemsIds = savedItemsDoc.map((doc) => doc.itemId);
      const savedItemsCount = await Contacts_V5.countDocuments({
        _id: { $in: savedItemsIds },
        ...query,
      });

      let results;
      if (viewType === "saved") {
        results =
          savedItemsIds.length > 0
            ? await Contacts_V5.find({
                _id: { $in: savedItemsIds },
                ...query,
              })
                .skip((currentPage - 1) * limit)
                .limit(limit)
            : [];
      } else if (viewType === "new") {
        // Exclude saved items from the total list
        if (savedItemsIds.length > 0 && filters.list.length === 0) {
          query._id = { $nin: savedItemsIds };
        }

        results = await Contacts_V5.find(query)
          .skip((currentPage - 1) * limit)
          .limit(limit);
      } else {
        results = await Contacts_V5.find(query)
          .skip((currentPage - 1) * limit)
          .limit(limit);
      }

      res.status(200).json({
        results,
        counts: {
          total: totalCount,
          saved: savedItemsCount,
          new: totalCount - savedItemsCount,
        },
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Something went wrong" });
    }
  },

  getItemDetailsByIds: async (req, res) => {
    try {
      const { itemIds } = req.body;

      const results = await Contacts_V5.find({ _id: { $in: itemIds } }).exec();

      res.status(200).json({ results });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Something went wrong" });
    }
  },

  findLeads: async (req, res) => {
    try {
      const { name, domain } = req.query;
      console.log(req.query);

      // Initialize an empty query object
      const query = {};

      // Add conditions based on the presence of 'name' and 'domain'
      if (name || domain) {
        query.$and = []; // Create an $and array to hold conditions

        // Condition for name if provided
        if (name) {
          query.$and.push({
            "_source.person_name": { $regex: new RegExp(name, "i") }, // Case-insensitive regex search
          });
        }

        // Condition for domain if provided
        if (domain) {
          query.$and.push({
            "_source.organization_domain": { $regex: new RegExp(domain, "i") }, // Case-insensitive regex search
          });
        }
      }

      // Execute the query only if there's at least one condition
      const results =
        query.$and.length > 0 ? await Contacts_V5.find(query).exec() : [];

      // Return the results
      res.status(200).json({ results });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Something went wrong" });
    }
  },
};

module.exports = searchController;

// Function to fetch saved items based on list IDs
async function fetchSavedItemsByListIds(userId, listIds) {
  return listIds.length > 0
    ? SavedItem.find({ userId, listIds: { $in: listIds } }).distinct("itemId")
    : [];
}
