import express, { Application, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import router from './app/routers';
import globalErrorHandler from './app/middleWares/globalErrorHandler';
import httpStatus from 'http-status';
import cookeParser from 'cookie-parser';

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5000'], credentials: true }));


app.use(cookeParser());

app.get('/', (req: Request, res: Response) => {
  res.send({
    message: 'Coaching Center server is Running',
  });
});

app.use('/api', router);

app.use(globalErrorHandler);

app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: 'API NOT FOUND',
    error: {
      path: req.originalUrl,
      message: 'Your Requested Path Is Not Found',
    },
  });
});

export default app;
