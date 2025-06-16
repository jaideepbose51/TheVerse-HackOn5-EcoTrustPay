// server.js
import express from "express";
import 'dotenv/config';
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

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan("dev")); // Better logging in dev

// Routes
app.use("/api/user", userRouter);
app.use("/api/seller", sellerRouter);
app.use("/api/admin", adminRouter);

// Health check
app.get("/", (req, res) => {
    res.status(200).send("✅ API is working");
});

// Start server only after DB & Cloudinary connect
const startServer = async () => {
    try {
        await connectDB();
        await connectCloudinary();

        app.listen(port, () => {
            console.log(`🚀 Server is running on http://localhost:${port}`);
        });
    } catch (error) {
        console.error("❌ Error starting server:", error);
        process.exit(1);
    }
};

startServer();
