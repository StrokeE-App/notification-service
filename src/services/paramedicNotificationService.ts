import emergencyModel from "../models/emergencyModel";

export const getEmergencyFromDb = async (ambulanceId: string) =>{
    try{

        const emergencies = await emergencyModel.aggregate([
            {
                $match: {
                    ambulanceId: ambulanceId,
                    status: "TO_AMBULANCE"
                }
            },
            {
                $lookup: {
                    from: "patients",
                    localField: "patientId",
                    foreignField: "patientId",
                    as: "patient"
                }
            },
            {
                $unwind: "$patient"
            },
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
                    "patient.phoneNumber": 1
                }
            }
        ]);

        if (!emergencies || emergencies.length === 0) {
            return { success: true, message: "No se encontraron emergencias" };
        }
        
        return {success: true, data: emergencies};
    }catch(error){
        const errorMessage = error instanceof Error ? error.message : 'Error';
        return {success: false, data: `Error obteniendo emergencia ${errorMessage}`};
    }
}