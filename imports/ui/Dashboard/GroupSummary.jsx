import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {
  Segment, List, Image, Grid, Divider,
} from 'semantic-ui-react';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import {
  GroupPropType, ScenarioSetPropType, UserPropType, DiscussionPropType,
} from '/imports/types';
import ScenarioSets from '/imports/api/ScenarioSets';
import Discussions from '/imports/api/Discussions';
import DiscussionSummary from './DiscussionSummary';

class GroupSummary extends Component {
  static defaultProps = {
    scenarioSet: false,
  }

  static propTypes = {
    group: GroupPropType.isRequired,
    scenarioSet: PropTypes.oneOfType([ScenarioSetPropType, PropTypes.bool]),
    participants: PropTypes.arrayOf(UserPropType).isRequired,
    discussions: PropTypes.arrayOf(DiscussionPropType).isRequired,
  }

  render() {
    const {
      group, scenarioSet, participants, discussions,
    } = this.props;
    return (
      <List.Item key={group._id}>
        <Segment clearing size="large">
          <List.Header content={scenarioSet.title} />
          <List.Description content={scenarioSet.description} />
          <Grid columns="2" padded divided>
            <Grid.Column width="12">
              <List selection size="tiny" animated>
                <List.Header content="Discussions" />
                {discussions.map(discussion => (
                  <DiscussionSummary
                    key={discussion._id}
                    discussion={discussion}
                  />
                ))}
              </List>
            </Grid.Column>
            <Grid.Column width="4">
              <List selection size="tiny">
                <List.Header content="Members" />
                <Divider fitted />
                {group.members.map((memberId) => {
                  const member = participants.find(user => user._id === memberId);
                  return member && (
                    <List.Item key={member._id} as={Link} to={`/user/${member._id}`}>
                      <Image avatar src={member.avatar || '/avatar_default.png'} />
                      <List.Content content={member.username} verticalAlign="middle" />
                    </List.Item>
                  );
                })}
              </List>
            </Grid.Column>
          </Grid>
        </Segment>
      </List.Item>
    );
  }
}
export default withTracker(({ group }) => ({
  participants: Meteor.users.find({ _id: { $in: group.members } }).fetch(),
  scenarioSet: ScenarioSets.findOne({ _id: group.scenarioSetId }),
  discussions: Discussions.find(
    { groupId: group._id },
    {
      sort: { createdAt: -1 },
    },
  ).fetch(),
}))(GroupSummary);
