const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const compression = require("compression");

const AppError = require("./utils/AppError");

// Import Routes
const professorRoutes = require("./routes/authRoutes");
// Load Swagger documentation
const scheduleRoutes = require("./routes/scheduleRoutes");
const prevSemesterRoutes = require("./routes/prevSemesterRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const ContactRoutes = require("./routes/contactRoutes");
const articleRoutes = require("./routes/articles");
const authRoutes = require("./routes/authRoutes");
// Initialize Express app
const app = express();

// Trust proxies (for rate limiting and secure headers)
app.set("trust proxy", 1);

// 1) GLOBAL MIDDLEWARES

// Implement CORS
app.use(
  cors({
    origin: ["http://localhost:5173", "https://lonewalkerProf.netlify.app"],
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS", "PUT"],
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
  })
);

// Serve static files
app.use("/uploads", express.static("uploads"));

// Set security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'", "https://cdn.example.com"],
        scriptSrc: ["'self'", "https://apis.google.com"],
        styleSrc: ["'self'", "https://fonts.googleapis.com", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
      },
    },
  })
);

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Limit requests from the same API
const limiter = rateLimit({
  max: process.env.RATE_LIMIT_MAX || 100,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));

// Cookie parser
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Compression middleware
app.use(compression());

// 2) ROUTES

// Health Check Endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "API is running smoothly",
    timestamp: new Date(),
  });
});

// Welcome Route
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Welcome to the Academic Timetable API!",
    documentation: "/api-docs",
  });
});

// API Routes
app.use("/api/v1/professors", professorRoutes);
app.use("/api/v1/schedules", scheduleRoutes);
app.use("/api/v1/prevSemester", prevSemesterRoutes);
app.use("/api/v1/announcement", announcementRoutes);
app.use("/api/v1/contact", ContactRoutes);
app.use("/api/v1/article", articleRoutes);
app.use("/api/v1/auth", authRoutes);
// 3) ERROR HANDLING

// Handle unhandled routes
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware

module.exports = app;
