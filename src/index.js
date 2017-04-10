import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter, Route/*, Link*/ } from 'react-router-dom'

import './index.scss';

import App from './App';

render((
  <BrowserRouter>
    <Route path="/" component={App}>
{/*
      <Route path="/about" component={About}/>
      <Route path="/users" component={Users}>
        <Route path="/user/:userId" component={User}/>
      </Route>
      <Route path="*" component={NoMatch}/>
*/}
    </Route>
  </BrowserRouter>
), document.getElementById('root'));
