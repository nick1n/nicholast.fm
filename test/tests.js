// Basic tests that do nothing lol
test('basic test', function() {
	expect(1);
	ok(true, 'this had better work.');
});

test("deepEqual test", function() {
	var obj = {
		foo: "bar"
	};

	deepEqual(obj, {
		foo: "bar"
	}, "Two objects can be the same in value");
});


// some testing variables
var string = {
		'Blah| Blah': 3,
		'Fall Out Boy': 0,
		'Infinity` On High': 1,
		'Third Song || Same Album': 4,
		'Thriller╙': 2
	},
	number = [
		'Fall Out Boy',
		'Infinity` On High',
		'Thriller╙',
		'Blah| Blah',
		'Third Song || Same Album'
	],
	namesCompressed = 'Fall Out Boy|Infinity` On High|Thriller╙|Blah|| Blah|Third Song |||| Same Album',

	userStats = {
		12: {
			10: {
				123: 4,
				124: 3,
				132: 1
			},
			11: {
				122: 5,
				132: 6
			}
		},
		13: {
			0: {
				123: 4,
				124: 3,
				132: 1
			},
			1: {
				122: 5,
				132: 6
			}
		}
	},

	userStatsCompressed = 'c|a;3f:4,3g:3,3o;b;3e:5,3o:6|d|0;3f:4,3g:3,3o;1;3e:5,3o:6';


// Test Storage module
module('Storage');
test('Names', function() {

	Names._decompress(namesCompressed);

	deepEqual(Names.number, number, 'Decompress Passed');

	equal(Names._compress(), namesCompressed, 'Compress Passed');

});

test('User', function() {

	User._decompress(userStatsCompressed);

	deepEqual(User.stats, userStats, 'Decompress Passed');

	equal(User._compress(), userStatsCompressed, 'Compress Passed');

});