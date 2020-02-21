import auth from './directives/auth';
import upperCase from './directives/upperCase';
import lowerCase from './directives/lowerCase';
import lifecycle from './events/lifecycleEvents';

export default {
  directives: { auth, upperCase, lowerCase },
  events: { lifecycle },
};
