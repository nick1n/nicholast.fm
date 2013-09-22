/*
 * My Storage adapter for localStorage
 * by: Nicholas Ness
 */

//(function($) {

'use strict';

var storage = localStorage,
	version = 'v',
	//names = 'n',
	//tracks = 't',
	date = 'd',

	comma = ',',
	pipe = '|',
	colon = ':',
	semicolon = ';',
	newline = '\n',

	//currentVersion = 0,
	//compress,



	//function Storage() {

	//}

	extend = function(parent, child) {
		return $.extend({}, parent, child);
	};

// By the way, none of these functions are safe...

// Storage parent class
var Storage = {

	//key: ''

	string: {},
	number: [],

	lookup: function(key) {
		return this[typeof key][key];
	},

	//add: function() {}

	save: function() {
		storage[this.key] = this._compress();
	}

	//_compress: function() {}

	//_decompress: function() {}

};

// Names child class of Storage
var Names = extend(Storage, {

	// Private
	/**
	 * fast lookup by value
	 * example: {"Fall Out Boy": 0, "Infinity On High": 1, "Thriller": 2, "Blah Blah": 3, "Third Song From Same Album": 4}
	 */
	//string: {},

	// Private
	/**
	 * fast lookup by index
	 * example: ["Fall Out Boy", "Infinity On High", "Thriller", "Blah Blah", "Third Song From Same Album"]
	 */
	//number: [],

	// Public
	//lookup: function( key ) {
	//	return this[ typeof key ];
	//},

	key: 'n',

	// Public
	add: function(name) {

		// adds {"Fall Out Boy": 0, ...}
		this.string[name] = this.number.length;

		// adds ["Fall Out Boy", ...]
		this.number.push(name);

	},

	//save: function() {
	//	storage[ names ] = this.compress();
	//},

	// "Private"
	// compresses to 'Fall Out Boy\nInfinity On High\nThriller\nBlah Blah\nThird Song Same Album'
	// '||' represents '|'
	_compress: function() {
		// just need to join the array with new lines
		return array.join(newline);
	},

	// Private
	// decompresses 'Fall Out Boy\nInfinity On High\nThriller\Blah Blah\nThird Song Same Album' to usable data
	_decompress: function(text) {
		var index = 0,

			// just a temporary array, split the input text if there is input text
			array = text && text.split(newline) || [];

		this.string = {};
		this.number = [];

		for (; index < array.length; ++index) {

			// creates {"Fall Out Boy": 0, ...}
			this.string[array[index]] = this.number.length;

			// creates ["Fall Out Boy", ...]
			this.number.push(array[index]);

		};

	}

});



// Tracks child class of Storage
var Tracks = extend(Storage, {

	// Private
	/**
	 * fast lookup by value
	 * example: {"0,1,2": 0, "0,1,3": 1, "0,1,4": 2}
	 */
	//string: {},

	// Private
	/**
	 * fast lookup by index
	 * example: [[0, 1, 2], [0, 1, 3], [0, 1, 4]]
	 */
	//number: [],

	// Public
	//lookup: function( key ) {
	//	return this[ typeof key ];
	//},

	key: 't',

	// Public
	artist: function(key) {
		return this.lookup(key)[0];
	},

	// Public
	// track is an array of three name indices
	// [0,1,2]
	add: function(track) {

		// adds {"0,1,2": 0, ...}
		this.string[track.join(comma)] = this.number.length;

		// adds [[0, 1, 2], ...]
		this.number.push(track);

		// should we always save...?

	},

	// Public
	// track is a comma delimited string of three names
	// this function is probably a bad idea to have...
	addString: function(track) {

		// adds {"0,1,2": 0, ...}
		this.string[track] = this.number.length;

		// adds [[0, 1, 2], ...]
		this.number.push(track.split(comma));

	},

	//save: function() {
	//	storage[ tracks ] = this.compress();
	//},

	// "Private"
	// compresses to '0,1,2|0,1,3|0,1,4'
	_compress: function() {
		var trackIndex,
			nameIndex,

			// just a temporary array
			array = [];

		for (trackIndex in this.number) {

			array[trackIndex] = [];

			for (nameIndex in this.number[trackIndex]) {

				array[trackIndex][nameIndex] = compressNumber(this.number[trackIndex][nameIndex]);

			};

		};

		return compressArray(array);
	},

	// Private
	// decompresses '0,1,2|0,1,3|0,1,4' to usable data
	_decompress: function(text) {
		var trackIndex,

			// just a temporary array, split the input text if there is input text
			array = text && decompressArray(text);

		this.string = {};
		this.number = [];

		for (trackIndex in array) {

			// creates {"0,1,2": 0, ...}
			this.string[array[trackIndex]] = this.number.length;

			// creates [[0, 1, 2], ...]
			this.number.push(array[trackIndex].split(comma));

		};

	}

});

// User class
var User = {

	// User's name
	name: '',

	stats: {},

	save: function() {
		storage[this.name] = this._compress();
	},

	// "Private"
	// compresses "{12:{10:{123:4,124:3,132:1},11:{122:5,132:6}},13:{0:{123:4,124:3,132:1},1:{122:5,132:6}}}"
	//         to "c|a;3f:4,3g:3,3o;b;3e:5,3o:6|d|0;3f:4,3g:3,3o;1;3e:5,3o:6"
	_compress: function() {
		var year,
			month,
			track,

			array = [],
			monthArray,
			trackArray,

			text,
			stats = this.stats;

		for (year in stats) {

			// adds year to the array
			array.push(compressNumber(year));

			monthArray = [];
			for (month in stats[year]) {

				// adds the month to the array
				monthArray.push(compressNumber(month));

				trackArray = [];
				for (track in stats[year][month]) {

					// adds the track and plays to the array, e.g. '123:4'
					if (stats[year][month][track] > 1) {
						trackArray.push(compressNumber(track) + colon + compressNumber(stats[year][month][track]));

						// adds the track to the array, e.g. '123'
					} else {
						trackArray.push(compressNumber(track));
					}

				}

				// adds the combined tracks and plays to the array, e.g. '123:4,124:3,132;11;122:5,132:6'
				monthArray.push(trackArray.join(comma));

			}

			// adds the combined month and tracks to the array, e.g. 10;123:4,124:3,132;11;122:5,132:6
			array.push(monthArray.join(semicolon));
		}

		// returns the compressed stats
		return array.join(pipe);
	},

	// Private
	// decompresses 'c|a;3f:4,3g:3,3o;b;3e:5,3o:6|d|0;3f:4,3g:3,3o;1;3e:5,3o:6' to usable data
	_decompress: function(text) {
		// Now turn it back into an object
		var index,
			month,
			track,
			plays,

			obj = {},

			// seperate the years
			array = text.split(pipe);

		// decompress the years
		for (index = 0; index < array.length; ++index) {
			obj[decompressNumber(array[index])] = array[++index];
		}

		// decompress the months
		for (index in obj) {

			// seperate the months
			array = obj[index].split(semicolon); // might change this symbol

			obj[index] = {};
			for (month = 0; month < array.length; ++month) {
				obj[index][decompressNumber(array[month])] = array[++month];
			}

		}

		// decompress the tracks
		for (index in obj) {
			for (month in obj[index]) {

				// seperate the tracks
				array = obj[index][month].split(comma);

				obj[index][month] = {};
				for (track in array) {

					// seperate the track and the plays
					plays = array[track].split(colon);

					if (plays.length > 1) {
						obj[index][month][decompressNumber(plays[0])] = decompressNumber(plays[1]);
					} else {
						obj[index][month][decompressNumber(plays[0])] = 1;
					}
				}
			}
		}

		this.stats = obj;
	}

};

function lookup(key) {

}

/////////////////////////////////

/**
 * Compresses an array by joining them
 */

function compressArray(array) {
	//return array.join( delimiter[ typeof array[0] ] );
	return array.join(pipe);
}

function decompressArray(text) {
	//return text.split( delimiter[ typeof array[0] ] );
	return text.split(pipe);
}

/////////////////////////////////

/**
 * Compresses a date by removing unneeded digits and compresses that number
 */

function compressDate(date) {
	return compressNumber(+(date + '').substr(1, 7));
}

/**
 * Decompresses a date by decompressing the number and adding the removed digits back
 */

function decompressDate(text) {
	return +('1' + decompressNumber(text) + '00000');
}

////////////////////////////////

/**
 * Compresses a number into a string using radix
 */

function compressNumber(number, radix) {
	return (+number).toString(radix || 36);
}

/**
 * Decompresses a string into a number using radix
 */

function decompressNumber(text, radix) {
	return parseInt(text, radix || 36);
}


////////////////////////////////////////////////////////////////////////////////////////////////////


/**
 * Returns wether or not the username is in storage
 */

function username(name) {
	var key;

	for (key in storage) {
		if (key === name) {
			return true;
		}
	}

	return false;
}

/**
 * Returns an array of usernames
 * Usernames are defined by a key in storage longer then 1 character
 */

function usernames() {
	var key,
		arrayOfUserames;

	for (key in storage) {
		if (key.length > 1) {
			arrayOfUserames.push(key);
		}
	}

	return arrayOfUserames;
}


// Radix 64 encode numbers
// by Reb.Cabin
// at http://stackoverflow.com/questions/6213227/fastest-way-to-convert-a-number-to-radix-64-in-javascript#answers
var Radix64 = {

	_Rixits:
//   0       8       16      24      32      40      48      56     63
//   v       v       v       v       v       v       v       v      v
	"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+/",

	// You have the freedom, here, to choose the glyphs you want for
	// representing your base-64 numbers. The ASCII encoding guys usually
	// choose a set of glyphs beginning with ABCD..., but, looking at
	// your update #2, I deduce that you want glyphs beginning with
	// 0123..., which is a fine choice and aligns the first ten numbers
	// in base 64 with the first ten numbers in decimal.

	// This cannot handle negative numbers and only works on the
	//     integer part, discarding the fractional part.
	// Doing better means deciding on whether you're just representing
	// the subset of javascript numbers of twos-complement 32-bit integers
	// or going with base-64 representations for the bit pattern of the
	// underlying IEEE floating-point number, or representing the mantissae
	// and exponents separately, or some other possibility. For now, bail
	fromNumber: function(number) {

		if (isNaN(Number(number)) || number === null || number === Number.POSITIVE_INFINITY) {
			throw "The input is not valid";
		}

		if (number < 0) {
			throw "Can't represent negative numbers now";
		}

		var rixit; // like 'digit', only in some non-decimal radix
		var residual = Math.floor(number);
		var result = '';

		while (true) {
			rixit = residual % 64

			result = this._Rixits.charAt(rixit) + result;

			residual = Math.floor(residual / 64);

			if (residual == 0) {
				break;
			}
		}

		return result;
	},

	toNumber: function(rixits) {
		var result = 0;

		rixits = rixits.split('');

		for (e in rixits) {
			result = (result * 64) + this._Rixits.indexOf(rixits[e]);
		}

		return result;
	}
}

//})(window.jQuery);
