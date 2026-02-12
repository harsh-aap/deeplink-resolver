import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import deeplinkRoutes from './routes/deeplink.routes';
import errorMiddleware from './middlewares/error.middleware';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(compression());
app.use(morgan('dev'));

app.use('/api/deeplink', deeplinkRoutes);

app.use(errorMiddleware);

export default app;
