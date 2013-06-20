(function($, window) {
	$(function() {

		var loaded = 0;
		var length = 0;
		var store = [];

		function loader(type, what, where, data_type) {
			length += what.length;
			for (var i = 0; i < what.length; i++) {
				var id = what[i];
				var url = where.replace('{{id}}', id);
				$.ajax({
					url: url,
					dataType: data_type,
					noCache: true,
					row: { id: id, type: type },
					success: function(data) {
						store.push({
							"id": this.row.id,
							"type": this.row.type,
							"data": data
						});
						loaded++;
						if (loaded >= length) {
							complete();
						}
					}
				});
			}
		}

		function data(what, type) {
			var type = ( typeof type == 'undefined' ) ? 'config' : type;
			for (var i in store) {
				if (store[i].id == what && store[i].type == type) {
					return store[i].data;
				}
			}
			return false;
		}

		function template(what, json) {
			var source = data(what, 'template');
			var template = Handlebars.compile(source);
			return template(json);
		}

		function complete() {
			// Remove the loading status
			$('body').removeClass('loading');
			var instances = data('instances');
			// Sort the instanes alphabetical style
			instances.sort(function(a, b) {
				var a_title = a.title.toLowerCase();
				var b_title = b.title.toLowerCase();
				if (a_title == b_title) {
					return 0;
				} else {
					return ( a_title < b_title ) ? -1 : 1;
				}
			});
			// Setup the instances
			$.each(instances, function() {
				$(template('instance', this)).appendTo('#instances');
			});
			$('#instances').packery({
				itemSelector: '.instance',
				gutter: 0,
				transitionDuration: '0.2s',
				isInitLayout: false
			});
			// Now setup the facets
			$.each(data('facets'), function() {
				$(template('facet', this)).appendTo('#facets');
			});
			$('#facets .has-dropdown').on('click', dropdown);

			hash();
		}

		function featured() {
			$('#facets .facet:first').addClass('active');
			$('#facets .facet').removeClass('selected');
			$('#facets .faceter').removeClass('active');
			$('#instances .instance').hide();
			$('#instances .instance.featured').show();
			$('#instances').packery();
		}

		function dropdown(event) {
			event.preventDefault();
			var parent = $(this).parent();
			var method = parent.hasClass('active') ? 'removeClass' : 'addClass';
			$('#facets .facet').removeClass('active');
			parent[method]('active');
		}

		function hash() {
			var hash = window.location.hash;
			if (!hash) {
				featured();
			} else {
				var bits = hash.substr(1).split('=');
				var $this = $('[data-facet^="'+bits[1]+'"]');
				$('#facets .facet, #facets .faceter').removeClass('active');
				$('#instances .instance').hide();
				$this.addClass('active');
				$('.instance[data-facet-'+bits[0]+'^="'+bits[1]+'"]').show();
				$this.parents('.facet').addClass('selected');
				$('#instances').packery();
			}
		}

		$(window).on('hashchange', hash)
		loader("template", ['instance', 'facet'], 'templates/{{id}}.hbs', 'text');
		loader("config", ['instances', 'facets'], 'config/{{id}}.json', 'json');

	});
})(jQuery, window);