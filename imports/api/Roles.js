import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Roles } from 'meteor/alanning:roles';

if (Meteor.isServer) {
  Meteor.publish(null, () => Meteor.roles.find({}));
}

Meteor.methods({
  'roles.setAdmin'(userIds) {
    check(userIds, Match.OneOf(String, Array));

    if (!this.userId || !Roles.userISInRole(this.userId, 'admin')) {
      throw new Meteor.Error('not-authorized');
    }

    Roles.addUsersToRoles(userIds, 'admin');
  },
  'roles.setPermission_createScenario'(userIds, set) {
    check(userIds, Match.OneOf(String, Array));
    check(set, Boolean);

    if (!this.userId || !Roles.userIsInRole(this.userId, 'admin')) {
      throw new Meteor.Error('not-authorized');
    }

    // TODO: validate userIds

    if (set) {
      Roles.addUsersToRoles(userIds, 'create-scenario');
    } else {
      Roles.removeUsersFromRoles(userIds, 'create-scenario');
    }
  },
  'roles.setPermission_createScenarioSet'(userIds, set) {
    check(userIds, Match.OneOf(String, Array));
    check(set, Boolean);

    if (!this.userId || !Roles.userIsInRole(this.userId, 'admin')) {
      throw new Meteor.Error('not-authorized');
    }

    if (set) {
      Roles.addUsersToRoles(userIds, 'create-scenario-set');
    } else {
      Roles.removeUsersFromRoles(userIds, 'create-scenario-set');
    }
  },
  'roles.setPermission_createGroup'(userIds, set) {
    check(userIds, Match.OneOf(String, Array));
    check(set, Boolean);

    if (!this.userId || !Roles.userIsInRole(this.userId, 'admin')) {
      throw new Meteor.Error('not-authorized');
    }

    if (set) {
      Roles.addUsersToRoles(userIds, 'create-group');
    } else {
      Roles.removeUsersFromRoles(userIds, 'create-group');
    }
  },
});
