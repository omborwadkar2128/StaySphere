// const mongoose = require("mongoose");
// const initData = require("./data.js");
// const Listing = require("../models/listing.js");


// const MONGO_URL = "mongodb://127.0.0.1:27017/StaySphere";

// main()
//     .then(() => {
//         console.log("Connected to DB")
//     })
//     .catch(err => console.log(err));

// async function main() {
//   await mongoose.connect(MONGO_URL);
// }

// const initDB = async () => {
//     await Listing.deleteMany({});
//     initData.data = initData.data.map((obj) => ({...obj , owner: '684597c5e71e0eb5c6f59800'}));
//     await Listing.insertMany(initData.data);
//     console.log("Data was initalized");
// };

// initDB();

// const mongoose = require("mongoose");
// const initData = require("./data.js");
// const Listing = require("../models/listing.js");
// require("dotenv").config();

// const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
// const geocoder = mbxGeocoding({ accessToken: process.env.MAP_TOKEN});

// const ATLASDB_URL = process.env.ATLASDB_URL;

// main()
//   .then(() => {
//     console.log("Connected to MongoDB Atlas");
//     safeSeed();
//   })
//   .catch(err => console.log(err));

// async function main() {
//   await mongoose.connect(ATLASDB_URL);
// }

// const safeSeed = async () => {
//   try {
//     for (let item of initData.data) {

//       // Check if listing already exists
//       const exists = await Listing.findOne({ title: item.title });
//       if (exists) {
//         console.log(`Skipped (exists): ${item.title}`);
//         continue;
//       }

//       // Fetch real coordinates from Mapbox API
//       const geoResponse = await geocoder.forwardGeocode({
//         query: `${item.location}, ${item.country}`,
//         limit: 1
//       }).send();

//       const coordinates =
//         geoResponse.body.features.length > 0
//           ? geoResponse.body.features[0].geometry.coordinates
//           : [0, 0]; // fallback

//       const listingToInsert = {
//         ...item,
//         owner: "6964f55e1dbb5bf6c48b86dc", // your real user ID
//         geometry: {
//           type: "Point",
//           coordinates: coordinates
//         }
//       };

//       // Insert new listing
//       await Listing.create(listingToInsert);
//       console.log(`Inserted: ${item.title}`, "Coordinates:", coordinates);
//     }

//     console.log("✔ Safe seeding complete!");
//   } catch (error) {
//     console.error("❌ Seed error:", error);
//   } finally {
//     mongoose.connection.close();
//   }
// };


const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
require("dotenv").config();

// Mapbox setup
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocoder = mbxGeocoding({ accessToken: process.env.MAP_TOKEN });

// MongoDB Atlas URL
const ATLASDB_URL = process.env.ATLASDB_URL;

// Connect to DB then run seeder
main()
  .then(() => {
    console.log("Connected to MongoDB Atlas");
    safeSeed();
  })
  .catch(err => console.log(err));

async function main() {
  await mongoose.connect(ATLASDB_URL);
}

// Safe seeding function
const safeSeed = async () => {
  try {
    for (let item of initData.data) {

      // Check if listing already exists
      const exists = await Listing.findOne({ title: item.title });
      if (exists) {
        console.log(`Skipped (exists): ${item.title}`);
        continue;
      }

      // Geocode location
      let coordinates = [0, 0];
      try {
        const geoResponse = await geocoder.forwardGeocode({
          query: `${item.location}, ${item.country}`,
          limit: 1
        }).send();

        if (geoResponse.body.features.length > 0) {
          coordinates = geoResponse.body.features[0].geometry.coordinates;
        }

      } catch (geoError) {
        console.error("Mapbox Geocoding Error:", geoError.message);
      }

      // Prepare final listing object
      const listingToInsert = {
        ...item,
        owner: "6964f55e1dbb5bf6c48b86dc", // your actual user ID
        geometry: {
          type: "Point",
          coordinates: coordinates
        }
      };

      // Insert into MongoDB
      await Listing.create(listingToInsert);
      console.log(`Inserted: ${item.title} | Coordinates:`, coordinates);
    }

    console.log("✔ Safe seeding complete!");
  } catch (error) {
    console.error("❌ Seed error:", error);
  } finally {
    mongoose.connection.close();
  }
};
