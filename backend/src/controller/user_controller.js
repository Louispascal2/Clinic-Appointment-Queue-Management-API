import bcrypt from "bcryptjs";
import MailSending from "../middleware/email.js";
import User from "../models/user_model.js";
import dotenv from "dotenv";
dotenv.config();

export const createStaff = async (req, res) => {
  try {
    const { name, email, password, role, ...rest } = req.body;

    if (!name || !email || !password || !role) {
      return res
        .status(400)
        .json({ message: "Name, email, password, and role are required." });
    }

    if (!["doctor", "receptionist"].includes(role)) {
      return res
        .status(400)
        .json({ message: "Role must be either 'doctor' or 'receptionist." });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password be 6 or more characters." });
    }
    
    const existing = await User.findOne({ email });

    if (existing) {
      return res
        .status(409)
        .json({ message: "This email is in use by another user." });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newStaff = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      ...rest,
    });
    

    const staffData = newStaff.toObject();
    delete staffData.password;

    const emailOptions = {
      email: newStaff.email,
      from: process.env.EMAIL,
      subject: "Your Clinic Account has been created",
      message: `Hello ${newStaff.name}, \n\nAs a staff, an account has been created for you as a ${role} on the Clinic Appointment System. \n\nYour login details:\n\nEmail: ${newStaff.email}\nPassword: ${password}\n\nPlease log in and and change your password as soon as possible.\n\nIf you are not expecting this email, please contact clinic admin on +3453433443 `,
    };
    
    MailSending(emailOptions).catch((error) =>
      console.log("Failed to email the staff:", error),
    );
    
    res.status(201).json({
      message: `${role} account created successfully. Login details sent to ${newStaff.email}. `,
      user: staffData,
    });
      
  } catch (error) {
    console.log("Error in createStaff controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
