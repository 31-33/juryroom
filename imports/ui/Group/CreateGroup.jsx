import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import { ScenarioSetPropType, UserPropType } from '/imports/types';
import ScenarioSets from '/imports/api/ScenarioSets';
import {
  Container, Segment, Header, Form,
} from 'semantic-ui-react';
import { Roles } from 'meteor/alanning:roles';
import NotAuthorizedPage from '/imports/ui/Error/NotAuthorizedPage';
import { MAX_COMMENT_LENGTH } from '/imports/api/Comments';

class CreateGroup extends Component {
  static propTypes = {
    scenarioSets: PropTypes.arrayOf(ScenarioSetPropType).isRequired,
    users: PropTypes.arrayOf(UserPropType).isRequired,
    history: PropTypes.shape({ push: PropTypes.func.isRequired }).isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      selectedSet: '',
      members: [],
      commentLengthLimit: MAX_COMMENT_LENGTH,
    };
  }

  handleChange = (e, { name, value }) => this.setState({ [name]: value });

  render() {
    const { scenarioSets, users, history } = this.props;
    const { members, selectedSet, commentLengthLimit } = this.state;

    if (!Meteor.user() === null && !Roles.userIsInRole(Meteor.userId(), ['admin', 'create-group'])) {
      return <NotAuthorizedPage />;
    }

    return (
      <Container>
        <Header
          as={Segment}
          attached="top"
          size="huge"
          content="Create New Group"
        />
        <Form
          as={Segment}
          attached="bottom"
        >
          <Form.Dropdown
            label="Scenario Set"
            loading={scenarioSets.length === 0}
            selection
            search
            options={scenarioSets.map(scenarioSet => ({
              key: scenarioSet._id,
              text: scenarioSet.title,
              description: scenarioSet.description,
              value: scenarioSet._id,
            }))}
            name="selectedSet"
            onChange={this.handleChange}
          />
          <Form.Dropdown
            label="Users"
            loading={users.length === 0}
            selection
            multiple
            search
            options={users.map(user => ({
              key: user._id,
              text: user.username,
              image: user.avatar,
              value: user._id,
            }))}
            name="members"
            onChange={this.handleChange}
          />
          <Form.Input
            label="Max Comment Length"
            type="number"
            value={commentLengthLimit}
            onInput={({ target }) => this.setState({
              commentLengthLimit: parseInt(target.value, 10) || commentLengthLimit,
            })}
          />
          <Form.Button
            content="Submit"
            onClick={() => selectedSet && members.length > 1
              && Meteor.call(
                'groups.create',
                members,
                selectedSet,
                commentLengthLimit,
                (event, groupId) => history.push(`/groups/${groupId}`),
              )}
          />
        </Form>
      </Container>
    );
  }
}

export default withTracker(() => {
  Meteor.subscribe('users');
  Meteor.subscribe('scenarioSets');

  return {
    users: Meteor.users.find({}).fetch(),
    scenarioSets: ScenarioSets.find({}).fetch() || [],
  };
})(CreateGroup);
