import amqp from "amqplib";
import { handleDQLMessageParamedic, handleDQLMessageOperator, handleDQLMessageParamedicUpdates } from "./emiterService";
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

      const dlxExchange = `${queueName}.dlx`;
      const dlqName = `${queueName}.dlq`;

      // Declarar el exchange de la DLQ
      await channel.assertExchange(dlxExchange, "direct", { durable: true });

      // Declarar la DLQ
      await channel.assertQueue(dlqName, { durable: true });
      await channel.bindQueue(dlqName, dlxExchange, dlqName);

      // Declarar la cola principal con DLX configurado
      await channel.assertQueue(queueName, {
        durable: true,
        arguments: {
          "x-dead-letter-exchange": dlxExchange,
          "x-dead-letter-routing-key": dlqName
        }
      });

      // Declarar el exchange principal y enlazar la cola principal
      await channel.assertExchange(exchangeName, "direct", { durable: true });
      await channel.bindQueue(queueName, exchangeName, routingKey);

      console.log(`Cola "${queueName}" vinculada al exchange "${exchangeName}" con routingKey "${routingKey}"`);

      channel.prefetch(1);

      channel.consume(queueName, async (msg) => {
        if (msg) {
          try {
            console.log(`Recibido mensaje: ${msg.content.toString()} - queue: ${queueName}`);
            const messageJson = JSON.parse(msg.content.toString());
            await onMessage(messageJson);
            channel.ack(msg);
          } catch (error) {
            console.error("Error en onMessage:", error);
            channel.nack(msg, false, false); // No reencolar, enviar a DLQ
          }
        }
      });

      connection.on("close", () => {
        console.error("Conexión cerrada. Intentando reconectar...");
        setTimeout(connectRabbitMQ, 5000);
      });
    } catch (error) {
      console.error("Error al consumir mensajes de RabbitMQ:", error);
      setTimeout(connectRabbitMQ, 5000);
    }
  };

  await connectRabbitMQ();
};


export const consumeDLQ = async (dlqNames: string[]) => {
  const connectRabbitMQ = async () => {
    try {
      const connection = await amqp.connect(process.env.RABBIT_MQ || "amqp://localhost");
      const channel = await connection.createChannel();

      for (const dlqName of dlqNames) {
        await channel.assertQueue(dlqName, { durable: true });

        console.log(`📥 Consumidor activo para DLQ: ${dlqName}`);

        channel.consume(dlqName, async (msg) => {
          if (!msg) return;
          try {
            const content = msg.content.toString();
            console.log("📥 Recibido mensaje de DLQ:", content);

            console.log(`📥 Procesando mensaje de ${dlqName}`);

            switch (dlqName) {
              case "paramedic_update_queue.dlq":
                await handleDQLMessageParamedicUpdates(content);
                break;
              case "emergency_started_queue.dlq":
                await handleDQLMessageParamedic(content);
                break;
              case "patient_report_queue.dlq":
                await handleDQLMessageOperator(content);
                break;
              default:
                console.warn("⚠️ Cola DLQ desconocida:", dlqName);
            }

            channel.ack(msg);
          } catch (error) {
            console.error(`🚨 Error procesando mensaje de ${dlqName}:`, error);
            channel.nack(msg, false, false); // No reencolar en la DLQ
          }
        });
      }

      connection.on("close", () => {
        console.error("Conexión cerrada. Intentando reconectar...");
        setTimeout(connectRabbitMQ, 5000);
      });

    } catch (error) {
      console.error("🚨 Error al consumir DLQ:", error);
      setTimeout(connectRabbitMQ, 5000);
    }
  };

  await connectRabbitMQ();
};