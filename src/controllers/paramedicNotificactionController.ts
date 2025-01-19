import { getEmergencyFromDb } from "../services/paramedicNotificationService";
import { messageEmitter } from "../services/emiterService";
import { NextFunction, Request, Response } from "express";

export const getEmergency = async (req: Request, res: Response, next: NextFunction) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    try {
        const ambulanceId = req.params.ambulanceId;

        if (!ambulanceId) {
            res.write(`data: {"error": "No se ha proporcionado un ID de emergencia"}\n\n`);
            return;
        }

        const currentEmergency = await getEmergencyFromDb(ambulanceId);
        if (currentEmergency) {
            console.log('Emergencia actual:', currentEmergency);
            res.write(`data: ${JSON.stringify(currentEmergency)}\n\n`);
        } else {
            res.write(`data: {"error": "Emergencia no encontrada"}\n\n`);
        }

        const onNewMessage = async (newMessage: any) => {
            if (newMessage.ambulanceId === ambulanceId) {
                const updateEmergency = await getEmergencyFromDb(ambulanceId);
                res.write(`data: ${JSON.stringify(updateEmergency)}\n\n`);
            } else {
                console.log('Mensaje no es para este cliente');
            }
        };

        messageEmitter.on("newMessage", onNewMessage);

        req.on("close", () => {
            console.log(`Cliente ${ambulanceId} desconectado de SSE`);
            messageEmitter.off("newMessage", onNewMessage);
        });
    } catch (error) {
        next(error);
    }
};
