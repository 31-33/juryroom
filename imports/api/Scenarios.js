import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Roles } from 'meteor/alanning:roles';

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
        status: 1,
      },
    },
  ));
}

Meteor.methods({
  'scenarios.create'(topicId, title, description) {
    check(topicId, String);
    check(title, String);
    check(description, String);

    if (!Roles.userIsInRole(this.userId, ['admin', 'create-scenario'])) {
      throw new Error('not-authorized');
    }

    return Scenarios.insert({
      topicId,
      title,
      description,
      createdAt: new Date(),
      status: 'active',
    });
  },

});
