export default ({messageRepo, sessionRepo}) => {
  return {
    messagesSince(uuid, id) {
      return sessionRepo.touchSession(uuid)
        .then(session => Promise.all([messageRepo.messagesSince(id), session]))
        .then(([messages, session]) => ({messages, session}));
    },

    postMessage(uuid, text) {
      return sessionRepo.touchSession(uuid)
        .then(session => Promise.all([messageRepo.addMessage({user: session.user, text}), session]))
        .then(([message, session]) => ({message, session}));
    }
  };
};
