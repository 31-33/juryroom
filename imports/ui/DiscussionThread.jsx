import React, { Component, createRef } from 'react';
import { Button, Comment, Container, Rail, Ref, Segment, Sticky } from 'semantic-ui-react';
import CommentView from '/imports/ui/CommentView';
import StarredCommentView from '/imports/ui/StarredCommentView';
import CommentForm from '/imports/ui/CommentForm';

class DiscussionThread extends Component{
  contextRef = createRef();

  constructor(){
    super();

    this.state = {
      replying: false,
    }
  }

  onCommentStarred = (commentid) => {
    console.log(`user clicked star on comment ${commentid}`)
  }

  onCommentVoteCalled = (commentid) => {
    console.log(`user clicked vote on comment ${commentid}`)
  }

  showCommentForm(){
    this.setState({
      replying: true,
    })
  }

  closeCommentForm = () => {
    this.setState({
      replying: false,
    })
  }

  renderComments(){
    return this.props.comments.map(comment =>  {
      return (
        <CommentView
          key={comment.id}
          data={comment}
          starCallback={this.onCommentStarred}
        />
      )
    });
  }

  render(){
    return (
      <div>
        <Ref innerRef={this.contextRef}>
          <Segment>
            <Comment.Group threaded={true}>
              {this.renderComments()}
              {this.state.replying ?
                (<CommentForm onClose={this.closeCommentForm} />)
                : (<Button primary onClick={this.showCommentForm.bind(this)}>Post</Button>)
              }
            </Comment.Group>
            <Rail position='left'>
              <Sticky context={this.contextRef} offset={80}>
                <StarredCommentView
                  starred={[
                    {id: 0, author: "bob", text: "hello world", starredBy: [{id: 7,username: "George"}]},
                    {id: 1, author: "bob", text: "hello world", starredBy: [{id: 1, username: "Amber"}, {id: 2,username: "Bob"}, {id: 3,username: "Chris"}, {id: 4,username: "Dave"}, {id: 5,username: "Erin"}, {id: 6,username: "Fred"}, {id: 7,username: "George"}]},
                    {id: 2, author: "bob", text: "hello world", starredBy: [{id: 1, username: "Amber"}, {id: 4,username: "Dave"}, {id: 5,username: "Erin"}, {id: 6,username: "Fred"}, {id: 7,username: "George"}]},
                  ]}
                  starCallback={this.onCommentStarred}
                  voteCallback={this.onCommentVoteCalled}
                />
              </Sticky>
            </Rail>
            <Rail position='right'>
              <Sticky context={this.contextRef} offset={80}>
                <Segment>Discussion history / navigation bar here</Segment>
              </Sticky>
            </Rail>
          </Segment>
        </Ref>
      </div>
    );
  }
}

export default DiscussionThread;
