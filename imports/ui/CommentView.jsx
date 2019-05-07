import React, { Component } from 'react';
import { Comment, Icon } from 'semantic-ui-react';
import CommentForm from '/imports/ui/CommentForm';

class CommentView extends Component {

  constructor(props){
    super(props);

    this.state = {
      collapsed: false,
      reply: false,
    }
  }

  renderChildren(){
    return this.props.data.children.map(child => {

      return (
        <CommentView
          key={child.id}
          data={child}
          starCallback={this.props.starCallback}
        />
      );
    });
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
    console.log(`user clicked on name: ${this.props.data.username}`);
  }

  render(){
    // <Comment.Avatar src=""/>
    return (
      <Comment collapsed={ this.state.collapsed }>
        <Comment.Content>
          <Icon link name={ this.state.collapsed ? 'chevron down' : 'minus' } onClick={this.collapse.bind(this)}/>
          <Comment.Author as='a' onClick={this.userSelected.bind(this)}>
            {this.props.data.username}
          </Comment.Author>
          <Comment.Metadata>
            <div>{this.props.data.time}</div>
          </Comment.Metadata>
          <Comment.Text>
            {this.props.data.text}
          </Comment.Text>
          <Comment.Actions>
            <Comment.Action onClick={this.onReplyClicked.bind(this)}>Reply</Comment.Action>
            <Comment.Action onClick={() => this.props.starCallback(this.props.data.id)}>Star</Comment.Action>
          </Comment.Actions>
          { this.state.reply ?
            <CommentForm parentid={this.props.id} onClose={this.closeCommentForm} />
            : ''
          }
          { this.props.data.children ?
            (
              <Comment.Group threaded={true}>
                {this.renderChildren()}
              </Comment.Group>
            ) : ''
          }
        </Comment.Content>
      </Comment>
    );
  }
}

export default CommentView;
