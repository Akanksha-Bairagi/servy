const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/no1";

async function main() {
  try {
    await mongoose.connect(MONGO_URL, {
      serverSelectionTimeoutMS: 30000 // Adjust timeout if needed
    });
    console.log("Connected to DB");
    await initDB();
  } catch (err) {
    console.error("Error connecting to DB", err);
  } finally {
    mongoose.connection.close(); // Close the connection after operations
  }
}

const initDB = async () => {
  try {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({ 
      ...obj,
      owner: "66082b215f3ae09c76dd747e" // Ensure this ID exists
    }));
    await Listing.insertMany(initData.data);
    console.log("Data was initialized");
  } catch (err) {
    console.error("Error initializing data", err);
  }
};

main();
