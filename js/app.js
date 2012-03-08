/*
 * Last.fm stats
 * Authors: Nicholas Ness & Nicholas Kramer
 */

if (typeof console == 'undefined') { var console = { log : function(val) {} }; }

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
var isRunning = false;

// starting function, the function that lets all last.fm hell break loose.
function getTracks(user) {
  if (isRunning) {
    return;
  }
  isRunning = true;
  $(".btn").button('loading');
  
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
  var date = new Date();
  year = $("#year").val();
  date.setFullYear(year);
  month = parseInt($("#month").val());
  date.setMonth(month);
  date.setDate(1);
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);
  fromDate = (date.getTime() - offset) / 1000;
  date.setMonth(date.getMonth() + 1);
  toDate = (date.getTime() - offset) / 1000;
  
  try {
    lastfm.user.getRecentTracks({ user : username, limit : '200', page : 1, to : toDate, from : fromDate }, { success : gotNumTracks, error : failFunction });
  } catch (e) {}
}

// initial track info from last.fm
function gotNumTracks(data) {
  if (data.recenttracks['@attr'] == undefined) {
    innerStr += "No Data";
    finished();
    return;
  }
  numPages = data.recenttracks['@attr'].totalPages;
  $("#totalTracks").html(data.recenttracks['@attr'].total);
  
  // check for extra now playing track even though its a list of tracks from last month :-/
  // and remove it from the array FOREVER!
  if (data.recenttracks.track[0] != undefined) {
    if (data.recenttracks.track[0]['@attr'] != undefined) {
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
  lastfm.user.getRecentTracks({ user : username, limit : '200', page : page, to : toDate, from : fromDate }, { success : gotTracks, error : failFunction });
}

// got some track info from last.fm lets parse it :)
function gotTracks(data) {
  numTracks += data.recenttracks.track.length;
  $("#totalUniqueTracks").html(numTracks);
  
  for (var i = 0; i < data.recenttracks.track.length; ++i) {
    var artist = data.recenttracks.track[i].artist["#text"];
    var track = artist + " - " + data.recenttracks.track[i].name;
    if (uniqueTracks[track] == undefined) {
      uniqueTracks[track] = {
        artist : artist,
        track : data.recenttracks.track[i].name,
        plays : 1
      };
    } else {
      ++uniqueTracks[track].plays;
    }
    if (uniqueArtists[artist] == undefined) {
      uniqueArtists[artist] = {
        artist : artist,
        plays : 1
      };
    } else {
      ++uniqueArtists[artist].plays;
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
  var tempUser = encodeURI(username.replace(/ /g, "+"));
  var tempArtist = "";
  for (var i = 0; i < artists.length && i < 50; ++i) {
    tempArtist = encodeURI(artists[i].artist.replace(/ /g, "+"));
    innerStr += "<tr><td class=\"artist\">" + artists[i].artist.link("http://www.last.fm/music/" + tempArtist) + " <span class=\"plays\">" + ("(" + artists[i].plays + " plays)").link("http://www.last.fm/user/" + tempUser + "/library/music/" + tempArtist) + "</span></td></tr>";
  }
  $("#artistList").html(innerStr + "</table>");
  
  // generate large track list .......
  var tempTrack = "";
  innerStr = "<table>";
  for (var i = 0; i < tracks.length && i < 50; ++i) {
    tempArtist = encodeURI(tracks[i].artist.replace(/ /g, "+"));
    tempTrack = encodeURI(tracks[i].track.replace(/ /g, "+"));
    
    //<div id="progressBar" class="progressBar" style="background-color:green; width:0%">&nbsp;<span id="progressPercent" style="position:relative; right:-240px;"></span></div>
    innerStr += "<tr><td class=\"track\">" + tracks[i].artist.link("http://www.last.fm/music/" + tempArtist) + " - " + tracks[i].track.link("http://www.last.fm/music/" + tempArtist + "/_/" + tempTrack) + " <span class=\"plays\">" + ("(" + tracks[i].plays + " plays)").link("http://www.last.fm/user/" + tempUser + "/library/music/" + tempArtist) + "</span></td></tr>";
    //<div style=\"background-color:#71B7E6; width:" + (tracks[i].plays/tracks[0].plays*500).toFixed(0) + "px;\">&nbsp;<span style=\"position:relative;\">
  }
  console.log(innerStr);
  $("#trackList").html(innerStr + "</table>");
  
  // generate my bb code
  var bbCode = "";
  if (artists[0] != undefined) {
    bbCode += "[url=http://nicholast.fm]Monthly Top Artists[/url]\n";
    for (var i = 0; artists[i] != undefined && artists[0].plays == artists[i].plays; ++i) {
      tempArtist = encodeURI(artists[i].artist.replace(/ /g, "+"));
      bbCode += "[b]" + (month + 1) + "-" + year.substr(2) + ":[/b] [artist]" + artists[i].artist + "[/artist] [url=http://www.last.fm/user/" + tempUser + "/library/music/" + tempArtist + "](" + artists[i].plays + " plays)[/url]\n";
    }
    bbCode += "[url=http://nicholast.fm]Monthly Top Tracks[/url]\n";
    for (var i = 0; tracks[i] != undefined && tracks[0].plays == tracks[i].plays; ++i) {
      bbCode += "[b]" + (month + 1) + "-" + year.substr(2) + ":[/b] [artist]" + tracks[i].artist + "[/artist] - [track artist=" + tracks[i].artist + "]" + tracks[i].track + "[/track]\n";
    }
    $("#bbcode").html(bbCode);
    
    // generate old bb code (styled from lastfm.heathaze.org)
    bbCode = "";
    bbCode += "[url=http://nicholast.fm]Monthly Top Artists[/url]\n";
    for (var i = 0; artists[i] != undefined && artists[0].plays == artists[i].plays; ++i) {
      tempArtist = encodeURI(artists[i].artist.replace(/ /g, "+"));
      bbCode += "[b]" + getShortMonthName(month) + "-" + year + "[/b]\n[artist]" + artists[i].artist + "[/artist] ([b]" + artists[i].plays + "[/b] plays)\n";
    }
    bbCode += "[url=http://nicholast.fm]Monthly Top Tracks[/url]\n";
    for (var i = 0; tracks[i] != undefined && tracks[0].plays == tracks[i].plays; ++i) {
      bbCode += "[b]" + getShortMonthName(month) + "-" + year + "[/b]\n[artist]" + tracks[i].artist + "[/artist] : [track artist=" + tracks[i].artist + "]" + tracks[i].track + "[/track] ([b]" + tracks[i].plays + "[/b] plays)\n";
    }
    $("#oldbbcode").html(bbCode);
  }
  
  $("#mttMonth").html("Monthly Stats For " + getMonthName(month));
  
  $("#trackInfo").show();
  $("#progressBack").hide();
  
  isRunning = false;
  $(".btn").button('reset');
}

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
  alert("Failed:\nCode: " + code + "\n" + message);
}

function getArtistRecommendations(user) {
  if (isRunning) {
    return;
  }
  isRunning = true;
  $(".btn").button('loading');
  
  /*
  numTracks = 0;
  year = 0;
  month = 0;
   */
  numPages = 0; // num of user's top artists
  uniqueTracks = {}; // user's top artists
  uniqueArtists = {}; // recommended artists
  topArtists = {};
  innerStr = "<table>";
  pagesFinished = 0;
  
  $("#progressBar").width("0%");
  //document.getElementById("progressPercent").innerHTML = "0%";
  
  
  $("#arDisplay").hide();
  $("#progressBack").show();
  
  username = $("#user").val();
  
  var period = $("#arPeriod").val();
  numPages = parseInt($("#arLimit").val());
  
  lastfm.user.getTopArtists({ user : username, period : period, limit : 200 }, { success : gotTopArtists, error : failFunction });
}

function gotTopArtists(data) {
  if (data.topartists['@attr'] == undefined) {
    innerStr += "No Data";
    arFinished();
    return;
  }
  
  if (data.topartists.artist.length < numPages) {
    numPages = data.topartists.artist.length;
  }
  
  // make a list with the user's top artists' names (or mbid (...the mbid is missing on a lot of artists :-/)) as the index
  for (var i = 0; i < data.topartists.artist.length; ++i) {
    uniqueTracks[data.topartists.artist[i].name] = 1;
  }
  
  topArtists = data.topartists.artist;
  
  // for each top artist get their list of similar artists
  for (var i = 0; i < data.topartists.artist.length && i < numPages; ++i) {
    setTimeout("getSimilarArtists(" + i + ")", 200 * i + 200);
  }
}

function getSimilarArtists(i) {
  lastfm.artist.getSimilar({ artist : topArtists[i].name, autocorrect : 1 }, { success : gotTopSimilarArtists, error : failFunction });
}

function gotTopSimilarArtists(data) {
  // no similar artists for this one
  if (data.similarartists['@attr'] == undefined) {
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
    if (uniqueTracks[data.similarartists.artist[i].name] == undefined) {
      // if not in it, look for it in the list of recommended artist
      if (uniqueArtists[data.similarartists.artist[i].name] == undefined) {
        // if not in it add that artist to it and add one recommendation
        uniqueArtists[data.similarartists.artist[i].name] = {
          artist : data.similarartists.artist[i].name,
          plays : 1,
          url : data.similarartists.artist[i].url
        }; // artist == name && plays == recommendations
      } else {
        ++uniqueArtists[data.similarartists.artist[i].name].plays;
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
  var artists = [];
  for (var artist in uniqueArtists) {
    artists.push(uniqueArtists[artist]);
  }
  artists.sort(artistSort);
  
  var tempArtist = "";
  for (var i = 0; i < artists.length && i < 50; ++i) {
    tempArtist = encodeURI(artists[i].artist.replace(/ /g, "+"));
    innerStr += "<tr><td class=\"artist\">" + artists[i].artist.link("http://" + artists[i].url) + " <span class=\"plays\">(" + artists[i].plays + " recommendations)</span></td></tr>";
  }
  $("#arList").html(innerStr + "</table>");
  
  $("#arDisplay").show();
  $("#progressBack").hide();
  
  $(".btn").button('reset');
  isRunning = false;
}

//////////////// Track Recommendations Code //////////////////////////////////////
// thinking of advance tuning such as:
// auto correct on/off
// recommendation ... match ... cut off ... ? 0-1
// user's top artists' ... plays ... cut off ... ? ... 20 ... 100 ?

var recommendedTracks = [];
var trSortColumn = 'M';

function getTrackRecommendations(user) {
  if (isRunning) {
    return;
  }
  isRunning = true;
  $(".btn").button('loading');
  
  /*
  numTracks = 0;
  year = 0;
  month = 0;
  */
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
  
  var period = $("#trPeriod").val();
  numPages = parseInt($("#trLimit").val());
  
  lastfm.user.getTopTracks({user: username, period: period, limit: 400}, {success: gotTopTracks, error: failFunction});
}

function gotTopTracks(data) {
  if (data.toptracks['@attr'] == undefined) {
    innerStr += "No Data";
    arFinished();
    return;
  }
  console.log(data);
  
  if (data.toptracks.track.length < numPages) {
    numPages = data.toptracks.track.length;
  }
  
  // make a list with the user's top artist and tracks' names as the index
  for (var i = 0; i < data.toptracks.track.length; ++i) {
    uniqueTracks[data.toptracks.track[i].artist.name + " " + data.toptracks.track[i].name] = 1;
  }
  
  topArtists = data.toptracks.track;
  
  // for each top artist get their list of similar artists
  for (var i = 0; i < data.toptracks.track.length && i < numPages; ++i) {
    setTimeout("getSimilarTracks(" + i + ")", 200*i+200);
  }
}

function getSimilarTracks(i) {
  lastfm.track.getSimilar({artist: topArtists[i].artist.name, track: topArtists[i].name, autocorrect: 1}, {success: gotTopSimilarTracks, error: failFunction});
}

function gotTopSimilarTracks(data) {
  // make sure that there are similar tracks for this one
  if (data.similartracks['@attr'] != undefined) {  
    // for each similar artist
    for (var i = 0; i < data.similartracks.track.length; ++i) {
      var combinedName = data.similartracks.track[i].artist.name + " " + data.similartracks.track[i].name;
      // look for the artist in the user's top artists
      if (uniqueTracks[combinedName] == undefined) {
        // if not in it, look for it in the list of recommended artist
        if (uniqueArtists[combinedName] == undefined) {
          // if not in it add that artist to it and add one recommendation
          uniqueArtists[combinedName] = {artist: data.similartracks.track[i].artist.name, track: data.similartracks.track[i].name, recommendations: 1, match: parseFloat(data.similartracks.track[i].match), artisturl: data.similartracks.track[i].artist.url, trackurl: data.similartracks.track[i].url}; // artist == name && plays == recommendations
        } else {
          ++uniqueArtists[combinedName].recommendations;
          uniqueArtists[combinedName].match += parseFloat(data.similartracks.track[i].match);
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
  recommendedTracks = [];
  for (var artist in uniqueArtists) {
    recommendedTracks.push(uniqueArtists[artist]);
  }
  
  trOnClick('M');
  
  $("#trDisplay").show();
  $("#progressBack").hide();
  
  $(".btn").button('reset');
  isRunning = false;
}

function trSort(a, b) {
  var ret = 0;
  if (trSortColumn == 'R') {
    ret = b.recommendations - a.recommendations;
    if (ret == 0) {
      ret = b.match - a.match;
    }
  } else if (trSortColumn == 'M') {
    ret = b.match - a.match;
  }
  if (ret == 0) {
    var aat = (a.artist + " " + a.track).toLowerCase();
    var bat = (b.artist + " " + b.track).toLowerCase();
    if (aat < bat) return -1;
    if (aat > bat) return 1;
  }
  return ret;
}

function trOnClick(col) {
  trSortColumn = col;
  
  recommendedTracks.sort(trSort);
  
  innerStr = "<table class=\"table table-striped table-bordered table-condensed\"><thead><tr>";
  innerStr += "<th onClick=\"trOnClick('A');\"><b>Artist</b>" + (col == 'A' ? " <i class=\"icon-chevron-down\"></i>" : "") + "</th>";
  innerStr += "<th onClick=\"trOnClick('M');\"><b>Match</b>" + (col == 'M' ? " <i class=\"icon-chevron-down\"></i>" : "") + "</th>";
  innerStr += "<th onClick=\"trOnClick('R');\"><b>Recommendations</b>" + (col == 'R' ? " <i class=\"icon-chevron-down\"></i>" : "") + "</th></tr></thead><tbody>";
  for (var i = 0; i < recommendedTracks.length && i < 50; ++i) {
    innerStr += "<tr><td class=\"artist\"><a href=\"http://" + recommendedTracks[i].artisturl + "\">" + recommendedTracks[i].artist + "</a> - <a href=\"http://" + recommendedTracks[i].trackurl + "\">" + recommendedTracks[i].track + "</a></td> <td class=\"plays\">" + recommendedTracks[i].match.toFixed(2) + "</td> <td class=\"plays\">" + recommendedTracks[i].recommendations + "</td></tr>";
  }
  $("#trList").html(innerStr + "</tbody></table>");
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
  
  console.log(data);
  tracks = data.topalbums.album.length;
  
  for (var i = 0; i < tracks; i++) {
    try {
      art += "<img src=\"" + data.topalbums.album[i].image[2]["#text"] + "\" class=\"logo-bg\">";
    } catch (e) {}
  }
  
  //alert( art );
  $("#logo-container").prepend(art);
  var delay = 150;
  $.each($(".logo-bg"), function(i, x) {
    $(this).fadeTo(250 + (delay * i), .70);
  });
}

function logoInit() {
  //if a different username is entered, clear the album art in the logo
  $("#logo-container .logo-bg").fadeOut("500", function() {
    $(this).remove();
  });
  username = $("#user").val();
  try {
    lastfm.user.getTopAlbums({ user : username, limit : '20' }, { success : logo, error : failFunction });
  } catch (e) {
    return;
  }
}

function activate(whichFeature) {
  if (username != $("#user").val()) {
    logoInit();
  }
  
  // this is how you invoke a function via a string stored in a variable.
  // In this case, the string is from the ID attribute of the submit button pressed
  if (!isRunning)
    window[whichFeature]();
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
    $("#logo-container .logo-bg").fadeOut("500", function() {
      $(this).remove();
    });
  }).hide();
  
  // activate tooltips
  //$("[data-original-title]").tooltip({placement: "right"});
  $("#user").tooltip({ trigger : 'manual', placement : 'right' });
  
  // makes sure you don't submit the form without entering a username
  var user = null;
  $("#user").keyup(function(data) {
    if (user == $("#user").val()) {
      return;
    }
    if ($("#user").val() == "") {
      $("#user").tooltip('show');
      $(".submit").addClass("disabled").attr("disabled", "disabled");
      $("#clear-user").fadeOut(250);
    } else {
      $("#user").tooltip('hide');
      $(".submit").removeClass("disabled").removeAttr("disabled");
      $("#clear-user").fadeIn(250);
    }
    user = $("#user").val();
  }).keyup();
  
  // handles activation of features, like getting Monthly Top Tracks, etc.
  $(".submit").click(function() {
    if ($("#user").val() == "") {
      $("#user").parents(".control-group").addClass("error");
    } else {
      activate($(this).attr("id"));
    }
  });
  
  // sets default selections of the month and year to the current
  var date = new Date();
  var years = $("#year");
  $("#month").val(date.getMonth());
  for (var i = 2005; i <= date.getFullYear(); ++i) {
    $("<option value='" + i + "'>" + i + "</option>").appendTo(years);
  }
  years.val(date.getFullYear());
  
  // The flag counter is currently hidden
  // make flag conuter section less obnoxious, but have a nice fade-in when moused over
  //$("#flags").fadeTo(0, .1).hover(function() {
  //  $(this).stop().fadeTo(250, 1);
  //}, function() {
  //  $(this).stop().fadeTo(250, .1);
  //});
  
  // make sure placeholders show up
  if (!elementSupportsAttribute('input', 'placeholder')) {
    // javascript to replicate placeholder function
  }
  
  //Testing...
  //$("#user").val("nick1n");
  //logoInit();
});

// By: nickf
// Src: http://stackoverflow.com/questions/1643320/get-month-name-from-date-using-javascript
// Modified by: Nicholas Ness
var monthNames = [
  "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
];
function getMonthName(month) {
  return this.monthNames[month];
};
function getShortMonthName(month) {
  return this.getMonthName(month).substr(0, 3);
};
