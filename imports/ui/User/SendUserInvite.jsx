import React, { PureComponent } from 'react';
import { Meteor } from 'meteor/meteor';
import {
  Container, Header, Segment, Form,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';

class SendUserInvite extends PureComponent {
  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      email: '',
    };
  }

  render() {
    const { onSubmit } = this.props;
    const { email } = this.state;

    return (
      <Container>
        <Header
          content="Send Email Invite"
          size="large"
          attached="top"
        />
        <Segment
          attached="bottom"
          as={Form}
          clearing
        >
          <Form.Input
            label="Email Address"
            focus
            onChange={(err, { value }) => this.setState({ email: value })}
          />
          <Form.Button
            floated="right"
            positive
            content="Send Email"
            onClick={() => Meteor.call('users.enrolNewUser', email, (err, newUserId) => onSubmit(newUserId))}
          />
        </Segment>
      </Container>
    );
  }
}

export default SendUserInvite;
