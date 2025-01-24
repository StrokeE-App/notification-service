import { EventEmitter } from "events";

export const messageEmitter = new EventEmitter();

export const handleParamedicUpdateMessage = (message: any) => {
  messageEmitter.emit("paramedicUpdate", message);
};

export const handleEmergencyStartedMessage = (message: any) => {
  messageEmitter.emit("emergencyStarted", message);
};

export const handlePatientReportMessage = (message: any) => {
  messageEmitter.emit("patientReport", message);
};
