import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Comments } from '/imports/api/Comments';
import { Discussions } from '/imports/api/Discussions';
import { Votes } from '/imports/api/Votes';
import { Comment, Icon, Divider, Placeholder, Container, Segment, List, Button, Item, Image, Header } from 'semantic-ui-react';
import Moment from 'react-moment';
import CommentForm from './CommentForm';
import Vote from './Vote';
import { Link } from 'react-router-dom';

class CommentViewTemplate extends Component {

  isCollapsed(){
    return this.props.comment.collapsed.includes(Meteor.userId());
  }
  collapse(){
    Meteor.call('comments.collapse', this.props.discussion._id, this.props.comment._id, !this.isCollapsed());
  }

  renderChildren(){
    return this.props.children.length > 0 && 
    (
      <Comment.Group threaded={true}>
        {
          this.props.children.map(child => {
            return (
              <CommentView
                key={child._id}
                discussion={this.props.discussion}
                participants={this.props.participants}
                comment={child}
              />
            )
          })
        }
      </Comment.Group>
    );
  }

  renderUserReplyingStatus(){
    const userList = this.props.discussion.active_replies
      .filter(reply => reply.user_id !== Meteor.userId() && reply.parent_id === this.props.comment._id)
      .map(reply => this.props.participants.find(user => user._id === reply.user_id).username);
      
    return userList.length > 0 &&
    (
      <strong>
        {userList.join(', ')} is replying
      </strong>
    );
  }

  renderContent(starredBy){
    const author = this.props.participants.find(user => user._id === this.props.comment.author_id);
    return (
      <Container>
        {
          starredBy.length > 0 && 
          (
            <Button
              disabled={!!this.props.discussion.active_vote || !starredBy.some(star => star.user_id === Meteor.userId())}
              floated='right'
              content='Call Vote'
              color='green'
              onClick={() => Meteor.call('discussions.callVote', this.props.discussion._id, this.props.comment._id, starredBy.map(star => star.user_id))}
              label={{
                basic: true,
                content: 
                  <List children={
                    starredBy.map(star => {
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
          <Comment.Action onClick={() => Meteor.call('discussions.reply', this.props.discussion._id, this.props.comment._id)} content='Reply' />
          {
            starredBy.some(star => star.user_id === Meteor.userId()) ? 
            (
              <Comment.Action onClick={() => Meteor.call('discussions.remove_star', this.props.discussion._id)} content='Unstar' />
            ) :
            (
              <Comment.Action onClick={() => Meteor.call('discussions.star_comment', this.props.discussion._id, this.props.comment._id)} content='Star' />
            )
          }
        </Comment.Actions>
      </Container>
    );
  }

  render(){
    const starredBy = this.props.discussion.user_stars.filter(star => star.comment_id === this.props.comment._id);
    return (
      <Comment collapsed={ this.isCollapsed() } id={this.props.comment._id}>
        <Comment.Content>
          { 
            starredBy.length > 0 ?
            (
              <Segment color='yellow' inverted tertiary attached={this.props.vote && 'top'} clearing>
                {this.renderContent(starredBy)}
              </Segment>
            ) : this.renderContent(starredBy)
          }
          {this.props.vote && (
            <Vote 
              vote={this.props.vote}
              participants={this.props.participants}
              isActive={this.props.vote._id === this.props.discussion.active_vote}
              />
          )}
          {this.props.discussion.active_replies.some(reply => 
            reply.user_id === Meteor.userId() && 
            reply.parent_id === this.props.comment._id) && 
          (
            <CommentForm
              discussion_id={this.props.discussion._id}
              parent_id={this.props.comment._id}
            />
          )}
          {this.renderChildren()}
          {this.isCollapsed() && (<Divider clearing hidden />)}
        </Comment.Content>
      </Comment>
    );
  }
}
const CommentView = withTracker(({discussion, comment}) => {
  Meteor.subscribe('comments', discussion._id);
  Meteor.subscribe('votes');

  return {
    children: Comments.find(
      { 
        discussion_id: discussion._id,
        parent_id: comment._id,
      },
      { sort: { posted_time: 1 }},
      ).fetch() || [],
    vote: Votes.findOne({ comment_id: comment._id }),
  }
})(CommentViewTemplate);

export default CommentView;
