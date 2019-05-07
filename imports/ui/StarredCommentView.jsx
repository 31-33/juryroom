import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Button, Comment, Header, Icon, Segment } from 'semantic-ui-react';

class StarredCommentView extends Component {

  renderComments(){
    const currUserID = this.props.user && this.props.user._id;
    return this.props.starred
      .sort((c1, c2) => c2.starredBy.length - c1.starredBy.length)
      .map(comment => {
        const userStarred = comment.starredBy.some(user => user.id===currUserID);
        return (
          <Comment key={comment.id}>
            <Comment.Content>
              <Comment.Author as="a">
                {comment.author}
              </Comment.Author>
              <Comment.Metadata>
                {comment.time}
              </Comment.Metadata>
              <Comment.Text>
                {comment.text}
              </Comment.Text>
              <Comment.Actions>
                <Button
                  attached="top"
                  icon="star"
                  color="yellow"
                  content={userStarred ? "Starred" : "Star"}
                  basic={!userStarred}
                  label={{
                    basic: true,
                    color: "yellow",
                    pointing: "left",
                    content: comment.starredBy.map(user => user.username).join(", "),
                  }}
                  onClick={() => this.props.starCallback(comment.id)}
                />
                <Button
                attached="bottom"
                  icon="exclamation"
                  color="green"
                  content="Call Vote"
                  onClick={() => this.props.voteCallback(comment.id)}
                />
              </Comment.Actions>
            </Comment.Content>
          </Comment>
        );
      });
  }

  render(){

    return (
      <Segment>
        <Header>Starred Comments</Header>
        <Comment.Group>
          {this.renderComments()}
        </Comment.Group>
      </Segment>
    );
  }
}

export default withTracker(({id}) => {
  return {
    user: Meteor.user(),
  }
})(StarredCommentView);
