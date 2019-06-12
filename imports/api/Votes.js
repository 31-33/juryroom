import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

const Votes = new Mongo.Collection('votes');
export default Votes;

if (Meteor.isServer) {
  Meteor.publish('votes', (discussionId) => {
    check(discussionId, String);
    return Votes.find(
      { discussionId },
      {
        fields: {
          discussionId: 1,
          commentId: 1,
          userVotes: 1,
          // caller_id: 0,
          // starred_by: 0,
          calledAt: 1,
        },
      },
    );
  });
}
