import { getEmergencyFromDb } from "../services/paramedicNotificationService";
import { NextFunction, Request, Response } from "express";

export const getEmergency = async (req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
        const emergencyId = req.params.emergencyId;

        if (!emergencyId) {
            res.write(`data: {"error": "No se ha proporcionado un ID de emergencia"}\n\n`);
            return;
        }

        console.log(`Cliente ${req.params.emergencyId} conectado a SSE`);

        const result = await getEmergencyFromDb(emergencyId);
        
        if (result.success) {
            res.write(`data: ${JSON.stringify(result.data)}\n\n`);  
        } else {
            res.write(`data: ${JSON.stringify(result.data)}\n\n`);  
        }


    } catch (error) {
        next(error); 
    }

    req.on('close', () => {
        console.log(`Cliente ${req.params.emergencyId} desconectado de SSE`);
    });
};
