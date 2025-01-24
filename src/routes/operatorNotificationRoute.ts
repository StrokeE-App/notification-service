import { Router } from "express";
import { getEmergencyOperator } from "../controllers/operatorNotificationController";
import { verifyTokenWithRole } from "../middlewares/authMiddleware";

const router = Router();

router.get("/emergencies-patients", getEmergencyOperator);


export default router;