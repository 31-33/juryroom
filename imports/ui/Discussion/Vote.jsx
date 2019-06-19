import React, { Component } from 'react';
import {
  Segment, Button, List, Image,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';

class Vote extends Component {
    static propTypes = {
      vote: PropTypes.shape({

      }).isRequired,
      isActive: PropTypes.bool.isRequired,
      participants: PropTypes.arrayOf(PropTypes.shape({

      })).isRequired,
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
          ) : (
            <List horizontal>
              {participants.map((user) => {
                const userVote = vote.userVotes.find(v => v.userId === user._id);
                let color = 'grey';
                if (userVote !== undefined) {
                  color = userVote.vote ? 'green' : 'red';
                }
                return (
                  <List.Item key={user._id}>
                    <Segment
                      size="mini"
                      textAlign="center"
                      compact
                      inverted
                      secondary
                      color={color}
                    >
                      <Image
                        disabled={userVote === undefined}
                        bordered
                        size="mini"
                        circular
                        src={user.avatar ? user.avatar : '/avatar_default.png'}
                      />
                      {user.username}
                    </Segment>
                  </List.Item>
                );
              })}
            </List>
          )}
        </Segment>
      );
    }
}

export default Vote;
