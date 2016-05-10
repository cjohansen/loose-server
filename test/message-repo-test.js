import {assert} from 'chai';
import {pick, first, last} from 'lodash';
import createMessageRepo from '../src/message-repo';

describe('message repo', () => {
  it('adds message with id', () => {
    const repo = createMessageRepo();

    return repo.addMessage({user: 'chris', text: 'Howdy!'})
      .then(message => assert.deepEqual(
        pick(message, ['id', 'text', 'user']),
        {id: 0, text: 'Howdy!', user: 'chris'}
      ));
  });

  it('retrieves all messages', () => {
    const repo = createMessageRepo();

    return Promise.all([
      repo.addMessage({user: 'chris', text: 'Howdy!'}),
      repo.addMessage({user: 'jen', text: 'Heya!'}),
      repo.addMessage({user: 'lisa', text: 'Cheerio'})
    ])
      .then(() => repo.messagesSince(-1))
      .then(messages => {
        assert.equal(messages.length, 3);
        assert.equal(last(messages).text, 'Cheerio');
      });
  });

  it('retrieves messages after first one', () => {
    const repo = createMessageRepo();

    return Promise.all([
      repo.addMessage({user: 'chris', text: 'Howdy!'}),
      repo.addMessage({user: 'jen', text: 'Heya!'}),
      repo.addMessage({user: 'lisa', text: 'Cheerio'})
    ])
      .then(() => repo.messagesSince(0))
      .then(messages => {
        assert.equal(messages.length, 2);
        assert.equal(first(messages).text, 'Heya!');
      });
  });

  it('retrieves no messages after last message', () => {
    const repo = createMessageRepo();

    return Promise.all([
      repo.addMessage({user: 'chris', text: 'Howdy!'}),
      repo.addMessage({user: 'jen', text: 'Heya!'}),
      repo.addMessage({user: 'lisa', text: 'Cheerio'})
    ])
      .then(() => repo.messagesSince(3))
      .then(messages => assert.equal(messages.length, 0));
  });

  it('emits event when adding new message', done => {
    const repo = createMessageRepo();

    repo.on('message', message => {
      assert.equal(message.text, 'Whoa');
      done();
    });

    repo.addMessage({user: 'chris', text: 'Whoa'})
  });

  it('gets poll response immediately', () => {
    const repo = createMessageRepo();

    return repo.addMessage({user: 'chris', text: 'Whoa'})
      .then(() => repo.waitForMessagesSince(-1))
      .then(messages => {
        assert.equal(messages.length, 1);
      });
  });

  it('waits for messages when polling', done => {
    const repo = createMessageRepo();

    repo.waitForMessagesSince(-1).
      then(messages => {
        assert.equal(last(messages).text, 'Nice!');
        done();
      });

    repo.addMessage({user: 'chris', text: 'Nice!'})
  });
});
