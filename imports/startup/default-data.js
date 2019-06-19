import { Meteor } from 'meteor/meteor';
import Topics from '/imports/api/Topics';
import Scenarios from '/imports/api/Scenarios';
import ScenarioSets from '/imports/api/ScenarioSets';

if (Meteor.isServer) {
  // Create default topics
  if (Topics.find().count() === 0) {
    Topics.insert({ title: 'Politics' });
    Topics.insert({ title: 'Religion' });
    Topics.insert({ title: 'Philosophy' });
    Topics.insert({ title: 'Sport' });
    Topics.insert({ title: 'Science' });
    Topics.insert({ title: 'Other' });
  }

  if (ScenarioSets.find().count() === 0) {
    const scenarios = [];
    const allUserIds = Meteor.users.find().fetch().map(user => user._id);

    const topicId = Topics.findOne({ title: 'Other' })._id;
    scenarios.push(Scenarios.insert({
      topicId,
      title: 'Ketchup vs mustard',
      description: 'Which is the better condiment, ketchup or mustard?',
      createdAt: new Date(),
      status: 'active',
    }));
    scenarios.push(Scenarios.insert({
      topicId,
      title: 'Star Wars or Star Trek?',
      description: '...',
      createdAt: new Date(),
      status: 'active',
    }));
    scenarios.push(Scenarios.insert({
      topicId,
      title: 'LoTR: Movies or Books?',
      description: '...',
      createdAt: new Date(),
      status: 'active',
    }));
    scenarios.push(Scenarios.insert({
      topicId,
      title: 'Are hot dogs sandwiches?',
      description: '...',
      createdAt: new Date(),
      status: 'active',
    }));

    Meteor.call(
      'scenarioSets.create',
      'Testing Set',
      'A set of mock scenarios for use in the development and testing of JuryRoom.',
      scenarios,
      true,
      (err, setId) => {
        Meteor.call('groups.create', allUserIds, setId);
      },
    );
  }
}
