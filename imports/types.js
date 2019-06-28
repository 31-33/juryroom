import PropTypes from 'prop-types';

const GroupPropType = PropTypes.shape({
  _id: PropTypes.string.isRequired,
  members: PropTypes.arrayOf(PropTypes.string).isRequired,
  discussions: PropTypes.arrayOf(PropTypes.shape({
    discussionId: PropTypes.string.isRequired,
    scenarioId: PropTypes.string.isRequired,
  })).isRequired,
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
  votes: PropTypes.arrayOf(PropTypes.shape({
    voteId: PropTypes.string.isRequired,
    commentId: PropTypes.string.isRequired,
  })).isRequired,
  status: PropTypes.string.isRequired,
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

const TopicPropType = PropTypes.shape({
  _id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
});

const ScenarioPropType = PropTypes.shape({
  _id: PropTypes.string.isRequired,
  topicId: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  createdAt: PropTypes.objectOf(Date).isRequired,
  status: PropTypes.string.isRequired,
});

const ScenarioSetPropType = PropTypes.shape({
  _id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  scenarios: PropTypes.arrayOf(PropTypes.string).isRequired,
  ordered: PropTypes.bool.isRequired,
  createdAt: PropTypes.objectOf(PropTypes.bool).isRequired,
  status: PropTypes.string.isRequired,
});

export {
  CommentPropType, DiscussionPropType,
  UserPropType, GroupPropType, VotePropType,
  TopicPropType, ScenarioPropType, ScenarioSetPropType,
};
