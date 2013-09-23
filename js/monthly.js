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


	// these numbers are in seconds, javascript uses milliseconds
	//var beginnings = [1108296002, 1108900801, 1109505601, 1110110401, 1110715201, 1111320001, 1111924801, 1112529601, 1113134400, 1113739202, 1114344001, 1114965332, 1115553600, 1116158400, 1116759602, 1117364401, 1117969201, 1118577601, 1119182401, 1119787202, 1120392002, 1120996803, 1121601602, 1122206401, 1122811201, 1123416004, 1124020801, 1124625601, 1125230401, 1125835201, 1126440001, 1127044802, 1127649601, 1128254402, 1128859201, 1129464001, 1130068802, 1130673602, 1131278402, 1131883201, 1132488002, 1133092801, 1133697601, 1134302403, 1134907202, 1135512002, 1136116801, 1136721601, 1137326402, 1137931202, 1138536002, 1139140801, 1139745601, 1140350401, 1140955203, 1141560002, 1142164802, 1142769602, 1143374402, 1143979202, 1144584000],

	// anything before this should probably not be trusted (might not be completely correct)
	var weeklyBegins = 1144584000,
		week = 604800,
		oneSecond = 1000,
		firstWeek,
		weeklyFroms = [],
		weeklyFromsLength,
		//year,
		//month,
		date,
		fromDate,
		toDate,
		requests = 0,
		i;


	// Find the from and to dates
	// need to fix this only works when you are in the same timezone as the scrobbling was
	date = new Date(year, month, 1);
	fromDate = date / oneSecond - 1;
	date.setMonth(month + 1);
	toDate = date / oneSecond;


	// first week from date
	firstWeek = weeklyBegins + Math.ceil((fromDate - weeklyBegins) / week) * week;

	while (firstWeek + week <= Date.now() / oneSecond && firstWeek + week <= toDate) {

		// if this week falls before correct last.fm weekly charts, skip it
		if (firstWeek < weeklyBegins) {
			continue;
		}

		weeklyFroms.push(firstWeek);
		firstWeek += week;
	}

	weeklyFromsLength = weeklyFroms.length;

	for (i = 0; i < weeklyFromsLength; ++i) {
		// get weekly tracks:
		getWeeklyTrackChart(weeklyFroms[i]);
	}


	// fixing utc times for last.fm, converting them from being in milliseconds to seconds
	//fromDate /= oneSecond;
	//toDate /= oneSecond;


	if (weeklyFromsLength > 0) {

		if (weeklyFroms[0] - fromDate > 0) {

			getRecentTracks(1, fromDate, weeklyFroms[0]);

		}

		if (toDate - weeklyFroms[weeklyFromsLength - 1] - week > 0) {

			getRecentTracks(1, weeklyFroms[weeklyFromsLength - 1] + week, toDate);

		}

	} else {

		getRecentTracks(1, fromDate, toDate);

	}



	function getRecentTracks(page, from, to) {
		++requests;

		LastFM('user.getRecentTracks', {
			user: username,
			limit: '200',
			page: page,
			from: from,
			to: to
		}).done(gotRecentTracks(page, from, to));
	}

	function gotRecentTracks(page, from, to) {
		return function(data) {
			var totalPages,
				i;

			console.log(page, from, to, data);

			// if '@attr' is missing means no data was returned for this request
			if (!data.recenttracks['@attr']) {
				finished();
				return;
			}

			// if its the first page and there are more to get, get them all
			totalPages = +data.recenttracks['@attr'].totalPages;
			for (++page; page < totalPages && page == 1; ++page) {
				getRecentTracks(page, from, to);
			}

			// TODO: go through tracks

			finished();
		};
	}


	function getWeeklyTrackChart(from) {
		++requests;

		LastFM('user.getweeklytrackchart', {
			user: username,
			from: from
		}).done(gotWeeklyTrackChart(from));
	}

	function gotWeeklyTrackChart(from) {
		return function(data) {
			console.log(from, data);

			// if '@attr' is missing means no data was returned for this request
			if (!data.weeklytrackchart['@attr']) {
				finished();
				return;
			}

			// I believe the weekly track chart get cut off at 500 unique tracks,
			// If so, redo this week by getting the recent tracks for it.
			if (data.weeklytrackchart.track.length == 500) {
				getRecentTracks(1, from, from + week);
			}

			// TODO: go through tracks

			finished();
		};
	}


	function finished() {
		if (!--requests) {
			console.log('finished');
		}
	}


}




//})(window, document, jQuery, Storage, LastFM);