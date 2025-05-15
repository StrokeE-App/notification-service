import emergencyModel from "../../models/emergencyModel";
import { getEmergencyFromDbOperator } from "../../services/operatorNotificationService";

jest.mock("../../models/emergencyModel", () => ({
    aggregate: jest.fn().mockReturnThis(),
}));

describe("getEmergencyFromDbOperator", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("debería retornar emergencias cuando aggregate devuelve datos", async () => {
        const mockEmergencies = [
            {
                emergencyId: "123",
                status: "PENDING",
                startDate: "2025-01-01T01:00:00Z",
                pickupDate: "2025-01-01T01:30:00Z",
                deliveredDate: "2025-01-01T02:00:00Z",
                nihScale: 15,
                patient: {
                    firstName: "Juan",
                    lastName: "Pérez",
                    age: 45,
                    height: 170,
                    weight: 70,
                    phoneNumber: "1234567890",
                },
            },
        ];

        (emergencyModel.aggregate as jest.Mock).mockResolvedValue(mockEmergencies);

        const result = await getEmergencyFromDbOperator();

        expect(result).toEqual({ success: true, data: mockEmergencies });
        expect(emergencyModel.aggregate).toHaveBeenCalledTimes(1);
        expect(emergencyModel.aggregate).toHaveBeenCalledWith([
            {
                $match: {
                    status: "PENDING",
                },
            },
            {
                $lookup: {
                    from: "patients",
                    localField: "patientId",
                    foreignField: "patientId",
                    as: "patient",
                },
            },
            { $unwind: "$patient" },
            {
                $project: {
                    "_id": 0,
                    "emergencyId": 1,
                    "status": 1,
                    "startDate": 1,
                    "pickupDate": 1,
                    "deliveredDate": 1,
                    "activatedBy": 1,
                    "nihScale": 1,
                    "patient.firstName": 1,
                    "patient.lastName": 1,
                    "patient.age": 1,
                    "patient.height": 1,
                    "patient.weight": 1,
                    "patient.phoneNumber": 1,
                },
            },
        ]);
    });

    it("debería retornar un mensaje de éxito cuando no se encuentran emergencias", async () => {
        (emergencyModel.aggregate as jest.Mock).mockResolvedValue([]);

        const result = await getEmergencyFromDbOperator();

        expect(result).toEqual({ success: true, message: "No se encontraron emergencias" });
        expect(emergencyModel.aggregate).toHaveBeenCalledTimes(1);
    });

    it("debería retornar un mensaje de error cuando ocurre una excepción", async () => {
        const errorMessage = "Error de conexión con la base de datos";
        (emergencyModel.aggregate as jest.Mock).mockRejectedValue(new Error(errorMessage));

        const result = await getEmergencyFromDbOperator();

        expect(result).toEqual({
            success: false,
            data: `Error obteniendo emergencia ${errorMessage}`,
        });
        expect(emergencyModel.aggregate).toHaveBeenCalledTimes(1);
    });

    it("debería manejar correctamente si aggregate retorna null", async () => {
        (emergencyModel.aggregate as jest.Mock).mockResolvedValue(null);

        const result = await getEmergencyFromDbOperator();

        expect(result).toEqual({ success: true, message: "No se encontraron emergencias" });
        expect(emergencyModel.aggregate).toHaveBeenCalledTimes(1);
    });
});
