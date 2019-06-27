import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import Discussions, { isDiscussionParticipant } from './Discussions';

const Comments = new Mongo.Collection('comments');
export default Comments;
export const MAX_COMMENT_LENGTH = 500;

if (Meteor.isServer) {
  // TODO: ensure current user is within group associated with discussion_id
  Meteor.publish('comments', (discussionId) => {
    check(discussionId, String);

    return Comments.find(
      { discussionId },
      {
        fields: {
          discussionId: 1,
          parentId: 1,
          postedTime: 1,
          authorId: 1,
          text: 1,
          collapsedBy: 1,
        },
      },
    );
  });
}

Meteor.methods({
  'comments.insert'(discussionId, parentId, text) {
    check(discussionId, String);
    check(parentId, String);
    check(text, String);

    const discussion = Discussions.findOne({ _id: discussionId });
    if (!discussion || discussion.status !== 'active') {
      throw new Meteor.Error('discussion-not-active');
    }

    if (!isDiscussionParticipant(this.userId, discussionId)) {
      throw new Meteor.Error('not-authorized');
    }

    if (text.length > MAX_COMMENT_LENGTH) {
      throw new Meteor.Error('max-length-exceeded');
    }

    Comments.insert({
      discussionId,
      parentId,
      postedTime: new Date(),
      authorId: this.userId,
      text,
      collapsedBy: [],
    });
  },
  'comments.collapse'(discussionId, commentId, collapse) {
    check(discussionId, String);
    check(commentId, String);
    check(collapse, Boolean);

    if (!isDiscussionParticipant(this.userId, discussionId)) {
      throw new Meteor.Error('not-authorized');
    }

    if (collapse) {
      Comments.update(
        { _id: commentId },
        { $addToSet: { collapsedBy: this.userId } },
      );
    } else {
      Comments.update(
        { _id: commentId },
        { $pull: { collapsedBy: this.userId } },
      );
    }
    // Write a record of this action to persistent storage
    Discussions.update(
      { _id: discussionId },
      {
        $addToSet: {
          action_collapse: {
            userId: this.userId,
            commentId,
            collapsed: collapse,
            dateTime: new Date(),
          },
        },
      },
    );
  },
});
