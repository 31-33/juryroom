import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { List, Segment } from 'semantic-ui-react';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import Comments from '/imports/api/Comments';
import Scenarios from '/imports/api/Scenarios';
import { DiscussionPropType, ScenarioPropType } from '/imports/types';

class DiscussionSummary extends Component {
  static defaultProps = {
    scenario: {
      title: 'title',
      description: 'scenario description...',
    },
  }

  static propTypes = {
    discussion: DiscussionPropType.isRequired,
    scenario: ScenarioPropType,
    commentCount: PropTypes.number.isRequired,
  }

  render() {
    const { discussion, scenario, commentCount } = this.props;
    const isActive = discussion.status !== 'finished';
    return (
      <List.Item as={Link} to={`/discussion/${discussion._id}`}>
        <List.Content
          as={Segment}
          basic
          color={isActive ? 'green' : 'grey'}
        >
          <List.Header content={scenario.title} />
          <List.Description content={scenario.description} />
          <List.Content floated="left" content={`Comments: ${commentCount}`} />
          <List.Content floated="right" description={isActive ? 'In Progress' : 'Finished'} />
        </List.Content>
      </List.Item>
    );
  }
}

export default withTracker(({ discussion }) => {
  Meteor.subscribe('comments', discussion._id);

  return {
    scenario: Scenarios.findOne({ _id: discussion.scenarioId }),
    commentCount: Comments.find({ discussionId: discussion._id }).count(),
  };
})(DiscussionSummary);
