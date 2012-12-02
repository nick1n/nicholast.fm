/*
 * Last.fm stats
 * Authors: Nicholas Ness & Nicholas Kramer
 */

if (!console) { var console = { log : function(val) {} }; }

// add scrollbar from load so no weird repositioning happens
//$("body").height( $(window).height() * 1.1 );

/* Create a LastFM object */
var lastfm = new LastFM({ apiKey : 'f750712ed70caea3272e70e48e1f464e' });

var username = "";
var numTracks = 0;
var innerStr = "<table>";
var pagesFinished = 0;
var numPages = 0;
var fromDate = 0;
var toDate = 0;
var uniqueTracks = {};
var uniqueArtists = {};
var year = 0;
var month = 0;
var executing = null;
var period = 0;
var startTime;

/////////////////////// User's Monthly Top Tracks Code //////////////////

// starting function, the function that lets all last.fm hell break loose.
function getTracks(user) {
  executing = 'Monthly Top Tracks';
  $(".submit").button('loading');
  startTime = new Date().getTime();
  
  username = $("#user").val();
  numTracks = 0;
  innerStr = "<table>";
  pagesFinished = 0;
  numPages = 0;
  uniqueTracks = {};
  uniqueArtists = {};
  year = 0;
  month = 0;
  $("#progressBar").width("0%");
  //document.getElementById("progressPercent").innerHTML = "0%";
  
  $("#trackInfo").hide();
  $("#progressBack").show();
  
  // Just call getTimeZone, trying to figure out last.fm user's timezone isn't working out :-/
  getTimeZone();
  //try {
  //  lastfm.user.getRecentTracks({user: username, limit: 1}, {success: getTimeZone, error: failFunction});
  //} catch (e) {}
}

// gets the timezone of the user so that we can have accurate stats no matter what timezone you are in :)
function getTimeZone(data) {
  // TODO: get the last.fm user's timezone and use that instead of this page user's timezone
  // just in case we get the now playing track :-| (it doesn't have a date)
  var offset = 0;
  //if (data.recenttracks.track[1] == undefined) {
  //    offset = -(new Date().getTimezoneOffset()*60*1000) - (new Date(new Date(data.recenttracks.track.date.uts*1000).setSeconds(0)).getTime()-new Date(data.recenttracks.track.date['#text']).getTime());
  //}
  
  // Find the from and to dates
  // need to fix this only works when you are in the same timezone as the scrobbling was
  year = $("#year").val();
  month = parseInt($("#month").val());
  var date = new Date(year, month, 1);
  fromDate = (date.getTime() - offset) / 1000 - 1;
  date.setMonth(date.getMonth() + 1);
  toDate = (date.getTime() - offset) / 1000;
  
  try {
    lastfm.user.getRecentTracks({
      user : username,
      limit : '200',
      page : 1,
      to : toDate,
      from : fromDate
    }, {
      success : gotNumTracks,
      error : failFunction
    });
  } catch (e) {}

  _gaq.push(['_trackEvent', executing, year + ' ' + padMonth(month + 1) + ' ' + getMonthName(month), username.toLocaleLowerCase()]);
}

// initial track info from last.fm
function gotNumTracks(data) {
  if (!data.recenttracks['@attr']) {
    innerStr += "No Data";
    finished();
    return;
  }
  numPages = data.recenttracks['@attr'].totalPages;
  $("#totalTracks").html(data.recenttracks['@attr'].total);
  
  // check for extra now playing track even though its a list of tracks from last month :-/
  // and remove it from the array FOREVER!
  if (data.recenttracks.track[0]) {
    if (data.recenttracks.track[0]['@attr']) {
      data.recenttracks.track.shift();
    }
  }
  
  try {
    for (var page = 2; page <= numPages; ++page) {
      setTimeout("getRecentTracks(" + page + ")", 200 * (page - 2));
    }
  } catch (e) {}
  
  gotTracks(data);
}

// a proxy function for delaying all the last.fm api calls
function getRecentTracks(page) {
  lastfm.user.getRecentTracks({
    user : username,
    limit : '200',
    page : page,
    to : toDate,
    from : fromDate
  }, {
    success : gotTracks,
    error : failFunction
  });
}

// got some track info from last.fm lets parse it :)
function gotTracks(data) {
  numTracks += data.recenttracks.track.length;
  $("#totalUniqueTracks").html(numTracks);
  
  for (var i = 0; i < data.recenttracks.track.length; ++i) {
    var artist = data.recenttracks.track[i].artist["#text"];
    var track = artist + " - " + data.recenttracks.track[i].name;
    if (uniqueTracks[track]) {
      ++uniqueTracks[track].plays;
    } else {
      uniqueTracks[track] = {
        artist : artist,
        track : data.recenttracks.track[i].name,
        plays : 1
      };
    }
    if (uniqueArtists[artist]) {
      ++uniqueArtists[artist].plays;
    } else {
      uniqueArtists[artist] = {
        artist : artist,
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
}

// sorts it by number of plays descending and if the plays are the same
// sorts it by artist and track names ascending (...or not...sometimes)
function trackSort(a, b) {
  var ret = b.plays - a.plays;
  if (ret == 0) {
    var aat = (a.artist + " " + a.track).toLowerCase();
    var bat = (b.artist + " " + b.track).toLowerCase();
    if (aat < bat)
      return -1;
    if (aat > bat)
      return 1;
  }
  return ret;
}

function artistSort(a, b) {
  var ret = b.plays - a.plays;
  if (ret == 0) {
    var aat = a.artist.toLowerCase();
    var bat = b.artist.toLowerCase();
    if (aat < bat)
      return -1;
    if (aat > bat)
      return 1;
  }
  return ret;
}

// finally finished receiving all track info from last.fm
function finished() {
  // sort the unique tracks and artists
  var tracks = [];
  for (var track in uniqueTracks) {
    tracks.push(uniqueTracks[track]);
  }
  tracks.sort(trackSort);
  var artists = [];
  for (var artist in uniqueArtists) {
    artists.push(uniqueArtists[artist]);
  }
  artists.sort(artistSort);
  
  $("#totalUniqueTracks").html(tracks.length);
  if (numTracks > 0) {
    $("#songRepetition").html((numTracks / tracks.length).toFixed(2));
  }
  
  // generate large artist list .......
  var tempUser = encodeName(username);
  var tempArtist = "";
  for (var i = 0; i < artists.length && i < 50; ++i) {
    tempArtist = encodeName(artists[i].artist);
    innerStr += "<tr><td class=\"artist\">" + EncodeHtml(artists[i].artist).link("http://www.last.fm/music/" + tempArtist) + " <span class=\"plays\">" + ("(" + artists[i].plays + " plays)").link("http://www.last.fm/user/" + tempUser + "/library/music/" + tempArtist) + "</span></td></tr>";
  }
  $("#artistList").html(innerStr + "</table>");
  
  // generate large track list .......
  var tempTrack = "";
  innerStr = "<table>";
  for (var i = 0; i < tracks.length && i < 50; ++i) {
    tempArtist = encodeName(tracks[i].artist);
    tempTrack = encodeName(tracks[i].track);
    
    innerStr +=
      "<tr>" +
        "<td class=\"track\">" + EncodeHtml(tracks[i].artist).link("http://www.last.fm/music/" + tempArtist) + " - " + EncodeHtml(tracks[i].track).link("http://www.last.fm/music/" + tempArtist + "/_/" + tempTrack) + " <span class=\"plays\">" + ("(" + tracks[i].plays + " plays)").link("http://www.last.fm/user/" + tempUser + "/library/music/" + tempArtist) + "</span></td>" +
      "</tr>";
  }
  $("#trackList").html(innerStr + "</table>");
  
  // generate my bb code
  var bbCode = "";
  var codeMonth = month + 1;
  codeMonth = (codeMonth > 9 ? codeMonth : '0' + codeMonth);
  if (artists[0]) {
    bbCode += "[url=http://nicholast.fm]Monthly Top Artists[/url]\n";
    for (var i = 0; artists[i] && artists[0].plays == artists[i].plays; ++i) {
      tempArtist = encodeName(artists[i].artist);
      bbCode += "[b]" + codeMonth + "-" + year.substr(2) + ":[/b] [artist]" + EncodeHtml(artists[i].artist) + "[/artist] [url=http://www.last.fm/user/" + tempUser + "/library/music/" + tempArtist + "](" + artists[i].plays + " plays)[/url]\n";
    }
    bbCode += "\n";
    bbCode += "[url=http://nicholast.fm]Monthly Top Tracks[/url]\n";
    for (var i = 0; tracks[i] && tracks[0].plays == tracks[i].plays; ++i) {
      bbCode += "[b]" + codeMonth + "-" + year.substr(2) + ":[/b] [artist]" + EncodeHtml(tracks[i].artist) + "[/artist] - [track artist=" + EncodeHtml(tracks[i].artist) + "]" + EncodeHtml(tracks[i].track) + "[/track]\n";
    }
    $("textarea#bbcode").html(bbCode);
    
    // generate old bb code (styled from lastfm.heathaze.org)
    bbCode = "";
    bbCode += "[url=http://nicholast.fm]Monthly Top Artists[/url]\n";
    for (var i = 0; artists[i] && artists[0].plays == artists[i].plays; ++i) {
      tempArtist = encodeName(artists[i].artist);
      bbCode += "[b]" + getShortMonthName(month) + "-" + year + "[/b]\n[artist]" + EncodeHtml(artists[i].artist) + "[/artist] ([b]" + artists[i].plays + "[/b] plays)\n";
    }
    bbCode += "\n";
    bbCode += "[url=http://nicholast.fm]Monthly Top Tracks[/url]\n";
    for (var i = 0; tracks[i] && tracks[0].plays == tracks[i].plays; ++i) {
      bbCode += "[b]" + getShortMonthName(month) + "-" + year + "[/b]\n[artist]" + EncodeHtml(tracks[i].artist) + "[/artist] : [track artist=" + EncodeHtml(tracks[i].artist) + "]" + EncodeHtml(tracks[i].track) + "[/track] ([b]" + tracks[i].plays + "[/b] plays)\n";
    }
    $("textarea#oldbbcode").html(bbCode);
  }
  
  $("#mttMonth").html("Monthly Stats For " + getMonthName(month));
  
  $("#trackInfo").show();
  $("#progressBack").hide();
  
  var timeSpent = new Date().getTime() - startTime;
  if (timeSpent > 100)
    _gaq.push(['_trackTiming', executing, year + ' ' + padMonth(month + 1) + ' ' + getMonthName(month), timeSpent, username.toLocaleLowerCase(), 100])

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
  
  username = $("#user").val();
  period = $("#arPeriod").val();
  numPages = parseInt($("#arLimit").val());
  
  try {
    lastfm.user.getTopArtists({
      user : username,
      period : period,
      limit : 200
    }, {
      success : gotTopArtists,
      error : failFunction
    });
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
    setTimeout("getSimilarArtists(" + i + ")", 200 * i + 200);
  }
}

function getSimilarArtists(i) {
  lastfm.artist.getSimilar({
    artist : topArtists[i].name,
    autocorrect : 1
  }, {
    success : gotTopSimilarArtists,
    error : failFunction
  });
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
      artist : EncodeHtml(uniqueArtists[i].artist).link(uniqueArtists[i].url),
      match : uniqueArtists[i].match.toFixed(3),
      recommendations : uniqueArtists[i].recommendations,
      searchable : {
        artist : uniqueArtists[i].artist.toLocaleLowerCase()
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
  var ret = b.match - a.match;
  if (ret == 0) ret = b.recommendations - a.recommendations;
  if (ret == 0) {
    if (a.searchable.artist < b.searchable.artist) return -1;
    if (a.searchable.artist > b.searchable.artist) return 1;
  }
  return ret;
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
  
  username = $("#user").val();
  
  period = $("#trPeriod").val();
  numPages = parseInt($("#trLimit").val());
  
  try {
    lastfm.user.getTopTracks({
      user: username,
      period: period,
      limit: 400
    }, {
      success: gotTopTracks,
      error: failFunction
    });
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
    setTimeout("getSimilarTracks(" + i + ")", 200*i+200);
  }
}

function getSimilarTracks(i) {
  lastfm.track.getSimilar({
    artist : topArtists[i].artist.name,
    track : topArtists[i].name,
    autocorrect : 1
  }, {
    success : gotTopSimilarTracks,
    error : failFunction
  });
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
      artist : EncodeHtml(uniqueArtists[i].artist).link(uniqueArtists[i].artisturl),
      track : EncodeHtml(uniqueArtists[i].track).link(uniqueArtists[i].trackurl),
      recommendations : uniqueArtists[i].recommendations,
      match : uniqueArtists[i].match.toFixed(3),
      searchable : {
        artist : uniqueArtists[i].artist.toLocaleLowerCase(),
        track : uniqueArtists[i].track.toLocaleLowerCase()
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
          span: 4
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
  var ret = b.match - a.match;
  if (ret == 0) ret = b.recommendations - a.recommendations;
  if (ret == 0) {
    var aat = a.searchable.artist + " " + a.searchable.track;
    var bat = b.searchable.artist + " " + b.searchable.track;
    if (aat < bat) return -1;
    if (aat > bat) return 1;
  }
  return ret;
}

//// end of last.fm api code ////

// something went wrong function for all last.fm api calls
function failFunction(code, message) {
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

function elementSupportsAttribute(element, attribute) {
  var test = document.createElement(element);
  if (attribute in test) {
    return true;
  } else {
    return false;
  }
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
  username = $("#user").val();
  try {
    lastfm.user.getTopAlbums({
      user : username,
      limit : '20'
    }, {
      success : logo,
      error : failFunction
    });
  } catch (e) { }
}

function activate(whichFeature) {
  if (username != $("#user").val()) {
    logoInit();
  }
  
  // this is how you invoke a function via a string stored in a variable.
  // In this case, the string is from the ID attribute of the submit button pressed
  if (executing == null)
    window[whichFeature]();
}

function formSubmit() {
  if ($("#user").val() == "") {
    $("#userForm .control-group").addClass("error");
    $("#user").focus();
  } else {
    try { activate($("li.active").attr("id")); } catch(e) {}
  }
  return false;
}

function encodeName(name) {
  return encodeURIComponent(name).replace(/%20/g, '+').replace(/%2B/g, '%252B');
}

var delay = (function() {
  var timer = 0;
  return function(callback, ms) {
    clearTimeout(timer);
    timer = setTimeout(callback, ms);
  };
})();

// ready funciton / event function(s)
$(function() {
  // sets focus to first textbox
  $("#user").focus();
  
  // button to clear the current user
  $("#clear-user").click(function() {
    $("#user").val("").keyup();
    $("#user").focus();
  }).hide();
  
  // activate tooltips
  $("#user").tooltip({ animation : false, trigger : 'manual', placement : 'right' });
  $("#user").focus(function() {
    if ($("#user").val() == "") {
      $("#user").tooltip('show');
    }
  });
  
  // makes sure you don't submit the form without entering a username
  var user = null;
  $("#user").keyup(function() {
    if (user == $("#user").val()) {
      return;
    }
    if ($("#user").val() == "") {
      $("#user").tooltip('show');
      $(".submit").addClass("disabled");
      $("#clear-user").fadeOut(250);
    } else {
      $("#user").tooltip('hide');
      $(".submit").removeClass("disabled");
      $("#clear-user").fadeIn(250);
      $("#userForm .control-group").removeClass("error");
    }
    user = $("#user").val();
  }).keyup();
  
  // handles activation of features, like getting Monthly Top Tracks, etc.
  $(".submit").click(formSubmit);
  $("#userForm").submit(formSubmit);

  // make sure placeholders show up
  if (!elementSupportsAttribute('input', 'placeholder')) {
    // javascript to replicate placeholder function
  }

  // Hides the BB code for mobile screens sizes by default.
  if ($(window).width() <= 767) {
    $('div#BBCode').removeClass('in').addClass('collapse');
  }

  $('a').click(function() {
    var href = $(this).attr('href');
    if (href && href != "#")
      _gaq.push(['_trackEvent', 'Click', href, username.toLocaleLowerCase()]);
  });

  //Testing...
  //$("#user").val("nick1n");
  //logoInit();
});

// Stops the tooltip from being in the wrong position
$(window).resize(function() {
  if ($("#user").val() == "") {
    $("#user").tooltip('show');
  }
});

// Simple helper functions
function padMonth(m) {
  return padNumber('00', m);
};
function padNumber(str, num) {
  return str.substr(0, str.length - ('' + num).length) + num;
};

// By: nickf
// Src: http://stackoverflow.com/questions/1643320/get-month-name-from-date-using-javascript
// Modified by: Nicholas Ness
var monthNames = [
  "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
];
function getMonthName(month) {
  return this.monthNames[this.month];
};
function getShortMonthName(month) {
  return this.getMonthName(this.month).substr(0, 3);
};

// Google Analytics
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-30386018-1']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script');
  ga.type = 'text/javascript';
  ga.async = true;
  ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(ga, s);
})();
