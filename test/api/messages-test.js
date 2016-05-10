import supertest from 'supertest-as-promised';
import {createSession, postMessage} from './test-helper';
import {assert} from 'chai';
import initializeDeps from '../../src/deps';
import createAppServer from '../../src/app-server';

describe('Messages HTTP API', () => {
  let request;

  beforeEach(() => {
    request = supertest(createAppServer(initializeDeps(process.env)));
  });

  it('posts message', () => {
    return createSession(request, 'lisa')
      .then(({links}) => {
        return request.post(links.postMessage.path)
          .set('Content-Type', 'application/json')
          .send(JSON.stringify({text: 'Yo dawg!'}))
          .expect(201)
          .expect('Access-Control-Allow-Origin', '*');
      })
      .then(({body: {body: message}}) => {
        console.log(message);
        assert.equal(message.text, 'Yo dawg!');
        assert.equal(message.user, 'lisa');
      });
  });

  it('retrieves all messages', () => {
    return createSession(request, 'lisa')
      .then(postMessage(request, 'All good?'))
      .then(postMessage(request, 'I am fine anyway'))
      .then(({links}) => request
            .get(links.allMessages.path)
            .expect(200)
            .expect(/All good\?/)
            .expect(/I am fine/)
            .expect('Access-Control-Allow-Origin', '*'))
      .then(({body: {body: messages}}) => {
        assert.equal(messages.length, 2);
      });
  });

  it('retrieves messages since the first', () => {
    return createSession(request, 'lisa')
      .then(postMessage(request, 'All good?'))
      .then(postMessage(request, 'I am fine anyway'))
      .then(({links}) => request
            .get(links.messagesSince.path.replace('{sinceId}', 0))
            .expect(200)
            .expect(/I am fine/))
      .then(({body: {body: messages}}) => {
        assert.equal(messages.length, 1);
      });
  });
});
