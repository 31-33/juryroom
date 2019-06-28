import React, { Component } from 'react';
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
        const userVote = vote.userVotes.find(v => v.userId === user._id);
        let color = 'grey';
        if (userVote !== undefined) {
          color = userVote.vote ? 'green' : 'red';
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

class Vote extends Component {
    static propTypes = {
      vote: VotePropType.isRequired,
      isActive: PropTypes.bool.isRequired,
      participants: PropTypes.arrayOf(UserPropType).isRequired,
    }

    render() {
      const { vote, isActive, participants } = this.props;
      return (
        <Segment attached="bottom" secondary>
          {(isActive && !vote.userVotes.some(v => v.userId === Meteor.userId())) ? (
            <Button.Group>
              <Button
                negative
                content="Disagree"
                onClick={() => Meteor.call('votes.vote', vote._id, false)}
                attached="left"
              />
              <Button
                positive
                content="Agree"
                onClick={() => Meteor.call('votes.vote', vote._id, true)}
                attached="right"
              />
            </Button.Group>
          ) : renderUserVotes(vote, participants)}
        </Segment>
      );
    }
}

export default Vote;
