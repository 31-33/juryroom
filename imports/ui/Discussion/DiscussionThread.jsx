import React, { PureComponent, createRef } from 'react';
import {
  Button, Comment, Container, Rail, Ref, Segment, Sticky, Header,
} from 'semantic-ui-react';
import { Meteor } from 'meteor/meteor';
import Comments from '/imports/api/Comments';
import Discussions from '/imports/api/Discussions';
import Groups from '/imports/api/Groups';
import Scenarios from '/imports/api/Scenarios';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import CommentView from './CommentView';
import CommentForm from './CommentForm';
import StarredCommentView from './StarredCommentView';
import {
  UserPropType, ScenarioPropType,
} from '/imports/types';
import NotFoundPage from '/imports/ui/Error/NotFoundPage';
import LoadingPage from '/imports/ui/Error/LoadingPage';

class DiscussionThread extends PureComponent {
  static defaultProps = {
    participants: false,
    scenario: false,
  }

  static propTypes = {
    children: PropTypes.arrayOf(PropTypes.shape({ _id: PropTypes.string.isRequired })).isRequired,
    participants: PropTypes.oneOfType([PropTypes.arrayOf(UserPropType), PropTypes.bool]),
    scenario: PropTypes.oneOfType([ScenarioPropType, PropTypes.bool]),
    discussionId: PropTypes.string.isRequired,
  }

  contextRef = createRef();

  renderUserReplyingStatus = withTracker(({ discussionId }) => ({
    discussion: Discussions.findOne(
      { _id: discussionId },
      {
        fields: { activeReplies: 1 },
      },
    ),
  }))(({ discussion, participants }) => {
    const userList = discussion
      ? discussion.activeReplies
        .filter(reply => reply.userId !== Meteor.userId() && reply.parentId === '')
        .map(reply => participants.find(user => user._id === reply.userId).username)
      : [];

    return userList.length > 0 && (
      <Container>
        <strong>
          {`${userList.join(', ')} is commenting`}
        </strong>
      </Container>
    );
  });

  renderCommentForm = withTracker(({ discussionId }) => ({
    discussion: Discussions.findOne(
      { _id: discussionId },
      {
        fields: {
          activeReplies: 1,
          commentLengthLimit: 1,
        },
      },
    ),
  }))(({ discussion }) => (
    (discussion && discussion.activeReplies.some(reply => reply.userId === Meteor.userId() && reply.parentId === ''))
      ? (
        <CommentForm discussion={discussion} />
      )
      : (
        <Button
          onClick={() => Meteor.call('discussions.reply', discussion._id, '')}
          content="Post"
          labelPosition="left"
          icon="edit"
          primary
        />
      )
  ));

  renderComments() {
    const { children, participants, discussionId } = this.props;
    return children.map(({ _id }) => (
      <CommentView
        key={_id}
        discussionId={discussionId}
        participants={participants}
        commentId={_id}
      />
    ));
  }

  render() {
    const {
      participants, scenario, discussionId,
    } = this.props;

    if (!scenario) {
      return <NotFoundPage />;
    }

    return (
      <Ref innerRef={this.contextRef}>
        <Segment>
          {scenario && (
            <Header
              size="large"
              attached="top"
              content={scenario.title}
              subheader={scenario.description}
            />
          )}
          <Comment.Group threaded attached="bottom">
            {this.renderComments()}
            <this.renderUserReplyingStatus participants={participants} discussionId={discussionId} />
          </Comment.Group>
          <this.renderCommentForm discussionId={discussionId} />
          <Rail position="left">
            <Sticky context={this.contextRef} offset={80}>
              <StarredCommentView
                discussionId={discussionId}
                participants={participants}
              />
            </Sticky>
          </Rail>
          <Rail position="right">
            <Sticky context={this.contextRef} offset={80}>
              <Segment>Discussion history / navigation bar here</Segment>
            </Sticky>
          </Rail>
        </Segment>
      </Ref>
    );
  }
}

export default withTracker(({ match }) => {
  const { discussionId } = match.params;
  Meteor.subscribe('comments', discussionId);
  Meteor.subscribe('votes', discussionId);

  const discussion = Discussions.findOne(
    { _id: discussionId },
    {
      fields: { scenarioId: 1 },
    },
  );

  return {
    discussionId,
    children: Comments.find(
      {
        discussionId,
        parentId: '',
      },
      {
        fields: { _id: 1 },
        sort: { postedTime: 1 },
      },
    ).fetch(),
    scenario:
      discussion
      && Scenarios.findOne({ _id: discussion.scenarioId }),
    participants:
      discussion
      && Meteor.users.find({
        _id: {
          $in: Groups.findOne(
            { discussions: { $elemMatch: { discussionId } } },
          ).members,
        },
      }).fetch(),
  };
})(DiscussionThread);
