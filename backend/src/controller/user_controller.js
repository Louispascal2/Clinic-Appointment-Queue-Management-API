import bcrypt from "bcryptjs";
import MailSending from "../middleware/email.js";
import User from "../models/user_model.js";
import Department from "../models/departments_model.js"
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

export const deleteStaff = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
     return res.status(404).json({messge: "User not found"}) 
    }

    res.status(200).json({message: "User deleted successfully"})
  } catch (error) {
    console.log("Error in deleteStaff controller", error);
    res.status(500).json({message: "Internal server error"})
  }
}

export const getUserById = async (req, res) => {
  try {
   const user = await User.findById(req.params.id).select("-password").populate("department", "name head");

   if (!user) {
    return res.status(404).json({message: "User not found"});
   }

   res.status(200).json(user)
  } catch (error) {
    console.log("Error in getUserById controller", error);
    res.status(500).json({message: "Internal server error"})
  }
}
export const getAllUsers = async (req, res) => {
  try {
    const {role} = req.query;
    const filter = role? {role} :{}

    const users = await User.find(filter).select("-password");

    res.status(200).json(users)
  } catch (error) {
    console.log("Error in getAllUsers controller", error);
    res.status(500).json({message: "Interanl server error"});
  }
}

export const updateUser = async (req, res) => {
  try {
    const {password, ...updates} = req.body;

    const user = await User.findByIdAndUpdate(req.params.id, updates, {new: true, runValidators: true}).select("-password");

    if (!user) {
      return res.status(404).json({message: "User not found."});
    }

    res.status(200).json({message: "User updated successfully:", user});
  } catch (error) {
    console.log("Error in updateUser controller", error);
    res.status(500).json({message: "Interanl server error"});
  }
}


export const toggleStatus = async (req, res) => {
  try {
    if (req.params.id === req.user.id.toString()) {
      return res.status(400).json({message: "You cannot change your account status."});
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({message: "User not found"});
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({message: `User ${user.isActive? "Activated" : "Deactivated"}`, user});
  } catch (error) {
    console.log("Error in toggleStatus Controller", error);
    res.status(500).json({message: "Internal server error"});
  }
}


//Self service

export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({message: "User not found"});
    }

    res.status(200).json(user)
  } catch (error) {
    console.log("Error in getMYProfile controller", error);
    res.status(500).json({message: "Internal server error"});
  }
}

export const updateMyProfile = async (req, res) => {
  try {
    const {password, role, isActive, ...updates} = req.body;

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true, runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({message: "User not found"})
    }

    res.status(200).json({message: "Profile updated successfully", user
    })
  } catch (error) {
    console.log("Error in updateMyProfile controller", error);
    rres.status(500).json({message: "Internal server error"});
  }
}

export const updateMyPassword = async (req, res) => {
  try {
    const {currentPassword, newPassword} = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({message: "Both current and new password are required."});
    }

    if (newPassword.length < 6) {
      res.status(400).json({message: "Password must be at least 6 characters"});
    }

    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
     return res.status(404).json({message: "User not found"}); 
    }

    const matchedPassword = await bcrypt.compare(currentPasswordPassword, user.password);

    if (!matchedPassword) {
      return res.status(401).json({message: "Your current password is incorrect."});
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save()

    res.status(200).json({message: "Password updated successfully."})
  } catch (error) {
    console.log("Error in updateMyProfile controller", error);
    rres.status(500).json({message: "Internal server error"}); 
  }
}

