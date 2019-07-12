import React, { PureComponent } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import PropTypes from 'prop-types';
import {
  Modal, Form, Segment, Header, Container,
} from 'semantic-ui-react';
import NotAuthorizedPage from '/imports/ui/Error/NotAuthorizedPage';

class EnrollForm extends PureComponent {
  static propTypes = {
    token: PropTypes.string.isRequired,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      username: '',
      validUsername: true,
      password: '',
      confirm: '',
      error: false,
      user: {},
    };
    Meteor.call('users.getFromResetToken', props.token, (error, user) => {
      if (error) {
        this.setState({ error });
      }
      this.setState({ user });
    });
  }

  handleChange = (e, { name, value }) => this.setState({ [name]: value });

  render() {
    const {
      username, validUsername, password, confirm, user, error,
    } = this.state;
    const { token, history } = this.props;

    if (error) {
      return <NotAuthorizedPage />;
    }

    const emailAddress = user.emails ? user.emails[0].address : false;
    return (
      <Modal
        open
        size="mini"
      >
        <Container>
          <Header
            content="Complete Registration"
            size="large"
            attached="top"
          />
          <Form
            as={Segment}
            clearing
            attached="bottom"
          >
            <Form.Input
              label="Email Address"
              loading={!emailAddress}
              readOnly
              value={emailAddress || ''}
            />
            <Form.Input
              label="Username"
              onChange={(err, { value }) => {
                this.setState({
                  username: value,
                  validUsername: null,
                });
                Meteor.call('users.doesUsernameExist', value,
                  (_, usernameExists) => this.setState({ validUsername: !usernameExists }));
              }}
              loading={validUsername === null}
              error={validUsername === false}
            />
            <Form.Input
              label="Password"
              type="password"
              onChange={(err, { value }) => this.setState({ password: value })}
            />
            <Form.Input
              label="Confirm Password"
              type="password"
              error={password !== confirm}
              onChange={(err, { value }) => this.setState({ confirm: value })}
            />
            <Form.Button
              primary
              floated="right"
              content="Submit"
              disabled={
                !username
                || !validUsername
                || !password
                || password !== confirm
              }
              onClick={() => {
                Meteor.call('users.setUsernameOnEnroll', token, username,
                  err => !err && Accounts.resetPassword(token, password, () => history.push('/')));
              }}
            />
          </Form>
        </Container>
      </Modal>
    );
  }
}
export default withTracker(({ match }) => {
  const { token } = match.params;
  return {
    token,
  };
})(EnrollForm);
