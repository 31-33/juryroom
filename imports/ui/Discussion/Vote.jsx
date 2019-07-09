import React, { PureComponent } from 'react';
import {
  Segment, Button, List, Image,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { VotePropType, UserPropType } from '/imports/types';
import { Meteor } from 'meteor/meteor';

export function renderUserVotes(vote, users, size = 'mini') {
  return (
    <List horizontal size={size}>
      {users.map((user) => {
        const userVote = vote.userVotes[user._id];
        let color = 'grey';
        if (userVote !== null) {
          color = userVote ? 'green' : 'red';
        }
        return (
          <List.Item key={user._id} size={size}>
            <Segment
              size={size}
              textAlign="center"
              compact
              inverted
              secondary
              color={color}
            >
              <Image
                disabled={userVote === undefined}
                bordered
                size={size}
                circular
                centered
                src={user.avatar ? user.avatar : '/avatar_default.png'}
              />
              {user.username}
            </Segment>
          </List.Item>
        );
      })}
    </List>
  );
}

class Vote extends PureComponent {
    static propTypes = {
      vote: VotePropType.isRequired,
      isActive: PropTypes.bool.isRequired,
      participants: PropTypes.arrayOf(UserPropType).isRequired,
    }

    render() {
      const { vote, isActive, participants } = this.props;
      const userVote = vote.userVotes[Meteor.userId()];
      return (
        <Segment attached="bottom" secondary clearing>
          {userVote !== undefined && renderUserVotes(vote, participants)}
          {isActive && (
            <Button.Group floated="right">
              <Button
                color={userVote !== true ? 'red' : 'grey'}
                content="Disagree"
                onClick={() => Meteor.call('votes.vote', vote._id, false)}
                attached="left"
              />
              <Button
                color={userVote !== false ? 'green' : 'grey'}
                content="Agree"
                onClick={() => Meteor.call('votes.vote', vote._id, true)}
                attached="right"
              />
            </Button.Group>
          )}
        </Segment>
      );
    }
}

export default Vote;
