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
            res.write(`data: {"error": "No se ha proporcionado un ID de ambulancia"}\n\n`);
            return;
        }

        const currentEmergency = await getEmergencyFromDb(ambulanceId);
        if (currentEmergency) {
            res.write(`data: ${JSON.stringify(currentEmergency)}\n\n`);
        } else {
            res.write(`data: {"error": "Emergencia no encontrada"}\n\n`);
        }

        const onNewMessage = async (newMessage: any) => {
            console.log("Nuevo mensaje recibido:", newMessage);

            if (newMessage?.ambulanceId === ambulanceId) {
                console.log("La ambulancia coincide, enviando actualización al cliente.");
                const updateEmergency = await getEmergencyFromDb(ambulanceId);
                res.write(`data: ${JSON.stringify(updateEmergency)}\n\n`);
            } else {
                console.log("La ambulancia no coincide, ignorando el mensaje.");
            }
        };

        const eventKeys = [
            `emergencyStarted:${ambulanceId}`,
            `paramedicUpdate:${ambulanceId}`,
            `dlqErrorParamedic`
        ];

        eventKeys.forEach(eventKey => {
            messageEmitter.on(eventKey, onNewMessage);
        });

        const keepAliveInterval = setInterval(() => {
            res.write(`: ping\n\n`);
        }, 15000);


        req.on("close", () => {
            console.log(`Cliente desconectado de ambulancia ${ambulanceId}`);
            eventKeys.forEach(eventKey => {
                messageEmitter.off(eventKey, onNewMessage);
            });
            clearInterval(keepAliveInterval);
        });

    } catch (error) {
        next(error);
    }
};
