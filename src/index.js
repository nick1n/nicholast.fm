import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, hashHistory } from 'react-router';

import './index.scss';

import App from './App';

ReactDOM.render((
  <Router history={hashHistory}>
    <Route path="/" component={App} />
  </Router>
), document.getElementById('root'));
