import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import { Mongo } from 'meteor/mongo';
import { check, Match } from 'meteor/check';
import { LoremIpsum } from 'lorem-ipsum';
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
          activeReplies: 1,
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

    return Comments.insert({
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
          actionCollapse: {
            userId: this.userId,
            commentId,
            collapsed: collapse,
            dateTime: new Date(),
          },
        },
      },
    );
  },
  'comments.reply'(discussionId, parentId) {
    check(discussionId, String);
    check(parentId, String);

    if (!isDiscussionParticipant(this.userId, discussionId)) {
      throw new Meteor.Error('not-authorized');
    }

    const discussion = Discussions.findOne({ _id: discussionId });
    if (!discussion || discussion.status !== 'active') {
      throw new Meteor.Error('discussion-not-active');
    }

    if (parentId === '') {
      // Root level comment- stored on discussion object
      Discussions.update(
        { _id: discussionId },
        {
          $addToSet: {
            activeReplies: {
              userId: this.userId,
              activeTime: new Date(),
            },
            actionReply: {
              userId: this.userId,
              parentId,
              dateTime: new Date(),
              open: true,
            },
          },
        },
      );
    } else {
      // Reply to comment- stored on parent comment object
      Comments.update(
        { _id: parentId, discussionId },
        {
          $addToSet: {
            activeReplies: {
              userId: this.userId,
              activeTime: new Date(),
            },
          },
        },
      );
      Discussions.update(
        { _id: discussionId },
        {
          $addToSet: {
            actionReply: {
              userId: this.userId,
              parentId,
              dateTime: new Date(),
              open: true,
            },
          },
        },
      );
    }
  },
  'comments.closeReply'(discussionId, parentId) {
    check(discussionId, String);
    check(parentId, String);

    if (!isDiscussionParticipant(this.userId, discussionId)) {
      throw new Meteor.Error('not-authorized');
    }

    if (parentId === '') {
      Discussions.update(
        { _id: discussionId },
        {
          $pull: {
            activeReplies: { userId: this.userId },
          },
          $addToSet: {
            userId: this.userId,
            parentId,
            dateTime: new Date(),
            open: false,
          },
        },
      );
    } else {
      Comments.update(
        { _id: parentId, discussionId },
        {
          $pull: {
            activeReplies: { userId: this.userId },
          },
        },
      );
      Discussions.update(
        { _id: discussionId },
        {
          $addToSet: {
            userId: this.userId,
            parentId,
            dateTime: new Date(),
            open: false,
          },
        },
      );
    }
  },
  'comments.generateDiscussion'(discussionId, numComments, replyProbability) {
    check(discussionId, String);
    check(numComments, Number);
    check(replyProbability, Match.Where((prob) => {
      check(prob, Number);
      return prob >= 0 && prob <= 1;
    }));

    if (!Roles.userIsInRole(this.userId, 'admin')) {
      throw new Meteor.Error('not-authorized');
    }

    if (!isDiscussionParticipant(this.userId, discussionId)) {
      throw new Meteor.Error('not-authorized');
    }
    const lorem = new LoremIpsum({
      wordsPerSentence: {
        min: 10,
        max: 100,
      },
    });

    const parentStack = [];

    for (let i = 0; i < numComments; i += 1) {
      const parentId = parentStack.length > 0
        ? parentStack[parentStack.length - 1]
        : '';
      const commentId = Comments.insert({
        discussionId,
        parentId,
        postedTime: new Date(),
        authorId: this.userId,
        text: lorem.generateSentences(1),
        collapsedBy: [],
      });

      if (Math.random() < replyProbability) {
        parentStack.push(commentId);
      } else if (parentStack.length > 0 && Math.random() > replyProbability) {
        parentStack.pop();
      }
    }
  },
});
