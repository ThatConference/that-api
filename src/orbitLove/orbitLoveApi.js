// our  Orbit.love api sdk
import debug from 'debug';
import fetch from 'node-fetch';

const dlog = debug('that:api:orbit-love');

export function addActivityByEmail({ activityType, payload, email }) {
  dlog('addActivity called');
  // https://docs.orbit.love/reference/post_-workspace-slug-activities
}

/**
π denotes required

description
link
link text
π title
activity type key
occurred_at (defaults to now)
properties {
  key:'value',
}
member : { 
  tags_to_add:'' 
}
idenity: { 
  source: 'email',
  email: '@'
}
 
{
  "description": "May 17 - Getting Started with the Orbit Model",
  "link": "https://orbit-event.eventbrite.com/",
  "link_text": "See the event",
  "title": "Orbit Meetup Registration",
  "activity_type_key": "eventbrite:registration",
  "key": "registration-1827374",
  "occurred_at": "2020-05-10T00:00:00Z",
  "member": {
    "tags_to_add": "Attendee"
  },
  "identity": {
    "source": "email",
    "email": "patrick@orbit.love"
  }
}
 */
