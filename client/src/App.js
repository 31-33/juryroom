import React, { Component } from 'react';
import LoginComponent from './components/Login.Component';
import Authmanager from 'react-authmanager';
import logo from './logo.svg';
import './App.css';

Authmanager.config.getToken = (credentials) => {
  console.log(`Fetching JWT for user credentials: ${credentials}`);
  //TODO: get JWT from backend for user credentials
  return "";
}

Authmanager.config.getUser = () => {
  //TODO: fetch information from server for current user
  return null;
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <LoginComponent/>
        </header>
      </div>
    );
  }
}

export default App;
