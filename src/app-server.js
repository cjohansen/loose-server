import express from 'express';
import bodyParser from 'body-parser';
import createApiRoutes from './api';

export default deps => {
  const app = express();

  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'content-type,accept');
    next();
  });

  app.use(bodyParser.json());
  app.use('/api', createApiRoutes(deps));
  return app;
};
