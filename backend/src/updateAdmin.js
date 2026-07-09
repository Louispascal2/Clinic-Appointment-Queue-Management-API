import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "./models/user_model.js";
import dotenv from "dotenv";

dotenv.config();

const updateAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const currentEmail = process.env.ADMIN_EMAIL;
    const newEmail = process.env.NEW_ADMIN_EMAIL;
    const newPassword = process.env.NEW_ADMIN_PASSWORD;

    if (!currentEmail || !newEmail || !newPassword) {
      console.log(
        "Error: ADMIN_EMAIL, NEW_ADMIN_EMAIL and NEW_ADMIN_PASSWORD must all be set in .env",
      );
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const updated = await User.findOneAndUpdate(
      { email: currentEmail, role: "admin" },
      { email: newEmail, password: hashedPassword },
      { returnDocument: "after" },
    );

    if (!updated) {
      console.log(
        "No admin found with that current email. Check ADMIN_EMAIL in .env.",
      );
    } else {
      console.log("Password updated successfully");
    }

  } catch (error) {
    console.log("Error in updatedAdminPassword:", error);
  } finally {
    process.exit();
  }
};

updateAdmin();
