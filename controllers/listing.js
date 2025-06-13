const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken});

module.exports.index = async (req , res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs" , {allListings});
};

module.exports.renderNewForm = (req , res) => {
    res.render("listings/new.ejs")
};

module.exports.showListing = async (req , res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({
        path: "reviews", 
        populate :{
            path : "author"
        },
    }).populate("owner");
    if(!listing){
        req.flash("error" , "Listing you requested does not exists!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs" , {listing})
};

module.exports.createListing = async (req, res, next) => {
  try {
    // Get geolocation data
    let response = await geocodingClient.forwardGeocode({
      query: req.body.listing.location,
      limit: 1
    }).send();

    // Create new listing from form data
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;

    // Handle image upload (or default)
    if (req.file) {
      newListing.image = {
        url: req.file.path,
        filename: req.file.filename
      };
    } else {
      newListing.image = {
        url: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        filename: "defaultImage"
      };
    }

    // Add geometry from Mapbox response
    newListing.geometry = response.body.features[0].geometry;

    // Save listing
    let savedListings = await newListing.save();
    console.log(savedListings);

    req.flash("success", "New Listing Created!");
    res.redirect("/listings");

  } catch (err) {
    console.error("Error creating listing:", err);
    next(err);
  }
};


module.exports.renderEditForm = async (req , res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error" , "Listing you requested does not exists!");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload" , "/upload/w_250");
    res.render("listings/edit.ejs" , {listing , originalImageUrl});
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;

    // Re-geocode the updated location string
    const geoData = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
    }).send();

    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    // Update the geometry field with new coordinates
    listing.geometry = geoData.body.features[0].geometry;

    // Handle image update if provided
    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
    }

    await listing.save();

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async(req ,res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success" , "Listing Deleted!");
    res.redirect("/listings");
};