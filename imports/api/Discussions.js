import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Discussions = new Mongo.Collection('discussions');

if(Meteor.isServer){
  //TODO: ensure user is participating in discussion_id
  Meteor.publish('discussions', (discussion_id) => {
    return Discussions.find({
      _id: discussion_id,
    });
  });

  // Create discussion 0 for testing purposes
  if(Discussions.find().count() === 0){
    Discussions.insert({
      _id: '0',
      user_data: []
    });
  }
}

Meteor.methods({
  'discussions.create'(users){
    check(users, Array);

    const discussion = Discussions.insert({
      user_data: users,
    });
    // TODO: return discussion id
    console.log(discussion._id);
  },
  'discussions.star_comment'(discussion_id, comment_id){
    check(discussion_id, String);
    check(comment_id, String);

    // TODO: ensure current user is participating in discussion
    if(!this.userId){
      throw new Meteor.Error('not-authorized');
    }

    const username = Meteor.users.findOne({_id: this.userId}).username;

    var updateResult = Discussions.update(
      { 
        _id: discussion_id,
        "user_data.id": this.userId,
      },
      {
        $set: { "user_data.$.starred": comment_id }
      }
    );
    // Update failed-- user does not exist in user_data set
    if(!updateResult){
      Discussions.update(
        { _id: discussion_id },
        {
          $addToSet: {
            user_data: {
              id: this.userId,
              name: username,
              replying: '',
              starred: comment_id,
            }
          }
        }
      );
    }
  },
  'discussions.reply'(discussion_id, comment_id){
    check(discussion_id, String);
    check(comment_id, String);

    // TODO: ensure current user is participating in discussion
    if(!this.userId){
      throw new Meteor.Error('not-authorized');
    }
    
    const username = Meteor.users.findOne({_id: this.userId}).username;

    var updateResult = Discussions.update(
      { 
        _id: discussion_id,
        "user_data.id": this.userId,
      },
      {
        $set: { "user_data.$.replying": comment_id }
      }
    );
    // Update failed-- user does not exist in user_data set
    if(!updateResult){
      Discussions.update(
        { _id: discussion_id },
        {
          $addToSet: {
            user_data: {
              id: this.userId,
              name: username,
              replying: comment_id,
              starred: '',
            }
          }
        }
      );
    }
  }
});
