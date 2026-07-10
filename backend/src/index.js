import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./route/auth_routes.js";
import userRoutes from "./route/user_route.js"
dotenv.config()


mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log("Connected to MongoDB");
})
.catch((err) => {
    console.log("error connecting to MongoDB", err);
})

const app = express();

app.use(express.json());
app.use(cookieParser())

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

const port = process.env.PORT || 3000;

app.listen(port, ()=> {
    console.log(`Server running on http://localhost:${port}`)
});


export default app;