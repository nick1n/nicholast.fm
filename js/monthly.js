/**
 * Monthly stats
 * by: Nicholas Ness
 */

//(function(window, document, $, Storage, LastFM) {

	'use strict';

	// don't need to init LastFM module at all
	//LastFM();

/* Init the LastFM module */
LastFM({
  api_key : 'f750712ed70caea3272e70e48e1f464e',

  callbacks: {
    fail: failFunction
  }
});


function failFunction() {
	console.log(arguments);
}

/*

	function setYear(number) {
		year = number;
	}

	function setMonth(number) {
		month = number;
	}
*/

function Monthly(year, month) {
		//setYear(year);
		//setMonth(month);


	// TODO: should probably make some of these "constants"
	// anything before this date should probably not be trusted (might not be completely correct)
	var weeklyBegins = 1144584000,
		week = 604800,
		oneSecond = 1000,
		text = '#text',
		attr = '@attr',

		firstWeek,
		weeklyFroms = [],
		weeklyFromsLength,

		//year,
		//month,
		date,
		fromDate,
		toDate,

		now = Date.now() / oneSecond,
		requests = 0,
		i = 0;


	// Find the from and to dates
	// need to fix this only works when you are in the same timezone as the scrobbling was
	date = new Date(year, month, 1);
	fromDate = date / oneSecond;
	date.setMonth(month + 1);
	toDate = date / oneSecond;


	// first week from date
	firstWeek = weeklyBegins + Math.ceil((fromDate - weeklyBegins) / week) * week;

	for (; firstWeek + week <= now && firstWeek + week <= toDate; firstWeek += week) {

		// if this week falls before correct last.fm weekly charts, skip it
		if (firstWeek < weeklyBegins) {
			continue;
		}

		weeklyFroms.push(firstWeek);
	}

	weeklyFromsLength = weeklyFroms.length;

	for (; i < weeklyFromsLength; ++i) {
		// get weekly tracks:
		getWeeklyTrackChart(weeklyFroms[i]);
	}

	// get the in between weekly tracks for a month
	if (weeklyFromsLength > 0) {

		// beginning of the month
		if (weeklyFroms[0] - fromDate > 0) {
			getRecentTracks(1, fromDate, weeklyFroms[0]);
		}

		// ending of the month
		if (toDate - weeklyFroms[weeklyFromsLength - 1] - week > 0) {
			getRecentTracks(1, weeklyFroms[weeklyFromsLength - 1] + week, toDate);
		}

	// or if there are no weekly tracks to get, just get all recent tracks for the month then
	} else {
		getRecentTracks(1, fromDate, toDate);
	}



	function getRecentTracks(page, from, to) {
		++requests;

		// cache recent tracks only when it falls before now
		LastFM('user.getRecentTracks', {
			user: username,
			limit: '200',
			page: page,
			from: from - 1, // subtract one second from all getRecentTracks requests, because I believe its more accurate, since its exclusive.
			to: to
		}, now > to).done(gotRecentTracks(page, from, to));
	}

	function gotRecentTracks(page, from, to) {
		return function(data) {
			var tracks,
				index = 0;

			console.log(page, from, to, data);

			// if '@attr' is missing means no data was returned for this request
			if (!data.recenttracks[attr]) {
				finished();
				return;
			}

			tracks = data.recenttracks.track;

			// if its the first page and there are more to get, get them all
			if (page == 1) {
				for (++page; page <= data.recenttracks[attr].totalPages; ++page) {
					getRecentTracks(page, from, to);
				}

				// check for extra now playing track even when its tracks from months or years ago
				// and remove it from the array
				if (tracks[0] && tracks[0][attr]) {
					tracks.shift();
				}
			}

			for (; index < tracks.length; ++index) {
				// TODO: do something with tracks[index]
				var artist = tracks[index].artist[text];
				var album = tracks[index].album[text];
				var track = tracks[index].name;

				/*
				User.year(2013)
					.month(8)
					.artist(artist)
					.album(album)
					.track(track)
					.play(1);
				
				// the Storage module should take care of this:
				Names.add(artist);
				Names.add(album);
				Names.add(track);

				var track_id = Track.add(artist, album, track);

				User.add(track_id).toYear(year).andMonth(month).forUser(username);

				Storage.add(artist, album, track, 1);

				*/
			}

			finished();
		};
	}


	function getWeeklyTrackChart(from) {
		++requests;

		// always cache weekly tracks, because it should never change
		LastFM('user.getWeeklyTrackChart', {
			user: username,
			from: from
		}, true).done(gotWeeklyTrackChart(from));
	}

	function gotWeeklyTrackChart(from) {
		return function(data) {
			var tracks,
				index = 0;

			console.log(from, data);

			// if '@attr' is missing means no data was returned for this request
			if (!data.weeklytrackchart[attr]) {
				finished();
				return;
			}

			tracks = data.weeklytrackchart.track;

			// I'm pretty sure the weekly track chart gets cut off at 500 unique tracks,
			// If so, redo this week by getting the recent tracks for it.
			if (tracks.length == 500) {
				getRecentTracks(1, from, from + week);
				finished();
				return;
			}

			for (; index < tracks.length; ++index) {
				// TODO: do something with tracks[index]
			}

			finished();
		};
	}


	function finished() {
		if (!--requests) {
			console.log('finished');

			// TODO: do something, maybe save it all back to localStorage or something...
			/*
			Storage.saveAll();
			*/
		}
	}


}




//})(window, document, jQuery, Storage, LastFM);
