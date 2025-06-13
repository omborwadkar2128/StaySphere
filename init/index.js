const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");


const MONGO_URL = "mongodb://127.0.0.1:27017/StaySphere";

main()
    .then(() => {
        console.log("Connected to DB")
    })
    .catch(err => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({...obj , owner: '684597c5e71e0eb5c6f59800'}));
    await Listing.insertMany(initData.data);
    console.log("Data was initalized");
};

initDB();