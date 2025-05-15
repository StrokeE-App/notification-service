import emergencyModel from "../../models/emergencyModel";
import { getEmergencyFromDb } from "../../services/paramedicNotificationService";

jest.mock("../../models/emergencyModel", () => ({
    aggregate: jest.fn(),
}));

describe("getEmergencyFromDb", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return emergencies when aggregate returns data", async () => {
        const mockEmergencies = [
            {
                emergencyId: "123",
                status: "ACTIVE",
                startDate: "2025-01-01T01:00:00Z",
                pickupDate: "2025-01-01T01:30:00Z",
                deliveredDate: "2025-01-01T02:00:00Z",
                nihScale: 15,
                patient: {
                    firstName: "John",
                    lastName: "Doe",
                    age: 45,
                    height: 180,
                    weight: 80,
                    phoneNumber: "1234567890",
                },
            },
        ];
        
        emergencyModel.aggregate = jest.fn().mockResolvedValue(mockEmergencies);

        const result = await getEmergencyFromDb("AMB123");

        expect(result).toEqual({ success: true, data: mockEmergencies });
    });

    it("should return a success message when no emergencies are found", async () => {
        emergencyModel.aggregate = jest.fn().mockResolvedValue([]);
    
        const result = await getEmergencyFromDb("AMB123");
    
        expect(result).toEqual({ success: true, message: "No se encontraron emergencias" });
        expect(emergencyModel.aggregate).toHaveBeenCalledTimes(1);
    });

    it("should return an error message when an exception occurs", async () => {
        const errorMessage = "Database connection error";
        emergencyModel.aggregate = jest.fn().mockRejectedValue(new Error(errorMessage));
    
        const result = await getEmergencyFromDb("AMB123");
    
        expect(result).toEqual({
            success: false,
            data: `Error obteniendo emergencia ${errorMessage}`,
        });
        expect(emergencyModel.aggregate).toHaveBeenCalledTimes(1);
    });
    
    it("should return no emergencies when ambulanceId is invalid", async () => {
        emergencyModel.aggregate = jest.fn().mockResolvedValue([]);
    
        const result = await getEmergencyFromDb("");
    
        expect(result).toEqual({ success: true, message: "No se encontraron emergencias" });
        expect(emergencyModel.aggregate).toHaveBeenCalledWith([
            {
                $match: { 
                    ambulanceId: "", 
                    status: { $in: ["TO_AMBULANCE", "CONFIRMED"] } // Ajuste aquí para reflejar la consulta correcta
                },
            },
            {
                $lookup: {
                    as: "patient",
                    foreignField: "patientId",
                    from: "patients",
                    localField: "patientId",
                },
            },
            { $unwind: "$patient" },
            {
                $project: {
                    _id: 0,
                    activatedBy: 1,
                    deliveredDate: 1,
                    emergencyId: 1,
                    nihScale: 1,
                    "patient.age": 1,
                    "patient.firstName": 1,
                    "patient.height": 1,
                    "patient.lastName": 1,
                    "patient.phoneNumber": 1,
                    "patient.weight": 1,
                    pickupDate: 1,
                    startDate: 1,
                    status: 1,
                },
            },
        ]);
    });    
    

});
