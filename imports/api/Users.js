import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

if(Meteor.isServer){
    Meteor.publish('users', () => {
        return Meteor.users.find(
            { },
            // Publish only selected fields
            {
                fields: {
                    username: 1,
                    avatar: 1,
                }
            },
        );
    });
}

Meteor.methods({
    'users.updateProfile'(avatar){

        if(!this.userId){
            throw new Meteor.Error('not-authorized');
        }

        Meteor.users.update(
            { _id: this.userId },
            {
                $set: {
                    avatar: avatar,
                }
            }
        );
    },
});
