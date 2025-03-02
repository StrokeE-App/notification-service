import { getEmergencyClinic } from "../../controllers/clinicNotificationController";
import { getEmergencyFromDbClinic } from "../../services/clinicNotificationService";
import { messageEmitter } from "../../services/emiterService";
import { Request, Response, NextFunction } from "express";

jest.mock("../../services/clinicNotificationService");
jest.mock("../../services/emiterService", () => ({
    messageEmitter: {
        on: jest.fn(),
        off: jest.fn(),
        listenerCount: jest.fn().mockReturnValue(0),
    },
}));

describe("getEmergencyClinic Controller", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("debería escribir los datos de la emergencia actual cuando se encuentra", async () => {
        const mockEmergency = { id: "123", status: "CONFIRMED" };
        (getEmergencyFromDbClinic as jest.Mock).mockResolvedValue(mockEmergency);

        const req = { on: jest.fn() } as unknown as Request;
        const res = {
            setHeader: jest.fn(),
            write: jest.fn(),
        } as unknown as Response;
        const next = jest.fn();

        await getEmergencyClinic(req, res, next);

        expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "text/event-stream");
        expect(res.setHeader).toHaveBeenCalledWith("Cache-Control", "no-cache");
        expect(res.setHeader).toHaveBeenCalledWith("Connection", "keep-alive");
        expect(res.write).toHaveBeenCalledWith(`data: ${JSON.stringify(mockEmergency)}\n\n`);
    });

    it("debería escribir un error cuando no se encuentra la emergencia", async () => {
        (getEmergencyFromDbClinic as jest.Mock).mockResolvedValue(null);

        const req = { on: jest.fn() } as unknown as Request;
        const res = {
            setHeader: jest.fn(),
            write: jest.fn(),
        } as unknown as Response;
        const next = jest.fn();

        await getEmergencyClinic(req, res, next);

        expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "text/event-stream");
        expect(res.setHeader).toHaveBeenCalledWith("Cache-Control", "no-cache");
        expect(res.setHeader).toHaveBeenCalledWith("Connection", "keep-alive");
        expect(res.write).toHaveBeenCalledWith(`data: {"error": "Emergencia no encontrada"}\n\n`);
    });

    it("debería manejar nuevos mensajes y enviar datos de emergencia actualizados", async () => {
        const mockEmergency = { id: "123", status: "CONFIRMED" };
        (getEmergencyFromDbClinic as jest.Mock).mockResolvedValue(mockEmergency);

        const req = { on: jest.fn() } as unknown as Request;
        const res = {
            setHeader: jest.fn(),
            write: jest.fn(),
        } as unknown as Response;
        const next = jest.fn();

        let callback: () => void = () => {};

        (messageEmitter.on as jest.Mock).mockImplementation((event, cb) => {
            if (event === "patientReport") callback = cb;
        });

        await getEmergencyClinic(req, res, next);

        callback();

        expect(res.write).toHaveBeenCalledWith(`data: ${JSON.stringify(mockEmergency)}\n\n`);
    });

    it("debería eliminar el listener del evento cuando la petición se cierra", async () => {
        const req = {
            on: jest.fn((event, cb) => {
                if (event === "close") cb();
            }),
        } as unknown as Request;
        const res = {
            setHeader: jest.fn(),
            write: jest.fn(),
        } as unknown as Response;
        const next = jest.fn();

        await getEmergencyClinic(req, res, next);

        expect(messageEmitter.off).toHaveBeenCalledWith("patientReport", expect.any(Function));
    });

    it("debería llamar a next con el error cuando ocurre una excepción", async () => {
        const error = new Error("Database error");
        (getEmergencyFromDbClinic as jest.Mock).mockRejectedValue(error);

        const req = { on: jest.fn() } as unknown as Request;
        const res = {
            setHeader: jest.fn(),
            write: jest.fn(),
        } as unknown as Response;
        const next = jest.fn();

        await getEmergencyClinic(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});
