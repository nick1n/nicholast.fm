import md5 from 'md5';

const LASTFM = {
  'url': 'http://ws.audioscrobbler.com/2.0/',
  'secret': '5ef32174a4c9a41e2a1a561e6702ab6d',
  'data': {
    'method': 'auth.getSession',
    // 'token': '123db3e0ba03e4553d347ca572935e73',
    'api_key': 'f750712ed70caea3272e70e48e1f464e',
  },
};

function queryParams(params) {
  return Object.keys(params)
    .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
    .join('&');
}

function handleToken(token) {
  if (!token) {
    return;
  }

  var api_sig = '';

  // clear the url of the token
  window.history.pushState(token, '', '/');

  // add the token to the data being sent to last.fm
  var data = {
    ...LASTFM.data,
    token
  };

  // build the alphabetical string of key values of the data
  api_sig = Object.keys(data).sort().reduce((prev, key) => prev + key + data[key], '');

  // md5 the string plus our last.fm secret
  api_sig = md5(api_sig + LASTFM.secret);

  // add the api sig to the data being sent to last.fm
  data.api_sig = api_sig;
  data.format = 'json';

  fetch(LASTFM.url + '?' + this.queryParams(data))
  .then(res => res.json())
  .then((json) => {

    // TODO: Welcome user, get started on retrieving stats

    localStorage['lastfm.session.key'] = json.session.key;
    localStorage['lastfm.session.name'] = json.session.name;
    //json.session.subscriber

    this.setState({
      signedIn: true,
      user: json.session.name,
    });

  })
  .catch((error) => {
    console.log(error);

    // TODO: handle this error
    if (typeof error.responseJSON === 'object') {
      // error.responseJSON.error; // last.fm api error code
      // error.responseJSON.message; // error message
    } else {
      // error.responseText;
    }

    // please try again

  });
}


