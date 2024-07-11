const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
        type: String,
        default: "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&dl=scott-webb-1ddol8rgUH8-unsplash.jpg",
        set: (v) =>
         (v === ""
          ? "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&dl=scott-webb-1ddol8rgUH8-unsplash.jpg"
           : v),
    },
    price: Number,
    location: String,
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        }
    ],

    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },

});


listingSchema.post("findOneAndDelete", async (listing) => {
    if(listing) {
      await Review.deleteMany({_id : {$in: listing.reviews}});
    }
  });


const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing; 



