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
import DiscussionThread from '/imports/ui/Discussion/DiscussionThread';
import GroupView from '/imports/ui/Group/GroupView';
import CreateGroup from '/imports/ui/Group/CreateGroup';
import UserProfile from '/imports/ui/User/UserProfile';
import EditProfile from '/imports/ui/User/EditProfile';
import Dashboard from '/imports/ui/Dashboard/Dashboard';
import BrowseScenarios from '/imports/ui/Scenario/BrowseScenarios';
import CreateScenario from '/imports/ui/Scenario/CreateScenario';
import ScenarioView from '/imports/ui/Scenario/ScenarioView';
import BrowseScenarioSets from '/imports/ui/ScenarioSet/BrowseScenarioSets';
import CreateScenarioSet from '/imports/ui/ScenarioSet/CreateScenarioSet';
import ScenarioSetView from '/imports/ui/ScenarioSet/ScenarioSetView';

class App extends Component {
  browserHistory = history.createBrowserHistory();

  render() {
    return (
      <Router history={this.browserHistory}>
        <Menu fixed="top" inverted>
          <Container>
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
            <Menu inverted floated="right">
              {
                Meteor.userId() && (
                  <Menu.Item as={Link} to={`/user/${Meteor.userId()}`}>
                    Profile
                  </Menu.Item>
                )
              }
              <Menu.Item as="a">
                <AccountsUIWrapper />
              </Menu.Item>
            </Menu>
          </Container>
        </Menu>
        <Container style={{ paddingTop: '4em' }}>
          <Switch>
            <Route exact path="/discussion/:discussionId" component={DiscussionThread} />
            <Route exact path="/user/:userId" component={UserProfile} />
            <Route exact path="/user/:userId/edit" component={EditProfile} />
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
