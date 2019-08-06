/* eslint-disable no-undef */
import { Meteor } from 'meteor/meteor';
import '/imports/api/Comments';
import Discussions, { startNext } from '/imports/api/Discussions';
import '/imports/api/Users';
import '/imports/api/Groups';
import '/imports/api/Votes';
import '/imports/api/Scenarios';
import '/imports/api/ScenarioSets';
import '/imports/api/Topics';
import '/imports/api/Roles';
import '/imports/startup/accounts-config';
import '/imports/startup/default-data';

Meteor.startup(() => {
  UserPresence.start();
  UserPresenceMonitor.start();

  SyncedCron.add({
    name: 'checkDiscussionDeadline',
    schedule(parser) {
      return parser.recur().on(0).minute();
    },
    job(dateTime) {
      Discussions.find(
        {
          status: 'active',
          deadline: { $lte: dateTime },
        },
      ).fetch().forEach((discussion) => {
        Discussions.update(
          { _id: discussion._id },
          {
            $set: {
              status: 'hung',
              activeReplies: [],
            },
          },
        );
        startNext(discussion.groupId);
      });
    },
  });

  SyncedCron.start();
});
