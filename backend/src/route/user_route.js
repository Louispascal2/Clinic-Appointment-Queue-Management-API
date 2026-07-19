import express from"express";
import {restrictTo} from "../middleware/roleMiddleware.js";
import { createStaff, getAllUsers, updateUser, getUserById, deleteStaff, toggleStatus, getMyProfile, updateMyProfile, updateMyPassword} from "../controller/user_controller.js";
import { protectRoute } from "../middleware/auth_middleware.js";



const router = express.Router();


router.post("/staff", protectRoute, restrictTo("admin"), createStaff );

router.get("/", protectRoute, restrictTo("admin"), getAllUsers);

router.patch("/:id", protectRoute, restrictTo("admin", updateUser));

router.get("/:id", protectRoute, restrictTo("admin"), getUserById);

router.delete("/:id", protectRoute, restrictTo("admin"), deleteStaff);

router.patch("/:id/status", protectRoute, restrictTo("admin"), toggleStatus);

router.get("/me", protectRoute, getMyProfile);

router.patch("/me", protectRoute, updateMyProfile);

router.patch("/me/password", protectRoute, updateMyPassword);

export default router;