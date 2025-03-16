import { getEmergencyFromDbClinic } from "../services/clinicNotificationService";
import { messageEmitter } from "../services/emiterService";
import { NextFunction, Request, Response } from "express";

export const getEmergencyClinic = async (req: Request, res: Response, next: NextFunction) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    try {
        const currentEmergency = await getEmergencyFromDbClinic();
        if (currentEmergency) {
            res.write(`data: ${JSON.stringify(currentEmergency)}\n\n`);
        } else {
            res.write(`data: {"error": "Emergencia no encontrada"}\n\n`);
        }

        const onNewMessage = async () => {
            try {
                console.log("entro al onNewMessage");
                const updateEmergency = await getEmergencyFromDbClinic();
                res.write(`data: ${JSON.stringify(updateEmergency)}\n\n`);
            } catch (error) {
                console.error("Error al procesar la nueva emergencia:", error);
            }
        };

        if (!messageEmitter.listenerCount("paramedicUpdate")) {
            messageEmitter.on("paramedicUpdate", onNewMessage);
        }else{
            console.log("entro al else");
        }

        req.on("close", () => {
            messageEmitter.off("paramedicUpdate", onNewMessage);
        });
    } catch (error) {
        next(error);
    }
};
