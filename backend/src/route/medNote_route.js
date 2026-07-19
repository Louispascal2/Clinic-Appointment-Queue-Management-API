import express from "express";
import { createMedNote, getPatientHistory } from "../controller/medicalNote_controller.js";
import { protectRoute } from "../middleware/auth_middleware.js";
import { restrictTo } from "../middleware/roleMiddleware.js";

const router = express.Router()

router.post("/", protectRoute, restrictTo(("doctor"), createMedNote));

router.get("/patient/:patientId", protectRoute, restrictTo("patient", "doctor", "admin"), getPatientHistory);


export default router;