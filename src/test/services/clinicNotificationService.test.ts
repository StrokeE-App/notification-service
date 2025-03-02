import emergencyModel from "../../models/emergencyModel";
import { getEmergencyFromDbClinic } from "../../services/clinicNotificationService";

jest.mock("../../models/emergencyModel", () => ({
    aggregate: jest.fn(),
}));

describe("getEmergencyFromDbClinic", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("debería retornar emergencias cuando aggregate devuelve datos", async () => {
        const mockEmergencies = [
            {
                emergencyId: "123",
                status: "CONFIRMED",
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
        
        (emergencyModel.aggregate as jest.Mock).mockResolvedValue(mockEmergencies);

        const result = await getEmergencyFromDbClinic();

        expect(result).toEqual({ success: true, data: mockEmergencies });
        expect(emergencyModel.aggregate).toHaveBeenCalledTimes(1);
    });

    it("debería retornar un mensaje de éxito cuando no se encuentran emergencias", async () => {
        (emergencyModel.aggregate as jest.Mock).mockResolvedValue([]);

        const result = await getEmergencyFromDbClinic();

        expect(result).toEqual({ success: true, message: "No se encontraron emergencias" });
        expect(emergencyModel.aggregate).toHaveBeenCalledTimes(1);
    });

});
