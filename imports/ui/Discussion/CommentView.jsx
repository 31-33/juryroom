import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Comments } from '/imports/api/Comments';
import { Discussions } from '/imports/api/Discussions';
import { Comment, Icon, Divider, Placeholder } from 'semantic-ui-react';
import Moment from 'react-moment';
import CommentForm, { openCommentForm } from './CommentForm';
import { starComment, unstarComment } from './StarredCommentView';
import { Link } from 'react-router-dom';

class CommentViewTemplate extends Component {

  isCollapsed(){
    return this.props.comment.collapsed.includes(Meteor.userId());
  }
  collapse(){
    Meteor.call('comments.collapse', this.props.discussion_id, this.props.comment._id, !this.isCollapsed());
  }

  userSelected(){
    console.log(`user clicked on name: ${this.props.comment.author_id}`);
  }

  renderChildren(){
    return this.props.children && this.props.children.length > 0 ? 
    (
      <Comment.Group threaded={true}>
        {
          this.props.children.map(child => {
            return (
              <CommentView
                key={child._id}
                discussion_id={this.props.discussion_id}
                comment={child}
              />
            )
          })
        }
      </Comment.Group>
    ) : '';
  }

  renderUserReplyingStatus(){
    const userList = this.props.replyingUsers
      .filter(reply => reply.user_id !== Meteor.userId() && reply.parent_id === this.props.comment._id)
      .map(reply => this.props.participants.find(user => user._id === reply.user_id).username);
      
    return userList.length > 0 ?
      (
        <strong>
          {userList.join(', ')} is replying
        </strong>
      ): '';
  }

  renderReplyForm(){
    return this.props.replyingUsers.some(reply => reply.user_id === Meteor.userId() && reply.parent_id === this.props.comment._id) ?
    (
      <CommentForm
        discussion_id={this.props.discussion_id}
        parent_id={this.props.comment._id}
      />
    ) : '';
  }

  render(){
    if(this.props.loaded){
      const author = this.props.participants.find(user => user._id === this.props.comment.author_id);
      return (
        <Comment collapsed={ this.isCollapsed() } id={this.props.comment._id}>
          <Comment.Content>
            <Icon link 
              name={ this.isCollapsed() ? 'chevron down' : 'minus' } 
              onClick={this.collapse.bind(this)}
            />
            <Comment.Avatar 
              as={Link} to={`/user/${author._id}`}
              src={author.avatar ? author.avatar : '/avatar_default.png'}
              />
            <Comment.Author as={Link} to={`/user/${author._id}`}>
              {author.username}
            </Comment.Author>
            <Comment.Metadata>
              <div>
                <Moment fromNow>{this.props.comment.posted_time}</Moment>
                &nbsp;
                {this.renderUserReplyingStatus()}
              </div>
            </Comment.Metadata>
            <Comment.Text>
              {this.props.comment.text}
            </Comment.Text>
            <Comment.Actions>
              <Comment.Action onClick={() => openCommentForm(this.props.discussion_id, this.props.comment._id)}>Reply</Comment.Action>
              {
                this.props.starred ? 
                (
                  <Comment.Action onClick={() => unstarComment(this.props.discussion_id)}>Unstar</Comment.Action>
                ) :
                (
                  <Comment.Action onClick={() => starComment(this.props.discussion_id, this.props.comment._id)}>Star</Comment.Action>
                )
              }
            </Comment.Actions>
            {this.renderReplyForm()}
            {this.renderChildren()}
            {this.isCollapsed() ? (<Divider clearing hidden />) : ''}
          </Comment.Content>
        </Comment>
      );
    }
    else{
      return (
        <Placeholder fluid />
      );
    }
  }
}
const CommentView = withTracker(({discussion_id, comment}) => {
  const commentsSub = Meteor.subscribe('comments', discussion_id, comment._id);
  const discussionsSub = Meteor.subscribe('discussions', discussion_id);
  const participantsSub = Meteor.subscribe('discussionParticipants');

  const discussion = Discussions.findOne(
    { _id: discussion_id },
    { fields: {
        active_replies: 1, 
        user_stars: 1
      }
    }
  );
  return {
    loaded: commentsSub.ready() && discussionsSub.ready() && participantsSub.ready(),
    children: Comments.find(
      { 
        discussion_id: discussion_id,
        parent_id: comment._id,
      },
      { sort: { posted_time: 1 }},
      ).fetch(),
    replyingUsers: discussion ? discussion.active_replies : [],
    starred: discussion ? discussion.user_stars.some(star => star.user_id === Meteor.userId() && star.comment_id === comment._id) : false,
    participants: Meteor.users.find({}).fetch(),
  }
})(CommentViewTemplate);

export default CommentView;
