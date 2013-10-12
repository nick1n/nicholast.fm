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

function Monthly(username, year, month, refresh) {
		//setYear(year);
		//setMonth(month);


	// TODO: should probably make some of these "constants"
	var oneSecond = 1000,
		text = '#text',
		attr = '@attr',

		options = {
			year: year,
			month: month
		},

		//year,
		//month,
		date,
		fromDate,
		toDate,
		data,

		now = Date.now() / oneSecond,
		requests = 0,
		i = 0;


	// retrieve the user's data from storage if there is any
	data = Storage.user(username).get(options);

	if (data && !refresh) {
		// TODO: render data
		return;
	}

	// reset the user's stats for this month
	Storage.user(username).clear(options);

	// Find the from and to dates
	// need to fix this only works when you are in the same timezone as the scrobbling was
	date = new Date(year, month, 1);
	fromDate = date / oneSecond;
	date.setMonth(month + 1);
	toDate = date / oneSecond;

	getRecentTracks(1, fromDate, toDate);



	function getRecentTracks(page, from, to) {
		++requests;

		// cache recent tracks only when it falls before now
		LastFM('user.getRecentTracks', {
			user: username,
			limit: '200',
			page: page,
			extended: 1,
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

			// if its the first page
			// check for extra now playing track even when its tracks from months or years ago
			// and remove it from the array
			if (page == 1 && tracks[0] && tracks[0][attr]) {
				tracks.shift();
			}

			// if there are more pages to get, get the next one
			if (page < data.recenttracks[attr].totalPages) {
				getRecentTracks(++page, from, to);
			}

			// store all tracks
			for (; index < tracks.length; ++index) {
				storeTrack(tracks[index]);
			}

			finished();
		};
	}

	function storeTrack(track) {
		var artistImages = track.artist.image,
			albumImages = track.image;

		// artist.name when its extended data and artist[text] when not
		options.artist = track.artist.name;
		options.album = track.album[text];
		options.track = track.name;

		// Store Images, the Storage module might handle this in the future
		ArtistImages.addImages(options.artist, artistImages);
		AlbumImages.addImages(options.album, albumImages);

		Storage.user(username).add(options);

	}

	function finished() {
		if (!--requests) {
			console.log('finished');

			// TODO: do something, maybe save it all back to localStorage or something...
			Storage.user(username).save();
		}
	}


}




//})(window, document, jQuery, Storage, LastFM);
