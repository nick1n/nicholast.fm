/* Use this script if you need to support IE 7 and IE 6. */

window.onload = function() {
	function addIcon(el, entity) {
		var html = el.innerHTML;
		el.innerHTML = '<span style="font-family: \'icomoon\';font-style: normal">' + entity + '</span>' + html;
	}
	var icons = {
			'icon-user' : '&#xe000;',
			'icon-github' : '&#xe001;',
			'icon-lastfm' : '&#xe002;',
			'icon-comment' : '&#xe003;',
			'icon-music' : '&#xe004;',
			'icon-facebook' : '&#xe005;',
			'icon-twitter' : '&#xe006;',
			'icon-chevron-down' : '&#xe007;',
			'icon-chevron-up' : '&#xe008;',
			'icon-arrow-right' : '&#xe009;',
			'icon-arrow-left' : '&#xe00a;',
			'icon-search' : '&#xe00b;',
			'icon-remove' : '&#xe00c;'
		},
		els = document.getElementsByTagName('*'),
		i, attr, html, c, el;
	for (i = 0; i < els.length; i += 1) {
		el = els[i];
		attr = el.getAttribute('data-icon');
		if (attr) {
			addIcon(el, attr);
		}
		c = el.className;
		c = c.match(/icon-[^\s'"]+/);
		if (c && icons[c[0]]) {
			addIcon(el, icons[c[0]]);
		}
	}
};