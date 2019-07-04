import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import {
  Segment, Header, Form,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';

import DayPickerInput from 'react-day-picker/DayPickerInput';
import 'react-day-picker/lib/style.css';
import ReactAvatarEditor from 'react-avatar-editor';
import { UserPropType } from '/imports/types';
import NotAuthorizedPage from '/imports/ui/Error/NotAuthorizedPage';

class EditProfile extends Component {
  static defaultProps = {
    user: false,
  }

  static propTypes = {
    user: PropTypes.oneOfType([UserPropType, PropTypes.bool]),
    userId: PropTypes.string.isRequired,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
  }

  constructor(props) {
    super(props);

    const { avatar } = props.user || {};
    this.state = {
      scale: 1,
      image: avatar || '/avatar_default.png',
    };
  }

  componentDidUpdate(prevProps) {
    const { user } = this.props;
    if (!prevProps.user && user && user.avatar) {
      this.updateImage(user.avatar);
    }
  }

  setEditor = (editor) => {
    this.editor = editor;
  }

  getImage() {
    return this.editor.getImageScaledToCanvas().toDataURL();
  }

  saveProfile = () => {
    const { history, userId } = this.props;
    Meteor.call('users.updateProfile', this.getImage(), () => {
      history.push(`/user/${userId}`);
    });
  }

  updateImage(img) {
    this.setState({ image: img });
  }

  render() {
    const { image, scale } = this.state;
    const { user, userId } = this.props;
    const { username } = user || {};

    if (userId !== Meteor.userId()) {
      return <NotAuthorizedPage />;
    }

    return (
      <Segment>
        <Header attached="top">
          {username || ''}
          <Header.Subheader>(Edit Profile)</Header.Subheader>
        </Header>
        <Segment attached="bottom">
          <Form>
            <Segment.Group horizontal>
              <Form.Group grouped as={Segment} floated="left">
                <Form.Group>
                  <Form.Input label="First Name" />
                  <Form.Input label="Last Name" />
                </Form.Group>
                <Form.Group>
                  <Form.Input label="Gender" />
                  <Form.Field label="Date of Birth" control={DayPickerInput} format="DD/MM/YYYY" placeholder="DD/MM/YYYY" />
                </Form.Group>
                <Form.Group>
                  <Form.Input label="Ethnicity" />
                  <Form.Input label="Religion" />
                </Form.Group>
              </Form.Group>
              <Form.Group grouped as={Segment} floated="right">
                <ReactAvatarEditor
                  ref={this.setEditor}
                  width={100}
                  height={100}
                  image={image}
                  scale={parseFloat(scale)}
                />
                <div>
                  <input type="range" min="0.25" max="4" step="0.05" defaultValue="1" onChange={e => this.setState({ scale: parseFloat(e.target.value) })} />
                  <input type="file" onChange={e => this.setState({ image: e.target.files[0] })} />
                </div>
              </Form.Group>
            </Segment.Group>
            <Form.TextArea label="About" />
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
