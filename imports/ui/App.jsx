import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { Link } from 'react-router-dom';
import {
  Container, Icon, Menu, Dropdown,
} from 'semantic-ui-react';
import { Router, Route, Switch } from 'react-router';
import history from 'history';

import '/imports/startup/accounts-config';
import '/imports/api/Roles';

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
  browserHistory = history.createBrowserHistory();

  constructor(props) {
    super(props);

    Meteor.subscribe('topics');
    Meteor.subscribe('scenarioSets');
    Meteor.subscribe('scenarios');
    Meteor.subscribe('discussions');
    Meteor.subscribe('groups');

    this.state = {
      roles: [],
    };
  }

  componentDidMount() {
    if (Meteor.userId()) {
      Meteor.call('users.getProfile', Meteor.userId(), (error, user) => {
        if (!error) {
          this.setState({ roles: user.roles });
        }
      });
    }
  }

  render() {
    const { roles } = this.state;

    return (
      <Router history={this.browserHistory}>
        <Menu fixed="top" inverted>
          <Container className="content-width">
            <Menu.Item as={Link} to="/" header>
              <Icon size="big" name="balance scale" />
              JuryRoom
            </Menu.Item>
            {roles.includes('admin') && (
              <Dropdown item text="Browse">
                <Dropdown.Menu>
                  <Dropdown.Item content="Scenarios" as={Link} to="/scenarios" />
                  <Dropdown.Item content="Sets" as={Link} to="/sets" />
                </Dropdown.Menu>
              </Dropdown>
            )}
            <Menu.Menu
              position="right"
            >
              {Meteor.userId() && (
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
            <Route exact path="/discussion/:discussionId" component={DiscussionPage} />
            <Route exact path="/user/:userId" component={UserProfile} />
            <Route exact path="/user/:userId/edit" component={EditProfile} />
            <Route exact path="/user/enroll/:token" component={EnrollForm} />
            <Route exact path="/scenarios" component={BrowseScenarios} />
            <Route exact path="/scenarios/create" component={CreateScenario} />
            <Route exact path="/scenarios/:scenarioId" component={ScenarioView} />
            <Route exact path="/sets" component={BrowseScenarioSets} />
            <Route exact path="/sets/create" component={CreateScenarioSet} />
            <Route exact path="/sets/:scenarioSetId" component={ScenarioSetView} />
            <Route exact path="/groups/create" component={CreateGroup} />
            <Route exact path="/groups/:groupId" component={GroupView} />
            <Route exact path="/" component={Dashboard} />
            <Route component={NotFoundPage} />
          </Switch>
        </Container>
      </Router>
    );
  }
}

export default App;
