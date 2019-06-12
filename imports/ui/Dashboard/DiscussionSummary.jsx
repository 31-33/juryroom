import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { List, Header } from 'semantic-ui-react';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import Comments from '/imports/api/Comments';
import { DiscussionPropType } from '/imports/types';

class DiscussionSummary extends Component {
  static propTypes = {
    discussion: DiscussionPropType.isRequired,
    scenario: PropTypes.string.isRequired,
    commentCount: PropTypes.number.isRequired,
  }

  render() {
    const { discussion, scenario, commentCount } = this.props;
    return (
      <List.Item>
        <List.Content>
          <Header as={Link} to={`/discussion/${discussion._id}`} content={scenario} />
          {`Comments: ${commentCount}`}
        </List.Content>
      </List.Item>
    );
  }
}

export default withTracker(({ discussion }) => {
  const discussionId = discussion._id;
  Meteor.subscribe('comments', discussionId);

  return {
    scenario: 'Test topic',
    commentCount: Comments.find({ discussionId }).count(),
  };
})(DiscussionSummary);
