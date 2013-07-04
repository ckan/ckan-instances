// This code needs to be in the parent iframe page at ckan.org/instances
(function($, window) {
	function hashchange() {
		var hash = window.location.hash.substring(1);
		if (!isNaN(hash)) {
			var height = parseInt(hash);
			if (height > 0) {
				height += 15;
				$('#instances_frame').css('height', height);
				window.location.href = '#';
			}
		}
	}
	$(window).bind('hashchange', hashchange);
	window.InstancesIframe = hashchange;
}(jQuery, window));