/*
 * Last.fm stats
 * Authors: Nicholas Ness & Nicholas Kramer
 */

if (!console) { var console = { log : function(val) {} }; }

// add scrollbar from load so no weird repositioning happens
//$("body").height( $(window).height() * 1.1 );

/* Init the LastFM module */
LastFM({
  api_key : 'f750712ed70caea3272e70e48e1f464e',

  callbacks: {
    fail: failFunction
  }
});

var $user;

var username = "";
var numTracks = 0;
var innerStr = "<table>";
var pagesFinished = 0;
var numPages = 0;
var page = 0;
var fromDate = 0;
var toDate = 0;
var uniqueTracks = {};
var uniqueArtists = {};
var uniqueAlbums = {};
var year = 0;
var month = 0;
var executing = null;
var period = 0;
var startTime;
var idPrefix = '';
var methods = {
  "#MonthlyTopTracks": getTracks,
  "#YearlyTopTracks": getYearly,
  "#ArtistRecommendations": getArtistRecommendations,
  "#TrackRecommendations": getTrackRecommendations
};

/////////////////////// User's Yearly Top Tracks Code ///////////////////

function getYearly(user) {

  executing = 'Yearly Top Tracks';
  $('.submit').button('loading');
  startTime = +new Date;

  username = $user.val();
  numTracks = 0;
  innerStr = '<table>';
  pagesFinished = 0;
  numPages = 0;
  page = 1;
  uniqueTracks = {};
  uniqueArtists = {};
  uniqueAlbums = {};
  year = 0;
  month = 0;
  idPrefix = '#YearlyTopTracks ';

  $('#progressBar').width('0%');

  $(idPrefix + '#trackInfo').hide();
  $('#progressBack').show();

  getTimeZone();

}


/////////////////////// User's Monthly Top Tracks Code //////////////////

// starting function, the function that lets all last.fm hell break loose.
function getTracks(user) {
  executing = 'Monthly Top Tracks';
  $(".submit").button('loading');
  startTime = new Date().getTime();

  username = $user.val();
  numTracks = 0;
  innerStr = "<table>";
  pagesFinished = 0;
  numPages = 0;
  page = 1;
  uniqueTracks = {};
  uniqueArtists = {};
  uniqueAlbums = {};
  year = 0;
  month = 0;
  idPrefix = '#MonthlyTopTracks ';

  $("#progressBar").width("0%");
  //document.getElementById("progressPercent").innerHTML = "0%";

  $(idPrefix + '#trackInfo').hide();
  $("#progressBack").show();

  // Just call getTimeZone, trying to figure out last.fm user's timezone isn't working out :-/
  getTimeZone();
  //try {
  //  LastFM('user.getRecentTracks', {user: username, limit: 1}).done(getTimeZone);
  //} catch (e) {}
}

// gets the timezone of the user so that we can have accurate stats no matter what timezone you are in :)
function getTimeZone(data) {
  // TODO: get the last.fm user's timezone and use that instead of this page user's timezone
  // just in case we get the now playing track :-| (it doesn't have a date)
  var
    offset = 0,
    date;

  //if (data.recenttracks.track[1] == undefined) {
  //    offset = -(new Date().getTimezoneOffset()*60*1000) - (new Date(new Date(data.recenttracks.track.date.uts*1000).setSeconds(0)).getTime()-new Date(data.recenttracks.track.date['#text']).getTime());
  //}

  // Find the from and to dates
  // need to fix this only works when you are in the same timezone as the scrobbling was
  year = $(idPrefix + "#year").val();
  month = $(idPrefix + "#month").val();

  if (month == undefined) {
    date = new Date(year, 0, 1);
  } else {
    month = +month;
    date = new Date(year, month, 1);
  }

  fromDate = (date.getTime() - offset) / 1000 - 1;

  if (month == undefined) {
    date.setFullYear(date.getFullYear() + 1);
  } else {
    date.setMonth(date.getMonth() + 1);
  }

  toDate = (date.getTime() - offset) / 1000;

  try {
    LastFM('user.getRecentTracks', {
      user : username,
      limit : '200',
      page : 1,
      to : toDate,
      from : fromDate
    }).done(gotNumTracks);
  } catch (e) {}

  if (month == undefined) {
    _gaq.push(['_trackEvent', executing, year, username.toLocaleLowerCase()]);
  } else {
    _gaq.push(['_trackEvent', executing, year + ' ' + padMonth(month + 1) + ' ' + getMonthName(month), username.toLocaleLowerCase()]);
  }
}

// initial track info from last.fm
function gotNumTracks(data) {
  if (!data.recenttracks['@attr']) {
    innerStr += "No Data";
    finished();
    return;
  }

  numPages = data.recenttracks['@attr'].totalPages;
  $(idPrefix + "#totalTracks").html(data.recenttracks['@attr'].total);

  // check for extra now playing track even though its a list of tracks from last month :-/
  // and remove it from the array FOREVER!
  if (data.recenttracks.track[0]) {
    if (data.recenttracks.track[0]['@attr']) {
      data.recenttracks.track.shift();
    }
  }

  // try {
  //   for (var page = 2; page <= numPages; ++page) {
  //     setTimeout(getRecentTracks(page), 200 * (page - 2));
  //   }
  // } catch (e) {}

  gotTracks(data);
}

// a proxy function for delaying all the last.fm api calls
function getRecentTracks(page) {
  // return function() {
    LastFM('user.getRecentTracks' , {
      user: username,
      limit: '200',
      page: page,
      to: toDate,
      from: fromDate
    }).done(gotTracks);
  // };
}

// got some track info from last.fm lets parse it :)
function gotTracks(data) {

  if (page < numPages) {
    getRecentTracks(++page);
  }

  setTimeout(function() {

  numTracks += data.recenttracks.track.length;
  $(idPrefix + "#totalUniqueTracks").html(numTracks);

  for (var i = 0; i < data.recenttracks.track.length; ++i) {
    var artist = data.recenttracks.track[i].artist["#text"];
    var album = artist + " - " + data.recenttracks.track[i].album["#text"];
    var track = artist + " - " + data.recenttracks.track[i].name;

    if (uniqueTracks[track]) {
      ++uniqueTracks[track].plays;
    } else {
      uniqueTracks[track] = {
        artist : artist,
        track : data.recenttracks.track[i].name,
        url : data.recenttracks.track[i].url,
        plays : 1
      };
    }

    if (uniqueAlbums[album]) {
      ++uniqueAlbums[album].plays;
    } else {
      uniqueAlbums[album] = {
        artist : artist,
        album : data.recenttracks.track[i].album["#text"],
        url : data.recenttracks.track[i].url,
        plays : 1
      };
    }

    if (uniqueArtists[artist]) {
      ++uniqueArtists[artist].plays;
    } else {
      uniqueArtists[artist] = {
        artist : artist,
        url : data.recenttracks.track[i].url,
        plays : 1
      };
    }
  }
  ++pagesFinished;

  //code for progress bar :)
  var percent = (pagesFinished / numPages * 100).toFixed(0) + "%";
  $("#progressBar").width(percent);
  //document.getElementById("progressPercent").innerHTML = percent;

  // this is our last page so let's finish this
  if (pagesFinished >= numPages) {
    finished();
  }

  });

}

// sorts it by number of plays descending and if the plays are the same
// sorts it by artist and track names ascending (...or not...sometimes)
function trackSort(a, b) {
  if (a.searchable.plays < b.searchable.plays) return 1;
  if (a.searchable.plays > b.searchable.plays) return -1;
  var aat = a.searchable.artist + " " + a.searchable.track;
  var bat = b.searchable.artist + " " + b.searchable.track;
  if (aat < bat) return -1;
  if (aat > bat) return 1;
  return 0;
}

function artistSort(a, b) {
  if (a.searchable.plays < b.searchable.plays) return 1;
  if (a.searchable.plays > b.searchable.plays) return -1;
  if (a.searchable.artist < b.searchable.artist) return -1;
  if (a.searchable.artist > b.searchable.artist) return 1;
  return 0;
}

function albumSort(a, b) {
  if (a.searchable.plays < b.searchable.plays) return 1;
  if (a.searchable.plays > b.searchable.plays) return -1;
  if (a.searchable.album < b.searchable.album) return -1;
  if (a.searchable.album > b.searchable.album) return 1;
  return 0;
}

// finally finished receiving all track info from last.fm
function finished() {
  var tempUser = encodeName(username);
  var tempArtist = "";

  // sort the unique tracks and artists
  var artists = [];
  for (var i in uniqueArtists) {
    tempArtist = uniqueArtists[i].url.substr(0, uniqueArtists[i].url.indexOf("/_/"));
    artists.push({
      artist : link(EncodeHtml(uniqueArtists[i].artist), checkHttp(tempArtist)),
      plays : link('<span class="hide-text">(</span>' + uniqueArtists[i].plays + '<span class="hide-text"> plays)</span>', "http://www.last.fm/user/" + tempUser + "/library/music/" + tempArtist.substr(tempArtist.lastIndexOf('/') + 1)),
      searchable : {
        artist : uniqueArtists[i].artist.toLocaleLowerCase(),
        plays : uniqueArtists[i].plays
      },
      bbcode : {
        artist : uniqueArtists[i].artist,
        plays : uniqueArtists[i].plays
      }
    });
  }
  artists.sort(artistSort);

  var tracks = [];
  for (var i in uniqueTracks) {
    tempArtist = uniqueTracks[i].url.substr(0, uniqueTracks[i].url.indexOf("/_/"));
    tracks.push({
      artist : link(EncodeHtml(uniqueTracks[i].artist), checkHttp(tempArtist)) + '<span class="hide-text"> -</span>',
      track : link(EncodeHtml(uniqueTracks[i].track), checkHttp(uniqueTracks[i].url)),
      plays : link('<span class="hide-text">(</span>' + uniqueTracks[i].plays + '<span class="hide-text"> plays)</span>', "http://www.last.fm/user/" + tempUser + "/library/music/" + tempArtist.substr(tempArtist.lastIndexOf('/') + 1)),
      searchable : {
        artist : uniqueTracks[i].artist.toLocaleLowerCase(),
        track : uniqueTracks[i].track.toLocaleLowerCase(),
        plays : uniqueTracks[i].plays
      },
      bbcode : {
        artist : uniqueTracks[i].artist,
        track : uniqueTracks[i].track,
        plays : uniqueTracks[i].plays
      }
    });
  }
  tracks.sort(trackSort);

  var albums = [];
  for (var i in uniqueAlbums) {
    tempArtist = uniqueAlbums[i].url.substr(0, uniqueAlbums[i].url.indexOf("/_/"));
    albums.push({
      artist : link(EncodeHtml(uniqueAlbums[i].artist), checkHttp(tempArtist)) + '<span class="hide-text"> -</span>',
      album : link(EncodeHtml(uniqueAlbums[i].album), checkHttp(tempArtist + '/' + encodeName(uniqueAlbums[i].album))),
      plays : link('<span class="hide-text">(</span>' + uniqueAlbums[i].plays + '<span class="hide-text"> plays)</span>', "http://www.last.fm/user/" + tempUser + "/library/music/" + tempArtist.substr(tempArtist.lastIndexOf('/') + 1)),
      searchable : {
        artist : uniqueAlbums[i].artist.toLocaleLowerCase(),
        album : uniqueAlbums[i].album.toLocaleLowerCase(),
        plays : uniqueAlbums[i].plays
      },
      bbcode : {
        artist : uniqueAlbums[i].artist,
        album : uniqueAlbums[i].album,
        plays : uniqueAlbums[i].plays
      }
    });
  }
  albums.sort(albumSort);

  $(idPrefix + "#totalUniqueTracks").html(tracks.length);
  if (numTracks > 0) {
    $(idPrefix + "#songRepetition").html((numTracks / tracks.length).toFixed(2));
  }

  // generate top 10 artists list ...
  for (var i = 0; i < artists.length && i < 10; ++i) {
    tempArtist = encodeName(artists[i].artist);
    innerStr +=
      '<tr>' +
        '<td>' + (i + 1) + '. ' + artists[i].artist + ' ' + artists[i].plays.replace(/hide-text/g, '') + '</td>' +
      '</tr>';
  }
  $(idPrefix + "#artistList").html(innerStr + '</table>');

  // generate artist datagrid ...
  $(idPrefix + "#artist-datagrid").html($("#template-datagrid").html());
  $(idPrefix + "#artist-datagrid #caption").html("<h3>Top Artists:</h3>");

  var dataSource = new StaticDataSource({
      columns: [{
          property: 'artist',
          label: 'Artist',
          sortable: 'asc',
          span: 9
      }, {
          property: 'plays',
          label: 'Plays',
          sortable: 'desc',
          defaultSort: true,
          span: 3
      }],
      data: artists
  });

  $(idPrefix + '#artist-datagrid .datagrid').datagrid({
      dataSource: dataSource
  });

  // generate top 10 albums list ...
  var tempTrack = '';
  innerStr = '<table>';
  for (var i = 0; i < albums.length && i < 10; ++i) {
    tempArtist = encodeName(albums[i].artist);
    tempTrack = encodeName(albums[i].album);

    innerStr +=
      '<tr>' +
        '<td>' + (i + 1) + '. ' + albums[i].artist.replace(/hide-text/g, '') + ' ' + albums[i].album + ' ' + albums[i].plays.replace(/hide-text/g, '') + '</td>' +
      '</tr>';
  }
  $(idPrefix + "#albumList").html(innerStr + '</table>');

  // generate album datagrid ...
  $(idPrefix + "#album-datagrid").html($("#template-datagrid").html());
  $(idPrefix + "#album-datagrid #caption").html("<h3>Top Albums:</h3>");

  dataSource = new StaticDataSource({
      columns: [{
          property: 'artist',
          label: 'Artist',
          sortable: 'asc',
          span: 2
      }, {
          property: 'album',
          label: 'Album',
          sortable: 'asc',
          span: 2
      }, {
          property: 'plays',
          label: 'Plays',
          sortable: 'desc',
          defaultSort: true,
          span: 1
      }],
      data: albums
  });

  $(idPrefix + '#album-datagrid .datagrid').datagrid({
      dataSource: dataSource
  });

  // generate top 10 tracks list ...
  var tempTrack = '';
  innerStr = '<table>';
  for (var i = 0; i < tracks.length && i < 10; ++i) {
    tempArtist = encodeName(tracks[i].artist);
    tempTrack = encodeName(tracks[i].track);

    innerStr +=
      '<tr>' +
        '<td>' + (i + 1) + '. ' + tracks[i].artist.replace(/hide-text/g, '') + ' ' + tracks[i].track + ' ' + tracks[i].plays.replace(/hide-text/g, '') + '</td>' +
      '</tr>';
  }
  $(idPrefix + "#trackList").html(innerStr + '</table>');

  // generate track datagrid ...
  $(idPrefix + "#track-datagrid").html($("#template-datagrid").html());
  $(idPrefix + "#track-datagrid #caption").html("<h3>Top Tracks:</h3>");

  dataSource = new StaticDataSource({
      columns: [{
          property: 'artist',
          label: 'Artist',
          sortable: 'asc',
          span: 2
      }, {
          property: 'track',
          label: 'Track',
          sortable: 'asc',
          span: 2
      }, {
          property: 'plays',
          label: 'Plays',
          sortable: 'desc',
          defaultSort: true,
          span: 1
      }],
      data: tracks
  });

  $(idPrefix + '#track-datagrid .datagrid').datagrid({
      dataSource: dataSource
  });

  if (month == undefined) {

    // TODO: BB code
    $(idPrefix + "#bbcode").html('');
    $(idPrefix + "#oldbbcode").html('');

    $(idPrefix + "#mttMonth").html("Yearly Stats For " + year);

  } else {

  // generate my bb code
  var bbCode = "";
  var codeMonth = month + 1;
  codeMonth = (codeMonth > 9 ? codeMonth : '0' + codeMonth);
  if (artists[0]) {
    bbCode += "[url=http://nicholast.fm]Monthly Top Tracks[/url]<br>";
    for (var i = 0; tracks[i] && tracks[0].bbcode.plays == tracks[i].bbcode.plays; ++i) {
      bbCode += "[b]" + codeMonth + "-" + year.substr(2) + ":[/b] [artist]" + EncodeHtml(tracks[i].bbcode.artist) + "[/artist] - [track artist=" + EncodeHtml(tracks[i].bbcode.artist) + "]" + EncodeHtml(tracks[i].bbcode.track) + "[/track]<br>";
    }

    bbCode += "<br>";
    bbCode += "[url=http://nicholast.fm]Monthly Top Artists[/url]<br>";
    for (var i = 0; artists[i] && artists[0].bbcode.plays == artists[i].bbcode.plays; ++i) {
      tempArtist = encodeName(artists[i].bbcode.artist);
      bbCode += "[b]" + codeMonth + "-" + year.substr(2) + ":[/b] [artist]" + EncodeHtml(artists[i].bbcode.artist) + "[/artist] [url=http://www.last.fm/user/" + tempUser + "/library/music/" + tempArtist + "](" + artists[i].bbcode.plays + " plays)[/url]<br>";
    }

    bbCode += "<br>";
    bbCode += "[url=http://nicholast.fm]Monthly Top Albums[/url]<br>";
    for (var i = 0; albums[i] && albums[0].bbcode.plays == albums[i].bbcode.plays; ++i) {
      bbCode += "[b]" + codeMonth + "-" + year.substr(2) + ":[/b] [artist]" + EncodeHtml(albums[i].bbcode.artist) + "[/artist] - [album artist=" + EncodeHtml(albums[i].bbcode.artist) + "]" + EncodeHtml(albums[i].bbcode.album) + "[/album]<br>";
    }
    $(idPrefix + "#bbcode").html(bbCode);

    // generate old bb code (styled from lastfm.heathaze.org)
    bbCode = "";
    bbCode += "[url=http://nicholast.fm]Monthly Top Tracks[/url]<br>";
    for (var i = 0; tracks[i] && tracks[0].bbcode.plays == tracks[i].bbcode.plays; ++i) {
      bbCode += "[b]" + getShortMonthName(month) + "-" + year + "[/b]<br>[artist]" + EncodeHtml(tracks[i].bbcode.artist) + "[/artist] : [track artist=" + EncodeHtml(tracks[i].bbcode.artist) + "]" + EncodeHtml(tracks[i].bbcode.track) + "[/track] ([b]" + tracks[i].bbcode.plays + "[/b] plays)<br>";
    }

    bbCode += "<br>";
    bbCode += "[url=http://nicholast.fm]Monthly Top Artists[/url]<br>";
    for (var i = 0; artists[i] && artists[0].bbcode.plays == artists[i].bbcode.plays; ++i) {
      tempArtist = encodeName(artists[i].bbcode.artist);
      bbCode += "[b]" + getShortMonthName(month) + "-" + year + "[/b]<br>[artist]" + EncodeHtml(artists[i].bbcode.artist) + "[/artist] ([b]" + artists[i].bbcode.plays + "[/b] plays)<br>";
    }

    bbCode += "<br>";
    bbCode += "[url=http://nicholast.fm]Monthly Top Albums[/url]<br>";
    for (var i = 0; albums[i] && albums[0].bbcode.plays == albums[i].bbcode.plays; ++i) {
      bbCode += "[b]" + getShortMonthName(month) + "-" + year + "[/b]<br>[artist]" + EncodeHtml(albums[i].bbcode.artist) + "[/artist] : [album artist=" + EncodeHtml(albums[i].bbcode.artist) + "]" + EncodeHtml(albums[i].bbcode.album) + "[/album] ([b]" + albums[i].bbcode.plays + "[/b] plays)<br>";
    }
    $(idPrefix + "#oldbbcode").html(bbCode);
  }

  $(idPrefix + "#mttMonth").html("Monthly Stats For " + getMonthName(month));

  }

  $(idPrefix + "#trackInfo").show();
  $("#progressBack").hide();

  var timeSpent = new Date().getTime() - startTime;
  if (timeSpent > 100) {

    if (month == undefined) {
      _gaq.push(['_trackTiming', executing, year, timeSpent, username.toLocaleLowerCase(), 100]);
    } else {
      _gaq.push(['_trackTiming', executing, year + ' ' + padMonth(month + 1) + ' ' + getMonthName(month), timeSpent, username.toLocaleLowerCase(), 100]);
    }

  }

  executing = null;
  $(".submit").button('reset');
}

//////////////// Artist Recommendations Code /////////////////
// thinking of advance tuning such as:
// auto correct on/off
// recommendation ... match ... cut off ... ? 0-1
// user's top artists' ... plays ... cut off ... ? ... 20 ... 100 ?

function getArtistRecommendations(user) {
  executing = 'Artist Recommendations';
  $(".submit").button('loading');
  startTime = new Date().getTime();

  /*
  numTracks = 0;
  year = 0;
  month = 0;
   */
  numPages = 0; // num of user's top artists
  uniqueTracks = {}; // user's top artists
  uniqueArtists = {}; // recommended artists
  topArtists = {};
  innerStr = "";
  pagesFinished = 0;

  $("#progressBar").width("0%");
  //document.getElementById("progressPercent").innerHTML = "0%";


  $("#arDisplay").hide();
  $("#progressBack").show();

  username = $user.val();
  period = $("#arPeriod").val();
  numPages = parseInt($("#arLimit").val());

  try {
    LastFM('user.getTopArtists', {
      user : username,
      period : period,
      limit : 200
    }).done(gotTopArtists);
  } catch (e) {}

  _gaq.push(['_trackEvent', executing, period + ' ' + numPages, username.toLocaleLowerCase()]);
}

function gotTopArtists(data) {
  if (!data.topartists['@attr']) {
    innerStr += "No Data";
    arFinished();
    return;
  }

  if (data.topartists.artist.length < numPages) {
    numPages = data.topartists.artist.length;
  }

  // make a list with the user's top artists' names (or mbid (...the mbid is missing on a lot of artists :-/)) as the index
  for (var i = 0; i < data.topartists.artist.length; ++i) {
    uniqueTracks[data.topartists.artist[i].name] = true;
  }

  topArtists = data.topartists.artist;

  // for each top artist get their list of similar artists
  for (var i = 0; i < data.topartists.artist.length && i < numPages; ++i) {
    setTimeout(getSimilarArtists(i), 200 * i + 200);
  }
}

function getSimilarArtists(i) {
  return function() {
    LastFM('artist.getSimilar', {
      artist: topArtists[i].name,
      autocorrect: 1
    }).done(gotTopSimilarArtists);
  };
}

function gotTopSimilarArtists(data) {
  // no similar artists for this one
  if (!data.similarartists['@attr']) {
    ++pagesFinished;

    //code for progress bar :)
    var percent = (pagesFinished / numPages * 100).toFixed(0) + "%";
    $("#progressBar").width(percent);
    //document.getElementById("progressPercent").innerHTML = percent;

    // this is our last page so let's finish this
    if (pagesFinished >= numPages) {
      arFinished();
    }
    return;
  }

  // for each similar artist
  for (var i = 0; i < data.similarartists.artist.length; ++i) {
    // look for the artist in the user's top artists
    if (!uniqueTracks[data.similarartists.artist[i].name]) {
      // if not in it, look for it in the list of recommended artist
      if (uniqueArtists[data.similarartists.artist[i].name]) {
        ++uniqueArtists[data.similarartists.artist[i].name].recommendations;
        uniqueArtists[data.similarartists.artist[i].name].match += parseFloat(data.similarartists.artist[i].match);
      } else {
        // if not in it add that artist to it and add one recommendation
        uniqueArtists[data.similarartists.artist[i].name] = {
          artist : data.similarartists.artist[i].name,
          match : parseFloat(data.similarartists.artist[i].match),
          recommendations : 1,
          url : data.similarartists.artist[i].url
        };
      }
    }
  }

  ++pagesFinished;

  //code for progress bar :)
  var percent = (pagesFinished / numPages * 100).toFixed(0) + "%";
  $("#progressBar").width(percent);
  //document.getElementById("progressPercent").innerHTML = percent;

  // this is our last page so let's finish this
  if (pagesFinished >= numPages) {
    arFinished();
  }
}

function arFinished() {
  var recommendedArtists = [];
  for (var i in uniqueArtists) {
    recommendedArtists.push({
      artist : link(EncodeHtml(uniqueArtists[i].artist), checkHttp(uniqueArtists[i].url)),
      match : uniqueArtists[i].match.toFixed(3) + '<span class="hide-text"> match</span>',
      recommendations : '<span class="hide-text">(</span>' + uniqueArtists[i].recommendations + '<span class="hide-text"> recommendations)</span>',
      searchable : {
        artist : uniqueArtists[i].artist.toLocaleLowerCase(),
        match : uniqueArtists[i].match.toFixed(3),
        recommendations : uniqueArtists[i].recommendations
      }
    });
  }

  recommendedArtists.sort(arSort);

  $("#ar-datagrid").html($("#template-datagrid").html());
  $("#ar-datagrid #caption").html('<h2>Recommended Artists:</h2>');

  // INITIALIZING THE DATAGRID
  var dataSource = new StaticDataSource({
      columns: [{
          property: 'artist',
          label: 'Artist',
          sortable: 'asc',
          span: 6
      }, {
          property: 'match',
          label: 'Match',
          sortable: 'desc',
          defaultSort: true,
          span: 3
      }, {
          property: 'recommendations',
          label: 'Recommended',
          title: 'Number of Recommendations',
          sortable: 'desc',
          span: 3
      }],
      data: recommendedArtists
  });

  $('#ar-datagrid .datagrid').datagrid({
      dataSource: dataSource
  });

  $("#progressBack").hide();
  $("#arDisplay").show();

  var timeSpent = new Date().getTime() - startTime;
  if (timeSpent > 100)
    _gaq.push(['_trackTiming', executing, period + ' ' + numPages, timeSpent, username.toLocaleLowerCase(), 100])

  $(".submit").button('reset');
  executing = null;
}

function arSort(a, b) {
  if (a.searchable.match < b.searchable.match) return 1;
  if (a.searchable.match > b.searchable.match) return -1;
  if (a.searchable.recommendations < b.searchable.recommendations) return 1;
  if (a.searchable.recommendations > b.searchable.recommendations) return -1;
  if (a.searchable.artist < b.searchable.artist) return -1;
  if (a.searchable.artist > b.searchable.artist) return 1;
  return 0;
}

//////////////// Track Recommendations Code //////////////////////////////////////
// thinking of advance tuning such as:
// auto correct on/off
// recommendation ... match ... cut off ... ? 0-1
// user's top artists' ... plays ... cut off ... ? ... 20 ... 100 ?

function getTrackRecommendations(user) {
  executing = 'Track Recommendations';
  $(".submit").button('loading');
  startTime = new Date().getTime();

  numPages = 0; // num of user's top tracks
  uniqueTracks = {}; // user's top tracks
  uniqueArtists = {}; // recommended tracks
  topArtists = {};
  innerStr = "<table>";
  pagesFinished = 0;

  $("#progressBar").width("0%");
  //$("#progressPercent").innerHTML = "0%";
  //$("#arDisplay").hide();
  $("#trDisplay").hide();
  $("#progressBack").show();

  username = $user.val();

  period = $("#trPeriod").val();
  numPages = parseInt($("#trLimit").val());

  try {
    LastFM('user.getTopTracks', {
      user: username,
      period: period,
      limit: 400
    }).done(gotTopTracks);
  } catch (e) {}

  _gaq.push(['_trackEvent', executing, period + ' ' + numPages, username.toLocaleLowerCase()]);
}

function gotTopTracks(data) {
  if (!data.toptracks['@attr']) {
    innerStr += "No Data";
    arFinished();
    return;
  }

  if (data.toptracks.track.length < numPages) {
    numPages = data.toptracks.track.length;
  }

  // make a list with the user's top artist and tracks' names as the index
  for (var i = 0; i < data.toptracks.track.length; ++i) {
    uniqueTracks[data.toptracks.track[i].artist.name + " " + data.toptracks.track[i].name] = true;
  }

  topArtists = data.toptracks.track;

  // for each top artist get their list of similar artists
  for (var i = 0; i < data.toptracks.track.length && i < numPages; ++i) {
    setTimeout(getSimilarTracks(i), 200 * i + 200);
  }
}

function getSimilarTracks(i) {
  return function() {
    LastFM('track.getSimilar', {
      artist: topArtists[i].artist.name,
      track: topArtists[i].name,
      autocorrect: 1
    }).done(gotTopSimilarTracks);
  };
}

function gotTopSimilarTracks(data) {
  // make sure that there are similar tracks for this one
  if (data.similartracks['@attr']) {
    // for each similar artist
    for (var i = 0; i < data.similartracks.track.length; ++i) {
      var combinedName = data.similartracks.track[i].artist.name + " " + data.similartracks.track[i].name;
      // look for the artist in the user's top artists
      if (!uniqueTracks[combinedName]) {
        // if not in it, look for it in the list of recommended artist
        if (uniqueArtists[combinedName]) {
          ++uniqueArtists[combinedName].recommendations;
          uniqueArtists[combinedName].match += parseFloat(data.similartracks.track[i].match);
        } else {
          // if not in it add that artist to it and add one recommendation
          uniqueArtists[combinedName] = {
            artist : data.similartracks.track[i].artist.name,
            track : data.similartracks.track[i].name,
            recommendations : 1,
            match : parseFloat(data.similartracks.track[i].match),
            artisturl : data.similartracks.track[i].artist.url,
            trackurl : data.similartracks.track[i].url
          };
        }
      }
    }
  }

  ++pagesFinished;

  //code for progress bar :)
  var percent = (pagesFinished/numPages*100).toFixed(0) + "%";
  $("#progressBar").width(percent);
  //$("#progressPercent").innerHTML = percent;

  // this is our last page so let's finish this
  if (pagesFinished >= numPages) {
    trFinished();
  }
}

function trFinished() {
  var recommendedTracks = [];
  for (var i in uniqueArtists) {
    recommendedTracks.push({
      artist : link(EncodeHtml(uniqueArtists[i].artist), checkHttp(uniqueArtists[i].artisturl)) + '<span class="hide-text"> -</span>',
      track : link(EncodeHtml(uniqueArtists[i].track), checkHttp(uniqueArtists[i].trackurl)),
      recommendations : '<span class="hide-text">(</span>' + uniqueArtists[i].recommendations + '<span class="hide-text"> recommendations)</span>',
      match : uniqueArtists[i].match.toFixed(3) + '<span class="hide-text"> match</span>',
      searchable : {
        artist : uniqueArtists[i].artist.toLocaleLowerCase(),
        track : uniqueArtists[i].track.toLocaleLowerCase(),
        recommendations : uniqueArtists[i].recommendations,
        match : uniqueArtists[i].match.toFixed(3)
      }
    });
  }

  recommendedTracks.sort(trSort);

  $("#tr-datagrid").html($("#template-datagrid").html());
  $("#tr-datagrid #caption").html('<h2>Recommended Tracks:</h2>');

  // INITIALIZING THE DATAGRID
  var dataSource = new StaticDataSource({
      columns: [{
          property: 'artist',
          label: 'Artist',
          sortable: 'asc',
          span: 4
      }, {
          property: 'track',
          label: 'Track',
          sortable: 'asc',
          span: 5
      }, {
          property: 'match',
          label: 'Match',
          sortable: 'desc',
          defaultSort: true,
          span: 2
      }, {
          property: 'recommendations',
          label: 'Recommended',
          title: 'Number of Recommendations',
          sortable: 'desc',
          span: 3
      }],
      data: recommendedTracks
  });

  $('#tr-datagrid .datagrid').datagrid({
      dataSource: dataSource
  });

  $("#progressBack").hide();
  $("#trDisplay").show();

  var timeSpent = new Date().getTime() - startTime;
  if (timeSpent > 100)
    _gaq.push(['_trackTiming', executing, period + ' ' + numPages, timeSpent, username.toLocaleLowerCase(), 100])

  $(".submit").button('reset');
  executing = null;
}


function trSort(a, b) {
  if (a.searchable.match < b.searchable.match) return 1;
  if (a.searchable.match > b.searchable.match) return -1;
  if (a.searchable.recommendations < b.searchable.recommendations) return 1;
  if (a.searchable.recommendations > b.searchable.recommendations) return -1;
  var aat = a.searchable.artist + " " + a.searchable.track;
  var bat = b.searchable.artist + " " + b.searchable.track;
  if (aat < bat) return -1;
  if (aat > bat) return 1;
  return 0;
}

//// end of last.fm api code ////

// something went wrong function for all last.fm api calls
function failFunction(code, message, obj) {
  /**
   * 2 : Invalid service - This service does not exist
   * 3 : Invalid Method - No method with that name in this package
   * 4 : Authentication Failed - You do not have permissions to access the service
   * 5 : Invalid format - This service doesn't exist in that format
   * 6 : Invalid parameters - Your request is missing a required parameter
   * 7 : Invalid resource specified
   * 8 : Operation failed - Something else went wrong
   * 9 : Invalid session key - Please re-authenticate
   * 10 : Invalid API key - You must be granted a valid key by last.fm
   * 11 : Service Offline - This service is temporarily offline. Try again later.
   * 13 : Invalid method signature supplied
   * 16 : There was a temporary error processing your request. Please try again
   * 26 : Suspended API key - Access for your account has been suspended, please contact Last.fm
   * 29 : Rate limit exceeded - Your IP has made too many requests in a short period
   */
  if (executing == null)
    return;

  code = obj.error || obj;
  message = obj.message || message;

  alert("Failed:\nCode: " + code + "\n" + message);
  $(".submit").button("reset");
  $("#progressBack").hide();

  _gaq.push(['_trackEvent', 'Error', code + ": " + message, username.toLocaleLowerCase()]);
  // should be logging this error info:
  //  executing + ', ' + username.toLocaleLowerCase() + ', ' + numTracks + ', ' + pagesFinished + ', ' + period + ', ' + numPages + ', ' + fromDate + ', ' + toDate + ', ' + year + ', ' + month

  executing = null;
}

function EncodeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}

function checkHttp(s) {
  if (s.lastIndexOf('http://', 0) === 0) return s;
  return 'http://' + s;
}

function link(text, href) {
  return '<a href="' + href + '" target="_blank">' + text + '</a>';
}

// Load top 10 albums for logo
// code goes here
function logo(data) {
  var tracks = 0;
  var art = "";
  var counter = 0;
  var url = "";
  var test = false;
  if (data.topalbums.album)
    tracks = data.topalbums.album.length;
  else
    return;

  for (var i = 0; i < tracks; i++) {
    try {
      url = data.topalbums.album[i].image[2]["#text"];
      if (url.indexOf('noimage') == -1) {
        art += "<img src=\"" + url + "\" class=\"logo-bg\" style=\"left:" + counter * 10 + "%\">";
        ++counter;
      }
    } catch (e) { }
    if (counter == 10)
      break;
  }

  //alert( art );
  $("#logo-container").prepend(art);
  var delay = 150;
  $.each($(".logo-bg"), function(i, x) {
    $(this).fadeTo(250 + (delay * i), .75);
  });
}

function logoInit() {
  //if a different username is entered, clear the album art in the logo
  $("#logo-container .logo-bg").fadeOut("500", function() {
    $(this).remove();
  });

  username = $user.val();

  try {
    LastFM('user.getTopAlbums', {
      user : username,
      limit : '20'
    }).done(logo);
  } catch (e) { }
}

function activate(method) {
  if (username != $user.val()) {
    logoInit();
  }

  if (executing == null && methods[method]) {
    methods[method]();
  }
}

function formSubmit() {
  if ($user.val() == "") {
    $("#userForm .control-group").addClass("error");
    $user.focus();

  } else {
    activate($("li.active a").attr("href"));
  }

  return false;
}

function encodeName(name) {
  return encodeURIComponent(name).replace(/%20/g, '+').replace(/%2B/g, '%252B');
}

// ready funciton / event function(s)
$(function() {
  var user = null;

  $user = $("#user");

  // button to clear the current user
  $("#clear-user").click(function() {
    $user
      .val('')
      .keyup()
      .focus();
  }).hide();

  $user
    // sets focus to first textbox
    .focus()

    // activate tooltips
    .tooltip({
      animation: false,
      trigger: 'manual',
      placement: 'right'
    })

    .focus(function() {
      if ($user.val() == "") {
        $user.tooltip('show');
      }
    })

    // makes sure you don't submit the form without entering a username
    .keyup(function() {
      if (user == $user.val()) {
        return;
      }

      if ($user.val()) {
        $user.tooltip('hide');
        $(".submit").removeClass("disabled");
        $("#clear-user").fadeIn(250);
        $("#userForm .control-group").removeClass("error");

      } else {
        $user.tooltip('show');
        $(".submit").addClass("disabled");
        $("#clear-user").fadeOut(250);
      }

      user = $user.val();
    })
    .keyup();

  // handles activation of features, like getting Monthly Top Tracks, etc.
  $(".submit").click(formSubmit);
  $("#userForm").submit(formSubmit);

  // Hides the BB code for mobile screens sizes by default.
  if ($(window).width() <= 767) {
    $('div#BBCode').removeClass('in').addClass('collapse');
  }

  // track a few different clicks
  var target = null;
  $(document)
    .on('mousedown', 'a', function(event) {
      target = event.target;
    })
    .on('mouseup', 'a', function(event) {
      if (target != event.target) {
        return;
      }

      var href = $(this).attr('href');
      if (href && href != "#") {
        _gaq.push(['_trackEvent', 'Click', href, username.toLocaleLowerCase()]);
      }

    });

  // Stops the tooltip from being in the wrong position
  $(window).resize(function() {
    if ($user.val() == "") {
      $user.tooltip('show');
    }
  });

  // Lazy load
  $('[data-src]').each(function() {
    var $this = $(this);
    $this.attr('src', $this.data('src'));
  });

  //Testing...
  //$user.val("nick1n");
  //logoInit();

  // Asynchronously load google services, leave it for the very last
  script('http://www.google-analytics.com/ga.js');
  script('http://ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
  script('http://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js');
});

// Simple helper functions
function padMonth(m) {
  return padNumber('00', m);
}

function padNumber(str, num) {
  return str.substr(0, str.length - ('' + num).length) + num;
}

// By: nickf
// Src: http://stackoverflow.com/questions/1643320/get-month-name-from-date-using-javascript
// Modified by: Nicholas Ness
var monthNames = [
  "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
];
function getMonthName(month) {
  return monthNames[month];
}
function getShortMonthName(month) {
  return getMonthName(month).substr(0, 3);
}

// Asynchronous script helper function
function script(src) {
  var ga = document.createElement('script');
  ga.type = 'text/javascript';
  ga.async = true;
  ga.src = src;
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(ga, s);
}

// Google Analytics
window._gaq = window._gaq || [];
_gaq.push(['_setAccount', 'UA-30386018-1']);
_gaq.push(['_trackPageview']);

// Google Web Fonts
window.WebFontConfig = {
  google: {
    families: ['Ubuntu']
  }
};

// Google Adsense
(window.adsbygoogle = window.adsbygoogle || []).push({});
