import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import { Route } from 'react-router';
import PropTypes from 'prop-types';

import AuthenticatedRoute from './AuthenticatedRoute';
import NotAuthorizedPage from '/imports/ui/Error/NotAuthorizedPage';

class AuthorizedRoute extends Component {
  static defaultProps = {
    childProps: {},
  }

  static propTypes = {
    component: PropTypes.func.isRequired,
    requiredRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
    childProps: PropTypes.shape({}),
  }

  render() {
    const {
      component, childProps, requiredRoles, ...rest
    } = this.props;
    const ChildComponent = component;
    return (
      <Route
        {...rest}
        render={props => ((Meteor.user() && Roles.userIsInRole(Meteor.user(), requiredRoles))
          ? <ChildComponent {...props} {...childProps} />
          : (
            <AuthenticatedRoute
              {...props}
              component={NotAuthorizedPage}
              childProps={{ message: `One of the following roles are required: ${requiredRoles.join(', ')}` }}
            />
          )
        )}
      />
    );
  }
}

export default AuthorizedRoute;
