import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import Comments from '/imports/api/Comments';
import Votes from '/imports/api/Votes';
import {
  Comment, Icon, Divider, Container, Segment, List, Button, Item,
} from 'semantic-ui-react';
import Moment from 'react-moment';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import CommentForm from './CommentForm';
import Vote from './Vote';
import {
  DiscussionPropType, CommentPropType, UserPropType, VotePropType,
} from '/imports/types';

class CommentViewTemplate extends Component {
  static defaultProps = {
    vote: false,
  }

  static propTypes = {
    comment: CommentPropType.isRequired,
    discussion: DiscussionPropType.isRequired,
    children: PropTypes.arrayOf(CommentPropType).isRequired,
    participants: PropTypes.arrayOf(UserPropType).isRequired,
    vote: PropTypes.oneOfType([VotePropType, PropTypes.bool]),
  }

  collapse = () => {
    const { discussion, comment } = this.props;
    Meteor.call('comments.collapse', discussion._id, comment._id, !this.isCollapsed());
  }

  isCollapsed() {
    const { comment } = this.props;
    return comment.collapsedBy.includes(Meteor.userId());
  }

  renderChildren() {
    const { children, discussion, participants } = this.props;
    return children.length > 0 && (
      <Comment.Group threaded>
        {
          children.map(child => (
            <CommentView
              key={child._id}
              discussion={discussion}
              participants={participants}
              comment={child}
            />
          ))
        }
      </Comment.Group>
    );
  }

  renderUserReplyingStatus() {
    const { discussion, participants, comment } = this.props;
    const userList = discussion.activeReplies
      .filter(reply => reply.userId !== Meteor.userId() && reply.parentId === comment._id)
      .map(reply => participants.find(user => user._id === reply.userId).username);

    return userList.length > 0 && (
      <strong>
        {`${userList.join(', ')} is replying`}
      </strong>
    );
  }

  renderContent(starredBy) {
    const { participants, comment, discussion } = this.props;
    const author = participants.find(user => user._id === comment.authorId);
    return (
      <Container>
        {
          starredBy.length > 0 && (
            <Button
              disabled={!!discussion.activeVote
                || !starredBy.some(star => star.userId === Meteor.userId())}
              floated="right"
              content="Call Vote"
              color="green"
              onClick={() => Meteor.call('discussions.callVote', discussion._id, comment._id, starredBy.map(star => star.userId))}
              label={{
                basic: true,
                content: (
                  <List>
                    {
                      starredBy.map((star) => {
                        const item = participants.find(user => user._id === star.userId);
                        return (
                          <Item key={item._id} as={Link} to={`/user/${star.userId}`}>
                            <Item.Image avatar size="mini" src={item.avatar || '/avatar_default.png'} />
                            <Item.Content verticalAlign="middle" content={item.username} />
                          </Item>
                        );
                      })
                    }
                  </List>
                ),
              }}
              labelPosition="left"
            />
          )
        }
        <Icon
          link
          name={this.isCollapsed() ? 'chevron down' : 'minus'}
          onClick={this.collapse}
        />
        <Comment.Avatar
          as={Link}
          to={`/user/${author._id}`}
          src={author.avatar ? author.avatar : '/avatar_default.png'}
        />
        <Comment.Author as={Link} to={`/user/${author._id}`} content={author.username} />
        <Comment.Metadata>
          <div>
            <Moment fromNow>{comment.postedTime}</Moment>
            &nbsp;
            {this.renderUserReplyingStatus()}
          </div>
        </Comment.Metadata>
        <Comment.Text content={comment.text} />
        <Comment.Actions>
          <Comment.Action onClick={() => Meteor.call('discussions.reply', discussion._id, comment._id)} content="Reply" />
          {
            starredBy.some(star => star.userId === Meteor.userId()) ? (
              <Comment.Action onClick={() => Meteor.call('discussions.remove_star', discussion._id)} content="Unstar" />
            ) : (
              <Comment.Action onClick={() => Meteor.call('discussions.star_comment', discussion._id, comment._id)} content="Star" />
            )
          }
        </Comment.Actions>
      </Container>
    );
  }

  render() {
    const {
      discussion, comment, vote, participants,
    } = this.props;
    const starredBy = discussion.userStars.filter(star => star.commentId === comment._id);
    return (
      <Comment collapsed={this.isCollapsed()} id={comment._id}>
        <Comment.Content>
          {
            starredBy.length > 0 ? (
              <Segment color="yellow" inverted tertiary attached={vote && 'top'} clearing>
                {this.renderContent(starredBy)}
              </Segment>
            ) : this.renderContent(starredBy)
          }
          {vote && (
            <Vote
              vote={vote}
              participants={participants}
              isActive={vote._id === discussion.activeVote}
            />
          )}
          {discussion.activeReplies.some(reply => reply.userId === Meteor.userId()
            && reply.parentId === comment._id) && (
            <CommentForm
              discussionId={discussion._id}
              parentId={comment._id}
            />
          )}
          {this.renderChildren()}
          {this.isCollapsed() && (<Divider clearing hidden />)}
        </Comment.Content>
      </Comment>
    );
  }
}
const CommentView = withTracker(({ discussion, comment }) => {
  Meteor.subscribe('comments', discussion._id);
  Meteor.subscribe('votes', discussion._id);

  return {
    children: Comments.find(
      {
        discussionId: discussion._id,
        parentId: comment._id,
      },
      { sort: { postedTime: 1 } },
    ).fetch() || [],
    vote: Votes.findOne({ commentId: comment._id }),
  };
})(CommentViewTemplate);

export default CommentView;
