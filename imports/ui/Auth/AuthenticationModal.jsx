import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import {
  Modal, Header, Icon, Form, Message,
} from 'semantic-ui-react';


class AuthenticationModal extends Component {
  constructor() {
    super();
    this.state = {
      login: true,
      username: '',
      validUsername: true,
      verifyingUsername: false,
      email: '',
      password: '',
      confirmPassword: '',
      errorMessage: '',
    };
  }

  render() {
    const {
      login, errorMessage, verifyingUsername, validUsername,
      username, email, password, confirmPassword,
    } = this.state;

    return (
      <Modal open>
        <Header size="huge" textAlign="center">
          <Icon size="big" name="balance scale" />
          {login ? 'Log in to your account' : 'Create a new account'}
        </Header>
        <Form size="large" style={{ maxWidth: 450, margin: 'auto', padding: '1em' }}>
          {login ? (
            <>
              <Form.Input
                fluid
                icon="mail"
                iconPosition="left"
                placeholder="Email address"
                content={email}
                onChange={(_, { value }) => this.setState({ email: value })}
              />
              <Form.Input
                fluid
                icon="lock"
                iconPosition="left"
                placeholder="Password"
                type="password"
                content={password}
                onChange={(_, { value }) => this.setState({ password: value })}
              />
              <Message visible={errorMessage !== ''} error content={errorMessage} />
              <Form.Group widths="equal">
                <Form.Button
                  color="teal"
                  size="huge"
                  content="Login"
                  fluid
                  onClick={() => Meteor.loginWithPassword(
                    email,
                    password,
                    ({ reason }) => this.setState({ errorMessage: reason }),
                  )}
                />
                <Form.Button
                  color="orange"
                  size="large"
                  compact
                  content="New to JuryRoom? Register"
                  fluid
                  onClick={() => this.setState({ login: false })}
                />
              </Form.Group>
            </>
          ) : (
            <>
              <Form.Input
                fluid
                icon="user"
                iconPosition="left"
                placeholder="Username"
                content={username}
                error={!validUsername}
                loading={verifyingUsername}
                onChange={(_, { value }) => {
                  this.setState({
                    username: value,
                    verifyingUsername: true,
                  });
                  Meteor.call('users.doesUsernameExist', value, (err, res) => {
                    this.setState({
                      verifyingUsername: false,
                      validUsername: !res,
                      errorMessage: res ? 'Username already exists' : '',
                    });
                  });
                }}
              />
              <Form.Input
                fluid
                icon="mail"
                iconPosition="left"
                placeholder="Email address"
                content={email}
                onChange={(_, { value }) => this.setState({ email: value })}
              />
              <Form.Input
                fluid
                icon="lock"
                iconPosition="left"
                placeholder="Password"
                type="password"
                content={password}
                onChange={(_, { value }) => this.setState({ password: value })}
              />
              <Form.Input
                fluid
                icon="lock"
                iconPosition="left"
                placeholder="Confirm Password"
                type="password"
                content={confirmPassword}
                onChange={(_, { value }) => this.setState({ confirmPassword: value })}
              />
              <Message visible={errorMessage !== ''} error content={errorMessage} />
              <Form.Group widths="equal">
                <Form.Button
                  color="teal"
                  size="huge"
                  content="Register"
                  disabled={username === '' || verifyingUsername || email === '' || password === '' || password !== confirmPassword}
                  fluid
                  onClick={() => Accounts.createUser(
                    {
                      email,
                      username,
                      password,
                    },
                    ({ reason }) => this.setState({ errorMessage: reason }),
                  )}
                />
                <Form.Button
                  color="orange"
                  size="large"
                  compact
                  content="Already a member? Login"
                  fluid
                  onClick={() => this.setState({ login: true })}
                />
              </Form.Group>
            </>
          )}
        </Form>
      </Modal>
    );
  }
}

export default AuthenticationModal;
