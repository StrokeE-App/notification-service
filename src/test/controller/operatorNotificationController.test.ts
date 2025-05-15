import { getEmergencyOperator } from "../../controllers/operatorNotificationController";
import { getEmergencyFromDbOperator } from "../../services/operatorNotificationService";
import { messageEmitter } from "../../services/emiterService";
import { Request, Response, NextFunction } from "express";

jest.mock("../../services/operatorNotificationService");
jest.mock("../../services/emiterService", () => ({
    messageEmitter: {
        on: jest.fn(),
        off: jest.fn(),
    },
}));

describe("getEmergencyOperator Controller", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should write the current emergency data when found", async () => {
        const mockEmergency = { id: "123", status: "ACTIVE" };
        (getEmergencyFromDbOperator as jest.Mock).mockResolvedValue(mockEmergency);

        const req = {
            on: jest.fn(),
        } as unknown as Request;

        const res = {
            setHeader: jest.fn(),
            write: jest.fn(),
        } as unknown as Response;

        const next = jest.fn();

        await getEmergencyOperator(req, res, next);

        expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "text/event-stream");
        expect(res.setHeader).toHaveBeenCalledWith("Cache-Control", "no-cache");
        expect(res.setHeader).toHaveBeenCalledWith("Connection", "keep-alive");
        expect(res.write).toHaveBeenCalledWith(`data: ${JSON.stringify(mockEmergency)}\n\n`);
    });

    it("should write an error when the emergency is not found", async () => {
        (getEmergencyFromDbOperator as jest.Mock).mockResolvedValue(null);

        const req = {
            on: jest.fn(),
        } as unknown as Request;

        const res = {
            setHeader: jest.fn(),
            write: jest.fn(),
        } as unknown as Response;

        const next = jest.fn();

        await getEmergencyOperator(req, res, next);

        expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "text/event-stream");
        expect(res.setHeader).toHaveBeenCalledWith("Cache-Control", "no-cache");
        expect(res.setHeader).toHaveBeenCalledWith("Connection", "keep-alive");
        expect(res.write).toHaveBeenCalledWith(
            `data: {"error": "Emergencia no encontrada"}\n\n`
        );
    });

    it("should handle new messages and send updated emergency data", async () => {
        const mockEmergency = { id: "123", status: "ACTIVE" };
        (getEmergencyFromDbOperator as jest.Mock).mockResolvedValue(mockEmergency);

        const req = {
            on: jest.fn(),
        } as unknown as Request;

        const res = {
            setHeader: jest.fn(),
            write: jest.fn(),
        } as unknown as Response;

        const next = jest.fn();

        let callback: () => void = () => {};

        (messageEmitter.on as jest.Mock).mockImplementation((event, cb) => {
            if (event === "patientReport") callback = cb;
        });

        await getEmergencyOperator(req, res, next);

        callback();

        expect(res.write).toHaveBeenCalledWith(`data: ${JSON.stringify(mockEmergency)}\n\n`);
    });

    it("should call next with the error when an exception occurs", async () => {
        const error = new Error("Database error");
        (getEmergencyFromDbOperator as jest.Mock).mockRejectedValue(error);

        const req = {
            on: jest.fn(),
        } as unknown as Request;

        const res = {
            setHeader: jest.fn(),
            write: jest.fn(),
        } as unknown as Response;

        const next = jest.fn();

        await getEmergencyOperator(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});
