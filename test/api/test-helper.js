export function createSession(request, user) {
  return request.post('/api/sessions')
    .set('Content-Type', 'application/json')
    .send(JSON.stringify({user}))
    .then(({body}) => body);
}

export function postMessage(request, message) {
  return ({body: session, links}) => {
    return request.post(links.postMessage.path)
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({text: message}))
      .then(({body}) => body);
  };
}
