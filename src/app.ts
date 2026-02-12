import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import deeplinkRoutes from './routes/deeplink.routes';
import errorMiddleware from './middlewares/error.middleware';
import { env } from './config/env';

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
    origin: env.NODE_ENV === 'production'
        ? process.env.ALLOWED_ORIGINS?.split(',') || []
        : '*',
    credentials: true
};
app.use(cors(corsOptions));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Compression
app.use(compression());

// Logging - different formats for dev/prod
const logFormat = env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(logFormat));

app.use('/api/deeplink', deeplinkRoutes);

app.use(errorMiddleware);

export default app;
