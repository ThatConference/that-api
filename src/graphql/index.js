import auth from './directives/auth';
import upperCase from './directives/upperCase';
import lowerCase from './directives/lowerCase';
import lifecycle from './events/lifecycleEvents';
import date from './scalars/date';
import slug from './scalars/slug';

export default {
  directives: { auth, upperCase, lowerCase },
  events: { lifecycle },
  scalars: { date, slug },
};
