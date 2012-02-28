//Starting from top to bottom, the pieces of code needed to make the last.fm app work.

//Search for leftoff to find where I last left off when I was debugging.

//BEGIN:
//"lastfm.js" or aptly named linked file...
$(function(){ //jQuery onload function
  //document.getElementById("user").focus(); //sets focus to first textbox
console.log("onload:");
  //sets default selections of the month and year to the current
  var date = new Date();
  var $years = $("#year");
  $("#month option:eq("+date.getMonth()+")").selected = true;
  for (var i = 0; i <= date.getFullYear(); ++i) {
    $years.get(0).options[i] = new Option(i+2005, i+2005);
  }
  $years.children("option.eq("+(date.getFullYear())+")").selected = true;// .options[date.getFullYear()-2005].selected = true;
  //
  
  //selects all bbcode text onclick
  $('#bbCode').click(function(){
    $(this).select();});
  //  
}); //end jQuery onload function

//before onload function
var lastfm = new LastFM({apiKey : 'f750712ed70caea3272e70e48e1f464e'});

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
console.log("getTracks:"); //debugging lines are normally not indented //This is where I leftoff debugging
  if (user == null) {
    user = $("#user").val();
  }
  username = user;
  numTracks = 0;
  innerStr = "<div id=\"trackListWrapper\">";
  pagesFinished = 0;
  numPages = 0;
  uniqueTracks = {};
  uniqueArtists = {};
  year = 0;
  month = 0;
  $("#progressBar").width("0%");
  $("#progressPercent").text("0%");
  
  
  $("#trackInfo").hide();//.style.display = "none";
  $("#progressBack").show();//.style.display = "block";
  
  try {
    lastfm.user.getRecentTracks({user: username, limit: 1}, {success: getTimeZone, error: failFunction});
  } catch (e) {
console.log("timezone");
console.log(e);
  }
console.log(":getTracks");
} //end function getTracks(user) {

// gets the timezone of the user so that we can have accurate stats no matter what timezone you are in :)
function getTimeZone(data) { 
console.log("getTimeZone:");
console.log(data);
  // TODO: get the last.fm user's timezone and use that instead of this page user's timezone
  // just in case we get the now playing track :-| (it doesn't have a date)
  var offset = 0;
  /*
  if (data.recenttracks.track[1] == undefined) {
    console.log("first");
    console.log(data.recenttracks.track.date['#text']);
    console.log(new Date(data.recenttracks.track.date['#text']));
    console.log(new Date(data.recenttracks.track.date['#text']).toTimeString());
    console.log(new Date(data.recenttracks.track.date['#text']).toUTCString());
    console.log(new Date(data.recenttracks.track.date['#text']).getTime());
    console.log("second");
    console.log(data.recenttracks.track.date.uts);
    console.log(new Date(new Date(data.recenttracks.track.date.uts*1000).setSeconds(0)).getTime());
    console.log("third which is the last.fm user's timezone offset");
    offset = -(new Date().getTimezoneOffset()*60*1000) - (new Date(new Date(data.recenttracks.track.date.uts*1000).setSeconds(0)).getTime()-new Date(data.recenttracks.track.date['#text']).getTime());
    console.log(offset);
    console.log(new Date().getTimezoneOffset()*60*1000);
    console.log(new Date(new Date(data.recenttracks.track.date.uts*1000).setSeconds(0)).getTime()-new Date(data.recenttracks.track.date['#text']).getTime());
    console.log(data.recenttracks.track.date.uts*1000-new Date(data.recenttracks.track.date['#text']).getTime());
  }*/
  
  // Find the from and to dates
  // need to fix this only works when you are in the same timezone as the scrobbling was
  var date = new Date();
  var $dropdown = $("#year");
  year = $dropdown.children(":selected").val();
  date.setFullYear(year);
  $dropdown = $("#month");
  month = $dropdown.children(":selected").val();
  date.setMonth(month);
  date.setDate(1);
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);
  fromDate = (date.getTime()-offset)/1000;
  date.setMonth(date.getMonth()+1);
  toDate = (date.getTime()-offset)/1000;  
  try {
    lastfm.user.getRecentTracks({user: username, limit: '200', to: toDate, from: fromDate}, {success: gotNumTracks, error: failFunction});
  } catch (e) {
console.log("first");
console.log(e);
  }
console.log(":getTimeZone");
} //end function getTimeZone(data) {

// initial track info from last.fm
function gotNumTracks(data) {
console.log("gotNumTracks:");
console.log(data);
  if (data.recenttracks['@attr'] == undefined) {
    innerStr += "No Data";
    finished();
console.log(":gotNumTracks");
    return;
  }
  numPages = data.recenttracks['@attr'].totalPages;
  $("#totalTracks").html( data.recenttracks['@attr'].total );
  
  // if they have over 10000 in one month they are doing something wrong
  if (data.recenttracks['@attr'].total > 10000) {
    alert("Fuck that!\nI don't support people who abuse last.fm"); //lol
console.log(":gotNumTracks");
    return;
  }
  // check for extra now playing track even though its a list of tracks from last month :-/
  // and remove it from the array FOREVER!
  if (data.recenttracks.track[0] != undefined) {
    if (data.recenttracks.track[0]['@attr'] != undefined) {
      data.recenttracks.track.shift();
    }
  }
  
  var numDelays = 0;
  
  try {
    for (var page = 2; page <= numPages; ++page) {
      setTimeout("getRecentTracks(" + page + ")", 200*page);
    }
  } catch (e) {
console.log("others");
console.log(e);
  }
  
  gotTracks(data);
console.log(":gotNumTracks");
} //end function gotNumTracks(data) {

// a proxy function for delaying all the last.fm api calls
function getRecentTracks(page) {
  lastfm.user.getRecentTracks({user: username, limit: '200', page: page, to: toDate, from: fromDate}, {success: gotTracks, error: failFunction});
} //end function getRecentTracks(page) {

// got some track info from last.fm lets parse it :)
function gotTracks(data) {
  /* Use data. */
console.log("gotTracks:");
console.log(data);
  
  numTracks += data.recenttracks.track.length;
  $("#totalUniqueTracks").html( numTracks );
  
  for (var i = 0; i < data.recenttracks.track.length; ++i) {
    var artist = data.recenttracks.track[i].artist["#text"];
    var track = artist + " - " + data.recenttracks.track[i].name;
    if (uniqueTracks[track] == undefined) {
      uniqueTracks[track] = {artist: artist, track: data.recenttracks.track[i].name, plays: 1};
    } else {
      ++uniqueTracks[track].plays;
    }
    if (uniqueArtists[artist] == undefined) {
      uniqueArtists[artist] = {artist: artist, plays: 1};
    } else {
      ++uniqueArtists[artist].plays;
    }
  }
  ++pagesFinished;
  
  //code for progress bar :)
  var percent = (pagesFinished/numPages*100).toFixed(0) + "%";

  $("#progressBar").width( percent );
  $("#progressPercent").html( percent );
  
  // this is our last page so let's finish this
  if (pagesFinished >= numPages) {
    finished();
  }
console.log(":gotTracks");
} //function gotTracks(data) {

// sorts it by number of plays descending and if the plays are the same
// sorts it by artist and track names ascending (...or not...sometimes)
function trackSort(a, b) {
  var ret = b.plays - a.plays;
  if (ret == 0) {
    var aat = (a.artist + " " + a.track).toLowerCase();
    var bat = (b.artist + " " + b.track).toLowerCase();
    if (aat < bat) return -1;
    if (aat > bat) return 1;
  }
  return ret;
} //end function trackSort(a, b) {

function artistSort(a, b) {
  var ret = b.plays - a.plays;
  if (ret == 0) {
    var aat = a.artist.toLowerCase();
    var bat = b.artist.toLowerCase();
    if (aat < bat) return -1;
    if (aat > bat) return 1;
  }
  return ret;
} //end function artistSort(a, b) {

// finally finished receiving all track info from last.fm
function finished() {
console.log("finished:");
  
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
  
  $("#totalUniqueTracks").html( tracks.length );
  if (numTracks > 0) {
    $("#songRepetition").html( (numTracks/tracks.length).toFixed(2) );
  }
  
  // generate large artist list .......
  var tempUser = encodeURI(username.replace(/ /g, "+"));
  var tempArtist = "";
  for (var i = 0; i < artists.length && i < 50; ++i) {
    tempArtist = encodeURI(tracks[i].artist.replace(/ /g, "+"));
    innerStr += "<div class=\"artist\"><a href=\"http://www.last.fm/music/" + tempArtist + "\">" + artists[i].artist + "</a> <span class=\"plays\"><a href=\"http://www.last.fm/user/" + tempUser + "/library/music/" + tempArtist + "\">(" + artists[i].plays + " plays)</a></span></div>";
  }
  $("#artistList").html( innerStr + "</div>" );
  
  // generate large track list .......
  var tempTrack = "";
  innerStr = "<div id=\"trackListWrapper\">";
  for (var i = 0; i < tracks.length && i < 50; ++i) {
    tempArtist = encodeURI(tracks[i].artist.replace(/ /g, "+"));
    tempTrack = encodeURI(tracks[i].track.replace(/ /g, "+"));
    
    //<div id="progressBar" class="progressBar" style="background-color:green; width:0%">&nbsp;<span id="progressPercent" style="position:relative; right:-240px;"></span></div>
    innerStr += "<div class=\"track\"><a href=\"http://www.last.fm/music/" + tempArtist + "\">" + tracks[i].artist + "</a> - <a href=\"http://www.last.fm/music/" + tempArtist + "/_/" + tempTrack + "\">" + tracks[i].track + "</a> <span class=\"plays\"><a href=\"http://www.last.fm/user/" + tempUser + "/library/music/" + tempArtist + "\">(" + tracks[i].plays + " plays)</a></span></div>";
    //<div style=\"background-color:#71B7E6; width:" + (tracks[i].plays/tracks[0].plays*500).toFixed(0) + "px;\">&nbsp;<span style=\"position:relative;\">
  }
  $("#trackList").html( innerStr + "</div>" );
  
  // generate my bb code
  var bbCode = "";
  if (artists[0] != undefined) {
    bbCode += "[url=lastfm.nicholasness.com]Monthly Top Artists[/url]\n";
    for (var i = 0; artists[i] != undefined && artists[0].plays == artists[i].plays; ++i) {
      tempArtist = encodeURI(artists[i].artist.replace(/ /g, "+"));
      bbCode += "[b]" + (parseInt(month)+1) + "-" + year.substr(2) + ":[/b] [artist]" + artists[i].artist + "[/artist] [url=http://www.last.fm/user/" + tempUser + "/library/music/" + tempArtist + "](" + artists[i].plays + " plays)[/url]\n";
    }
    bbCode += "[url=lastfm.nicholasness.com]Monthly Top Tracks[/url]\n";
    for (var i = 0; tracks[i] != undefined && tracks[0].plays == tracks[i].plays; ++i) {
      bbCode += "[b]" + (parseInt(month)+1) + "-" + year.substr(2) + ":[/b] [artist]" + tracks[i].artist + "[/artist] - [track artist=" + tracks[i].artist + "]" + tracks[i].track + "[/track]\n";
    }
    $("#bbCode").html( bbCode );
  
  // generate old bb code (styled from lastfm.heathaze.org)
    bbCode = "";
    bbCode += "[url=lastfm.nicholasness.com]Monthly Top Artists[/url]\n";
    for (var i = 0; artists[i] != undefined && artists[0].plays == artists[i].plays; ++i) {
      tempArtist = encodeURI(artists[i].artist.replace(/ /g, "+"));
      bbCode += "[b]" + $("#month").options[parseInt(month)].innerHTML.substr(0,3) + "-" + year + "[/b]\n[artist]" + artists[i].artist + "[/artist] ([b]" + artists[i].plays + "[/b] plays)\n";
    }
    bbCode += "[url=lastfm.nicholasness.com]Monthly Top Tracks[/url]\n";
    for (var i = 0; tracks[i] != undefined && tracks[0].plays == tracks[i].plays; ++i) {
      bbCode += "[b]" + $("#month").options[parseInt(month)].innerHTML.substr(0,3) + "-" + year + "[/b]\n[artist]" + tracks[i].artist + "[/artist] : [track artist=" + tracks[i].artist + "]" + tracks[i].track + "[/track] ([b]" + tracks[i].plays + "[/b] plays)\n";
    }
    $("#oldbbcode").html( bbCode );
  }
  
  
  $("#trackInfo").show();//style.display = "block";
  $("#progressBack").hide();//style.display = "none";
  
  isRunning = false;
console.log(":finished");
}

// something went wrong function for all last.fm api calls
function failFunction(code, message) {
  alert("fail'd :(\nCode: " + code + "\n" + message);
}

//testing code: executes grabbing tracks
//getTracks("nick1n");
