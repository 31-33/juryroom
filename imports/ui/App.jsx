import React, { Component } from 'react';
import AccountsUIWrapper from '/imports/ui/AccountsUIWrapper';
import '/imports/startup/accounts-config';

class App extends Component {

  render() {
    return (
      <div className="container">
        <header>
          <h1>JuryRoom</h1>
          <AccountsUIWrapper />
        </header>
      </div>
    );
  }
}


export default App;
