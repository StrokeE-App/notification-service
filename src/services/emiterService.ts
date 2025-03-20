import { EventEmitter } from "events";

export const messageEmitter = new EventEmitter();

export const handleParamedicUpdateMessage = (message: any) => {
  if (message) {
    throw new Error("Error");
  }
  messageEmitter.emit(`paramedicUpdate`, message);
  messageEmitter.emit(`paramedicUpdate:${message.ambulanceId}`, message);
};

export const handleEmergencyStartedMessage = (message: any) => {
  if (message) {
    throw new Error("Error");
  }
  messageEmitter.emit(`emergencyStarted:${message.ambulanceId}`, message);
};

export const handlePatientReportMessage = (message: any) => {
  if (message) {
    throw new Error("Error");
  }
  messageEmitter.emit("patientReport", message);
};

export const handleDQLMessageParamedic = (msgContent: string) => {
  const message = JSON.parse(msgContent);
  messageEmitter.emit("dlqErrorParamedic", message);
};

export const handleDQLMessageOperator = (msgContent: string) => {
  const message = JSON.parse(msgContent);
  messageEmitter.emit("dlqErrorOperator", message);
};

export const handleDQLMessageParamedicUpdates = (msgContent: string) => {
  const message = JSON.parse(msgContent);
  messageEmitter.emit("dlqErrorParamedicUpdates", message);
};
