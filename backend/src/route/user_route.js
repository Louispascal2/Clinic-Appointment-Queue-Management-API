import express from"express";
import {restrictTo} from "../middleware/roleMiddleware.js";
import { createStaff, getAllUsers, updateUser } from "../controller/user_controller.js";
import { protectRoute } from "../middleware/auth_middleware.js";



const router = express.Router();


router.post("/staff", protectRoute, restrictTo("admin"), createStaff );

router.get("/", protectRoute, restrictTo("admin"), getAllUsers);

router.patch("/:id", protectRoute, restrictTo("admin", updateUser));

export default router;