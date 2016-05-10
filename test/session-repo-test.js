import chai, {assert} from 'chai';
import {pick, first, last} from 'lodash';
import createSessionRepo from '../src/session-repo';

const uuidRe = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

function wait(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });
}

describe('session repo', () => {
  it('creates session for user', () => {
    const repo = createSessionRepo();

    return repo.createSession('chris')
      .then(session => {
        assert.equal(session.user, 'chris');
        assert.isTrue(session.isActive);
      });
  });

  it('does not create session without username', () => {
    const repo = createSessionRepo();

    return repo.createSession(null)
      .then(() => {
        throw new Error('Should not happen');
      }, err => assert.equal(err.message, 'No username'));
  });

  it('assigns a session secret', () => {
    const repo = createSessionRepo();

    return repo.createSession('chris')
      .then(session => assert.match(session.uuid, uuidRe));
  });

  it('rejects session with taken user', () => {
    const repo = createSessionRepo();

    return repo.createSession('chris')
      .then(() => repo.createSession('chris'))
      .then(() => {
        throw new Error('Should not resolve');
      }, err => {
        assert.equal(err.message, 'Username is taken');
      });
  });

  it('gets all active sessions', () => {
    const repo = createSessionRepo();

    return Promise.all([
      repo.createSession('chris'),
      repo.createSession('jen'),
      repo.createSession('lisa')
    ])
      .then(() => repo.activeSessions())
      .then(sessions => {
        assert.equal(sessions.length, 3);
        assert.deepEqual(sessions.map(s => s.user), ['chris', 'jen', 'lisa']);
      });
  });

  it('marks session as inactive after configured time passes', () => {
    const repo = createSessionRepo({inactiveAfter: 10});

    return repo.createSession('chris')
      .then(() => wait(10))
      .then(() => repo.activeSessions())
      .then(sessions => assert.isFalse(first(sessions).isActive));
  });

  it('clears session after configured timeout', () => {
    const repo = createSessionRepo({inactiveAfter: 10, goneAfter: 15});

    return repo.createSession('chris')
      .then(() => wait(16))
      .then(() => repo.activeSessions())
      .then(sessions => assert.equal(sessions.length, 0));
  });

  it('allows reusing username from timed out session', () => {
    const repo = createSessionRepo({inactiveAfter: 10, goneAfter: 15});

    return repo.createSession('chris')
      .then(() => wait(16))
      .then(() => repo.createSession('chris'));
  });

  it('does not time out sessions that have been touched recently', () => {
    const repo = createSessionRepo({inactiveAfter: 10, goneAfter: 15});
    let session;

    return repo.createSession('chris')
      .then(s => {
        session = s;
        return wait(11);
      })
      .then(() => repo.touchSession(session.uuid))
      .then(() => wait(7))
      .then(() => repo.activeSessions())
      .then(sessions => {
        assert.equal(sessions.length, 1);
        assert.isTrue(first(sessions).isActive);
      });
  });

  it('revives timed out sessions by authenticating', () => {
    const repo = createSessionRepo({inactiveAfter: 10, goneAfter: 15});
    let session;

    return repo.createSession('chris')
      .then(s => {
        session = s;
        return wait(20);
      })
      .then(() => repo.touchSession(session.uuid))
      .then(() => repo.activeSessions())
      .then(sessions => assert.equal(sessions.length, 1));
  });

  it('recreates lost session on authenticate', () => {
    const repo = createSessionRepo({inactiveAfter: 10, goneAfter: 15});
    let session;

    return repo.createSession('chris')
      .then(s => {
        session = s;
        return wait(16);
      })
      .then(() => repo.activeSessions())
      .then(() => repo.touchSession(session.uuid))
      .then(sess => assert.equal(sess.uuid, session.uuid))
      .then(() => repo.activeSessions())
      .then(sessions => assert.equal(sessions.length, 1));
  });

  it('fails to recreate lost session if username was taken', () => {
    const repo = createSessionRepo({inactiveAfter: 10, goneAfter: 15});
    let session;

    return repo.createSession('chris')
      .then(s => {
        session = s;
        return wait(16);
      })
      .then(() => repo.createSession('chris'))
      .then(() => repo.touchSession(session.uuid))
      .then(() => {
        throw new Error('Should not resolve');
      }, err => assert.equal(err.message, 'No such session'));
  });
});
