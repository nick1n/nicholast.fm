import { combineReducers, createStore, applyMiddleware } from 'redux';

import ActionTypes from '../actions';

// Redux Middleware
import thunk from 'redux-thunk';
import logger from 'redux-logger';






function user(prevState = null, action) {

  // handle initial user state
  if (prevState === null) {
    var name = '';

    if (localStorage.getItem('lastfm.session.name') !== null) {
      // TODO: Welcome the user back
      name = localStorage['lastfm.session.name'];
    }

    return {
      signedIn: !!name,
      name,
    };
  }

  switch (action.type) {
    case ActionTypes.USER_SIGNING_IN:
      break;
    case ActionTypes.USER_SIGNED_IN:
      break;
    case ActionTypes.USER_SIGNOUT:
      break;
    default:
      return prevState;
  }

  return prevState;
}


function lastfm(prevState = null, action) {



  return prevState;
}





const allReducers = combineReducers({
  user,
  lastfm,
});

export default createStore(allReducers, applyMiddleware(thunk, logger));
