import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import { Mongo } from 'meteor/mongo';
import { Email } from 'meteor/email';
import { check, Match } from 'meteor/check';
import { LoremIpsum } from 'lorem-ipsum';
import RichTextEditor from 'react-rte';
import Discussions, { isDiscussionParticipant } from './Discussions';
import Groups from './Groups';
import Scenarios from './Scenarios';
import CommentNotification from '/imports/ui/EmailTemplates/CommentNotification.jsx';

const Comments = new Mongo.Collection('comments');
export default Comments;
export const MAX_COMMENT_LENGTH = 500;

if (Meteor.isServer) {
  Meteor.publish('comments', function(discussionId) {
    check(discussionId, String);

    // Check user is in group (or admin)
    if (!Groups.findOne({
      discussions: { $elemMatch: { discussionId } },
      members: this.userId,
    }) && !Roles.userIsInRole(this.userId, 'admin')) {
      throw new Meteor.Error('not-authorized');
    }

    return Comments.find(
      { discussionId },
      {
        fields: {
          discussionId: 1,
          parentId: 1,
          postedTime: 1,
          activeReplies: 1,
          userStars: 1,
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

    if (RichTextEditor.createValueFromString(text, 'markdown').getEditorState().getCurrentContent().getPlainText().length > MAX_COMMENT_LENGTH) {
      throw new Meteor.Error('max-length-exceeded');
    }

    const commentId = Comments.insert({
      discussionId,
      parentId,
      postedTime: new Date(),
      authorId: this.userId,
      text,
      collapsedBy: [],
    });

    if (Meteor.isServer) {
      this.unblock();
      const group = Groups.findOne({
        members: this.userId,
        discussions: { $elemMatch: { discussionId } },
      });
      const participants = Meteor.users.find(
        { _id: { $in: group.members } },
      ).fetch();
      const author = participants.find(user => user._id === this.userId);
      const scenario = Scenarios.findOne({ _id: discussion.scenarioId });
      const comment = Comments.findOne({ _id: commentId });

      Email.send({
        from: 'JuryRoom <no-reply@juryroom.com>',
        bcc: group.members
          .map(userId => participants.find(user => user._id === userId))
          .filter(user => (user._id !== this.userId) && (user.statusConnection !== 'online'))
          .map(user => user.emails[0]),
        subject: 'New comment on JuryRoom',
        html: ReactDOMServer.renderToStaticMarkup(React.createElement(CommentNotification, {
          discussionId, comment, scenario, author,
        })),
      });
    }

    return commentId;
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
            actionReply: {
              userId: this.userId,
              parentId,
              dateTime: new Date(),
              open: false,
            },
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
            actionReply: {
              userId: this.userId,
              parentId,
              dateTime: new Date(),
              open: false,
            },
          },
        },
      );
    }
  },
  'comments.star'(discussionId, commentId) {
    check(discussionId, String);
    check(commentId, String);

    if (!isDiscussionParticipant(this.userId, discussionId)) {
      throw new Meteor.Error('not-authorized');
    }

    const discussion = Discussions.findOne({ _id: discussionId });
    if (!discussion || discussion.status !== 'active') {
      throw new Meteor.Error('discussion-not-active');
    }

    // Remove existing stars by user in this discussion
    Comments.update(
      {
        discussionId,
        userStars: { $exists: true, $ne: [] },
      },
      {
        $pull: {
          userStars: { userId: this.userId },
        },
      },
      {
        multi: true,
      },
    );

    // Star the target comment
    Comments.update(
      { _id: commentId, discussionId },
      {
        $addToSet: {
          userStars: {
            userId: this.userId,
            dateTime: new Date(),
          },
        },
      },
    );

    // Record this event on the discussion
    Discussions.update(
      { _id: discussionId },
      {
        $addToSet: {
          actionStar: {
            userId: this.userId,
            commentId,
            dateTime: new Date(),
          },
        },
      },
    );
  },
  'comments.unstar'(discussionId, commentId) {
    check(discussionId, String);
    check(commentId, String);

    if (!isDiscussionParticipant(this.userId, discussionId)) {
      throw new Meteor.Error('not-authorized');
    }

    const discussion = Discussions.findOne({ _id: discussionId });
    if (!discussion || discussion.status !== 'active') {
      throw new Meteor.Error('discussion-not-active');
    }

    // Remove user from userStars on specified comment
    Comments.update(
      { _id: commentId, discussionId },
      {
        $pull: {
          userStars: { userId: this.userId },
        },
      },
    );

    // Record this event on discussion object
    Discussions.update(
      { _id: discussionId },
      {
        $addToSet: {
          actionStar: {
            userId: this.userId,
            commentId: '',
            dateTime: new Date(),
          },
        },
      },
    );
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
