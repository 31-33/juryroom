import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {
  Segment, List, Container, Header,
} from 'semantic-ui-react';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import ScenarioSets from '/imports/api/ScenarioSets';
import DiscussionSummary from './DiscussionSummary';
import { GroupPropType, ScenarioSetPropType, UserPropType } from '/imports/types';

class GroupSummary extends Component {
  static defaultProps = {
    scenarioSet: false,
  }

  static propTypes = {
    group: GroupPropType.isRequired,
    scenarioSet: PropTypes.oneOfType([ScenarioSetPropType, PropTypes.bool]),
    participants: PropTypes.arrayOf(UserPropType).isRequired,
  }

  render() {
    const { group, scenarioSet, participants } = this.props;
    return (
      <List.Item>
        <List.Content>
          <Segment.Group horizontal>
            <Container fluid>
              <Segment attached="top">
                {scenarioSet && (
                  <Header
                    content={scenarioSet.title}
                    subheader={scenarioSet.description}
                  />
                )}
              </Segment>
              <Segment attached="bottom">
                <List selection divided animated>
                  <List.Header>Discussions</List.Header>
                  {
                    group.discussions.map(discussion => (
                      <DiscussionSummary
                        key={discussion.discussionId}
                        discussionId={discussion.discussionId}
                        scenarioId={discussion.scenarioId}
                      />
                    ))
                  }
                </List>
              </Segment>
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
  Meteor.subscribe('scenarioSets');
  Meteor.subscribe('users');

  return {
    participants: Meteor.users.find({ _id: { $in: group.members } }).fetch(),
    scenarioSet: ScenarioSets.findOne({ _id: group.scenarioSetId }),
  };
})(GroupSummary);
