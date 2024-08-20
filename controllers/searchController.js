const { client } = require("../config/db");

const searchController = {
  search: async (req, res) => {
    try {
      const db = client.db();
      const collection = db.collection("contacts_v5");

      const filters = req.body;
      const query = {};
      const limit = filters.limit || 5;
      const page = filters.currentPage || 1;

      const conditions = [];

      // Country Filter
      if (filters.countries && filters.countries.length > 0) {
        conditions.push({
          "_source.person_location_country": { $in: filters.countries },
        });
      }

      // Job Title Filter
      if (filters.jobTitle && filters.jobTitle.length > 0) {
        conditions.push({ "_source.person_title": { $in: filters.jobTitle } });
      }

      // Seniority Filter
      if (filters.seniority && filters.seniority.length > 0) {
        conditions.push({
          "_source.person_seniority": { $in: filters.seniority },
        });
      }

      // Industry Filter
      if (filters.industry && filters.industry.length > 0) {
        conditions.push({
          "_source.organization_industries": { $in: filters.industry },
        });
      }

      // Gender Filter
      if (filters.gender && filters.gender.length > 0) {
        conditions.push({ "_source.person_gender": { $in: filters.gender } });
      }

      // Email Status Filter
      if (filters.emailStatus && filters.emailStatus.length > 0) {
        conditions.push({
          "_source.person_email_status_cd": { $in: filters.emailStatus },
        });
      }

      // Person Name Filter
      if (filters.personName && filters.personName.length > 0) {
        conditions.push({ "_source.person_name": { $in: filters.personName } });
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

      // Revenue Range Filter
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

      // Apply all conditions
      if (conditions.length > 0) {
        query.$and = conditions;
      }

      const contacts = await collection
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
