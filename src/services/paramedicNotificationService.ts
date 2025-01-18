import messageModel from "../models/messageModel"

export const getEmergencyFromDb = async (emergencyId: string) =>{
    console.log('Buscando emergencia en la base de datos');
    try{

        const emergency = await messageModel.findById(emergencyId).sort({createdAt: -1});
        
        if(!emergency){
            return {success: false, data: null};
        }
        
        return {success: true, data: emergency};
    }catch(error){
        const errorMessage = error instanceof Error ? error.message : 'Error';
        return {success: false, data: `Error obteniendo emergencia ${errorMessage}`};
    }
}