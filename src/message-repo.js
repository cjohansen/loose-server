import {findIndex} from 'lodash';
import {EventEmitter} from 'events';

export default config => {
  const messages = [];
  const emitter = new EventEmitter();

  function messagesSince(id) {
    return new Promise((resolve, reject) => {
      if (id < 0) {
        resolve(messages.slice());
      } else {
        const idx = findIndex(messages, m => m.id === id);
        resolve(idx < 0 ? [] : messages.slice(idx + 1));
      }
    });
  }

  return {
    messagesSince,
    on: emitter.on.bind(emitter),

    addMessage({user, text}) {
      return new Promise((resolve, reject) => {
        const message = {id: messages.length, user, text, timestamp: new Date().getTime()};
        messages.push(message);
        resolve(message);
        emitter.emit('message', message);
      });
    },

    waitForMessagesSince(timestamp) {
      return new Promise((resolve, reject) => {
        let resolved;

        function tryResolve(messages) {
          if (!resolved && messages.length > 0) {
            resolve(messages);
            resolved = true;
          }
        }

        emitter.once('message', () => messagesSince(timestamp).then(tryResolve));
        messagesSince(timestamp).then(tryResolve);
      });
    }
  };
};
