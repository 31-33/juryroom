import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  Container, Segment, Header, Comment,
} from 'semantic-ui-react';

import Linkify from 'react-linkify';
import ReactMarkdown from 'react-markdown';

class VoteNotification extends PureComponent {
  static propTypes = {
    discussionId: PropTypes.string.isRequired,
    caller: PropTypes.shape({
      username: PropTypes.string.isRequired,
    }).isRequired,
    author: PropTypes.shape({
      username: PropTypes.string.isRequired,
      avatar: PropTypes.string,
    }).isRequired,
    comment: PropTypes.shape({
      text: PropTypes.string.isRequired,
    }).isRequired,
    scenario: PropTypes.shape({
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
    }).isRequired,
  };

  render() {
    const {
      discussionId, author, caller, comment, scenario,
    } = this.props;
    return (
      <Container>
        {/* TODO: Embedd css in email */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.4.1/semantic.min.css" />
        <Segment attached="top">
          <Header
            size="huge"
            content="JuryRoom"
            icon="balance scale"
          />
        </Segment>
        <Segment attached="bottom">
          <p>
            <em>{caller.username}</em>
            {' '}
            called a vote on the discussion
            {' '}
            <em>{`'${scenario.title}'`}</em>
          </p>
          <Segment raised>
            <Comment.Group>
              <Comment>
                <Comment.Content>
                  <Comment.Avatar src={author.avatar || `${process.env.ROOT_URL}/avatar_default.png`} style={{ height: '2.5em' }} />
                  <Comment.Author content={author.username} />
                  <Comment.Text>
                    <Linkify properties={{ target: '_blank' }}>
                      <ReactMarkdown
                        source={comment.text}
                        disallowedTypes={['image', 'imageReference']}
                      />
                    </Linkify>
                  </Comment.Text>
                </Comment.Content>
              </Comment>
            </Comment.Group>
          </Segment>
          Click
          {' '}
          <a href={`${process.env.ROOT_URL}discussion/${discussionId}`}>here</a>
          {' '}
          to view the discussion.
          <Container>
            <Linkify properties={{ target: '_blank' }}>
              {`${process.env.ROOT_URL}discussion/${discussionId}`}
            </Linkify>
          </Container>
        </Segment>
      </Container>
    );
  }
}
export default VoteNotification;
