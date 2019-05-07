import React, { Component } from 'react';
import { Comment, Icon } from 'semantic-ui-react';

class CommentView extends Component {

  constructor(props){
    super(props);

    this.state = {
      collapsed: false,
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

  reply(){
    console.log("user clicked reply")
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
            <Comment.Action onClick={this.reply.bind(this)}>Reply</Comment.Action>
            <Comment.Action onClick={() => this.props.starCallback(this.props.data.id)}>Star</Comment.Action>
          </Comment.Actions>
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
