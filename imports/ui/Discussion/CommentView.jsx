import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Comments } from '/imports/api/Comments';
import { Discussions } from '/imports/api/Discussions';
import { Votes } from '/imports/api/Votes';
import { Comment, Icon, Divider, Placeholder, Container, Segment, List, Button, Item, Image, Header } from 'semantic-ui-react';
import Moment from 'react-moment';
import CommentForm from './CommentForm';
import { Link } from 'react-router-dom';

class CommentViewTemplate extends Component {

  isCollapsed(){
    return this.props.comment.collapsed.includes(Meteor.userId());
  }
  collapse(){
    Meteor.call('comments.collapse', this.props.discussion_id, this.props.comment._id, !this.isCollapsed());
  }

  renderChildren(){
    return this.props.children && this.props.children.length > 0 && 
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
    );
  }

  renderUserReplyingStatus(){
    const userList = this.props.userReplies
      .filter(reply => reply.user_id !== Meteor.userId() && reply.parent_id === this.props.comment._id)
      .map(reply => this.props.participants.find(user => user._id === reply.user_id).username);
      
    return userList.length > 0 &&
    (
      <strong>
        {userList.join(', ')} is replying
      </strong>
    );
  }

  renderVote(){
    return this.props.vote && (
      <Segment attached='bottom'>This comment has been voted upon.</Segment>
    );
  }

  renderReplyForm(){
    return this.props.userReplies.some(reply => reply.user_id === Meteor.userId() && reply.parent_id === this.props.comment._id) &&
    (
      <CommentForm
        discussion_id={this.props.discussion_id}
        parent_id={this.props.comment._id}
      />
    );
  }

  renderContent(starred){
    const author = this.props.participants.find(user => user._id === this.props.comment.author_id);
    return (
      <Container>
        {
          starred.length > 0 && 
          (
            <Button
              disabled={!!this.props.active_vote || !starred.some(star => star.user_id === Meteor.userId())}
              floated='right'
              content='Call Vote'
              color='green'
              onClick={() => Meteor.call('discussions.callVote', this.props.discussion_id, this.props.comment._id, starred.map(star => star.user_id))}
              label={{
                basic: true,
                content: 
                  <List children={
                    starred.map(star => {
                      const item = this.props.participants.find(user => user._id === star.user_id);
        
                      return (
                        <Item key={item._id} as={Link} to={`/user/${star.user_id}`}>
                          <Item.Image avatar size='mini' src={item.avatar ? item.avatar : '/avatar_default.png'} />
                          <Item.Content verticalAlign='middle' content={item.username} />
                        </Item>
                      )
                    })
                  } />
                }} 
                labelPosition='left'/>
          )
        }
        <Icon link 
          name={ this.isCollapsed() ? 'chevron down' : 'minus' } 
          onClick={this.collapse.bind(this)}
        />
        <Comment.Avatar 
          as={Link} to={`/user/${author._id}`}
          src={author.avatar ? author.avatar : '/avatar_default.png'}
          />
        <Comment.Author as={Link} to={`/user/${author._id}`} content={author.username} />
        <Comment.Metadata>
          <div>
            <Moment fromNow>{this.props.comment.posted_time}</Moment>
            &nbsp;
            {this.renderUserReplyingStatus()}
          </div>
        </Comment.Metadata>
        <Comment.Text content={this.props.comment.text} />
        <Comment.Actions>
          <Comment.Action onClick={() => Meteor.call('discussions.reply', this.props.discussion_id, this.props.comment._id)} content='Reply' />
          {
            starred.some(star => star.user_id === Meteor.userId()) ? 
            (
              <Comment.Action onClick={() => Meteor.call('discussions.remove_star', this.props.discussion_id)} content='Unstar' />
            ) :
            (
              <Comment.Action onClick={() => Meteor.call('discussions.star_comment', this.props.discussion_id, this.props.comment._id)} content='Star' />
            )
          }
        </Comment.Actions>
      </Container>
    );
  }

  render(){
    const starred = (this.props.userStars || []).filter(star => star.comment_id === this.props.comment._id);
    if(this.props.loaded){
      return (
        <Comment collapsed={ this.isCollapsed() } id={this.props.comment._id}>
          <Comment.Content>
            { 
              starred.length > 0 ?
              (
                <Segment color='yellow' inverted tertiary attached={this.props.vote && 'top'}>
                  {this.renderContent(starred)}
                </Segment>
              ) : this.renderContent(starred)
            }
            {this.renderVote()}
            {this.renderReplyForm()}
            {this.renderChildren()}
            {this.isCollapsed() && (<Divider clearing hidden />)}
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
  const participantsSub = Meteor.subscribe('users');

  Meteor.subscribe('votes');

  const discussion = Discussions.findOne(
    { _id: discussion_id },
    { fields: {
        active_replies: 1, 
        user_stars: 1,
        active_vote: 1,
      }
    }
  ) || {};

  return {
    loaded: commentsSub.ready() && discussionsSub.ready() && participantsSub.ready(),
    children: Comments.find(
      { 
        discussion_id: discussion_id,
        parent_id: comment._id,
      },
      { sort: { posted_time: 1 }},
      ).fetch(),
    userReplies: discussion.active_replies,
    userStars: discussion.user_stars,
    participants: Meteor.users.find({}).fetch(),
    vote: Votes.findOne({ comment_id: comment._id }),
    active_vote: discussion.active_vote,
  }
})(CommentViewTemplate);

export default CommentView;
