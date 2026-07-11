import express from "express";
import { createDepartment, getAllDept, getDepartmentById, updateDept, deleteDept } from "../controller/department_controller.js";
import { restrictTo } from "../middleware/roleMiddleware.js";
import { protectRoute } from "../middleware/auth_middleware.js";

const router = express.Router()

router.post("/", protectRoute, restrictTo("admin"), createDepartment);

router.get("/", protectRoute, getAllDept);

router.get("/:id", protectRoute, getDepartmentById);

router.patch("/:id", protectRoute, restrictTo("admin"), updateDept);

router.delete("/:id", protectRoute, restrictTo("admin"), deleteDept);



export default router;
