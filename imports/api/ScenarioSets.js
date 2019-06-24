import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Roles } from 'meteor/alanning:roles';

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
        submittedBy: 1,
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

    if (!Roles.userIsInRole(this.userId, ['admin', 'create-scenario-set'])) {
      throw new Meteor.Error('not-authorized');
    }

    return ScenarioSets.insert({
      title,
      description,
      scenarios,
      ordered,
      createdAt: new Date(),
      status: 'active',
      submittedBy: this.userId,
    });
  },
});
