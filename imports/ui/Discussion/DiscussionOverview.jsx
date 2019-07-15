import React, { PureComponent } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import {
  Segment, Container,
} from 'semantic-ui-react';
import Comments from '/imports/api/Comments';
import Votes from '/imports/api/Votes';

class DiscussionOverview extends PureComponent {
  static propTypes = {
    discussionId: PropTypes.string.isRequired,
    scrollToComment: PropTypes.func.isRequired,
  }

  renderChildren = withTracker(({ discussionId, commentId }) => ({
    children: Comments.find(
      { parentId: commentId, discussionId },
      {
        fields: { _id: 1 },
        sort: { postedTime: 1 },
      },
    ).fetch(),
    comment: Comments.findOne(
      { discussionId, _id: commentId },
      { fields: { userStars: 1 } },
    ),
    vote: Votes.findOne({ discussionId, commentId }),
  }))(({
    discussionId, children, scrollToComment, comment, vote,
  }) => {
    const isStarred = comment
      && comment.userStars
      && comment.userStars.some(star => star.userId === Meteor.userId());

    let color = 'black';
    if (vote) {
      color = 'green';
    } else if (isStarred) {
      color = 'yellow';
    }

    return (
      <div style={{ paddingLeft: '10px' }}>
        {comment && (
          <Container
            style={{
              height: '6px',
              backgroundColor: color,
              border: `${(vote || isStarred) ? '1px' : '2px'} solid #DEDEDE`,
            }}
            onClick={() => scrollToComment(comment._id)}
          />
        )}
        {children.map(({ _id }) => (
          <this.renderChildren
            key={_id}
            discussionId={discussionId}
            commentId={_id}
            scrollToComment={scrollToComment}
          />
        ))}
      </div>
    );
  });

  render() {
    const { discussionId, scrollToComment } = this.props;

    return (
      <Segment>
        <this.renderChildren
          discussionId={discussionId}
          commentId=""
          scrollToComment={scrollToComment}
        />
      </Segment>
    );
  }
}
export default DiscussionOverview;
