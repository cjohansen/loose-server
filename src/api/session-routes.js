import {Router} from 'express';
import {sessionLinks, links, createSession} from './links';

export default ({sessionRepo}) => {
  const routes = new Router();

  routes.post('/', ({body, headers}, res) => {
    sessionRepo.createSession(body.user)
      .then(session => res.status(201).json({
        links: sessionLinks(headers, session),
        body: session
      }), err => res.status(409).json({error: err.message}));
  });

  routes.get('/', ({headers, path}, res) => {
    sessionRepo.activeSessions()
      .then(sessions => res.status(200).json({
        links: links(headers, {
          self: {path},
          createSession
        }),
        body: sessions
      }));
  });

  return routes;
};
