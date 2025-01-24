import express, { Request, Response } from 'express';
import errorHandler from './middlewares/errorMiddleware';
import paramedicNotificationRoute from './routes/paramedicNotificacionRoute';
import { consumeMessages  } from './services/consumeService';
import { handleEmergencyStartedMessage, handleParamedicUpdateMessage } from './services/emiterService';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import amqp from 'amqplib'; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

const RABBITMQ_URL = process.env.RABBIT_MQ || 'amqp://localhost';

const connectToRabbitMQ = async () => {
  try {
    await amqp.connect(RABBITMQ_URL);
    console.log('Conectado a RabbitMQ');
    
  } catch (error) {
    console.error('Error conectando a RabbitMQ:', error);
  }
};

const connectToMongo = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/test';
    await mongoose.connect(uri);
    console.log('Conectado a MongoDB');
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error);
  }
};

connectToRabbitMQ();
connectToMongo();

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('¡Hola, mundo con TypeScript y Express!');
});

app.use('/paramedic-notification', paramedicNotificationRoute);
consumeMessages("paramedic_update_queue", "paramedic_exchange", "paramedic_update_queue", handleParamedicUpdateMessage);
consumeMessages("emergency_started_queue", "operator_exchange", "emergency_started_queue", handleEmergencyStartedMessage);

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
