import {assert} from 'chai';
import sinon from 'sinon';
sinon.assert.expose(assert, {prefix: ''});
import createMessageService from '../src/message-service';

describe('Message service', () => {
  let messageRepo, sessionRepo;

  beforeEach(() => {
    messageRepo = {
      messagesSince: sinon.stub(),
      addMessage: sinon.stub()
    };

    sessionRepo = {
      touchSession: sinon.stub()
    };
  });

  describe('messagesSince', () => {
    it('fails if session does not exist', () => {
      const service = createMessageService({sessionRepo, messageRepo});
      sessionRepo.touchSession.returns(Promise.reject(new Error('Unverified user')));

      return service.messagesSince('uuid', 0)
        .then(shouldNotHappen, err => {
          assert.equal(err.message, 'Unverified user');
        });
    });

    it('gets messages with active session', () => {
      const service = createMessageService({sessionRepo, messageRepo});
      sessionRepo.touchSession.returns(Promise.resolve({user: 'chris'}));
      messageRepo.messagesSince.returns(Promise.resolve([{id: 0}]));

      return service.messagesSince('uuid', 0)
        .then(({messages, session}) => {
          assert.calledOnce(messageRepo.messagesSince);
          assert.calledWith(messageRepo.messagesSince, 0);
          assert.deepEqual(messages, [{id: 0}]);
          assert.equal(session.user, 'chris');
        }, shouldNotHappen);
    });
  });

  describe('postMessage', () => {
    it('fails if session does not exist', () => {
      const service = createMessageService({sessionRepo, messageRepo});
      sessionRepo.touchSession.returns(Promise.reject(new Error('Unverified user')));

      return service.postMessage('chris', 'Anybody home?')
        .then(shouldNotHappen, err => {
          assert.equal(err.message, 'Unverified user');
        });
    });

    it('posts message with active session', () => {
      const service = createMessageService({sessionRepo, messageRepo});
      sessionRepo.touchSession.returns(Promise.resolve({user: 'chris'}));
      messageRepo.addMessage.returns(Promise.resolve({text: 'Home?'}));

      return service.postMessage('uuid', 'Home?')
        .then(({message, session}) => {
          assert.calledOnce(messageRepo.addMessage);
          assert.calledWith(messageRepo.addMessage, {user: 'chris', text: 'Home?'});
          assert.equal(message.text, 'Home?');
          assert.equal(session.user, 'chris');
        });
    });
  });
});

function shouldNotHappen() {
  throw new Error('Should not happen');
}
