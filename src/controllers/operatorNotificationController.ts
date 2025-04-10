import { getEmergencyFromDbOperator } from "../services/operatorNotificationService";
import { messageEmitter } from "../services/emiterService";
import { NextFunction, Request, Response } from "express";

export const getEmergencyOperator = async (req: Request, res: Response, next: NextFunction) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    try {
        // Enviar la emergencia actual si existe
        const currentEmergency = await getEmergencyFromDbOperator();
        if (currentEmergency) {
            res.write(`data: ${JSON.stringify(currentEmergency)}\n\n`);
        } else {
            res.write(`data: {"error": "Emergencia no encontrada"}\n\n`);
        }

        // Listener por conexión
        const onNewMessage = async () => {
            try {
                console.log("Nuevo mensaje recibido");
                const updateEmergency = await getEmergencyFromDbOperator();
                res.write(`data: ${JSON.stringify(updateEmergency)}\n\n`);
            } catch (error) {
                console.error("Error al procesar la nueva emergencia:", error);
            }
        };

        // Eventos relevantes para operadores
        const eventKeys = ["patientReport", "dlqErrorOperator"];

        // Registrar listeners por conexión
        eventKeys.forEach(eventKey => {
            messageEmitter.on(eventKey, onNewMessage);
        });

        // PING cada 15 segundos
        const keepAliveInterval = setInterval(() => {
            res.write(`: ping\n\n`);
        }, 15000);

        // Manejar desconexión
        req.on("close", () => {
            console.log("Cliente operador desconectado");
            eventKeys.forEach(eventKey => {
                messageEmitter.off(eventKey, onNewMessage);
            });
            clearInterval(keepAliveInterval);
        });

    } catch (error) {
        next(error);
    }
};
