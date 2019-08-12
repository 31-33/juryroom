import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import {
  Segment, Header, Form,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import { formatDate, parseDate } from 'react-day-picker/moment';
import 'react-day-picker/lib/style.css';
import NotAuthorizedPage from '/imports/ui/Error/NotAuthorizedPage';
import LoadingPage from '/imports/ui/Error/LoadingPage';
import AvatarEditor from './AvatarEditor';

class EditProfile extends Component {
  avatarEditor = null;

  static propTypes = {
    userId: PropTypes.string.isRequired,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      error: false,
      user: undefined,

      firstname: {
        value: '',
        public: false,
      },
      lastname: {
        value: '',
        public: false,
      },
      gender: {
        value: '',
        public: false,
      },
      dateofbirth: {
        value: '',
        public: false,
      },
      ethnicity: {
        value: '',
        public: false,
      },
      religion: {
        value: '',
        public: false,
      },
      about: {
        value: '',
        public: false,
      },
    };
  }

  componentDidMount() {
    const { userId } = this.props;
    Meteor.call('users.getProfile', userId, (error, user) => {
      if (error) {
        this.setState({ error });
      } else {
        this.setState({ user, ...user.profileInfo });
      }
    });
  }

  saveProfile = () => {
    const { history, userId } = this.props;
    const {
      firstname,
      lastname,
      gender,
      dateofbirth,
      ethnicity,
      religion,
      about,
    } = this.state;

    const profileInfo = {
      firstname,
      lastname,
      gender,
      dateofbirth,
      ethnicity,
      religion,
      about,
    };

    Meteor.call(
      'users.updateProfile',
      this.avatarEditor.getProfileImage(),
      profileInfo,
      () => {
        history.push(`/user/${userId}`);
      },
    );
  }

  handleChange = (e, { name, value }) => {
    this.setState({
      [name]: {
        public: false,
        value,
      },
    });
  }

  render() {
    const { userId } = this.props;
    const { error, user } = this.state;
    const { username } = user || {};

    if (userId !== Meteor.userId() || error) {
      return <NotAuthorizedPage />;
    }

    if (!user) {
      return <LoadingPage />;
    }

    const {
      firstname,
      lastname,
      gender,
      dateofbirth,
      ethnicity,
      religion,
      about,
    } = this.state;

    return (
      <Segment>
        <Header attached="top">
          {username || ''}
          <Header.Subheader>(Edit Profile)</Header.Subheader>
        </Header>
        <Segment attached="bottom">
          <Form>
            <Form.Group>
              <Form.Field width={12}>
                <Form.Group widths="equal">
                  <Form.Input
                    label="First Name"
                    name="firstname"
                    defaultValue={firstname.value}
                    onChange={this.handleChange}
                  />
                  <Form.Input
                    label="Last Name"
                    name="lastname"
                    defaultValue={lastname.value}
                    onChange={this.handleChange}
                  />
                </Form.Group>
                <Form.Group widths="equal">
                  <Form.Input
                    label="Gender"
                    name="gender"
                    defaultValue={gender.value}
                    onChange={this.handleChange}
                  />
                  <Form.Field
                    label="Date of Birth"
                    name="dateofbirth"
                    control={DayPickerInput}
                    value={dateofbirth.value}
                    format="DD/MM/YYYY"
                    formatDate={formatDate}
                    parseDate={parseDate}
                    placeholder="DD/MM/YYYY"
                    onDayChange={(date) => {
                      this.setState({
                        dateofbirth: {
                          public: false,
                          value: date,
                        },
                      });
                    }}
                  />
                </Form.Group>
                <Form.Group widths="equal">
                  <Form.Input
                    label="Ethnicity"
                    name="ethnicity"
                    defaultValue={ethnicity.value}
                    onChange={this.handleChange}
                  />
                  <Form.Input
                    label="Religion"
                    name="religion"
                    defaultValue={religion.value}
                    onChange={this.handleChange}
                  />
                </Form.Group>
              </Form.Field>
              <Form.Field width={4}>
                {user && (
                  <AvatarEditor
                    ref={(ref) => { this.avatarEditor = ref; }}
                    avatar={user.avatar}
                  />
                )}
              </Form.Field>
            </Form.Group>
            <Form.TextArea
              label="About"
              name="about"
              defaultValue={about.value}
              onChange={this.handleChange}
            />
            <Form.Button onClick={this.saveProfile}>Save</Form.Button>
          </Form>
        </Segment>
      </Segment>
    );
  }
}

export default withTracker(({ match }) => {
  const { userId } = match.params;
  return {
    userId,
  };
})(EditProfile);
