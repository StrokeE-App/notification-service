import { getEmergency } from "../../controllers/paramedicNotificactionController";
import { getEmergencyFromDb } from "../../services/paramedicNotificationService";
import { messageEmitter } from "../../services/emiterService";
import { Request, Response, NextFunction } from "express";

jest.mock("../../services/paramedicNotificationService");
jest.mock("../../services/emiterService", () => ({
    messageEmitter: {
        on: jest.fn(),
        off: jest.fn(),
    },
}));

describe("getEmergency Controller", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return an error when ambulanceId is not provided", async () => {
        const req = {
            params: {},
            on: jest.fn(),
        } as unknown as Request;

        const res = {
            setHeader: jest.fn(),
            write: jest.fn(),
        } as unknown as Response;

        const next = jest.fn();

        await getEmergency(req, res, next);

        expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "text/event-stream");
        expect(res.setHeader).toHaveBeenCalledWith("Cache-Control", "no-cache");
        expect(res.setHeader).toHaveBeenCalledWith("Connection", "keep-alive");
        expect(res.write).toHaveBeenCalledWith(
            `data: {"error": "No se ha proporcionado un ID de emergencia"}\n\n`
        );
        expect(next).not.toHaveBeenCalled();
    });

    it("should write the current emergency data when found", async () => {
        const ambulanceId = "AMB123";
        const mockEmergency = { success: true, data: [{ emergencyId: "123", status: "ACTIVE" }] };

        (getEmergencyFromDb as jest.Mock).mockResolvedValue(mockEmergency);

        const req = {
            params: { ambulanceId },
            on: jest.fn(),
        } as unknown as Request;

        const res = {
            setHeader: jest.fn(),
            write: jest.fn(),
        } as unknown as Response;

        const next = jest.fn();

        await getEmergency(req, res, next);

        expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "text/event-stream");
        expect(res.setHeader).toHaveBeenCalledWith("Cache-Control", "no-cache");
        expect(res.setHeader).toHaveBeenCalledWith("Connection", "keep-alive");
        expect(res.write).toHaveBeenCalledWith(`data: ${JSON.stringify(mockEmergency)}\n\n`);
        expect(next).not.toHaveBeenCalled();
    });

    it("should write an error when the emergency is not found", async () => {
        const ambulanceId = "AMB123";

        (getEmergencyFromDb as jest.Mock).mockResolvedValue(null);

        const req = {
            params: { ambulanceId },
            on: jest.fn(),
        } as unknown as Request;

        const res = {
            setHeader: jest.fn(),
            write: jest.fn(),
        } as unknown as Response;

        const next = jest.fn();

        await getEmergency(req, res, next);

        expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "text/event-stream");
        expect(res.setHeader).toHaveBeenCalledWith("Cache-Control", "no-cache");
        expect(res.setHeader).toHaveBeenCalledWith("Connection", "keep-alive");
        expect(res.write).toHaveBeenCalledWith(
            `data: {"error": "Emergencia no encontrada"}\n\n`
        );
        expect(next).not.toHaveBeenCalled();
    });

    it("should call next with the error when an exception occurs", async () => {
        const ambulanceId = "AMB123";
        const error = new Error("Database error");

        (getEmergencyFromDb as jest.Mock).mockRejectedValue(error);

        const req = {
            params: { ambulanceId },
            on: jest.fn(),
        } as unknown as Request;

        const res = {
            setHeader: jest.fn(),
            write: jest.fn(),
        } as unknown as Response;

        const next = jest.fn();

        await getEmergency(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });

    it("should handle new messages and send updated emergency data", async () => {
        const ambulanceId = "AMB123";
        const mockEmergency = { success: true, data: [{ emergencyId: "123", status: "ACTIVE" }] };

        (getEmergencyFromDb as jest.Mock).mockResolvedValue(mockEmergency);

        const req = {
            params: { ambulanceId },
            on: jest.fn(),
        } as unknown as Request;

        const res = {
            setHeader: jest.fn(),
            write: jest.fn(),
        } as unknown as Response;

        const next = jest.fn();

        let callback: (newMessage: any) => void = () => {};

        (messageEmitter.on as jest.Mock).mockImplementation((event, cb) => {
            if (event === "newMessage") callback = cb;
        });

        await getEmergency(req, res, next);

        callback({ ambulanceId: "AMB123" });

        expect(messageEmitter.on).toHaveBeenCalledWith("newMessage", expect.any(Function));
        expect(res.write).toHaveBeenCalledWith(`data: ${JSON.stringify(mockEmergency)}\n\n`);

        req.on("close", () => {
            expect(messageEmitter.off).toHaveBeenCalledWith("newMessage", expect.any(Function));
        });
    });

    it("should remove the event listener on request close", async () => {
        const ambulanceId = "AMB123";

        (getEmergencyFromDb as jest.Mock).mockResolvedValue(null);

        const req = {
            params: { ambulanceId },
            on: jest.fn((event, cb) => {
                if (event === "close") cb();
            }),
        } as unknown as Request;

        const res = {
            setHeader: jest.fn(),
            write: jest.fn(),
        } as unknown as Response;

        const next = jest.fn();

        await getEmergency(req, res, next);

        expect(messageEmitter.off).toHaveBeenCalledWith("newMessage", expect.any(Function));
    });
});
