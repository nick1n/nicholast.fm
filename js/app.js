/*
 * Last.fm stats
 * Author: Nicholas Ness
 */

if (typeof console == 'undefined') { var console = { log: function(val) {} }; }

/* Create a LastFM object */
var lastfm = new LastFM({apiKey : 'f750712ed70caea3272e70e48e1f464e'});

console.log(lastfm);

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
	
	if (user == null) {
		user = $("#user").val();
	}
	username = user;
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
	
	document.getElementById("arDisplay").style.display = "none";
	document.getElementById("trackInfo").style.display = "none";
	$("#progressBack").show();
	
	try {
		lastfm.user.getRecentTracks({user: username, limit: 1}, {success: getTimeZone, error: failFunction});
	} catch (e) {}
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
	var dropdown = document.getElementById("year");
	year = dropdown.options[dropdown.selectedIndex].value;
	date.setFullYear(year);
	dropdown = document.getElementById("month");
	month = dropdown.options[dropdown.selectedIndex].value
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
		lastfm.user.getRecentTracks({user: username, limit: '200', page: 1, to: toDate, from: fromDate}, {success: gotNumTracks, error: failFunction});
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
	document.getElementById("totalTracks").innerHTML = data.recenttracks['@attr'].total;
	
	// check for extra now playing track even though its a list of tracks from last month :-/
	// and remove it from the array FOREVER!
	if (data.recenttracks.track[0] != undefined) {
		if (data.recenttracks.track[0]['@attr'] != undefined) {
			data.recenttracks.track.shift();
		}
	}
	
	try {
		for (var page = 2; page <= numPages; ++page) {
			setTimeout("getRecentTracks(" + page + ")", 200*(page-2));
		}
	} catch (e) {}
	
	gotTracks(data);
}

// a proxy function for delaying all the last.fm api calls
function getRecentTracks(page) {
	lastfm.user.getRecentTracks({user: username, limit: '200', page: page, to: toDate, from: fromDate}, {success: gotTracks, error: failFunction});
}

// got some track info from last.fm lets parse it :)
function gotTracks(data) {
	numTracks += data.recenttracks.track.length;
	document.getElementById("totalUniqueTracks").innerHTML = numTracks;
	
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
		if (aat < bat) return -1;
		if (aat > bat) return 1;
	}
	return ret;
}

function artistSort(a, b) {
	var ret = b.plays - a.plays;
	if (ret == 0) {
		var aat = a.artist.toLowerCase();
		var bat = b.artist.toLowerCase();
		if (aat < bat) return -1;
		if (aat > bat) return 1;
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
	
	document.getElementById("totalUniqueTracks").innerHTML = tracks.length;
	if (numTracks > 0) {
		document.getElementById("songRepetition").innerHTML = (numTracks/tracks.length).toFixed(2);
	}
	
	// generate large artist list .......
	var tempUser = encodeURI(username.replace(/ /g, "+"));
	var tempArtist = "";
	for (var i = 0; i < artists.length && i < 50; ++i) {
		tempArtist = encodeURI(artists[i].artist.replace(/ /g, "+"));
		innerStr += "<tr><td class=\"artist\"><a href=\"http://www.last.fm/music/" + tempArtist + "\">" + artists[i].artist + "</a> <span class=\"plays\"><a href=\"http://www.last.fm/user/" + tempUser + "/library/music/" + tempArtist + "\">(" + artists[i].plays + " plays)</a></span></td></tr>";
	}
	document.getElementById("artistList").innerHTML = innerStr + "</table>";
	
	// generate large track list .......
	var tempTrack = "";
	innerStr = "<table>";
	for (var i = 0; i < tracks.length && i < 50; ++i) {
		tempArtist = encodeURI(tracks[i].artist.replace(/ /g, "+"));
		tempTrack = encodeURI(tracks[i].track.replace(/ /g, "+"));
		
		//<div id="progressBar" class="progressBar" style="background-color:green; width:0%">&nbsp;<span id="progressPercent" style="position:relative; right:-240px;"></span></div>
		innerStr += "<tr><td class=\"track\"><a href=\"http://www.last.fm/music/" + tempArtist + "\">" + tracks[i].artist + "</a> - <a href=\"http://www.last.fm/music/" + tempArtist + "/_/" + tempTrack + "\">" + tracks[i].track + "</a> <span class=\"plays\"><a href=\"http://www.last.fm/user/" + tempUser + "/library/music/" + tempArtist + "\">(" + tracks[i].plays + " plays)</a></span></td></tr>";
		//<div style=\"background-color:#71B7E6; width:" + (tracks[i].plays/tracks[0].plays*500).toFixed(0) + "px;\">&nbsp;<span style=\"position:relative;\">
	}
	document.getElementById("trackList").innerHTML = innerStr + "</table>";
	
	// generate my bb code
	var bbCode = "";
	if (artists[0] != undefined) {
		bbCode += "[url=http://lastfm.nicholasness.com]Monthly Top Artists[/url]\n";
		for (var i = 0; artists[i] != undefined && artists[0].plays == artists[i].plays; ++i) {
			tempArtist = encodeURI(artists[i].artist.replace(/ /g, "+"));
			bbCode += "[b]" + (parseInt(month)+1) + "-" + year.substr(2) + ":[/b] [artist]" + artists[i].artist + "[/artist] [url=http://www.last.fm/user/" + tempUser + "/library/music/" + tempArtist + "](" + artists[i].plays + " plays)[/url]\n";
		}
		bbCode += "[url=http://lastfm.nicholasness.com]Monthly Top Tracks[/url]\n";
		for (var i = 0; tracks[i] != undefined && tracks[0].plays == tracks[i].plays; ++i) {
			bbCode += "[b]" + (parseInt(month)+1) + "-" + year.substr(2) + ":[/b] [artist]" + tracks[i].artist + "[/artist] - [track artist=" + tracks[i].artist + "]" + tracks[i].track + "[/track]\n";
		}
		document.getElementById("bbcode").innerHTML = bbCode;
	
	// generate old bb code (styled from lastfm.heathaze.org)
		bbCode = "";
		bbCode += "[url=http://lastfm.nicholasness.com]Monthly Top Artists[/url]\n";
		for (var i = 0; artists[i] != undefined && artists[0].plays == artists[i].plays; ++i) {
			tempArtist = encodeURI(artists[i].artist.replace(/ /g, "+"));
			bbCode += "[b]" + document.getElementById("month").options[parseInt(month)].innerHTML.substr(0,3) + "-" + year + "[/b]\n[artist]" + artists[i].artist + "[/artist] ([b]" + artists[i].plays + "[/b] plays)\n";
		}
		bbCode += "[url=http://lastfm.nicholasness.com]Monthly Top Tracks[/url]\n";
		for (var i = 0; tracks[i] != undefined && tracks[0].plays == tracks[i].plays; ++i) {
			bbCode += "[b]" + document.getElementById("month").options[parseInt(month)].innerHTML.substr(0,3) + "-" + year + "[/b]\n[artist]" + tracks[i].artist + "[/artist] : [track artist=" + tracks[i].artist + "]" + tracks[i].track + "[/track] ([b]" + tracks[i].plays + "[/b] plays)\n";
		}
		document.getElementById("oldbbcode").innerHTML = bbCode;
	}
	
	document.getElementById("mttMonth").innerHTML = "Monthly Stats For " + document.getElementById("month").options[parseInt(month)].innerHTML;
	
	document.getElementById("trackInfo").style.display = "block";
	$("#progressBack").hide();
	
	isRunning = false;
}

// something went wrong function for all last.fm api calls
function failFunction(code, message) {
	alert("Failed:\nCode: " + code + "\n" + message);
}

function getArtistRecommendations(user) {
	if (isRunning) {
		return;
	}
	isRunning = true;
	
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
	
	
	document.getElementById("arDisplay").style.display = "none";
	$("#progressBack").show();
	
	if (user == null) {
		user = document.getElementById("arUser").value;
	}
	username = user;
	
	var dropdown = document.getElementById("arPeriod");
	var period = dropdown.options[dropdown.selectedIndex].value;
	dropdown = document.getElementById("arLimit");
	numPages = parseInt(dropdown.options[dropdown.selectedIndex].value);
	
	lastfm.user.getTopArtists({user: username, period: period, limit: 200}, {success: gotTopArtists, error: failFunction});
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
		setTimeout("getSimilarArtists(" + i + ")", 200*i+200);
	}
}

function getSimilarArtists(i) {
	lastfm.artist.getSimilar({artist: topArtists[i].name, autocorrect: 1}, {success: gotTopSimilarArtists, error: failFunction});
}

function gotTopSimilarArtists(data) {
	// no similar artists for this one
	if (data.similarartists['@attr'] == undefined) {
		++pagesFinished;
		
		//code for progress bar :)
		var percent = (pagesFinished/numPages*100).toFixed(0) + "%";
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
				uniqueArtists[data.similarartists.artist[i].name] = {artist: data.similarartists.artist[i].name, plays: 1, url: data.similarartists.artist[i].url}; // artist == name && plays == recommendations
			} else {
				++uniqueArtists[data.similarartists.artist[i].name].plays;
			}
		}
	}
	
	++pagesFinished;
	
	//code for progress bar :)
	var percent = (pagesFinished/numPages*100).toFixed(0) + "%";
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
		innerStr += "<tr><td class=\"artist\"><a href=\"http://" + artists[i].url + "\">" + artists[i].artist + "</a> <span class=\"plays\">(" + artists[i].plays + " recommendations)</span></td></tr>";
	}
	document.getElementById("arList").innerHTML = innerStr + "</table>";
	
	$("#arDisplay").show();
	$("#progressBack").hide();
	
	isRunning = false;
}

//testing code: executes grabbing tracks
//getTracks("nick1n");

// event function(s)
$(function() {
	$('.tabs a:last').tab('show');
	
	// sets focus to first textbox
	$("#user").focus();
	
	// sets default selections of the month and year to the current
	var date = new Date();
	var years = $("#year");
	$("#month").val(date.getMonth());
	for (var i = 2005; i <= date.getFullYear(); ++i) {
		$("<option value='" + i + "'>" + i + "</option>").appendTo(years);
	}
	years.val(date.getFullYear());
});
