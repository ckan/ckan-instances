(function($, window) {
	$(function() {

		var is_local = ( window.location.href.indexOf('http://localhost:4000/') === 0 );
		var url = 'http://ckan.org/instances/';
		var loaded = 0;
		var length = 0;
		var store = [];
		var facet = 'Featured=All';

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
			$('#total').html(instances.length + ' total instances');
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
			$('#facets .faceter').on('click', filter);

			navigate();
		}

		function dropdown(event) {
			event.preventDefault();
			var parent = $(this).parent();
			var method = parent.hasClass('active') ? 'removeClass' : 'addClass';
			$('#facets .facet').removeClass('active');
			parent[method]('active');
			$('#facets')[method]('faceting');
		}

		function filter(event) {
			event.preventDefault();
			facet = $(this).data('filter');
			navigate();
		}

		function navigate() {
			var bits = facet.split('=');
			var $this = $('[data-facet^="'+bits[1]+'"]');
			var parent = $this.parents('.facet');
			var context = '';
			var total;

			$('.facet, .faceter').removeClass('active selected');
			$('[data-facet-root]').each(function() {
				$(this).text($(this).data('facet-root'));
			});

			if (bits[1] == 'All') {
				$('#instances .instance').show();
				total = $('#instances .instance').length;
			} else {
				$('#instances .instance').hide();
				var to_show = $('.instance[data-facet-'+bits[0]+'^="'+bits[1]+'"]');
				to_show.show();
				total = to_show.length;
				context = ' ' + bits[1].toLowerCase();
			}

			$('#total').text(total + context + ' instance' + ( ( total != 1 ) ? 's' : '' ) );
			$('.root span', parent).text(bits[1]);
			parent.addClass('selected');
			$this.addClass('active');

			$('#instances').packery();

			if (!is_local) {
				//window.top.location.href = url + '#' + $('body').outerHeight();
			}

		}

		loader("template", ['instance', 'facet'], 'templates/{{id}}.hbs', 'text');
		loader("config", ['instances', 'facets'], 'config/{{id}}.json', 'json');

	});
})(jQuery, window);
