import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/user_model.js";

dotenv.config()


const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("connected to mongoDB");

        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        const existing = await User.findOne({email: adminEmail});
        if (existing) {
         console.log("Admin already exists");
         return  
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        await User.create({
            name: "Core Admin",
            email: adminEmail,
            password: hashedPassword,
            role: "admin"
        });

        console.log("Admin successfully created");
    } catch (error) {
       console.log("Error in CreateAdmin", error) 
    }finally{
        process.exit()
    }
}


createAdmin();
