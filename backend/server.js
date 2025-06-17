import express from "express";
import "dotenv/config";
import cors from "cors";
import morgan from "morgan";

import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";

import adminRouter from "./routes/adminRoute.js";
import userRouter from "./routes/userRoute.js";
import sellerRouter from "./routes/sellerRoute.js";

// Initialize App
const app = express();
const port = process.env.PORT || 4000;

// Development CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow all origins in development (or use the commented whitelist approach)
    callback(null, true);

    /* 
    // Alternative: Whitelist specific ports
    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:5175",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5175"
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
    */
  },
  credentials: true,
  optionsSuccessStatus: 200, // For legacy browser support
};

// Middleware
app.use(cors(corsOptions)); // Single CORS middleware
app.use(express.json());
app.use(morgan("dev")); // HTTP request logger

// Routes
app.use("/api/user", userRouter);
app.use("/api/seller", sellerRouter);
app.use("/api/admin", adminRouter);

// Health check endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    status: "healthy",
    message: "✅ API is working",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
import { errorHandler } from "./middleware/errorHandler.js";
app.use(errorHandler);

// Start server only after DB & Cloudinary connect
const startServer = async () => {
  try {
    await connectDB();
    await connectCloudinary();

    app.listen(port, () => {
      console.log(`\n🚀 Server is running on http://localhost:${port}`);
      console.log("Allowed CORS origins:");
      console.log("- All origins (development mode)");
      // console.log("- http://localhost:5173");
      // console.log("- http://localhost:5175");
      console.log("\nPress CTRL+C to stop\n");
    });
  } catch (error) {
    console.error("❌ Error starting server:", error);
    process.exit(1);
  }
};

startServer();
