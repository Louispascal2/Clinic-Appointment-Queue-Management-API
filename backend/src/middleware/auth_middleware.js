import jwt from "jsonwebtoken";
import User from "../models/user_model.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorised - No Token Provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorised - Invalid Token." });
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
        return res.status(404).json({ message: "User Not Found." });
    }

    if (!user.isActive) {
       return res.status(403).json({message: "Account has been deactivated."})
    }

    req.user = user;
    return next()
  } catch (error) {
    console.log("Error in protectRoute middleware", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
