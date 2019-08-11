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
      discussionId, author, comment, scenario,
    } = this.props;
    return (
      <html lang="en">
        <Container
          as="body"
          style={{
            display: 'block',
            margin: 'auto',
          }}
        >
          <Segment
            style={{
              padding: '1em',
              border: '1px solid #d4d4d5',
              margin: 0,
            }}
          >
            <Header
              style={{
                fontSize: '2em',
                padding: '0',
                fontWeight: '700',
              }}
            >
              <img
                src={`${process.env.ROOT_URL}favicon.ico`}
                style={{ verticalAlign: 'middle' }}
                width="30px"
                height="30px"
                alt="JuryRoom Logo"
              />
              {' '}
              JuryRoom
            </Header>
          </Segment>
          <Segment
            style={{
              padding: '1em',
              border: '1px solid #d4d4d5',
              borderTop: 'none',
              margin: 0,
            }}
          >
            <p>
              <em>{author.username}</em>
              {' '}
              posted a new comment on the discussion
              {' '}
              <em>{`'${scenario.title}'`}</em>
            </p>
            <Segment
              style={{
                boxShadow: '0 2px 4px 0 rgba(34,36,38,.12),0 2px 10px 0 rgba(34,36,38,.15)',
                fontSize: '1rem',
                border: '1px solid rgba(34,36,38,.15)',
                borderRadius: '0.3rem',
                margin: '1rem 0',
              }}
            >
              <Comment.Group>
                <Comment>
                  <Comment.Content>
                    {/* <Comment.Avatar src={author.avatar || `${process.env.ROOT_URL}avatar_default.png`} style={{ height: '2.5em' }} /> */}
                    <Comment.Author
                      content={author.username}
                      style={{
                        fontWeight: 700,
                        padding: '1em',
                        fontSize: '1em',
                      }}
                    />
                    <Comment.Text
                      style={{
                        padding: '1em',
                      }}
                    >
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
            <p>
              Click
              {' '}
              <a href={`${process.env.ROOT_URL}discussion/${discussionId}#${comment._id}`}>here</a>
              {' '}
              to view the discussion.
            </p>
            <Container>
              <Linkify properties={{ target: '_blank' }}>
                {`${process.env.ROOT_URL}discussion/${discussionId}#${comment._id}`}
              </Linkify>
            </Container>
          </Segment>
        </Container>
      </html>
    );
  }
}
export default VoteNotification;
