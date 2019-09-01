/* eslint-disable no-undef */
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { Meteor } from 'meteor/meteor';
import '/imports/api/Comments';
import Discussions, { startNext } from '/imports/api/Discussions';
import '/imports/api/Users';
import Groups from '/imports/api/Groups';
import '/imports/api/Votes';
import Scenarios from '/imports/api/Scenarios';
import '/imports/api/ScenarioSets';
import '/imports/api/Topics';
import '/imports/api/Roles';
import '/imports/startup/accounts-config';
import '/imports/startup/default-data';
import DiscussionClosingNotification from '/imports/ui/EmailTemplates/DiscussionClosingNotification.jsx';

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

      const currDateTime = Number(new Date(dateTime));

      // Send email when there is 24 hours remaining
      Discussions.find(
        {
          status: 'active',
          deadline: {
            $gte: new Date(currDateTime + 24 * 60 * 60 * 1000),
            $lt: new Date(currDateTime + 25 * 60 * 60 * 1000),
          },
        },
      ).fetch().forEach((discussion) => {
        const group = Groups.findOne({ _id: discussion.groupId });
        const participants = Meteor.users.find(
          { _id: { $in: group.members } },
        ).fetch();

        Email.send({
          from: 'JuryRoom <no-reply@juryroom.com>',
          bcc: group.members
            .map(userId => participants.find(user => user._id === userId).emails[0]),
          subject: 'Discussion Ending on JuryRoom',
          html: ReactDOMServer.renderToStaticMarkup(React.createElement(
            DiscussionClosingNotification,
            {
              discussion,
              dateTime,
              scenario: Scenarios.findOne({ _id: discussion.scenarioId }),
            },
          )),
        });
      });
    },
  });

  SyncedCron.start();
});
