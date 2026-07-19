import express from "express";
import { protectRoute } from "../middleware/auth_middleware.js";
import { restrictTo } from "../middleware/roleMiddleware.js";
import { getTodayQueue, checkInPatient,callNextPatient } from "../controller/queue_controller.js";

const router = express.Router()

router.get("/:doctorId", protectRoute, restrictTo("doctor", "receptionist", "admin"), getTodayQueue);


router.patch("/:appointmentId/check-in", protectRoute, restrictTo("receptionist", "admin"), checkInPatient);


router.patch("/:appointmentId/call-next", protectRoute, restrictTo("doctor"), callNextPatient);


export default router;