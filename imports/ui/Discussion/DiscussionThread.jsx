import React, { Component, createRef } from 'react';
import {
  Button, Comment, Container, Rail, Ref, Segment, Sticky, Dimmer, Loader,
} from 'semantic-ui-react';
import { Meteor } from 'meteor/meteor';
import Comments from '/imports/api/Comments';
import Discussions from '/imports/api/Discussions';
import Groups from '/imports/api/Groups';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import CommentView from './CommentView';
import CommentForm from './CommentForm';
import StarredCommentView from './StarredCommentView';
import { CommentPropType, DiscussionPropType, UserPropType } from '/imports/types';

class DiscussionThread extends Component {
  static defaultProps = {
    discussion: false,
    participants: false,
  }

  static propTypes = {
    comments: PropTypes.arrayOf(CommentPropType).isRequired,
    discussion: PropTypes.oneOfType([DiscussionPropType, PropTypes.bool]),
    participants: PropTypes.oneOfType([PropTypes.arrayOf(UserPropType), PropTypes.bool]),
  }

  contextRef = createRef();

  renderComments() {
    const { comments, discussion, participants } = this.props;
    return comments.map(comment => (
      <CommentView
        key={comment._id}
        discussion={discussion}
        participants={participants}
        comment={comment}
      />
    ));
  }

  renderUserReplyingStatus() {
    const { discussion, participants } = this.props;
    const userList = (discussion.activeReplies || [])
      .filter(reply => reply.userId !== Meteor.userId() && reply.parentId === '')
      .map(reply => participants.find(user => user._id === reply.userId).username);

    return userList.length > 0 && (
      <Container>
        <strong>
          {`${userList.join(', ')} is commenting`}
        </strong>
      </Container>
    );
  }

  renderCommentForm() {
    const { discussion } = this.props;
    return (discussion.activeReplies || []).some(reply => reply.userId === Meteor.userId() && reply.parentId === '')
      ? (
        <CommentForm discussionId={discussion._id} />
      )
      : (
        <Button
          onClick={() => Meteor.call('discussions.reply', discussion._id, '')}
          content="Post"
          labelPosition="left"
          icon="edit"
          primary
        />
      );
  }

  render() {
    const { discussion, participants } = this.props;
    return (discussion && participants) ? (
      <Ref innerRef={this.contextRef}>
        <Segment>
          <Comment.Group threaded>
            {this.renderComments()}
            {this.renderUserReplyingStatus()}
          </Comment.Group>
          {this.renderCommentForm()}
          <Rail position="left">
            <Sticky context={this.contextRef} offset={80}>
              <StarredCommentView
                discussion={discussion}
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
    ) : (
      <Segment>
        <Dimmer active page inverted>
          <Loader size="large">Loading</Loader>
        </Dimmer>
      </Segment>
    );
  }
}

export default withTracker(({ match }) => {
  const { discussionId } = match.params;
  Meteor.subscribe('comments', discussionId);
  Meteor.subscribe('discussions');
  const usersSub = Meteor.subscribe('users');
  const groupsSub = Meteor.subscribe('groups');

  return {
    discussion: Discussions.findOne(
      { _id: discussionId },
      {
        fields:
        {
          activeReplies: 1,
          userStars: 1,
          activeVote: 1,
        },
      },
    ),
    comments: Comments.find(
      {
        discussionId,
        parentId: '',
      },
      { sort: { postedTime: 1 } },
    ).fetch(),
    participants:
      groupsSub.ready()
      && usersSub.ready()
      && Meteor.users.find({
        _id: {
          $in: Groups.findOne(
            { discussions: { $elemMatch: { discussionId } } },
          ).members,
        },
      }).fetch(),
  };
})(DiscussionThread);
