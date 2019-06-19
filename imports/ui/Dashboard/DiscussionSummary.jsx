import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { List, Header } from 'semantic-ui-react';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import Comments from '/imports/api/Comments';
import Scenarios from '/imports/api/Scenarios';
import Discussions from '/imports/api/Discussions';
import { DiscussionPropType, ScenarioPropType } from '/imports/types';

class DiscussionSummary extends Component {
  static defaultProps = {
    discussion: false,
    scenario: false,
  }

  static propTypes = {
    discussion: PropTypes.oneOfType([DiscussionPropType, PropTypes.bool]),
    scenario: PropTypes.oneOfType([ScenarioPropType, PropTypes.bool]),
    commentCount: PropTypes.number.isRequired,
  }

  render() {
    const { discussion, scenario, commentCount } = this.props;
    return (discussion && scenario) ? (
      <List.Item>
        <List.Content as={Link} to={`/discussion/${discussion._id}`}>
          <Header content={scenario.title} subheader={scenario.description} />
          {`Comments: ${commentCount}`}
        </List.Content>
      </List.Item>
    ) : '';
  }
}

export default withTracker(({ discussionId, scenarioId }) => {
  Meteor.subscribe('comments', discussionId);
  Meteor.subscribe('discussions');
  Meteor.subscribe('scenarios');

  return {
    discussion: Discussions.findOne({ _id: discussionId }),
    scenario: Scenarios.findOne({ _id: scenarioId }),
    commentCount: Comments.find({ discussionId }).count(),
  };
})(DiscussionSummary);
