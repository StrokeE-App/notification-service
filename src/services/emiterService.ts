import { EventEmitter } from "events";

export const messageEmitter = new EventEmitter();

export const handleParamedicUpdateMessage = (message: any) => {
  console.log("emitiendo paramedicUpdate");
  messageEmitter.emit(`paramedicUpdate`, message);
  messageEmitter.emit(`paramedicUpdate:${message.ambulanceId}`, message);
};

export const handleEmergencyStartedMessage = (message: any) => {
  console.log("emitiendo emergencyStarted");
  messageEmitter.emit(`emergencyStarted:${message.ambulanceId}`, message);
};

export const handlePatientReportMessage = (message: any) => {
  console.log("emitiendo patientReport");
  messageEmitter.emit("patientReport", message);
};

export const handleDQLMessageParamedic = (msgContent: string) => {
  console.log("emitiendo dlqErrorParamedic");
  const message = JSON.parse(msgContent);
  messageEmitter.emit("dlqErrorParamedic", message);
};

export const handleDQLMessageOperator = (msgContent: string) => {
  console.log("emitiendo dlqErrorOperator");
  const message = JSON.parse(msgContent);
  messageEmitter.emit("dlqErrorOperator", message);
};

export const handleDQLMessageParamedicUpdates = (msgContent: string) => {
  console.log("emitiendo dlqErrorParamedicUpdates");
  const message = JSON.parse(msgContent);
  messageEmitter.emit("dlqErrorParamedicUpdates", message);
};
