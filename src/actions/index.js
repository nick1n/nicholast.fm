
const ActionTypes = {
  USER_SIGNING_IN: 'USER_SIGNING_IN',
  USER_SIGNED_IN: 'USER_SIGNED_IN',
  USER_SIGNOUT: 'USER_SIGNOUT',

  LASTFM_TOKEN: 'LASTFM_TOKEN',
};

export default ActionTypes;



export function lastfmToken(token) {

  // clear the url of the token
  window.history.pushState(token, '', '/');

  return (dispatch) => {

  };
}
