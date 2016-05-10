import {Router} from 'express';
import {sessionLinks} from './links';

function handleError(res) {
  return err => {
    console.error(err.stack);
    res.status(500).json({error: err.message});
  };
}

export default ({messageService}) => {
  const routes = new Router();

  function messagesSince(res, headers, sessionId, id) {
    messageService.messagesSince(sessionId, id)
      .then(({messages, session}) => res.status(200).json({
        links: sessionLinks(headers, session),
        body: messages
      }))
      .catch(handleError(res));
  }

  routes.post('/:sessionId', ({body, params, headers}, res) => {
    messageService.postMessage(params.sessionId, body.text)
      .then(({message, session}) => res.status(201).json({
        links: sessionLinks(headers, session),
        body: message
      }))
      .catch(handleError(res));
  });

  routes.get('/:sessionId', ({body, params, headers}, res) => {
    messagesSince(res, headers, params.sessionId, -1);
  });

  routes.get('/:sessionId/:sinceId', ({body, params, headers}, res) => {
    messagesSince(res, headers, params.sessionId, parseInt(params.sinceId));
  });

  return routes;
};
