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

        // Obtener emergencia actual
        const currentEmergency = await getEmergencyFromDb(ambulanceId);
        if (currentEmergency) {
            res.write(`data: ${JSON.stringify(currentEmergency)}\n\n`);
        } else {
            res.write(`data: {"error": "Emergencia no encontrada"}\n\n`);
        }

        // Función para manejar los eventos
        const onNewMessage = async (newMessage: any) => {
            console.log("Nuevo mensaje recibido:", newMessage);

            if (newMessage?.ambulanceId === ambulanceId) {
                const updateEmergency = await getEmergencyFromDb(ambulanceId);
                res.write(`data: ${JSON.stringify(updateEmergency)}\n\n`);
            } else {
                console.log("La ambulancia no coincide, ignorando el mensaje.");
            }
        };

        // Claves de eventos a escuchar
        const eventKeys = [`emergencyStarted:${ambulanceId}`, `paramedicUpdate:${ambulanceId}`];

        // Suscribir a eventos si no hay listeners previos
        eventKeys.forEach(eventKey => {
            if (!messageEmitter.listenerCount(eventKey)) {
                messageEmitter.on(eventKey, onNewMessage);
            }
        });

        const errorEventKey = `dlqErrorParamedic`;
        if (!messageEmitter.listenerCount(errorEventKey)) {
            messageEmitter.on(errorEventKey, onNewMessage);
        }

        // Manejar cierre de conexión
        req.on("close", () => {
            eventKeys.forEach(eventKey => messageEmitter.off(eventKey, onNewMessage));
            messageEmitter.off(errorEventKey, onNewMessage);
        });

    } catch (error) {
        next(error);
    }
};
