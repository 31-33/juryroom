
import logo from './logo.svg';
import React from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { Login, Signup } from "@accounts/react";
import './App.css';

function Index(){
  console.log(Login);
  return <h2>Index</h2>;
}

function AppRouter() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <nav>
            <Link to="/">Home</Link>
            <Link to="/login/">Login</Link>
            <Link to="/users/">Users</Link>
          </nav>
          <img src={logo} className="App-logo" alt="logo" />
        </header>


        <Route path="/" exact component={Index} />
        <Route path="/login/" component={Login.render} />
        <Route path="/signup/" component={Signup} />
      </div>
    </Router>
  );
}

export default AppRouter;
