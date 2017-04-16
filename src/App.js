import React, { Component } from 'react';

import './App.scss';

import Header from './Header';
import Footer from './Footer';
import Alert from './Alert';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Header/>
        <div className="container-fluid">
          <p className="App-intro">
            To get started, edit <code>src/App.js</code> and save to reload.
          </p>
          <p>{this.props.params && this.props.params.token}</p>
        </div>
        <Footer/>
        <Alert/>
      </div>
    );
  }
}

export default App;
