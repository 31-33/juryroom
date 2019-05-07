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

    const username = Meteor.users.findOne({_id: this.userId}).username;

    //TODO: ensure current user is participating in discussion_id
    if(!this.userId){
      throw new Meteor.Error('not-authorized');
    }

    Comments.insert({
      discussion_id: discussion_id,
      parent_id: parent_id,
      posted_time: new Date(),
      author: {
        id: this.userId,
        name: username,
      },
      text: text,
    });
  },
});
