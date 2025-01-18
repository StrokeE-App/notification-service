import { Router } from "express";
import { getEmergency } from "../controllers/paramedicNotificactionController";

const router = Router();

router.get("/events/:emergencyId", getEmergency);


export default router;