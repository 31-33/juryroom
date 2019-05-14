import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Comments } from '/imports/api/Comments';
import { Discussions } from '/imports/api/Discussions';
import { Comment, Icon } from 'semantic-ui-react';
import Moment from 'react-moment';
import CommentForm, { openCommentForm } from '/imports/ui/CommentForm';
import { starComment } from './StarredCommentView';

class CommentViewTemplate extends Component {

  constructor(props){
    super(props);

    this.state = {
      collapsed: false,
    }
  }

  collapse(){
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }

  userSelected(){
    console.log(`user clicked on name: ${this.props.data.author.name}`);
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
                comment_id={child._id}
                data={child}
                starCallback={this.props.starCallback}
              />
            )
          })
        }
      </Comment.Group>
    ) : '';
  }

  renderUserReplyingStatus(){
    if(this.props.discussion_state && this.props.discussion_state.user_data){
      const replying_users = [];
      this.props.discussion_state.user_data.forEach(user => {
        if(user.replying === this.props.comment_id && user.id !== Meteor.userId()){
          replying_users.push(user.name);
        }
      })
      return replying_users.length > 0 ?
        (
          <strong>{replying_users.join(', ')} is replying</strong>
        ): '';
    }
    return '';
  }

  renderReplyForm(){
    if(this.props.discussion_state && this.props.discussion_state.user_data){
      return this.props.discussion_state.user_data.some(
        user => user.id === Meteor.userId() && user.replying === this.props.comment_id
      ) ?
      (
        <CommentForm
          discussion_id={this.props.discussion_id}
          parent_id={this.props.data._id}
        />
      ) : '';
    }
    return '';
  }

  render(){
    // <Comment.Avatar src=""/>
    return (
      <Comment collapsed={ this.state.collapsed }>
        <Comment.Content>
          <Icon link name={ this.state.collapsed ? 'chevron down' : 'minus' } onClick={this.collapse.bind(this)}/>
          <Comment.Author as='a' onClick={this.userSelected.bind(this)}>
            {this.props.data.author.name}
          </Comment.Author>
          <Comment.Metadata>
            <div>
              <Moment fromNow>{this.props.data.posted_time}</Moment>
              &nbsp;
              {this.renderUserReplyingStatus()}
            </div>
          </Comment.Metadata>
          <Comment.Text>
            {this.props.data.text}
          </Comment.Text>
          <Comment.Actions>
            <Comment.Action onClick={() => openCommentForm(this.props.discussion_id, this.props.comment_id)}>Reply</Comment.Action>
            <Comment.Action onClick={() => starComment(this.props.discussion_id, this.props.comment_id)}>Star</Comment.Action>
          </Comment.Actions>
          {this.renderReplyForm()}
          {this.renderChildren()}
        </Comment.Content>
      </Comment>
    );
  }
}
const CommentView = withTracker(({discussion_id, comment_id}) => {
  Meteor.subscribe('comments', discussion_id, comment_id);
  Meteor.subscribe('discussions', discussion_id);

  return {
    children: Comments.find(
      { 
        discussion_id: discussion_id,
        parent_id: comment_id,
      },
      { sort: { posted_time: 1 }},
    ).fetch(),
    discussion_state: Discussions.findOne(
      { _id: discussion_id },
      { user_data: 1 }
    ),
  }
})(CommentViewTemplate);

export default CommentView;
