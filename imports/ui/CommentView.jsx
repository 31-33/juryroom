import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Comments } from '/imports/api/Comments';
import { Comment, Icon } from 'semantic-ui-react';
import CommentForm from '/imports/ui/CommentForm';

class CommentViewTemplate extends Component {

  constructor(props){
    super(props);

    this.state = {
      collapsed: false,
      reply: false,
    }
  }

  collapse(){
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }

  onReplyClicked(){
    this.setState({
      reply: !this.state.reply,
    });
  }

  closeCommentForm = () => {
    this.setState({
      reply: false,
    });
  }

  userSelected(){
    console.log(`user clicked on name: ${this.props.data.author.name}`);
  }

  renderChildren(){
    return this.props.children ? 
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

  renderReplyForm(){
    return this.state.reply ?
    (
      <CommentForm
        discussion_id={this.props.discussion_id}
        parent_id={this.props.data._id}
        onClose={this.closeCommentForm} />
    ) : '';
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
            <div>{this.props.data.posted_time.toString()}</div>
          </Comment.Metadata>
          <Comment.Text>
            {this.props.data.text}
          </Comment.Text>
          <Comment.Actions>
            <Comment.Action onClick={this.onReplyClicked.bind(this)}>Reply</Comment.Action>
            <Comment.Action onClick={() => this.props.starCallback(this.props.data.id)}>Star</Comment.Action>
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
  return {
    children: Comments.find(
      { 
        discussion_id: discussion_id,
        parent_id: comment_id,
      },
      { sort: { posted_time: 1 }},
    ).fetch(),
  }
})(CommentViewTemplate);

export default CommentView;
