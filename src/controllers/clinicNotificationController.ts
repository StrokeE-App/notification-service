import { getEmergencyFromDbClinic } from "../services/clinicNotificationService";
import { messageEmitter } from "../services/emiterService";
import { NextFunction, Request, Response } from "express";

export const getEmergencyClinic = async (req: Request, res: Response, next: NextFunction) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    try {
        // Enviar emergencia actual si existe
        const currentEmergency = await getEmergencyFromDbClinic();
        if (currentEmergency) {
            res.write(`data: ${JSON.stringify(currentEmergency)}\n\n`);
        } else {
            res.write(`data: {"error": "Emergencia no encontrada"}\n\n`);
        }

        // Listener único por conexión
        const onNewMessage = async () => {
            try {
                console.log("Evento recibido para la clínica");
                const updateEmergency = await getEmergencyFromDbClinic();
                res.write(`data: ${JSON.stringify(updateEmergency)}\n\n`);
            } catch (error) {
                console.error("Error al procesar la nueva emergencia:", error);
            }
        };

        // Eventos para la clínica
        const eventKeys = ["paramedicUpdate", "dlqErrorParamedicUpdates"];

        // Suscribirse a los eventos
        eventKeys.forEach(eventKey => {
            messageEmitter.on(eventKey, onNewMessage);
        });


        // PING cada 15 segundos
        const keepAliveInterval = setInterval(() => {
            res.write(`: ping\n\n`);
        }, 15000);


        // Eliminar listeners al cerrar conexión
        req.on("close", () => {
            console.log("Cliente clínica desconectado");
            eventKeys.forEach(eventKey => {
                messageEmitter.off(eventKey, onNewMessage);
            });
            clearInterval(keepAliveInterval);
        });

    } catch (error) {
        next(error);
    }
};
