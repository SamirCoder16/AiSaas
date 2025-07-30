import "dotenv/config";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import { clerkMiddleware, requireAuth } from "@clerk/express";
import connectCloudinary from "./configs/cloudinary.config.js";
import aiRouter from "./routes/ai.route.js";
import userRouter from "./routes/user.route.js";

// Set the port number from environment variable or default to 3000
const PORT = process.env.PORT || 3000;

// Create an Express application instance
const app = express();

// Import and configure Cloudinary
connectCloudinary();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? [
          "https://quick-ai-client-xi.vercel.app",
          "https://your-custom-domain.com",
        ]
      : ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(morgan("dev"));
// Clerk middleware for authentication
app.use(clerkMiddleware());

// Define a route handler for the root path that sends a greeting message
app.get("/", (req, res) => {
  res.send("Server is Healthy!");
});

// Use the aiRouter for the '/api/ai' route (removed requireAuth from here since it's in routes)
app.use("/api/ai", requireAuth(), aiRouter);
app.use("/api/user", requireAuth(), userRouter);

// Start the server and listen on the specified port
app.listen(PORT, () => {
  // Log a message when server starts successfully
  console.log(`Server is running on port -----> ${PORT}`);
});
