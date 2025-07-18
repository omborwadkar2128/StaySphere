// if(process.env.NODE_ENV != "production"){
//     require('dotenv').config();
// }
// // console.log(process.env);

// const express = require("express");
// const app = express();
// const mongoose = require("mongoose");
// const Listing = require("./models/listing.js")
// const path = require("path");
// const methodOverride = require("method-override");
// const ejsMate = require("ejs-mate");
// const wrapAsync = require("./utils/wrapAsync.js");
// const ExpressError = require("./utils/ExpressError.js");
// const { listingSchema , reviewSchema }= require("./schema.js");
// const Review = require("./models/review.js");
// const session = require("express-session");
// const MongoStore = require('connect-mongo');
// const flash = require("connect-flash");
// const passport = require("passport");
// const LocalStrategy = require("passport-local");
// const User = require("./models/user.js");

// const listingRouter = require("./routes/listing.js");
// const reviewRouter = require("./routes/reviews.js");
// const userRouter = require("./routes/user.js");

// // const MONGO_URL = "mongodb://127.0.0.1:27017/StaySphere";
// const dbUrl = process.env.ATLASDB_URL

// app.set("view engine" ,"ejs");
// app.set("views" , path.join(__dirname ,"views"));

// app.use(express.urlencoded({extended : true}));
// app.use(methodOverride("_method"));
// app.engine("ejs" , ejsMate);
// app.use(express.static(path.join(__dirname , "/public")));

// main()
//     .then(() => {
//         console.log("Connected to DB")
//     })
//     .catch(err => console.log(err));

// async function main() {
//   await mongoose.connect(dbUrl);
// }

// const store = MongoStore.create({
//     mongoUrl : dbUrl ,
//     crypto :{
//         secret : process.env.SECRET,
//     },
//     touchAfter : 24 * 3600,
// })

// store.on("err" , () => {
//     console.log("ERROR IN MONGO SESSION STORE" , err);
// })

// const sessionOptions = {
//     store,
//     secret : process.env.SECRET,
//     resave : false,
//     saveUninitialized : true,
//     cookie : {
//         expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
//         maxAge : 7 * 24 * 60 * 60 * 1000 ,
//     }
// };

// app.get("/" , (req , res) => {
//     res.redirect("/listings");
// })

// app.use(session(sessionOptions));
// app.use(flash());

// app.use(passport.initialize());
// app.use(passport.session());
// passport.use(new LocalStrategy(User.authenticate()));

// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

// app.use((req , res , next) => {
//     res.locals.success = req.flash("success");
//     res.locals.error = req.flash("error");
//     res.locals.currUser = req.user;
//     next();
// })

// // app.get("/demouser" , async(req , res) => {
// //     let fakeUser = new User({
// //         email : "student@gmail.com",
// //         username : "delta-student"
// //     });

// //     let registerdUser = await User.register(fakeUser , "hello world");
// //     res.send(registerdUser);
// // })

// app.use("/listings" , listingRouter);
// app.use("/listings/:id/reviews" , reviewRouter);
// app.use("/" , userRouter);

// app.all(/.*/, (req, res, next) => {
//            next(new ExpressError(404, "Page Not Found"));
// });

//  app.use((err , req , res , next) => {
//     const { statusCode = 500, message = "Something went wrong!" } = err;
//     res.status(statusCode).render("error.ejs" , {err});
// });

// app.listen(4000 , () => {
//     console.log("Server is listening on port 4000");
// })

if (process.env.NODE_ENV != "production") {
    require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/reviews.js");
const userRouter = require("./routes/user.js");

const dbUrl = process.env.ATLASDB_URL;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

main()
    .then(() => {
        console.log("Connected to DB");
    })
    .catch(err => console.log(err));

async function main() {
    await mongoose.connect(dbUrl);
}

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("err", (err) => {
    console.log("ERROR IN MONGO SESSION STORE", err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    }
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Make flash and user available in all views
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// Home page (transparent nav)
app.get("/", (req, res) => {
    res.render("index", { isIndex: true });
});

// ✅ Login page — pass hideFooter to disable footer
app.get("/login", (req, res) => {
    res.render("users/login", { hideFooter: true });
});

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// 404 handler
app.all(/.*/, (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

// Global error handler
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", { err });
});

app.listen(4000, () => {
    console.log("Server is listening on port 4000");
});
