import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import {
  Segment, Header, Button, Item,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import ModifyUserPermissions from './ModifyUserPermissions';
import NotFoundPage from '/imports/ui/Error/NotFoundPage';
import LoadingPage from '/imports/ui/Error/LoadingPage';

class UserProfile extends Component {
  static propTypes = {
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
    }).isRequired,
    match: PropTypes.shape({}).isRequired,
  }

  constructor(props) {
    super(props);

    this.state = {
      error: false,
      user: undefined,
    };
  }

  componentDidMount() {
    const { match } = this.props;
    Meteor.call('users.getProfile', match.params.userId, (error, user) => {
      if (error) {
        this.setState({ error });
      } else {
        this.setState({ user });
      }
    });
  }

  render() {
    const { location } = this.props;
    const { error, user } = this.state;

    if (error) {
      return <NotFoundPage />;
    }

    if (!user) {
      return <LoadingPage />;
    }

    const { _id, username, avatar } = user;
    return (
      <Segment>
        <Item.Group>
          <Item>
            <Item.Image size="tiny" avatar src={avatar || '/avatar_default.png'} />
            <Item.Content>
              {_id === Meteor.userId() && (
                <Button
                  floated="right"
                  as={Link}
                  to={`${location.pathname}/edit`}
                  content="Edit Profile"
                />
              )}
              <Item.Header>
                {username}
              </Item.Header>
              <Item.Meta>&nbsp;</Item.Meta>
              <Item.Description>
                <Header sub>Description</Header>
                &nbsp;
              </Item.Description>
            </Item.Content>
          </Item>
        </Item.Group>
        <ModifyUserPermissions user={user} />
      </Segment>
    );
  }
}

export default UserProfile;
