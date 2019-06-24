import { Meteor } from 'meteor/meteor';
import Topics from '/imports/api/Topics';

if (Meteor.isServer) {
  // Create default topics
  if (Topics.find().count() === 0) {
    Topics.insert({ title: 'Politics' });
    Topics.insert({ title: 'Religion' });
    Topics.insert({ title: 'Philosophy' });
    Topics.insert({ title: 'Sport' });
    Topics.insert({ title: 'Science' });
    Topics.insert({ title: 'Other' });
  }
}
