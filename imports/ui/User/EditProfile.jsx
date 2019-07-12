import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import {
  Segment, Header, Form,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import 'react-day-picker/lib/style.css';
import { UserPropType } from '/imports/types';
import NotAuthorizedPage from '/imports/ui/Error/NotAuthorizedPage';
import AvatarEditor from './AvatarEditor';

class EditProfile extends Component {
  avatarEditor = null;

  static defaultProps = {
    user: false,
  };

  static propTypes = {
    user: PropTypes.oneOfType([UserPropType, PropTypes.bool]),
    userId: PropTypes.string.isRequired,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {

    };
  }

  componentDidUpdate(prevProps) {
    const { user } = this.props;
    if (prevProps.user.profileInfo === undefined && user.profileInfo) {
      const {
        firstname,
        lastname,
        gender,
        dateofbirth,
        ethnicity,
        religion,
        about,
      } = user.profileInfo;

      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        firstname: firstname.value,
        lastname: lastname.value,
        gender: gender.value,
        dateofbirth: dateofbirth.value,
        ethnicity: ethnicity.value,
        religion: religion.value,
        about: about.value,
      });
    }
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
      firstname: { value: firstname, public: true },
      lastname: { value: lastname, public: true },
      gender: { value: gender, public: true },
      dateofbirth: { value: dateofbirth, public: true },
      ethnicity: { value: ethnicity, public: true },
      religion: { value: religion, public: true },
      about: { value: about, public: true },
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

  handleChange = (e, { name, value }) => this.setState({ [name]: value });

  render() {
    const { user, userId } = this.props;
    const { username } = user || {};

    if (userId !== Meteor.userId()) {
      return <NotAuthorizedPage />;
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
                    defaultValue={firstname}
                    onChange={this.handleChange}
                  />
                  <Form.Input
                    label="Last Name"
                    name="lastname"
                    defaultValue={lastname}
                    onChange={this.handleChange}
                  />
                </Form.Group>
                <Form.Group widths="equal">
                  <Form.Input
                    label="Gender"
                    name="gender"
                    defaultValue={gender}
                    onChange={this.handleChange}
                  />
                  <Form.Field
                    label="Date of Birth"
                    control={DayPickerInput}
                    format="DD/MM/YYYY"
                    placeholder="DD/MM/YYYY"
                    name="dateofbirth"
                    defaultValue={dateofbirth}
                    onChange={this.handleChange}
                  />
                </Form.Group>
                <Form.Group widths="equal">
                  <Form.Input
                    label="Ethnicity"
                    name="ethnicity"
                    defaultValue={ethnicity}
                    onChange={this.handleChange}
                  />
                  <Form.Input
                    label="Religion"
                    name="religion"
                    defaultValue={religion}
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
              value={about}
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
    user: Meteor.users.findOne({ _id: userId }),
  };
})(EditProfile);
