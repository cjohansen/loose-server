import supertest from 'supertest-as-promised';
import initializeDeps from '../src/deps';
import createAppServer from '../src/app-server';

describe('HTTP API', () => {
  let request;

  beforeEach(() => {
    request = supertest(createAppServer(initializeDeps(process.env)));
  });

  it('requests API information', () => {
    return request.get('/api')
      .expect(200)
      .expect('Access-Control-Allow-Origin', '*')
      .expect('Access-Control-Allow-Headers', /content-type/i)
      .expect(/links/);
  });
});
