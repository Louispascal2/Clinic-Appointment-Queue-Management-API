import User from "../models/user_model.js";
import bcrypt from "bcryptjs";
import genToken from "../lib/utils.js";
import MailSending from "../middleware/email.js";

export const register = async (req, res) => {
  try {
    const { name, email, password, phone, gender, dateOfBirth } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be 6 characters or above." });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already exist." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const verificationToken = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      gender,
      dateOfBirth,
      role: "patient",
      verificationToken: verificationToken,
      verificationTokenExpiresAt: Date.now() + 10 * 60 * 1000,
    });

    if (newUser) {
      genToken(User._id, user.role, res);
      await newUser.save();

      const redirectUrl = `{req.protocol}://${req.get("host")}/api/auth/email_verified/${newUser._id} \n Verification Token: ${verificationToken}`;

      const options = {
        email: newUser.email,
        from: process.env.EMAIL,
        message: `Below is your Url Link, verificationToken, and it expires in 10 minutes \n ${redirectUrl}`,
        subject: "Url LinK",
      };

      const emailResult = await MailSending(options);

      if (!emailResult) {
         console.log("Email failed", emailResult.response)
      }

      res.status(201).json({
        message: emailResult.response? "User created successfully, email sent - check your inbox"
        : "User created but email failed to send.",
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    }else {
      return res.status(400).json({ message: "Invalid user data" });  
    }

  } catch (error) {
    console.log("Error in register controller");
    res.status(500).json({ message: "Internal server error" });
  }
};

export const email_verified = async (req, res) => {
  try {
    const {userId} = req.params;

    const user = await User.params;

    if (!user) {
      return res.status(404).json({message: "User not found"})
    }

    if (user.email_verified) {
      return res.status(200).json({message: "Email is already verified"})
    }

   if (user.verificationTokenExpiresAt && user.verificationTokenExpiresAt < Date.now()) {
     return res.status(400).json({ message: "Verification link expired" });
   } 

   user.email_verified = true;
   user.verificationToken = null;
   user.verificationTokenExpiresAt = null;
   await user.save()

   const redirectUrl = `${req.protocol}://${req.get("host")}/api/auth/email_verified/${user._id}`;

   res.status(200).json({
    message: "Email verifed successfully",
    success: true,
    redirectUrl
   })
  } catch (error) {
    console.log("Error in email verification", error.message); 
   res.status(500).json({ message: "Internal Server error"})
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isActive) {
      return res
        .status(403)
        .json({ message: "This accounted has been deactivated" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    genToken(user._id, user.role, res);

    const loginTime = new Date().toLocaleString();
    const logoutUrl = `${req.protocol}://${req.get("host")}/api/auth/logout`;

    const emailOptions = {
      email: user.email,
      from: process.env.EMAIL,
      subject: "New Login Detected",
      message: `Hello ${user.name}, \n\nA new login was detected on your account at ${loginTime}. \n\nNot you? Click here to logout: ${logoutUrl}\n\nIf this was you, please you can ignore this email.`
    }

    MailSending(emailOptions).catch(err => console.log("Log email failed:", err));
    
    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.log("Error in login controller");
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("token", "", {
      maxAge: 0,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
    });
    res.status(200).json({ message: "Logged out successfully." });
  } catch (error) {
    console.log("Error in logout controller");
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMe = async (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in get me controller");
    res.status(500).json({ message: "Internal server error" });
  }
};
