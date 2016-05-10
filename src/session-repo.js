import {find, omit, get, assign} from 'lodash';
import {v4 as uuid} from 'uuid';

function inactiveFor(now, session) {
  return now - session.updatedAt;
}

export default config => {
  let sessions = [];
  let timeouts = [];
  const inactiveAfter = get(config, ['inactiveAfter'], 10000);
  const goneAfter = get(config, ['goneAfter'], 60000);
  let lastCheckup = new Date().getTime();

  function updateSessionStatuses() {
    const now = new Date().getTime();

    if (now - lastCheckup >= inactiveAfter) {
      timeouts = timeouts.concat(sessions.filter(s => inactiveFor(now, s) >= goneAfter));

      sessions = sessions
        .filter(s => inactiveFor(now, s) < goneAfter)
        .map(s => assign({}, s, {isActive: inactiveFor(now, s) < inactiveAfter}));
    }
  }

  function createSession(user) {
    if (!user) {
      return Promise.reject(new Error('No username'));
    }

    return new Promise((resolve, reject) => {
      updateSessionStatuses();

      if (find(sessions, s => s.user === user)) {
        reject(new Error('Username is taken'));
      } else {
        const now = new Date();
        const session = {
          user,
          createdAt: now,
          updatedAt: now,
          uuid: uuid(),
          isActive: true
        };
        sessions.push(session);
        timeouts = timeouts.filter(s => s.user !== user);
        resolve(session);
      }
    });
  }

  return {
    createSession,

    activeSessions() {
      return new Promise((resolve, reject) => {
        updateSessionStatuses();
        resolve(sessions.map(s => omit(s, ['uuid'])));
      });
    },

    touchSession(uuid) {
      return new Promise((resolve, reject) => {
        let session = find(sessions, s => s.uuid === uuid);

        if (!session) {
          session = find(timeouts, s => s.uuid === uuid);

          if (session) {
            sessions.push(session);
            timeouts = timeouts.filter(s => s !== session);
          }
        }

        if (session) {
          session.updatedAt = new Date();
          resolve(session);
        } else {
          reject(new Error(`No such session`));
        }
      });
    }
  };
};
