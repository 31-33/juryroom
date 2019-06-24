import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Link } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import {
  Container, Segment, Header, List, Image,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import {
  GroupPropType, ScenarioPropType, DiscussionPropType, UserPropType,
} from '/imports/types';
import Groups from '/imports/api/Groups';
import Scenarios from '/imports/api/Scenarios';
import Discussions from '/imports/api/Discussions';

class Group extends Component {
  static defaultProps = {
    group: false,
  }

  static propTypes = {
    group: PropTypes.oneOfType([GroupPropType, PropTypes.bool]),
    members: PropTypes.arrayOf(UserPropType).isRequired,
    discussions: PropTypes.arrayOf(DiscussionPropType).isRequired,
    scenarios: PropTypes.arrayOf(ScenarioPropType).isRequired,
  }

  render() {
    const {
      group, members, discussions, scenarios,
    } = this.props;

    return group && (
      <Container>
        <Header
          as={Segment}
          attached="top"
          size="huge"
          content="View Group"
        />
        <Segment attached="bottom">
          <Header attached="top" content="Members" />
          <List
            as={Segment}
            attached="bottom"
            divided
            relaxed="very"
          >
            {members.map(user => (
              <List.Item key={user._id} as={Link} to={`/user/${user._id}`}>
                <Image avatar src={user.avatar} />
                <List.Content header={user.username} />
              </List.Item>
            ))}
          </List>
          <Header attached="top" content="Discussions" />
          <List
            as={Segment}
            attached="bottom"
            divided
            relaxed="very"
          >
            {discussions.map((discussion) => {
              const scenario = scenarios.find(sc => sc._id === discussion.scenarioId);
              return (
                <List.Item
                  key={discussion._id}
                  as={Link}
                  to={`/discussion/${discussion._id}`}
                >
                  <List.Content
                    floated="left"
                    header={scenario.title}
                    description={scenario.description}
                  />
                </List.Item>
              );
            })}
          </List>
        </Segment>
      </Container>
    );
  }
}

export default withTracker(({ match }) => {
  const { groupId } = match.params;
  Meteor.subscribe('groups');
  Meteor.subscribe('users');
  Meteor.subscribe('discussions');
  Meteor.subscribe('scenarios');

  const group = Groups.findOne({ _id: groupId });

  return {
    group,
    members: group ? Meteor.users.find(
      { _id: { $in: group.members } },
    ).fetch() : [],
    discussions: group ? Discussions.find(
      { _id: { $in: group.discussions.map(discussion => discussion.discussionId) } },
    ).fetch() : [],
    scenarios: group ? Scenarios.find(
      { _id: { $in: group.discussions.map(discussion => discussion.scenarioId) } },
    ).fetch() : [],
  };
})(Group);
