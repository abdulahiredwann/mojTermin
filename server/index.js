// Load environment variables FIRST (before requiring Prisma)
const { loadEnvironment } = require("./config/env");
loadEnvironment();

// Now require Prisma after env is loaded
const { connectDatabase, disconnectDatabase } = require("./config/database");
const {
  getCorsConfig,
  isOriginAllowed,
  getCorsHeaders,
  getCorsPreflightHeaders,
} = require("./config/cors");

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const fs = require("fs");

const app = express();

// Log all incoming requests for debugging (very early in the chain)
app.use((req, res, next) => {
  console.log(`[REQUEST] ${new Date().toISOString()} ${req.method} ${req.url}`);
  console.log(
    `[REQUEST] Host: ${req.headers.host}, Origin: ${req.headers.origin}`
  );
  next();
});

// CORS middleware
app.use(cors(getCorsConfig()));

// Cookie parser
app.use(cookieParser());

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve uploaded images statically with CORS headers
app.use(
  "/api/images",
  (req, res, next) => {
    // Log all image requests for debugging
    console.log(`[STATIC] Image request: ${req.method} ${req.url}`);
    console.log(`[STATIC] Headers:`, {
      origin: req.headers.origin,
      host: req.headers.host,
      "user-agent": req.headers["user-agent"]?.substring(0, 50),
    });

    const origin = req.headers.origin;

    // Handle preflight OPTIONS requests
    if (req.method === "OPTIONS") {
      const headers = getCorsPreflightHeaders(origin);
      Object.keys(headers).forEach((key) => {
        res.setHeader(key, headers[key]);
      });
      return res.status(204).end();
    }

    // Set CORS headers for actual requests
    const headers = getCorsHeaders(origin);
    Object.keys(headers).forEach((key) => {
      res.setHeader(key, headers[key]);
    });
    next();
  },
  express.static("upload", {
    // Add error handling for missing files
    setHeaders: (res, filePath) => {
      // Log when file is found
      console.log(`[STATIC] Serving: ${filePath}`);
    },
  }),
  // Fallback handler for 404s
  (req, res, next) => {
    // Only handle if it's an image request that wasn't found
    if (req.url.startsWith("/api/images/")) {
      const imagePath = req.url.replace("/api/images/", "");
      const fullPath = path.join(__dirname, "upload", imagePath);
      const normalizedPath = path.normalize(fullPath);
      const uploadDir = path.join(__dirname, "upload");

      // Security check
      if (!normalizedPath.startsWith(path.normalize(uploadDir))) {
        console.error(`[STATIC] Security violation: ${normalizedPath}`);
        return res.status(400).json({ error: "Invalid path" });
      }

      // Check if file exists
      if (!fs.existsSync(normalizedPath)) {
        console.error(`[STATIC] File not found: ${normalizedPath}`);
        console.error(`[STATIC] Requested URL: ${req.url}`);
        console.error(`[STATIC] Upload directory: ${uploadDir}`);
        console.error(`[STATIC] Image path from URL: ${imagePath}`);

        // List what's actually in the upload directory for debugging
        try {
          const uploadExists = fs.existsSync(uploadDir);
          console.error(`[STATIC] Upload directory exists: ${uploadExists}`);
          if (uploadExists) {
            const files = fs.readdirSync(uploadDir);
            console.error(`[STATIC] Files in upload root: ${files.join(", ")}`);

            const imagesDir = path.join(uploadDir, "Images");
            if (fs.existsSync(imagesDir)) {
              const imagesFiles = fs.readdirSync(imagesDir);
              console.error(
                `[STATIC] Files in Images: ${imagesFiles.join(", ")}`
              );

              const carsDir = path.join(imagesDir, "Cars");
              if (fs.existsSync(carsDir)) {
                const carsFiles = fs.readdirSync(carsDir);
                console.error(
                  `[STATIC] Files in Images/Cars (first 10): ${carsFiles
                    .slice(0, 10)
                    .join(", ")}`
                );
              }
            }
          }
        } catch (err) {
          console.error(`[STATIC] Error reading directory: ${err.message}`);
        }
      }

      return res.status(404).json({
        error: "Image not found",
        path: imagePath,
        requestedUrl: req.url,
      });
    }
    next();
  }
);

// API Routes
app.use("/api/auth", require("./Routes/Auth.Routes"));
app.use("/api/cars", require("./Routes/Cars.Routes"));
app.use("/api/bookings", require("./Routes/Bookings.Routes"));
app.use("/api/customers", require("./Routes/Customers.Routes"));
app.use(
  "/api/car-condition-images",
  require("./Routes/CarConditionImages.Routes")
);
app.use("/api/services", require("./Routes/Services.Routes"));
app.use("/api/service-cars", require("./Routes/ServiceCars.Routes"));
app.use("/api/service-picker", require("./Routes/ServicePicker.Routes"));
app.use("/api/dashboard", require("./Routes/Dashboard.Routes"));
app.use("/api/payments", require("./Routes/Payments.Routes"));
app.use("/api/contact", require("./Routes/Contact.Routes"));
app.use("/api/newsletter", require("./Routes/Newsletter.Routes"));

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start server
const port = process.env.PORT || 4000;

app.listen(port, async () => {
  try {
    await connectDatabase();
    console.log(`[SERVER] Server is running on port ${port}`);
  } catch (err) {
    process.exit(1);
  }
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await disconnectDatabase();
  process.exit(0);
});
