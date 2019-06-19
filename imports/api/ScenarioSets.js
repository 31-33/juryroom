import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

const ScenariosSets = new Mongo.Collection('scenarioSets');
export default ScenariosSets;

if (Meteor.isServer) {
  Meteor.publish('scenarioSets', () => ScenariosSets.find(
    {},
    {
      fields: {
        title: 1,
        description: 1,
        scenarios: 1,
        ordered: 1,
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

    return ScenariosSets.insert({
      title,
      description,
      scenarios,
      ordered,
      status: 'active',
    });
  },
});
