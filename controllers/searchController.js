const { client } = require("../config/db");
const parseNumber = require("../utils/parseNumber");

const searchController = {
  search: async (req, res) => {
    try {
      const userId = req.user.userId;
      const db = client.db();
      const contactsCollection = db.collection("contacts_v5");
      const savedItemCollection = db.collection("saved_items");

      const { filters, excludedFilters } = req.body;

      const query = {};
      const limit = filters.limit || 5;
      const page = filters.currentPage || 1;
      const viewType = filters.viewType || "total";

      const conditions = [];
      const exclusionConditions = [];

      const addCondition = (field, operator, values) => {};

      // Country Filter
      if (filters.countries && filters.countries.length > 0) {
        conditions.push({
          "_source.person_location_country": { $in: filters.countries },
        });
      }

      // Exclusion Country Filters
      if (excludedFilters.countries && excludedFilters.countries.length > 0) {
        exclusionConditions.push({
          "_source.person_location_country": {
            $nin: excludedFilters.countries,
          },
        });
      }

      // Job Title Filter
      if (filters.jobTitle && filters.jobTitle.length > 0) {
        conditions.push({ "_source.person_title": { $in: filters.jobTitle } });
      }

      // Exclusion Job Filters
      if (excludedFilters.jobTitle && excludedFilters.jobTitle.length > 0) {
        exclusionConditions.push({
          "_source.person_title": {
            $nin: excludedFilters.jobTitle,
          },
        });
      }

      // Seniority Filter
      if (filters.seniority && filters.seniority.length > 0) {
        const lowercasedSeniorities = filters.seniority.map((seniority) =>
          seniority.toLowerCase()
        );
        conditions.push({
          "_source.person_seniority": { $in: lowercasedSeniorities },
        });
      }

      // Exclusion Seniority Filters
      if (excludedFilters.seniority && excludedFilters.seniority.length > 0) {
        const lowercasedSeniorities = filters.seniority.map((seniority) =>
          seniority.toLowerCase()
        );
        exclusionConditions.push({
          "_source.person_seniority": {
            $nin: lowercasedSeniorities,
          },
        });
      }

      // Industry Filter
      if (filters.industry && filters.industry.length > 0) {
        const lowercasedIndustries = filters.industry.map((industry) =>
          industry.toLowerCase()
        );
        conditions.push({
          "_source.organization_industries": { $in: lowercasedIndustries },
        });
      }

      // Exclusion Industry Filters
      if (excludedFilters.industry && excludedFilters.industry.length > 0) {
        const lowercasedIndustries = filters.industry.map((industry) =>
          industry.toLowerCase()
        );
        exclusionConditions.push({
          "_source.organization_industries": {
            $nin: lowercasedIndustries,
          },
        });
      }

      // Email Status Filter
      if (filters.emailStatus && filters.emailStatus.length > 0) {
        conditions.push({
          "_source.person_email_status_cd": { $in: filters.emailStatus },
        });
      }

      // Exclusion Email Status Filters
      if (
        excludedFilters.emailStatus &&
        excludedFilters.emailStatus.length > 0
      ) {
        exclusionConditions.push({
          "_source.person_email_status_cd": {
            $nin: excludedFilters.emailStatus,
          },
        });
      }

      // Person Name Filter
      if (filters.personName && filters.personName.length > 0) {
        conditions.push({ "_source.person_name": { $in: filters.personName } });
      }

      // Exclusion Person Name Filters
      if (excludedFilters.personName && excludedFilters.personName.length > 0) {
        exclusionConditions.push({
          "_source.person_name": {
            $nin: excludedFilters.personName,
          },
        });
      }

      // Employee Range Filter
      if (filters.employeeRange && filters.employeeRange.length > 0) {
        const employeeRanges = filters.employeeRange
          .map((range) => {
            const normalizedRange = range.replace(/and/g, "-");
            const [min, max] = normalizedRange.split("-").map(Number);
            if (isNaN(min)) return null;
            if (isNaN(max)) {
              return {
                "_source.organization_num_current_employees": { $gte: min },
              };
            }
            return {
              "_source.organization_num_current_employees": {
                $gte: min,
                $lte: max,
              },
            };
          })
          .filter(Boolean);
        if (employeeRanges.length > 0) {
          conditions.push({ $or: employeeRanges });
        }
      }

      // Employee Range Exclusion Filter
      if (
        excludedFilters.employeeRange &&
        excludedFilters.employeeRange.length > 0
      ) {
        const excludedEmployeeRanges = excludedFilters.employeeRange
          .map((range) => {
            const normalizedRange = range.replace(/and/g, "-");
            const [minStr, maxStr] = normalizedRange
              .split("-")
              .map((str) => str.trim());

            const min = parseNumber(minStr);
            const max = parseNumber(maxStr);
            if (isNaN(min)) return null;
            if (isNaN(max)) {
              return {
                $or: [
                  {
                    "_source.organization_num_current_employees": { $lt: min },
                  },
                  {
                    "_source.organization_num_current_employees": { $gt: min },
                  },
                ],
              };
            }
            return {
              $or: [
                { "_source.organization_num_current_employees": { $lt: min } },
                { "_source.organization_num_current_employees": { $gt: max } },
              ],
            };
          })
          .filter(Boolean);

        if (excludedEmployeeRanges.length > 0) {
          exclusionConditions.push({ $or: excludedEmployeeRanges });
        }
      }

      // Revenue Range Filter
      if (filters.revenueRange && filters.revenueRange.length > 0) {
        const revenueRanges = filters.revenueRange
          .map((range) => {
            const normalizedRange = range.replace(/and/g, "-");
            const [minStr, maxStr] = normalizedRange
              .split("-")
              .map((str) => str.trim());

            // Remove 'M' and convert to a number in thousands

            const min = parseNumber(minStr);
            const max = parseNumber(maxStr);
            if (isNaN(min)) return null;
            if (isNaN(max)) {
              return {
                "_source.organization_revenue_in_thousands_int": { $gte: min },
              };
            }
            return {
              "_source.organization_revenue_in_thousands_int": {
                $gte: min,
                $lte: max,
              },
            };
          })
          .filter(Boolean);
        if (revenueRanges.length > 0) {
          conditions.push({ $or: revenueRanges });
        }
      }

      // Revenue Range Filter and Exclusion (same as before)
      if (filters.revenueRange && filters.revenueRange.length > 0) {
        const revenueRanges = filters.revenueRange
          .map((range) => {
            const normalizedRange = range.replace(/and/g, "-");
            const [minStr, maxStr] = normalizedRange
              .split("-")
              .map((str) => str.trim());

            const min = parseNumber(minStr);
            const max = parseNumber(maxStr);
            if (isNaN(min)) return null;
            if (isNaN(max)) {
              return {
                "_source.organization_revenue_in_thousands_int": { $gte: min },
              };
            }
            return {
              "_source.organization_revenue_in_thousands_int": {
                $gte: min,
                $lte: max,
              },
            };
          })
          .filter(Boolean);
        if (revenueRanges.length > 0) {
          conditions.push({ $or: revenueRanges });
        }
      }

      // Email Type Filter
      if (filters.emailType && filters.emailType.length > 0) {
        const regexConditions = filters.emailType.map((ext) => ({
          "_source.person_email": { $regex: `${ext}$`, $options: "i" },
        }));

        // Use $or to match any of the provided email extensions
        conditions.push({ $or: regexConditions });
      }

      // Email Type Exclusion Filter
      if (excludedFilters.emailType && excludedFilters.emailType.length > 0) {
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

      if (viewType === "saved") {
        const savedItemsDoc = await savedItemCollection
          .find({ userId })
          .toArray();

        if (savedItemsDoc?.[0]?.items?.length === 0) {
          return res.status(200).json([]);
        }

        const savedItemsIds = savedItemsDoc[0].items;

        const contacts = await contactsCollection
          .find({ _id: { $in: savedItemsIds }, ...query })
          .toArray();
        return res.status(200).json(contacts);
      }

      const contacts = await contactsCollection
        .find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray();

      res.status(200).json(contacts);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Something went wrong" });
    }
  },
};

module.exports = searchController;
