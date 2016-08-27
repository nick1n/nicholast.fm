/*
 * Fuel UX Data components - static data source
 * https://github.com/ExactTarget/fuelux-data
 *
 * Copyright (c) 2012 ExactTarget
 * Licensed under the MIT license.
 */

var StaticDataSource = function (options) {
	this._formatter = options.formatter;
	this._columns = options.columns;
	this._delay = options.delay || 0;
	this._data = options.data;
};

StaticDataSource.prototype = {

	columns: function () {
		return this._columns;
	},

	sortBy: function (item, prop) {
		if (item.searchable && item.searchable[prop]) return item.searchable[prop];
		return item[prop];
	},

	data: function (options, callback) {
		var self = this;

		setTimeout(function () {
			// SORTING
			if (options.sortProperty) {

				self._data.sort(function(a, b) {
					var sorta, sortb;
					for (var i = 0; i < options.sortProperty.length; ++i) {
						sorta = self.sortBy(a, options.sortProperty[i]);
						sortb = self.sortBy(b, options.sortProperty[i]);
						if (options.sortDirection[i] == 'desc') {
							if (sorta < sortb) return 1;
							if (sorta > sortb) return -1;
						} else {
							if (sorta < sortb) return -1;
							if (sorta > sortb) return 1;
						}
					}
					return 0;
				})
			}

			// SEARCHING
			var data = [];
			if (options.search) {
				$.each(self._data, function (id, item) {
					for (var i in item.searchable) {
						if (~item.searchable[i].toString().indexOf(options.search)) data.push(item);
					}
				});
			} else {
				$.extend(data, self._data);
			}

			// PAGING
			var count = data.length;
			var startIndex = options.pageIndex * options.pageSize;
			var endIndex = startIndex + options.pageSize;
			var end = (endIndex > count) ? count : endIndex;
			var pages = Math.ceil(count / options.pageSize);
			var page = options.pageIndex + 1;
			var start = startIndex + 1;

			data = data.slice(startIndex, endIndex);

			if (self._formatter) self._formatter(data);

			callback({ data: data, start: start, end: end, count: count, pages: pages, page: page });

		}, this._delay)
	}
};
