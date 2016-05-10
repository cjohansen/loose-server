import {assign, pick} from 'lodash';

export function links(headers, endpoints) {
  return Object.keys(endpoints).reduce((links, name) => assign(links, {
    [name]: assign({
      path: endpoints[name].path,
      url: `http://${headers.host}${endpoints[name].path}`,
      method: 'GET'
    }, pick(endpoints[name], ['method', 'body', 'params']))
  }), {});
}

export const createSession = {
  path: '/api/sessions',
  method: 'POST',
  body: {user: 'string'}
};

export function sessionLinks(headers, session) {
  const sessionId = session && session.uuid || '{sessionId}';

  return links(headers, {
    allMessages: {path: `/api/messages/${sessionId}`},
    messagesSince: {
      path: `/api/messages/${sessionId}/{sinceId}`,
      params: assign({sinceId: 'number (message id)'}, !session && {sessionId: 'string'})
    },
    postMessage: assign({
      path: `/api/messages/${sessionId}`,
      method: 'POST',
      body: {text: 'string'}
    }, !session && {params: {sessionId: 'string'}})
  });
}
