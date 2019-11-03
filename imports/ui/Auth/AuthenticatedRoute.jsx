import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { Route } from 'react-router';
import PropTypes from 'prop-types';
import AuthenticationModal from './AuthenticationModal';

class AuthenticatedRoute extends Component {
  static defaultProps = {
    childProps: {},
  }

  static propTypes = {
    component: PropTypes.func.isRequired,
    childProps: PropTypes.shape({}),
  }

  render() {
    const { component, childProps, ...rest } = this.props;
    const ChildComponent = component;
    return (
      <Route
        {...rest}
        render={props => (Meteor.user()
          ? <ChildComponent {...props} {...childProps} />
          : (
            <>
              <ChildComponent {...props} {...childProps} />
              <AuthenticationModal />
            </>
          )
        )}
      />
    );
  }
}

export default AuthenticatedRoute;
