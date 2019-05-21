import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

if(Meteor.isServer){
    Meteor.publish('discussionParticipants', () => {
        return Meteor.users.find(
            { },
            // Publish only selected fields
            {
                username: 1,
                avatar: 1,
            },
        );
    });
}
