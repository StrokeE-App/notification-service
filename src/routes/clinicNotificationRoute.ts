import { Router } from "express";
import { getEmergencyClinic } from "../controllers/clinicNotificationController";
import { verifyTokenWithRole } from "../middlewares/authMiddleware";

const router = Router();

router.get("/emergencies", verifyTokenWithRole(["clinic", "admin"]), getEmergencyClinic);


export default router;