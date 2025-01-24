import { Router } from "express";
import { getEmergency } from "../controllers/paramedicNotificactionController";
import { verifyTokenWithRole } from "../middlewares/authMiddleware";

const router = Router();

router.get("/emergencies/:ambulanceId", getEmergency);


export default router;