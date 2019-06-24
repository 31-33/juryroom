import React, { Component, createRef } from 'react';
import { Meteor } from 'meteor/meteor';
import { Link } from 'react-router-dom';
import {
  Container, Icon, Menu, Sticky,
} from 'semantic-ui-react';
import { Router, Route, Switch } from 'react-router';
import history from 'history';

import '/imports/startup/accounts-config';
import '/imports/api/Roles';
import AccountsUIWrapper from '/imports/ui/AccountsUIWrapper';
import DiscussionThread from '/imports/ui/Discussion/DiscussionThread';
import GroupPage from '/imports/ui/Group/GroupPage';
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
  contextRef = createRef();

  browserHistory = history.createBrowserHistory();

  render() {
    return (
      <div ref={this.contextRef}>
        <Router history={this.browserHistory}>
          <Sticky context={this.contextRef}>
            <Menu attached="top" inverted>
              <Container>
                <Menu.Item as={Link} to="/" header>
                  <Icon size="big" name="balance scale" />
                  JuryRoom
                </Menu.Item>
                {
                  Meteor.userId() && (
                    <Menu.Item as={Link} to={`/user/${Meteor.userId()}`}>
                      Profile
                    </Menu.Item>
                  )
                }
                <Menu.Item as="a" position="right">
                  <AccountsUIWrapper />
                </Menu.Item>
              </Container>
            </Menu>
          </Sticky>
          <Container>
            <Switch>
              <Route exact path="/group/:groupId" component={GroupPage} />
              <Route exact path="/discussion/:discussionId" component={DiscussionThread} />
              <Route exact path="/user/:userId" component={UserProfile} />
              <Route exact path="/user/:userId/edit" component={EditProfile} />
              <Route exact path="/scenarios" component={BrowseScenarios} />
              <Route exact path="/scenarios/create" component={CreateScenario} />
              <Route exact path="/scenarios/:scenarioId" component={ScenarioView} />
              <Route exact path="/sets" component={BrowseScenarioSets} />
              <Route exact path="/sets/create" component={CreateScenarioSet} />
              <Route exact path="/sets/:scenarioSetId" component={ScenarioSetView} />
              <Route exact path="/" component={Dashboard} />
            </Switch>
          </Container>
        </Router>
      </div>
    );
  }
}

export default App;
