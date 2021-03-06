import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import { ScenarioPropType, TopicPropType } from '/imports/types';
import {
  Container, Segment, Form, Item, Button,
} from 'semantic-ui-react';
import Scenarios from '/imports/api/Scenarios';
import Topics from '/imports/api/Topics';
import HeaderWithInfoMessage from '/imports/ui/Error/HeaderWithInfoMessage';

class CreateScenarioSet extends Component {
  static defaultProps = {
    scenarios: false,
  }

  static propTypes = {
    topics: PropTypes.arrayOf(TopicPropType).isRequired,
    scenarios: PropTypes.oneOfType([PropTypes.arrayOf(ScenarioPropType), PropTypes.bool]),
    history: PropTypes.shape({ push: PropTypes.func.isRequired }).isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      title: '',
      description: '',
      selectedScenarios: [],
      ordered: true,
    };
  }

  handleChange = (e, { name, value }) => this.setState({ [name]: value });

  render() {
    const { topics, scenarios, history } = this.props;
    const {
      title, description, selectedScenarios, ordered,
    } = this.state;

    return (
      <Container>
        <Segment attached="top">
          <HeaderWithInfoMessage
            header="Create New Scenario Set"
            infoMessage="From this page, new scenarios can be created."
          />
        </Segment>
        <Form
          as={Segment}
          attached="bottom"
        >
          <Form.Input
            label="Title"
            name="title"
            onChange={this.handleChange}
          />
          <Form.TextArea
            label="Description"
            name="description"
            onChange={this.handleChange}
          />
          <Form.Group>
            <Form.Select
              label="Scenarios"
              text="Search for scenario..."
              search
              width={4}
              options={scenarios.map(scenario => ({
                key: scenario._id,
                text: scenario.title,
                value: scenario._id,
              }))}
              onChange={(event, selection) => {
                selectedScenarios.push(selection.value);
                this.setState({ selectedScenarios });
              }}
            />
            <Form.Checkbox
              label="Ordered"
              name="ordered"
              onChange={this.handleChange}
              toggle
              defaultChecked={ordered}
            />
          </Form.Group>
          <Form.Field as={Segment}>
            <Item.Group
              relaxed="very"
              divided
            >
              {selectedScenarios.map(
                scenarioId => scenarios.find(scenario => scenario._id === scenarioId),
              ).map(scenario => (
                <Item key={scenario._id}>
                  <Item.Content
                    floated="left"
                    header={scenario.title}
                    meta={scenario.description}
                    description={`Topic: ${topics.find(topic => topic._id === scenario.topicId).title}`}
                  />
                  <Item.Content
                    floated="right"
                    extra={(
                      <Button
                        floated="right"
                        content="Remove"
                        onClick={() => this.setState({
                          selectedScenarios: selectedScenarios.filter(id => id !== scenario._id),
                        })}
                      />
                    )}
                  />
                </Item>
              ))}
            </Item.Group>
          </Form.Field>
          <Form.Button
            content="Submit"
            onClick={() => title && description && selectedScenarios.length > 0
              && Meteor.call(
                'scenarioSets.create',
                title,
                description,
                selectedScenarios,
                ordered,
                (event, scenarioSetId) => history.push(`/sets/${scenarioSetId}`),
              )}
          />
        </Form>
      </Container>
    );
  }
}

export default withTracker(() => ({
  topics: Topics.find({}).fetch() || [],
  scenarios: Scenarios.find({}).fetch(),
}))(CreateScenarioSet);
