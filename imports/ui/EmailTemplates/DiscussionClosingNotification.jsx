import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  Container, Segment, Header,
} from 'semantic-ui-react';
import Moment from 'react-moment';

import Linkify from 'react-linkify';

class NewDiscussionNotification extends PureComponent {
  static propTypes = {
    discussion: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      deadline: PropTypes.instanceOf(Date),
    }).isRequired,
    dateTime: PropTypes.instanceOf(Date).isRequired,
    scenario: PropTypes.shape({
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
    }).isRequired,
  };

  render() {
    const {
      discussion, scenario, dateTime,
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
              The discussion
              {' '}
              {`'${scenario.title}'`}
              {' '}
              ends
              {' '}
              <Moment
                from={dateTime}
                date={discussion.deadline}
              />
              <br />
              If the group has not reached a consensus by then, a hung jury will be declared.
              <br />
            </p>
            <p>
              Click
              {' '}
              <a href={`${process.env.ROOT_URL}discussion/${discussion._id}`}>here</a>
              {' '}
              to view the discussion.
            </p>
            <Container>
              <Linkify properties={{ target: '_blank' }}>
                {`${process.env.ROOT_URL}discussion/${discussion._id}`}
              </Linkify>
            </Container>
          </Segment>
        </Container>
      </html>
    );
  }
}
export default NewDiscussionNotification;
