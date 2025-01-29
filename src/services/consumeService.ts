import amqp from "amqplib";

export const consumeMessages = async (
  queueName: string,
  exchangeName: string,
  routingKey: string,
  onMessage: (message: any) => void
) => {
  const connectRabbitMQ = async () => {
    try {
      const connection = await amqp.connect(process.env.RABBIT_MQ || "amqp://localhost");
      const channel = await connection.createChannel();

      await channel.assertQueue(queueName, { durable: true });
      await channel.assertExchange(exchangeName, "direct", { durable: true });
      await channel.bindQueue(queueName, exchangeName, routingKey);

      console.log(`Cola "${queueName}" vinculada al exchange "${exchangeName}" con routingKey "${routingKey}"`);

      channel.consume(queueName, async (msg) => {
        if (msg) {
          try {
            console.log("Recibido mensaje:", msg.content.toString());
            const messageContent = msg.content.toString();
            const messageJson = JSON.parse(messageContent);
            onMessage(messageJson);
            channel.ack(msg);
          } catch (parseError) {
            console.error("Error al procesar el mensaje:", parseError);
            channel.nack(msg);
          }
        }
      });

      // Manejo de cierre de conexión
      connection.on("close", () => {
        console.error("Conexión cerrada. Intentando reconectar...");
        setTimeout(connectRabbitMQ, 5000); // Intentar reconectar después de 5 segundos
      });
    } catch (error) {
      console.error("Error al consumir mensajes de RabbitMQ:", error);
      setTimeout(connectRabbitMQ, 5000); // Intentar reconectar después de 5 segundos
    }
  };

  await connectRabbitMQ();
};
