import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

const ScenarioSets = new Mongo.Collection('scenarioSets');
export default ScenarioSets;

if (Meteor.isServer) {
  Meteor.publish('scenarioSets', () => ScenarioSets.find(
    {},
    {
      fields: {
        title: 1,
        description: 1,
        scenarios: 1,
        ordered: 1,
        createdAt: 1,
        status: 1,
      },
    },
  ));
}

Meteor.methods({
  'scenarioSets.create'(title, description, scenarios, ordered) {
    check(title, String);
    check(description, String);
    check(scenarios, Array);
    check(ordered, Boolean);

    return ScenarioSets.insert({
      title,
      description,
      scenarios,
      ordered,
      createdAt: new Date(),
      status: 'active',
    });
  },
});
