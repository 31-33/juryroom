import React, { PureComponent } from 'react';
import {
  Segment, Button, List, Image, Popup,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { VotePropType, UserPropType } from '/imports/types';
import { Meteor } from 'meteor/meteor';

export function renderUserVotes(vote, users, isActive = true) {
  const size = 'mini';
  return (
    <List horizontal size={size}>
      {Object.entries(vote.userVotes).map((userVoteEntry) => {
        const userProfile = users.find(u => u._id === userVoteEntry[0]);
        const userVote = userVoteEntry[1];
        let color = 'grey';
        if (userVote !== null) {
          color = userVote ? 'green' : 'red';
        }
        return (
          <Popup
            key={userProfile._id}
            disabled={!isActive || userProfile._id !== Meteor.userId()}
            hoverable
            position="top center"
            hideOnScroll
            trigger={(
              <List.Item size={size}>
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
                    src={userProfile.avatar || '/avatar_default.png'}
                  />
                  {userProfile.username}
                </Segment>
              </List.Item>
            )}
            content={(
              <Button.Group>
                <Button
                  icon="thumbs up"
                  color={userVote === true ? 'yellow' : 'grey'}
                  onClick={() => Meteor.call('votes.vote', vote._id, true)}
                />
                <Button
                  icon="thumbs down"
                  color={userVote === false ? 'yellow' : 'grey'}
                  onClick={() => Meteor.call('votes.vote', vote._id, false)}
                />
                <Button
                  icon="ban"
                  color="grey"
                  onClick={() => Meteor.call('votes.vote', vote._id, null)}
                />
              </Button.Group>
            )}
          />
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
        <Segment attached="bottom" secondary clearing disabled={!isActive}>
          {isActive && (
            <Button.Group vertical floated="right">
              <Button
                icon="thumbs up"
                color={userVote === true ? 'yellow' : 'grey'}
                onClick={() => Meteor.call('votes.vote', vote._id, userVote === true ? null : true)}
              />
              <Button
                icon="thumbs down"
                color={userVote === false ? 'yellow' : 'grey'}
                onClick={() => Meteor.call('votes.vote', vote._id, userVote === false ? null : false)}
              />
            </Button.Group>
          )}
          {renderUserVotes(vote, participants, isActive)}
        </Segment>
      );
    }
}

export default Vote;
