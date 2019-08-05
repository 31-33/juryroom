import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import {
  Comment,
} from 'semantic-ui-react';

import Comments from '/imports/api/Comments';
import Discussions from '/imports/api/Discussions';
import CommentView from './CommentView';


class DiscussionThread extends PureComponent {
  static propTypes = {
    discussion: PropTypes.shape({
      status: PropTypes.string.isRequired,
      commentLengthLimit: PropTypes.number,
      activeVote: PropTypes.string,
    }).isRequired,
    participants: PropTypes.arrayOf(PropTypes.shape({
      username: PropTypes.string.isRequired,
      avatar: PropTypes.string,
    })).isRequired,
    rootComments: PropTypes.arrayOf(PropTypes.shape({
      _id: PropTypes.string.isRequired,
    })).isRequired,
    hash: PropTypes.string.isRequired,
    scrollToComment: PropTypes.func.isRequired,
  }

  componentDidMount() {
    const { hash, scrollToComment } = this.props;
    if (hash) {
      setTimeout(() => window.requestAnimationFrame(() => {
        scrollToComment(hash);
      }));
    }
  }

  render() {
    const {
      participants, discussion, rootComments,
    } = this.props;

    return (
      <Comment.Group threaded>
        {rootComments.map(({ _id }) => (
          <CommentView
            key={_id}
            discussion={discussion}
            participants={participants}
            commentId={_id}
          />
        ))}
      </Comment.Group>
    );
  }
}

export default withTracker(({ discussionId }) => ({
  discussion: Discussions.findOne(
    { _id: discussionId },
    {
      fields: {
        activeVote: 1,
        commentLengthLimit: 1,
        status: 1,
      },
    },
  ) || { status: 'active' },
  rootComments: Comments.find(
    {
      discussionId,
      parentId: '',
    },
    {
      fields: {
        _id: 1,
      },
      sort: { postedTime: 1 },
    },
  ).fetch(),
}))(DiscussionThread);
