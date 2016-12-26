import React, { Component } from 'react';

import './App.scss';

import Header from './Header';
import Footer from './Footer';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Header />
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
