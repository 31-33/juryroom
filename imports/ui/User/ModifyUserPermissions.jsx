import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import {
  Header, Container, Segment, List, Checkbox,
} from 'semantic-ui-react';
import { Roles } from 'meteor/alanning:roles';
import { UserPropType } from '/imports/types';

class ModifyUserPermissions extends Component {
  static propTypes = {
    user: UserPropType.isRequired,
  }

  render() {
    const { user } = this.props;
    return Roles.userIsInRole(user._id, 'admin')
      ? <Segment inverted secondary color="green" content="Administrator" />
      : user._id !== Meteor.userId()
      && Roles.userIsInRole(Meteor.userId(), 'admin')
      && !Roles.userIsInRole(user._id, 'admin')
      && (
        <Container>
          <Header content="Permissions" attached="top" />
          <Segment attached="bottom">
            <List relaxed>
              <List.Item>
                <Checkbox
                  toggle
                  label="Create Scenarios"
                  defaultChecked={Roles.userIsInRole(user, 'create-scenario')}
                  onClick={(event, button) => Meteor.call('roles.setPermission_createScenario', user._id, button.checked)}
                />
              </List.Item>
              <List.Item>
                <Checkbox
                  toggle
                  label="Create Scenario Sets"
                  defaultChecked={Roles.userIsInRole(user, 'create-scenario-set')}
                  onClick={(event, button) => Meteor.call('roles.setPermission_createScenarioSet', user._id, button.checked)}
                />
              </List.Item>
              <List.Item>
                <Checkbox
                  toggle
                  label="Create Groups"
                  defaultChecked={Roles.userIsInRole(user, 'create-group')}
                  onClick={(event, button) => Meteor.call('roles.setPermission_createGroup', user._id, button.checked)}
                />
              </List.Item>
            </List>
          </Segment>
        </Container>
      );
  }
}

export default ModifyUserPermissions;
