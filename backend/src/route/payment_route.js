import express from "express";
import { initializePayment, verifyPayment } from "../controller/payment_controller.js";
import { restrictTo } from "../middleware/roleMiddleware.js";
import { protectRoute } from "../middleware/auth_middleware.js";

const router = express.Router()

router.post("/initialize", protectRoute, restrictTo("patient"), initializePayment);

router.get("/verify/:reference", protectRoute, restrictTo("patient"), verifyPayment);


export default router;