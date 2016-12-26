import React from 'react';
import { render } from 'react-dom';
import { Router, Route, /*Link,*/ browserHistory } from 'react-router';

import './index.scss';

import App from './App';

render((
  <Router history={browserHistory}>
    <Route path="/" component={App}>
{/*
      <Route path="about" component={About}/>
      <Route path="users" component={Users}>
        <Route path="/user/:userId" component={User}/>
      </Route>
      <Route path="*" component={NoMatch}/>
*/}
    </Route>
  </Router>
), document.getElementById('root'));
