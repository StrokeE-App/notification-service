import { EventEmitter } from "events";

export const messageEmitter = new EventEmitter();

export const handleParamedicUpdateMessage = (message: any) => {
    console.log("entro al handleParamedicUpdateMessage", message);
    messageEmitter.emit(`paramedicUpdate`, message);
    messageEmitter.emit(`paramedicUpdate:${message.ambulanceId}`, message);
};

export const handleEmergencyStartedMessage = (message: any) => {
  messageEmitter.emit(`emergencyStarted:${message.ambulanceId}`, message);
};

export const handlePatientReportMessage = (message: any) => {
  messageEmitter.emit("patientReport", message);
};
