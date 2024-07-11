// Import required modules
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const MongoStore = require("connect-mongo");

// Load environment variables from .env file
dotenv.config();

// MongoDB URL (from .env)
const MONGO_URL = process.env.MONGODB_URI;

// Create an Express app
const app = express();

// Connect to MongoDB
mongoose.connect(MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err.message);
    process.exit(1); // Exit process with failure
  });

// App configuration
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));

// Session configuration
const sessionStore = MongoStore.create({
  mongoUrl: MONGO_URL,
  crypto: {
    secret: process.env.SESSION_SECRET,
  },
  touchAfter: 24 * 3600, // time period in seconds
});

const sessionOptions = {
  store: sessionStore,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    httpOnly: true,
    // secure: true, // Uncomment this line in production for HTTPS
  },
};

app.use(session(sessionOptions));
app.use(flash());

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware to pass variables to all templates
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// Routes setup
const listingRouter = require("./routes/listing");
const reviewRouter = require("./routes/review");
const userRouter = require("./routes/user");

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// Welcome page route
app.get("/", (req, res) => {
  res.render("welcome"); // Renders the welcome.ejs file in the views directory
});

// Default route for handling 404 errors
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found!"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

// Server setup
const PORT = process.env.PORT || 3000; // Use environment variable or default port
app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
