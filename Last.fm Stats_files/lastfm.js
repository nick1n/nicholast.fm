/*
 * Last.fm stats
 * Author: Nicholas Ness
 */


if (console == undefined) { var console = { log: function(val) {} }; }

/* Create a LastFM object */
var lastfm = new LastFM({});


var username = "";

var numTracks = 0;
var innerStr = "<table>";
var pagesFinished = 0;
var numPages = 0;
var fromDate = 0;
var toDate = 0;
var uniqueTracks = {};
var uniqueArtists = {};
var topArtists = {};
var year = 0;
var month = 0;
var isRunning = false;

/////////////////////// User's Monthly Top Tracks Code //////////////////

// starting function, the function that lets all last.fm hell break loose.
function getTracks(user) {
	if (isRunning) {
		return;
	}
	isRunning = true;
	console.log("getTracks:");
	
	if (user == null) {
		user = document.getElementById("user").value;
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
	document.getElementById("progressBar").style.width = "0%";
	document.getElementById("progressPercent").innerHTML = "0%";
	
	
	document.getElementById("trackInfo").style.display = "none";
	document.getElementById("progressBack").style.display = "block";
	
	lastfm.user.getRecentTracks({user: username, limit: 1}, {success: getTimeZone, error: failFunction});
	console.log(":getTracks");
}

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
	var dropdown = document.getElementById("year");
	year = dropdown.options[dropdown.selectedIndex].value;
	date.setFullYear(year);
	dropdown = document.getElementById("month");
	month = dropdown.options[dropdown.selectedIndex].value;
	date.setMonth(month);
	date.setDate(1);
	date.setHours(0);
	date.setMinutes(0);
	date.setSeconds(0);
	date.setMilliseconds(0);
	fromDate = (date.getTime()-offset)/1000;
	date.setMonth(date.getMonth()+1);
	toDate = (date.getTime()-offset)/1000;
	
	lastfm.user.getRecentTracks({user: username, limit: '200', to: toDate, from: fromDate}, {success: gotNumTracks, error: failFunction});
	console.log(":getTimeZone");
}

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
	document.getElementById("totalTracks").innerHTML = data.recenttracks['@attr'].total;
	
	// if they have over 10000 in one month they are doing something wrong
	if (data.recenttracks['@attr'].total > 10000) {
		alert("Fuck that!\nI don't support people who abuse last.fm");
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
	
	for (var page = 2; page <= numPages; ++page) {
		setTimeout("getRecentTracks(" + page + ")", 200*page);
	}

	gotTracks(data);
	console.log(":gotNumTracks");
}

// a proxy function for delaying all the last.fm api calls
function getRecentTracks(page) {
	lastfm.user.getRecentTracks({user: username, limit: '200', page: page, to: toDate, from: fromDate}, {success: gotTracks, error: failFunction});
}

// got some track info from last.fm lets parse it :)
function gotTracks(data) {
	/* Use data. */
	console.log("gotTracks:");
	console.log(data);
	
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
	document.getElementById("progressBar").style.width =  percent;
	document.getElementById("progressPercent").innerHTML = percent;
	
	// this is our last page so let's finish this
	if (pagesFinished >= numPages) {
		finished();
	}
	console.log(":gotTracks");
}

// sorts it by number of plays descending and if the plays are the same
// sorts it by artist and track names ascending
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
	
	
	document.getElementById("trackInfo").style.display = "block";
	document.getElementById("progressBack").style.display = "none";
	
	isRunning = false;
	console.log(":finished");
}

// something went wrong function for all last.fm api calls
function failFunction(code, message) {
	alert("fail'd :(\nCode: " + code + "\n" + message);
}

//testing code: executes grabbing tracks
//getTracks("nick1n");

//////////////// Artist Recommendations Code /////////////////
// thinking of advance tuning such as:
// auto correct on/off
// recommendation ... match ... cut off ... ? 0-1
// user's top artists' ... plays ... cut off ... ? ... 20 ... 100 ?

var recommendedArtists = [];
var arSortColumn = 'M';

function getArtistRecommendations(user) {
	if (isRunning) {
		return;
	}
	isRunning = true;
	console.log("getArtistRecommendations:");
	
	/*
	numTracks = 0;
	year = 0;
	month = 0;
	*/
	numPages = 0; // num of user's top artists
	uniqueTracks = {}; // user's top artists
	uniqueArtists = {}; // recommended artists
	topArtists = {};
	pagesFinished = 0;
	
	document.getElementById("progressBar").style.width = "0%";
	document.getElementById("progressPercent").innerHTML = "0%";
	
	
	document.getElementById("arDisplay").style.display = "none";
	document.getElementById("progressBack").style.display = "block";
	
	if (user == null) {
		user = document.getElementById("arUser").value;
	}
	username = user;
	
	var dropdown = document.getElementById("arPeriod");
	var period = dropdown.options[dropdown.selectedIndex].value;
	dropdown = document.getElementById("arLimit");
	numPages = parseInt(dropdown.options[dropdown.selectedIndex].value);
	
	lastfm.user.getTopArtists({user: username, period: period, limit: 200}, {success: gotTopArtists, error: failFunction});
	console.log(":getArtistRecommendations");
}

function gotTopArtists(data) {
	console.log("gotTopArtists:");
	console.log(data);
	if (data.topartists['@attr'] == undefined) {
		innerStr += "No Data";
		arFinished();
		console.log(":gotTopArtists");
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
	
	console.log(":gotTopArtists");
}

function getSimilarArtists(i) {
	lastfm.artist.getSimilar({artist: topArtists[i].name, autocorrect: 1}, {success: gotTopSimilarArtists, error: failFunction});
}

function gotTopSimilarArtists(data) {
	console.log("gotTopSimilarArtists:");
	console.log(data);
	
	// no similar artists for this one
	if (data.similarartists['@attr'] == undefined) {
		++pagesFinished;
		
		//code for progress bar :)
		var percent = (pagesFinished/numPages*100).toFixed(0) + "%";
		document.getElementById("progressBar").style.width =  percent;
		document.getElementById("progressPercent").innerHTML = percent;
		
		// this is our last page so let's finish this
		if (pagesFinished >= numPages) {
			arFinished();
		}
		console.log(":gotTopSimilarArtists");
		return;
	}
	
	// for each similar artist
	for (var i = 0; i < data.similarartists.artist.length; ++i) {
		// look for the artist in the user's top artists
		if (uniqueTracks[data.similarartists.artist[i].name] == undefined) {
			// if not in it, look for it in the list of recommended artist
			if (uniqueArtists[data.similarartists.artist[i].name] == undefined) {
				// if not in it add that artist to it and add one recommendation
				uniqueArtists[data.similarartists.artist[i].name] = {artist: data.similarartists.artist[i].name, recommendations: 1, match: parseFloat(data.similarartists.artist[i].match), url: data.similarartists.artist[i].url};
			} else {
				++uniqueArtists[data.similarartists.artist[i].name].recommendations;
				uniqueArtists[data.similarartists.artist[i].name].match += parseFloat(data.similarartists.artist[i].match);
			}
		}
	}
	
	++pagesFinished;
	
	//code for progress bar :)
	var percent = (pagesFinished/numPages*100).toFixed(0) + "%";
	document.getElementById("progressBar").style.width =  percent;
	document.getElementById("progressPercent").innerHTML = percent;
	
	// this is our last page so let's finish this
	if (pagesFinished >= numPages) {
		arFinished();
	}
	console.log(":gotTopSimilarArtists");
}

function arFinished() {
	console.log("arFinished:");
	console.log(uniqueTracks);
	console.log(uniqueArtists);
	
	recommendedArtists = [];
	for (var artist in uniqueArtists) {
		recommendedArtists.push(uniqueArtists[artist]);
	}
	
	arOnClick('M');
	
	document.getElementById("arDisplay").style.display = "block";
	document.getElementById("progressBack").style.display = "none";
	
	isRunning = false;
	console.log(":arFinished");
}

function arSort(a, b) {
	var ret = 0;
	if (arSortColumn == 'R') {
		ret = b.recommendations - a.recommendations;
		if (ret == 0) {
			ret = b.match - a.match;
		}
	} else if (arSortColumn == 'M') {
		ret = b.match - a.match;
	}
	if (ret == 0) {
		var aat = a.artist.toLowerCase();
		var bat = b.artist.toLowerCase();
		if (aat < bat) return -1;
		if (aat > bat) return 1;
	}
	return ret;
}

function arOnClick(col) {
	console.log("arOnClick:");
	console.log(col);
	arSortColumn = col;
	
	recommendedArtists.sort(arSort);
	
	innerStr = "<table><tr><td onClick=\"arOnClick('A');\"><b>Artist</b></td><td onClick=\"arOnClick('M');\"><b>Match</b></td><td onClick=\"arOnClick('R');\"><b>Recommendations</b></td></tr>";
	for (var i = 0; i < recommendedArtists.length && i < 50; ++i) {
		innerStr += "<tr><td class=\"artist\"><a href=\"http://" + recommendedArtists[i].url + "\">" + recommendedArtists[i].artist + "</a></td> <td class=\"plays\">" + recommendedArtists[i].match.toFixed(2) + "</td> <td class=\"plays\">" + recommendedArtists[i].recommendations + "</td></tr>";
	}
	document.getElementById("arList").innerHTML = innerStr + "</table>";
		
	console.log(":arOnClick");
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
	console.log("getTrackRecommendations:");
	
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
	
	document.getElementById("progressBar").style.width = "0%";
	document.getElementById("progressPercent").innerHTML = "0%";
	
	
	document.getElementById("arDisplay").style.display = "none";
	document.getElementById("progressBack").style.display = "block";
	
	if (user == null) {
		user = document.getElementById("trUser").value;
	}
	username = user;
	
	var dropdown = document.getElementById("trPeriod");
	var period = dropdown.options[dropdown.selectedIndex].value;
	dropdown = document.getElementById("trLimit");
	numPages = parseInt(dropdown.options[dropdown.selectedIndex].value);
	
	lastfm.user.getTopTracks({user: username, period: period, limit: 400}, {success: gotTopTracks, error: failFunction});
	console.log(":getTrackRecommendations");
}

function gotTopTracks(data) {
	console.log("gotTopTracks:");
	console.log(data);
	if (data.toptracks['@attr'] == undefined) {
		innerStr += "No Data";
		arFinished();
		console.log(":gotTopTracks");
		return;
	}
	
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
	
	console.log(":gotTopTracks");
}

function getSimilarTracks(i) {
	lastfm.track.getSimilar({artist: topArtists[i].artist.name, track: topArtists[i].name, autocorrect: 1}, {success: gotTopSimilarTracks, error: failFunction});
}

function gotTopSimilarTracks(data) {
	console.log("gotTopSimilarTracks:");
	console.log(data);
	
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
	document.getElementById("progressBar").style.width =  percent;
	document.getElementById("progressPercent").innerHTML = percent;
	
	// this is our last page so let's finish this
	if (pagesFinished >= numPages) {
		trFinished();
	}
	console.log(":gotTopSimilarTracks");
}


function trFinished() {
	console.log("trFinished:");
	console.log(uniqueTracks);
	console.log(uniqueArtists);
	
	recommendedTracks = [];
	for (var artist in uniqueArtists) {
		recommendedTracks.push(uniqueArtists[artist]);
	}
	
	trOnClick('M');
	
	document.getElementById("trDisplay").style.display = "block";
	document.getElementById("progressBack").style.display = "none";
	
	isRunning = false;
	console.log(":trFinished");
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
	console.log("trOnClick:");
	console.log(col);
	trSortColumn = col;
	
	recommendedTracks.sort(trSort);
	
	innerStr = "<table><tr><td onClick=\"trOnClick('A');\"><b>Artist</b></td><td onClick=\"trOnClick('M');\"><b>Match</b></td><td onClick=\"trOnClick('R');\"><b>Recommendations</b></td></tr>";
	for (var i = 0; i < recommendedTracks.length && i < 50; ++i) {
		innerStr += "<tr><td class=\"artist\"><a href=\"http://" + recommendedTracks[i].artisturl + "\">" + recommendedTracks[i].artist + "</a> - <a href=\"http://" + recommendedTracks[i].trackurl + "\">" + recommendedTracks[i].track + "</a></td> <td class=\"plays\">" + recommendedTracks[i].match.toFixed(2) + "</td> <td class=\"plays\">" + recommendedTracks[i].recommendations + "</td></tr>";
	}
	document.getElementById("trList").innerHTML = innerStr + "</table>";
		
	console.log(":trOnClick");
}

///////////////////////// Get User's Scrobbled Tracks //////////////////////
// Get's all of the user's tracks the fastest way that I know of (for now)
//
// 1. Get the user's weekly top tracks for a month
// 2. If one or more of the week's top tracks reach 500 tracks
//		(this max number can change and has in the past, depending on how restricting last.fm wants to be)
// 3. Then get the user's recent tracks listening for that week
// 4. And while doing all this make sure to stay within the month
//
// really only useful for getting tracks for a month or for a year not overall
// for overall probably fastest is get the user's toptracks to the max
//
// Fastest way to get total unique tracks:
//	user.gettoptracks({user: 'nick1n', limit: 1});
//	and read the total :)
//

function getAllTracks(user) {
	if (isRunning) {
		return;
	}
	isRunning = true;
	console.log("getAllTracks:");
	
	if (user == null) {
		user = document.getElementById("user").value;
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
	document.getElementById("progressBar").style.width = "0%";
	document.getElementById("progressPercent").innerHTML = "0%";
	
	
	document.getElementById("trackInfo").style.display = "none";
	document.getElementById("progressBack").style.display = "block";
	
	lastfm.user.getWeeklyChartList({user: username}, {success: getWeeklyTopTracks, error: failFunction});
	console.log(":getAllTracks");
}

function getWeeklyTopTracks(data) {
	console.log("getWeeklyTopTracks:");
	console.log(data);
	
	
	
	console.log(":getWeeklyTopTracks");
}

function getTracksForWeek(start, end) {
	console.log("getTracksForWeek:");
	console.log(start);
	console.log(end);
	
	
	console.log(":getTracksForWeek");
}