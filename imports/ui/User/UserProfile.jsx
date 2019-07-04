import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import {
  Segment, Header, Button, Item,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { UserPropType } from '/imports/types';
import ModifyUserPermissions from './ModifyUserPermissions';
import NotFoundPage from '/imports/ui/Error/NotFoundPage';

class UserProfile extends Component {
  static defaultProps = {
    user: false,
  }

  static propTypes = {
    user: PropTypes.oneOfType([UserPropType, PropTypes.bool]),
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
    }).isRequired,
  }

  render() {
    const { user, location } = this.props;

    if (!user) {
      return <NotFoundPage />;
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

export default withTracker(({ match }) => ({
  user: Meteor.users.findOne({ _id: match.params.userId }),
}))(UserProfile);
