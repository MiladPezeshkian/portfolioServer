const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const AppError = require("./utils/AppError");
const globalErrorHandler = require("./controllers/errorController");
const apikey = require("./routes/apiKeyRoutes");
const compression = require("compression");
// Import Routes
const authRoutes = require("./routes/authRoutes");
const AiCategories = require("./routes/categoryRoutes");
const AI = require("./routes/aiRoutes");

const app = express();
const users = require("./routes/userRoutes");

app.use(
  cors({
    origin: ["http://localhost:5173", "https://aiwebpage-client.onrender.com"],
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  })
);

app.use("/uploads", express.static("uploads"));

// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Limit requests from the same API
const limiter = rateLimit({
  max: 100, // حداکثر درخواست‌ها
  windowMs: 60 * 60 * 1000, // 100 requests per hour (یک ساعت)
  message: "Too many requests from this IP, please try again in an hour!",
});
// app.use("/api", limiter);
app.use(compression());
// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));

// Cookie parser
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS (cross-site scripting attacks)
app.use(xss());

// Implement CORS for frontend access

// Routes mounting
// console.log(authRoutes);
// console.log("pro", product);
app.use("/api/v1/auth", authRoutes); // Authentication routes

app.use("/api/v1/apikey", apikey); // Orders routes
app.use("/api/v1/users", users);
app.use("/api/v1/Category", AiCategories);
app.use("/api/v1/ai", AI);

// Handle unhandled routes
app.get("/", (req, res) => {
  res.send("سلام، خوش آمدید!");
});
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use(globalErrorHandler);

module.exports = app;
