import {Router} from 'express';
import {links, createSession, sessionLinks} from './links';
import createSessionRoutes from './session-routes';
import createMessageRoutes from './message-routes';
import {assign} from 'lodash';

export default deps => {
  const routes = new Router();

  routes.get('/', ({headers}, res) => {
    res.status(200).json({
      links: assign(links(headers, {
        self: {path: '/api'},
        activeSessions: {path: '/api/sessions'},
        createSession
      }), sessionLinks(headers))
    });
  });

  routes.use('/sessions', createSessionRoutes(deps));
  routes.use('/messages', createMessageRoutes(deps));

  return routes;
};
