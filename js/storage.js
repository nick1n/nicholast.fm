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

	blank = '',
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

	//add: function() {}

	load: function() {
		this._decompress(localStorage[this.key]);
	},

	save: function() {
		storage[this.key] = this._compress();
	}


	//_compress: function() {}

	//_decompress: function() {}

};

var Data = extend(Storage, {

	string: {},
	number: [],

	lookup: function(key) {
		return this[typeof key][key];
	}

});

// Names child class of Storage
var Names = extend(Data, {

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
var Tracks = extend(Data, {

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

		for (trackIndex = 0; trackIndex < this.number.length; ++trackIndex) {

			for (nameIndex = 0; nameIndex < this.number[trackIndex].length; ++nameIndex) {

				array.push(Radix.fromNumber(this.number[trackIndex][nameIndex], 2));

			};

		};

		return array.join(blank);
	},

	// Private
	// decompresses '0,1,2|0,1,3|0,1,4' to usable data
	_decompress: function(text) {
		var trackIndex,
			track,

			// just a temporary array, split the input text if there is input text
			array = text && text.match(/.{2}/g) || [];

		this.string = {};
		this.number = [];

		for (trackIndex = 0; trackIndex < array.length; ++trackIndex) {

			track = [];

			track.push(Raxit.toNumber(array[trackArray]));
			track.push(Raxit.toNumber(array[++trackArray]));
			track.push(Raxit.toNumber(array[++trackArray]));

			// creates {"0,1,2": 0, ...}
			this.string[track.join(comma)] = this.number.length;

			// creates [[0, 1, 2], ...]
			this.number.push(track);

		};

	}

});

// User class
var User = extend(Storage, {

	// User's name
	//key: '',

	stats: {},

	// "Private"
	// compresses "{12:{10:{123:4,124:3,132:1},11:{122:5,132:6}},13:{0:{123:4,124:3,132:1},1:{122:5,132:6}}}"
	//         to "c\na3f43g33o1\nb3e53o6\nd\n03f43g33o1\n13e53o6"
	_compress: function() {
		var year,
			month,
			track,

			array = [],
			text,

			stats = this.stats;

		for (year in stats) {

			// adds year to the array
			array.push(Radix.fromNumber(year));

			for (month in stats[year]) {

				text = Radix.fromNumber(month);

				for (track in stats[year][month]) {

					// TODO: might need to sort tracks by plays and add some sort of number to indicate amount of tracks with over 1 compressed number of plays
					text += Radix.fromNumber(track, 2) + Radix.fromNumber(stats[year][month][track]);

				}

				// adds the month and the month's stats to the array
				array.push(text);
			}
		}

		// returns the compressed stats
		return array.join(newline);
	},

	// Private
	// decompresses 'c\na3f43g33o1\nb3e53o6\nd\n03f43g33o1\n13e53o6' to usable data
	_decompress: function(text) {
		// Now turn it back into an object
		var index,
			year,
			month,
			months,
			track,
			tracks,
			plays,

			// seperate the years
			array = test && text.split(newline) || [];

		// reset current user's stats
		this.stats = {};

		// decompress the years
		for (index = 0; index < array.length; ++index) {
			year = Radix.toNumber(array[++index]);

			months = {};
			for (; index < array.length && array[index].length > 1; ++index) {
				month = Radix.toNumber(array[index].substr(0, 1));

				// tracks and plays
				text = array[index].substr(1);

				tracks = {};
				while (text.length) {

					track = Radix.toNumber(text.substr(0, 2));
					plays = Radix.toNumber(text.substr(2, 1));

					tracks[track] = plays;

					text = text.substr(3);
				}

				months[month] = tracks;
			}

			this.stats[year] = months;
		}
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
function compressNumber(number, padding) {
	return Radix.fromNumber(number, padding);
}

/**
 * Decompresses a string into a number using radix
 */
function decompressNumber(text) {
	return Radix.toNumber(text);
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
		users;

	for (key in storage) {
		if (key.length > 1) {
			users.push(key);
		}
	}

	return users;
}



function loadUser(username) {
	User.key = username;
	User.load();
}

function loadAll(username) {
	User.key = username;
	User.load();
	Tracks.load();
	Names.load();
}

function saveAll() {
	User.save();
	Tracks.save();
	Names.save();
}



// Radix encode numbers
// by Reb.Cabin
// at http://stackoverflow.com/questions/6213227/fastest-way-to-convert-a-number-to-radix-64-in-javascript#answers
var Radix = {

	_rixits =
//   0       8       16      24      32      40      48      56     63
//   v       v       v       v       v       v       v       v      v
	"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzªºÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿĀāĂăĄąĆćĈĉĊċČčĎďĐđĒēĔĕĖėĘęĚěĜĝĞğĠġĢģĤĥĦħĨĩĪīĬĭĮįİıĲĳĴĵĶķĸĹĺĻļĽľĿŀŁłŃńŅņŇňŉŊŋŌōŎŏŐőŒœŔŕŖŗŘřŚśŜŝŞşŠšŢţŤťŦŧŨũŪūŬŭŮůŰűŲųŴŵŶŷŸŹźŻżŽžſƀƁƂƃƄƅƆƇƈƉƊƋƌƍƎƏƐƑƒƓƔƕƖƗƘƙƚƛƜƝƞƟƠơƢƣƤƥƦƧƨƩƪƫƬƭƮƯưƱƲƳƴƵƶƷƸƹƺƻƼƽƾƿǀǁǂǃǄǅǆǇǈǉǊǋǌǍǎǏǐǑǒǓǔǕǖǗǘǙǚǛǜǝǞǟǠǡǢǣǤǥǦǧǨǩǪǫǬǭǮǯǰǱǲǳǴǵǺǻǼǽǾǿȀȁȂȃȄȅȆȇȈȉȊȋȌȍȎȏȐȑȒȓȔȕȖȗɐɑɒɓɔɕɖɗɘəɚɛɜɝɞɟɠɡɢɣɤɥɦɧɨɩɪɫɬɭɮɯɰɱɲɳɴɵɶɷɸɹɺɻɼɽɾɿʀʁʂʃʄʅʆʇʈʉʊʋʌʍʎʏʐʑʒʓʔʕʖʗʘʙʚʛʜʝʞʟʠʡʢʣʤʥʦʧʨḀḁḂḃḄḅḆḇḈḉḊḋḌḍḎḏḐḑḒḓḔḕḖḗḘḙḚḛḜḝḞḟḠḡḢḣḤḥḦḧḨḩḪḫḬḭḮḯḰḱḲḳḴḵḶḷḸḹḺḻḼḽḾḿṀṁṂṃṄṅṆṇṈṉṊṋṌṍṎṏṐṑṒṓṔṕṖṗṘṙṚṛṜṝṞṟṠṡṢṣṤṥṦṧṨṩṪṫṬṭṮṯṰṱṲṳṴṵṶṷṸṹṺṻṼṽṾṿẀẁẂẃẄẅẆẇẈẉẊẋẌẍẎẏẐẑẒẓẔẕẖẗẘẙẚẛẠạẢảẤấẦầẨẩẪẫẬậẮắẰằẲẳẴẵẶặẸẹẺẻẼẽẾếỀềỂểỄễỆệỈỉỊịỌọỎỏỐốỒồỔổỖỗỘộỚớỜờỞởỠỡỢợỤụỦủỨứỪừỬửỮữỰựỲỳỴỵỶỷỸỹﬁﬂΆΈΉΊΌΎΏΐΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩΪΫάέήίΰαβγδεζηθικλμνξοπρςστυφχψωϊϋόύώΣΤΥΦΧΨΩΪΫάέήίΰαβγδεζηθικλμνξοπρςστυφχψωϊϋόύώϐϑϒϓϔϕϖϚϜϞϠϢϣϤϥϦϧϨϩϪϫϬϭϮϯϰϱϲϳἀἁἂἃἄἅἆἇἈἉἊἋἌἍἎἏἐἑἒἓἔἕἘἙἚἛἜἝἠἡἢἣἤἥἦἧἨἩἪἫἬἭἮἯἰἱἲἳἴἵἶἷἸἹἺἻἼἽἾἿὀὁὂὃὄὅὈὉὊὋὌὍὐὑὒὓὔὕὖὗὙὛὝὟὠὡὢὣὤὥὦὧὨὩὪὫὬὭὮὯὰάὲέὴήὶίὸόὺύὼώᾀᾁᾂᾃᾄᾅᾆᾇᾈᾉᾊᾋᾌᾍᾎᾏᾐᾑᾒᾓᾔᾕᾖᾗᾘᾙᾚᾛᾜ",

	_length = 1024,

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
	fromNumber: function(number, padding) {
		//TODO: implement padding

		if (isNaN(Number(number)) || number == null || number == Number.POSITIVE_INFINITY) {
			throw "The input is not valid";
		}

		if (number < 0) {
			throw "Can't represent negative numbers now";
		}

		var rixit; // like 'digit', only in some non-decimal radix
		var residual = Math.floor(number);
		var result = blank;

		while (true) {
			rixit = residual % this._length;

			result = this._rixits.charAt(rixit) + result;

			residual = Math.floor(residual / this._length);

			if (residual == 0) {
				break;
			}
		}

		return result;
	},

	toNumber: function(string) {
		var result = 0;

		string = string.split(blank);

		for (e in string) {
			result = (result * this._length) + this._rixits.indexOf(string[e]);
		}

		return result;
	}
}

//})(window.jQuery);
