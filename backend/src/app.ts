import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import authRoutes from './routes/auth.routes';
import employeeRoutes from './routes/employees.routes';
import documentRoutes from './routes/documents.routes';
import vacationRoutes from './routes/vacations.routes';
import licenseRoutes from './routes/licenses.routes';
import auditRoutes from './routes/audit.routes';

import { errorHandler } from './middleware/error-handler';

export const createApp = () => {
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/auth', authRoutes);
app.use('/empleados', employeeRoutes);
app.use('/documentos', documentRoutes);
app.use('/solicitudes-vacaciones', vacationRoutes);
app.use('/licencias', licenseRoutes);
app.use('/auditoria', auditRoutes);

app.use(errorHandler);

return app;
};