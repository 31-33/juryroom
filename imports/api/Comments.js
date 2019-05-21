import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Comments = new Mongo.Collection('comments');

if(Meteor.isServer){
  //TODO: ensure current user is within group associated with discussion_id
  Meteor.publish('comments', (discussion_id) => {
    return Comments.find({
      discussion_id: discussion_id,
    });
  });
}

Meteor.methods({
  'comments.insert'(discussion_id, parent_id, text) {
    check(discussion_id, String);
    check(parent_id, String);
    check(text, String);

    //TODO: ensure current user is participating in discussion_id
    if(!this.userId){
      throw new Meteor.Error('not-authorized');
    }

    Comments.insert({
      discussion_id: discussion_id,
      parent_id: parent_id,
      posted_time: new Date(),
      author_id: this.userId,
      text: text,
      collapsed: [],
    });
  },
  'comments.collapse'(comment_id, collapse) {
    check(comment_id, String);
    check(collapse, Boolean);

    // TODO: ensure current user is participating in discussion_id
    if(!this.userId){
      throw new Meteor.Error('not-authorized');
    }

    if(collapse){
      Comments.update(
        { _id: comment_id },
        { $push: { collapsed: this.userId }}
      );
    }
    else {
      Comments.update(
        { _id: comment_id },
        { $pull: { collapsed: this.userId }}
      );
    }
    // TODO: write a record of this action to persistent storage
  }
});
