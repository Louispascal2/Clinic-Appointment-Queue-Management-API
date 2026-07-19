import express from  "express";
import { protectRoute } from "../middleware/auth_middleware.js";
import {restrictTo} from "../middleware/roleMiddleware.js";
import { createAppointment, getAppointmentById, getAllAppointments, updateAppointmentStatus, cancelAppointment } from "../controller/appointment_controller.js";

const router = express.Router();

router.post("/", protectRoute, restrictTo("patient", "receptionist", "admin"), createAppointment);

router.get("/", protectRoute, getAllAppointments);

router.get("/:id", protectRoute, getAppointmentById);

router.patch("/:id/status", protectRoute, restrictTo("admin", "receptionist"), updateAppointmentStatus);

router.patch("/:id/cancel", protectRoute, restrictTo("patient", "receptionist", "admin"));


export default router;