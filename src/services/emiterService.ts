import { EventEmitter } from "events";

export const messageEmitter = new EventEmitter();

messageEmitter.on("newMessage", (savedMessage) => {
  console.log("Evento 'newMessage' emitido:", savedMessage);
});