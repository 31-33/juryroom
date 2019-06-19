import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

const Groups = new Mongo.Collection('groups');
export default Groups;

if (Meteor.isServer) {
  Meteor.publish('groups', () => Groups.find(
    { },
    {
      fields: {
        members: 1,
        scenarioSetId: 1,
        discussions: 1,
        calledAt: 1,
        // TODO: add fields to track scoring
      },
    },
  ));
}
