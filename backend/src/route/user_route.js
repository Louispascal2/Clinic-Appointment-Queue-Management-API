import express from"express";
import {restrictTo} from "../middleware/roleMiddleware.js";
import { createStaff } from "../controller/user_controller.js";
import { protectRoute } from "../middleware/auth_middleware.js";



const router = express.Router();


router.post("/staff", protectRoute, restrictTo("admin"), createStaff );


export default router;