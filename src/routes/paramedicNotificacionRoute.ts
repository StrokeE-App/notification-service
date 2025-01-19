import { Router } from "express";
import { getEmergency } from "../controllers/paramedicNotificactionController";

const router = Router();

router.get("/events/:ambulanceId", getEmergency);


export default router;