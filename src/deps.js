import createMessageRepo from './message-repo';
import createSessionRepo from './session-repo';
import createMessageService from './message-service';
import {get} from 'lodash';

export default env => {
  const config = {
    port: parseInt(get(env, 'PORT', 6660)),
    sessionRepo: {
      inactiveAfter: parseInt(get(env, 'SESSION_INACTIVE_AFTER', 1000)),
      goneAfter: parseInt(get(env, 'SESSION_GONE_AFTER', 10000))
    }
  };

  const messageRepo = createMessageRepo(config);
  const sessionRepo = createSessionRepo(config);

  return {
    messageRepo,
    sessionRepo,
    config,
    messageService: createMessageService({messageRepo, sessionRepo})
  };
};
