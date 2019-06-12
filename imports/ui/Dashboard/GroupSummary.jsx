import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Segment, List, Container } from 'semantic-ui-react';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import Discussions from '/imports/api/Discussions';
import DiscussionSummary from './DiscussionSummary';
import { GroupPropType, DiscussionPropType, UserPropType } from '/imports/types';

class GroupSummary extends Component {
  static propTypes = {
    group: GroupPropType.isRequired,
    discussions: PropTypes.arrayOf(DiscussionPropType).isRequired,
    participants: PropTypes.arrayOf(UserPropType).isRequired,
  }

  render() {
    const { group, discussions, participants } = this.props;
    return (
      <List.Item>
        <List.Content>
          <Segment.Group horizontal>
            <Container fluid>
              <List selection divided>
                <List.Header>Discussions</List.Header>
                {
                  discussions.map(discussion => (
                    <DiscussionSummary
                      key={discussion._id}
                      discussion={discussion}
                    />
                  ))
                }
              </List>
            </Container>
            <Segment compact>
              <List selection>
                <List.Header>Members</List.Header>
                {
                  group.members.map((memberId) => {
                    const member = participants.find(user => user._id === memberId);
                    return member ? (
                      <List.Item key={member._id} as={Link} to={`/user/${member._id}`}>{member.username}</List.Item>
                    ) : '';
                  })
                }
              </List>
            </Segment>
          </Segment.Group>
        </List.Content>
      </List.Item>
    );
  }
}
export default withTracker(({ group }) => {
  Meteor.subscribe('discussions');
  Meteor.subscribe('users');

  return {
    participants: Meteor.users.find({ _id: { $in: group.members } }).fetch(),
    discussions: Discussions.find({ _id: { $in: group.discussions } }).fetch(),
  };
})(GroupSummary);
