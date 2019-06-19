import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

const Scenarios = new Mongo.Collection('scenarios');
export default Scenarios;

if (Meteor.isServer) {
  Meteor.publish('scenarios', () => Scenarios.find(
    {},
    {
      fields: {
        topicId: 1,
        title: 1,
        description: 1,
        createdAt: 1,
      },
    },
  ));
}

Meteor.methods({
  'scenarios.create'(topicId, title, description) {
    check(topicId, String);
    check(title, String);
    check(description, String);

    // TODO: ensure this method is only called by users with permission to create scenarios
    // TODO: if open to public, set status to 'pending' and have moderators approve new scenarios
    return Scenarios.insert({
      topicId,
      title,
      description,
      createdAt: new Date(),
      status: 'active',
    });
  },

});
