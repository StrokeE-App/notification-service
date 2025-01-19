import amqp from "amqplib";
import { messageEmitter } from "./emiterService";

export const consumeMessages = async (queueName: string) => {
  try {
    const connection = await amqp.connect(process.env.RABBIT_MQ || "amqp://localhost");
    const channel = await connection.createChannel();
    await channel.assertQueue(queueName, { durable: true });

    console.log(`Esperando mensajes en la cola: ${queueName}`);

    channel.consume(queueName, async (msg) => {
        console.log('Mensaje recibido');
      if (msg) {
        const messageContent = JSON.parse(msg.content.toString());
        console.log(`Mensaje recibido: ${messageContent}`);
        const messageContonetToJson = JSON.parse(messageContent);

        messageEmitter.emit("newMessage", messageContonetToJson);

        channel.ack(msg); 
      }
    });
  } catch (error) {
    console.error("Error al consumir mensajes de RabbitMQ:", error);
  }
};
