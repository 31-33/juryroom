import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Roles } from 'meteor/alanning:roles';
import { Link } from 'react-router-dom';
import {
  Container, Icon, Menu, Dropdown,
} from 'semantic-ui-react';
import { Router, Route, Switch } from 'react-router';
import PropTypes from 'prop-types';
import history from 'history';

import '/imports/startup/accounts-config';
import '/imports/api/Roles';

import AuthenticatedRoute from '/imports/ui/Auth/AuthenticatedRoute';
import UnauthenticatedRoute from '/imports/ui/Auth/UnauthenticatedRoute';
import AuthorizedRoute from '/imports/ui/Auth/AuthorizedRoute';

import AccountsUIWrapper from '/imports/ui/AccountsUIWrapper';
import NotFoundPage from '/imports/ui/Error/NotFoundPage';
import DiscussionPage from '/imports/ui/Discussion/DiscussionPage';
import GroupView from '/imports/ui/Group/GroupView';
import CreateGroup from '/imports/ui/Group/CreateGroup';
import UserProfile from '/imports/ui/User/UserProfile';
import EditProfile from '/imports/ui/User/EditProfile';
import EnrollForm from '/imports/ui/User/EnrollForm';
import Dashboard from '/imports/ui/Dashboard/Dashboard';
import BrowseScenarios from '/imports/ui/Scenario/BrowseScenarios';
import CreateScenario from '/imports/ui/Scenario/CreateScenario';
import ScenarioView from '/imports/ui/Scenario/ScenarioView';
import BrowseScenarioSets from '/imports/ui/ScenarioSet/BrowseScenarioSets';
import CreateScenarioSet from '/imports/ui/ScenarioSet/CreateScenarioSet';
import ScenarioSetView from '/imports/ui/ScenarioSet/ScenarioSetView';

class App extends Component {
  static defaultProps = {
    user: false,
  }

  static propTypes = {
    user: PropTypes.oneOfType([
      PropTypes.shape({
        _id: PropTypes.string.isRequired,
        username: PropTypes.string.isRequired,
        roles: PropTypes.arrayOf(PropTypes.string).isRequired,
      }),
      PropTypes.bool,
    ]),
  }

  browserHistory = history.createBrowserHistory();

  render() {
    const { user } = this.props;
    return (
      <Router history={this.browserHistory}>
        <Menu fixed="top" inverted>
          <Container className="content-width">
            <Menu.Item as={Link} to="/" header>
              <Icon size="big" name="balance scale" />
              JuryRoom
            </Menu.Item>
            <Dropdown item text="Browse">
              <Dropdown.Menu>
                <Dropdown.Item content="Scenarios" as={Link} to="/scenarios" />
                <Dropdown.Item content="Sets" as={Link} to="/sets" />
              </Dropdown.Menu>
            </Dropdown>
            <Menu.Menu
              position="right"
            >
              {user && (
                <Menu.Item
                  as={Link}
                  to={`/user/${Meteor.userId()}`}
                >
                  Profile
                </Menu.Item>
              )}
              <Menu.Item>
                <AccountsUIWrapper />
              </Menu.Item>
            </Menu.Menu>
          </Container>
        </Menu>
        <Container className="wrapper content-width">
          <Switch>
            <AuthenticatedRoute exact path="/discussion/:discussionId" component={DiscussionPage} />
            <Route exact path="/user/:userId" component={UserProfile} />
            <AuthenticatedRoute exact path="/user/:userId/edit" component={EditProfile} />
            <UnauthenticatedRoute exact path="/user/enroll/:token" component={EnrollForm} />
            <Route exact path="/scenarios" component={BrowseScenarios} />
            <AuthorizedRoute exact path="/scenarios/create" requiredRoles={['admin', 'create-scenario']} component={CreateScenario} />
            <Route exact path="/scenarios/:scenarioId" component={ScenarioView} />
            <Route exact path="/sets" component={BrowseScenarioSets} />
            <AuthorizedRoute exact path="/sets/create" requiredRoles={['admin', 'create-scenario-set']} component={CreateScenarioSet} />
            <Route exact path="/sets/:scenarioSetId" component={ScenarioSetView} />
            <AuthorizedRoute exact path="/groups/create" requiredRoles={['admin', 'create-group']} component={CreateGroup} />
            <AuthenticatedRoute exact path="/groups/:groupId" component={GroupView} />
            <Route exact path="/" component={Dashboard} />
            <Route component={NotFoundPage} />
          </Switch>
        </Container>
      </Router>
    );
  }
}

export default withTracker(function() {
  Meteor.subscribe('topics');
  Meteor.subscribe('scenarioSets');
  Meteor.subscribe('scenarios');
  Meteor.subscribe('discussions');
  Meteor.subscribe('groups');

  return { user: Meteor.user() };
})(App);
