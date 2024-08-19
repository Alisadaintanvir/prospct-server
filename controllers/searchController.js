const { client } = require("../config/db");

const searchController = {
  search: async (req, res) => {
    const { query } = req.query;

    const db = client.db();
    const collection = db.collection("contacts_v5");
    const contacts = await collection
      .find({
        "_source.person_location_country": "India",
      })
      .limit(3)
      .toArray();

    res.json(contacts);
  },
};

module.exports = searchController;
