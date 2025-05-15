import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import errorHandler from './middlewares/errorMiddleware';
import swaggerUi from 'swagger-ui-express';
import swaggerDocs from './swagger/swagger-index';
import paramedicNotificationRoute from './routes/paramedicNotificacionRoute';
import operatorNotificationRoute from './routes/operatorNotificationRoute'
import clinicNotificationRoute from './routes/clinicNotificationRoute'
import { consumeMessages, consumeDLQ  } from './services/consumeService';
import { handleEmergencyStartedMessage, handleParamedicUpdateMessage, handlePatientReportMessage } from './services/emiterService';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import amqp from 'amqplib'; 
import cors from 'cors';

dotenv.config();

const app = express();
app.use(cors());
const envPort = process.env.NODE_ENV === 'staging' ? process.env.PORT : process.env.PORT_NOTIFICATIONS
const PORT = envPort || 3003;

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
app.use(cookieParser());

app.get('/strokeebackend/notification/', (req: Request, res: Response) => {
  res.send('Notification service running...');
});

app.use('/strokeebackend/notification/paramedic-notification', paramedicNotificationRoute);
app.use('/strokeebackend/notification/operator-notification', operatorNotificationRoute);
app.use('/strokeebackend/notification/clinic-notification', clinicNotificationRoute);
app.use('/strokeebackend/notification/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

consumeMessages("paramedic_update_queue", "paramedic_exchange", "paramedic_update_queue", handleParamedicUpdateMessage);
consumeMessages("emergency_started_queue", "operator_exchange", "emergency_started_queue", handleEmergencyStartedMessage);
consumeMessages("patient_report_queue", "patient_exchange", "patient_report_queue", handlePatientReportMessage);

consumeDLQ([
  "paramedic_update_queue.dlq",
  "emergency_started_queue.dlq",
  "patient_report_queue.dlq"
]);

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
