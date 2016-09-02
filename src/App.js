import React, { Component } from 'react';

import logo from './logo.svg';

import './App.scss';

import Header from './Header';
import Footer from './Footer';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Header />
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <div className="alert alert-success">
          <p className="m-b-0"><strong>Welcome</strong> to the new nicholast.fm!</p>
        </div>
        <Footer />
      </div>
    );
  }
}

export default App;
