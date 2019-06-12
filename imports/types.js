import PropTypes from 'prop-types';

const GroupPropType = PropTypes.shape({
  _id: PropTypes.string.isRequired,
  members: PropTypes.arrayOf(PropTypes.string).isRequired,
  discussions: PropTypes.arrayOf(PropTypes.string).isRequired,
});

const CommentPropType = PropTypes.shape({
  _id: PropTypes.string.isRequired,
  authorId: PropTypes.string.isRequired,
  collapsedBy: PropTypes.arrayOf(PropTypes.string).isRequired,
  discussionId: PropTypes.string.isRequired,
  parentId: PropTypes.string.isRequired,
  postedTime: PropTypes.objectOf(Date),
});

const DiscussionPropType = PropTypes.shape({
  _id: PropTypes.string.isRequired,
  votes: PropTypes.arrayOf(PropTypes.string),
});

const UserPropType = PropTypes.shape({
  _id: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
  avatar: PropTypes.string,
});

const VotePropType = PropTypes.shape({
  _id: PropTypes.string.isRequired,
  calledAt: PropTypes.objectOf(Date).isRequired,
  commentId: PropTypes.string.isRequired,
  discussionId: PropTypes.string.isRequired,
  userVotes: PropTypes.arrayOf(PropTypes.shape({
    userId: PropTypes.string.isRequired,
    vote: PropTypes.bool.isRequired,
  })).isRequired,
});

export {
  CommentPropType, DiscussionPropType, UserPropType, GroupPropType, VotePropType,
};