import amqp from "amqplib";
import { messageEmitter } from "./emiterService";

export const consumeMessages = async (queueName: string, exchangeName: string, routingKey: string) => {
  try {
    const connection = await amqp.connect(process.env.RABBIT_MQ || "amqp://localhost");
    const channel = await connection.createChannel();

    await channel.assertQueue(queueName, { durable: true });

    await channel.assertExchange(exchangeName, "direct", { durable: true });

    await channel.bindQueue(queueName, exchangeName, routingKey);
    console.log(`Cola "${queueName}" vinculada al exchange "${exchangeName}" con routingKey "${routingKey}"`);

    channel.consume(queueName, async (msg) => {
        console.log('Mensaje recibido');
      if (msg) {
        try {
          const messageContent = msg.content.toString();
          
          const messageJson = JSON.parse(messageContent);

          messageEmitter.emit("newMessage", messageJson);

          channel.ack(msg);
        } catch (parseError) {
          console.error("Error al procesar el mensaje:", parseError);
          channel.nack(msg);
        }
      }
    });
  } catch (error) {
    console.error("Error al consumir mensajes de RabbitMQ:", error);
  }
};
