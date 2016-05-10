import {createServer} from 'http';
import initializeDeps from './src/deps';
import createAppServer from './src/app-server';

const deps = initializeDeps(process.env);

createServer(createAppServer(deps))
  .listen(deps.config.port, () => {
    console.log(`http://localhost:${deps.config.port}`);
  });
