import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import App from '/imports/ui/App';


Meteor.startup(() => {
  // eslint-disable-next-line no-undef
  UserPresence.start();
  render(<App />, document.getElementById('react-target'));
});
