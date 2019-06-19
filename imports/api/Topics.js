import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

const Topics = new Mongo.Collection('topics');
export default Topics;

if (Meteor.isServer) {
  Meteor.publish('topics', () => Topics.find(
    {},
    {
      fields: {
        title: 1,
      },
    },
  ));
}
