const Plans = require("../models/Plans");

const planControllers = {
  getPlans: async (req, res) => {
    try {
      const plans = await Plans.find();
      res.status(200).json(plans);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};

module.exports = planControllers;
