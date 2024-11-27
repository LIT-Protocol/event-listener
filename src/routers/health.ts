import express from 'express';

const healthRouter = express.Router();

healthRouter.get('/health', (request, response) => {
  response.status(200).json({ status: 'ok' });
});

export default healthRouter;
