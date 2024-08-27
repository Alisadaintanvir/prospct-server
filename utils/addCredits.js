const { client } = require("../config/db");

const db = client.db();
const usersCollection = db.collection("users");

async function updateUsers() {
  try {
    const result = await usersCollection.updateMany(
      {},
      {
        $set: {
          credits: {
            emailCredits: 100, // Default values
            phoneCredits: 30,
            exportCredits: 30,
          },
        },
      }
    );
    console.log(`${result.modifiedCount} users updated with credits.`);
  } catch (error) {
    console.log(error);
  } finally {
    await client.close();
  }
}

updateUsers();
