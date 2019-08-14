import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  Container, Segment, Header,
} from 'semantic-ui-react';

import Linkify from 'react-linkify';

class EmailInvite extends PureComponent {
  static propTypes = {
    user: PropTypes.shape({}).isRequired,
    url: PropTypes.string.isRequired,
  };

  render() {
    const { url } = this.props;
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
            You have been invited to participate in JuryRoom.
            <p>
              Please click
              {' '}
              <a href={url}>here</a>
              {' '}
              to register your account.
            </p>
            <Container>
              <Linkify properties={{ target: '_blank' }}>
                {url}
              </Linkify>
            </Container>
          </Segment>
        </Container>
      </html>
    );
  }
}
export default EmailInvite;
