import { getEmergencyFromDbOperator } from "../services/operatorNotificationService";
import { messageEmitter } from "../services/emiterService";
import { NextFunction, Request, Response } from "express";

export const getEmergencyOperator = async (req: Request, res: Response, next: NextFunction) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    try {
        const currentEmergency = await getEmergencyFromDbOperator();
        if (currentEmergency) {
            res.write(`data: ${JSON.stringify(currentEmergency)}\n\n`);
        } else {
            res.write(`data: {"error": "Emergencia no encontrada"}\n\n`);
        }

        const onNewMessage = async () => {
            try {
                const updateEmergency = await getEmergencyFromDbOperator();
                res.write(`data: ${JSON.stringify(updateEmergency)}\n\n`);
            } catch (error) {
                console.error("Error al procesar la nueva emergencia:", error);
            }
        };

        if (!messageEmitter.listenerCount("patientReport")) {
            messageEmitter.on("patientReport", onNewMessage);
        }

        req.on("close", () => {
            messageEmitter.off("patientReport", onNewMessage);
        });
    } catch (error) {
        next(error);
    }
};
