# Loose chat server

This is a small and naive implementation of a chat server. It has a REST-like
API to:

* Create new session - there's no authentication, so basically just claim an
  available username
* List currently active (and inactive) users
* List all messages
* List all messages since some point of reference
* Post messages (requires a session token)

## Test it

There's a bunch of tests ensuring the correct workings of the server. To run
them:

```sh
npm install
npm test
```

## Run it

Run the server:

```sh
npm install
PORT=6660 npm start
```

You can leave out the `PORT` environment variable if you like, it defaults to
`6660`, the port of the beast. There are two more environment variables you can
set:

* `SESSION_INACTIVE_AFTER` - mark users as inactive after this many
  milliseconds. Defaults to `1000` - e.g. if the user has not posted a message
  or requested messages from the server during the last second, they will be
  marked as inactive.
* `SESSION_GONE_AFTER` - completely remove a user´s session if they have been
  inactive for this many milliseconds, defaults to `10000`, e.g. 10 seconds.

## The API

The API attempts to explain itself. You'll find it at
`http://localhost:6660/api` (unless you changed the `PORT`). The server supports
[CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS)
from any domain, so you can run your client from another server and make
requests to the API directly from the client.

All API endpoints have links to related resources, with some basic information
about `params`, placeholders in the URL, using
[URI Templates](https://tools.ietf.org/html/rfc6570)) and `body`, a JSON
document posted as the body of requests (remember to set the `Content-Type`
header to `application/json` with `POST` requests).

To log in, you can either just hit the endpoint directly:

```sh
curl -X POST -i -H 'Content-Type: application/json' -d '{"user": "desiredName"}' \
    http://localhost:6660
```

This will return a document that includes an `uuid`. You'll need to remember
this, as you'll pass it back to the server to post messages as the user you
created the session as. The returned document also conveniently contains links
to other resources (importantly: get active users, get messages, post messages)
with the uuid prefilled into the URLs.
