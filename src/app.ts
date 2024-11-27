import bodyParser from 'body-parser';
import express from 'express';
import helmet from 'helmet';

import healthRouter from './routers/health';
import automationRouter from './routers/automation';

const app = express();

// Standard Middleware
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use(healthRouter);
app.use(automationRouter);

export { app };
