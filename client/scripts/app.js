define([
	'lodash',
	'jquery'
], function (_, $) {

	function createCookie(name,value,days) {
		if (days) {
			var date = new Date();
			date.setTime(date.getTime()+(days*24*60*60*1000));
			var expires = "; expires="+date.toGMTString();
		}
		else var expires = "";
		document.cookie = name+"="+value+expires+"; path=/";
	}

	function readCookie(name) {
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		for(var i=0;i < ca.length;i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1,c.length);
			if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
		}
		return null;
	}

	function eraseCookie(name) {
		createCookie(name,"",-1);
	}

	$(function () {
		console.log('checking whether intro seen');
		if (!readCookie('seen-intro')) {
			console.log('not seen intro');
			$('#introduction').show();
		}

		$('a.video-continue').click(function () {
			console.log('seen intro - remembering');
			createCookie('seen-intro', 'true'); 
		});
	});
});
