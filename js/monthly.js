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
	var oneSecond = 1000,
		text = '#text',
		attr = '@attr',

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

	getRecentTracks(1, fromDate, toDate);



	function getRecentTracks(page, from, to) {
		++requests;

		// cache recent tracks only when it falls before now
		LastFM('user.getRecentTracks', {
			user: user,
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
				storeTrack(tracks[index]);
			}

			finished();
		};
	}

	function storeTrack(track) {

		// artist.name when its extended data and artist[text] when not
		var artist = track.artist.name;
		var album = track.album[text];
		var song = track.name;

		var artistImages = track.artist.image;
		var albumImages = track.image;

		// Store Images, the Storage module might handle this in the future
		ArtistImages.addImages(artistImages);
		AlbumImages.addImages(albumImages);

		// Since I haven't figured out how to go about this with the Storage module
		// let's just to it manually for now...

		// Get the ids
		//artist = Names.add(artist);
		//album = Names.add(album);
		//track = Names.add(track);

		Store.user(user).add({
			year: year,
			month: month,
			artist: artist,
			album: album,
			track: song
		});

		// Get Unique Track Id
		//track = Tracks.addUnique(artist, album, track);



		// TODO: do something with track
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

		User.add(track_id).toYear(year).andMonth(month).forUser(user);

		Storage.add(artist, album, track, 1);

		Storage.add({
			user: user,
			year: year,
			month: month,
			artist: artist,
			album: album,
			song: track,
			plays: 1
		});

		*/

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
