import {createSession} from './test-helper';
import supertest from 'supertest-as-promised';
import {assert} from 'chai';
import initializeDeps from '../../src/deps';
import createAppServer from '../../src/app-server';

describe('Sessions HTTP API', () => {
  let request;

  beforeEach(() => {
    request = supertest(createAppServer(initializeDeps(process.env)));
  });

  it('creates a session', () => {
    return request.post('/api/sessions')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({user: 'chris'}))
      .expect(201)
      .expect('Access-Control-Allow-Origin', '*')
      .expect(/chris/)
      .expect(/uuid/)
      .then(res => console.log(JSON.stringify(res.body, 0, 2)));
  });

  it('retrieves all sessions', () => {
    return createSession(request, 'lisa')
      .then(() => createSession(request, 'burns'))
      .then(() => request.get('/api/sessions')
            .expect(200)
            .expect(/lisa/)
            .expect(/burns/))
      .then(({body: {body}}) => {
        assert.equal(body.length, 2);
      });
  });
});
