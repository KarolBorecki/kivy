function gs_start() {

	$('div.footerlinks').hide();

	$('div.section h1').each(function(index, elem) {
		var pt = $(elem).parent()[0];
		$(pt).hide();
		if ( pt.id == 'getting-started' ) {
			$('<div id="gs-bar"></div>').insertAfter(pt);
		} else {
			$(pt).addClass('getting-started');
			$(elem).hide();
		}
	});

	var r = Raphael('gs-bar', 840, 100);
	r.clear();
	var instrs = r.set();
	var x = 20, y = 60;
	r.path('M20,85L760,85').attr({fill: "#445fa3", stroke: "#999", "stroke-width": 4, "stroke-opacity": 0.4});
	r.path('M770,85L760,80L760,90Z').attr({fill: "#999", stroke: "#999", "stroke-width": 4, "stroke-opacity": 0.4});

	var sections = {};
	var sections_key = [];
	var prev_gsid = '';

	function gs_show_section(gsid) {
		$(sections_key).each(function(i, key){
			if ( gsid == key ) {
				if ( prev_gsid == '' )
					$(sections[key][0]).show();
				else
					$(sections[key][0]).show('slide', {direction: 'right'}, 150);
				sections[key][1].attr({'font-weight': 'bold'});
				sections[key][2].animate({'stroke-width': '8', 'fill': '#f80'}, 300);
			}
			else if ( key == prev_gsid )
			{
				$(sections[key][0]).hide('slide', {direction: 'left'}, 150);
				sections[key][1].attr({'font-weight': 'normal'});
				sections[key][2].animate({'stroke-width': '3', 'fill': '#f7ff7a'}, 300);
			}
		});
		prev_gsid = gsid;
		document.location.hash = 'doc-' + gsid;
	}

	jQuery(document).bind('keydown', function (evt){
		var nid = '';
		console.log(prev_gsid);
		if ( event.which == 37 ) {
			nid = $('div.getting-started[id="' + prev_gsid + '"]').prev().attr('id');
		}
		else if ( event.which == 39 ) {
			nid = $('div.getting-started[id="' + prev_gsid + '"]').next().attr('id');
		}
		if ( typeof(nid) != 'undefined' && nid != '' && nid != 'gs-bar' )
			gs_show_section(nid);
		return true;
	});

	$('div.section h1').each(function(index, elem) {
		var gsid = $(elem).parent()[0].id;
		if ( gsid == 'getting-started' )
			return;
		var instr_t = r.text(x - 2, y, $(elem).text().split('¶')[0]);
		instr_t.rotate(-20, x, y);
		instrs.push(instr_t);
		var instr_c = r.circle(x + 4, y + 25, 10).attr({fill: "#f7ff7a", stroke: "#000", "stroke-width": 3, "stroke-opacity": 0.4});

		instr_t.click(function() { gs_show_section(gsid, index); });
		instr_c.click(function() { gs_show_section(gsid, index); });
		sections[gsid] = [$(elem).parent()[0], instr_t, instr_c];
		sections_key.push(gsid);

		x += 70;
	});
	instrs.attr({font: "14px Open Sans", fill: "#333", "text-anchor": "start"});

	console.log(location.hash.substring(0, 5));
	if ( location.hash.substring(0, 5) == '#doc-' )
		gs_show_section(location.hash.substring(5));
	else
		gs_show_section('introduction');
}

$(document).ready(function () {
	var height = $(document).height();
	$('#content').css('min-height', function(){ return height; });

	var bodyshortcut = false;
	function ensure_bodyshortcut() {
		if ( bodyshortcut == true )
			return;
		var bsc = $('<div class="bodyshortcut">&nbsp;</div>');
		bsc.insertAfter($('div.body h1:first'));
		bodyshortcut = true;
	};

	// if it's an API page, show the module name.
	var pagename = location.pathname.split('/');
	pagename = pagename[pagename.length - 1];
	if (pagename.search('api-') == 0) {
		pagename = pagename.substr(4, pagename.length - 9);

		ensure_bodyshortcut();
		var modulename = $('<div class="left">Module: <a href="#">' + pagename + '</a></div>')
		modulename.appendTo($('div.bodyshortcut'));
	}

	// insert breaker only for the first data/class/function found.
	var apibreaker = false;
	$('div.body dl[class]').each(function (i1, elem) {
		// theses are first level class: attribute and method are inside class.
		if (!$(elem).hasClass('data') &&
			!$(elem).hasClass('class') &&
			!$(elem).hasClass('exception') &&
			!$(elem).hasClass('function'))
			return;
		// dont accept dl inside dl
		if ($(elem).parents().filter('dl').length > 0)
			return;

		$(elem).addClass('api-level');

		if ( apibreaker == true )
			return;
		$('<div id="api"></div>')
			.attr('id', 'api')
			.html(
				$('<h2>API ' +
				  '<a id="api-toggle-all" class="showed">Collapse All &uArr;</a>' +
				  '<a id="api-toggle-desc" class="showed">Hide Description &uArr;</a>' +
				  '</h2>')
				)
			.insertBefore(elem);
		apibreaker = true;
	});


	$('div.body dl[class] dt').hover(
		function() { $(this).addClass('hover'); },
		function() { $(this).removeClass('hover'); }
	);

	if ( apibreaker == true ) {
		ensure_bodyshortcut();
		var apilink = $('<div class="right"><a id="api-link" href="#api">Jump to API</a> &dArr;</div>');
		apilink.appendTo($('div.bodyshortcut'));
	}

	$('#api-toggle-all').click(function() {
		if ($(this).hasClass('showed')) {
			$('div.body dl.api-level > dd').slideUp();
			$(this).removeClass('showed');
			$(this).html('Expand All &dArr;');
			$.cookie('kivy.toggleall', 'true');
		} else {
			$('div.body dl.api-level > dd').slideDown();
			$(this).addClass('showed');
			$(this).html('Collapse All &uArr;');
			$.cookie('kivy.toggleall', 'false');
		}
	});

	$('#api-toggle-desc').click(function() {
		if ($(this).hasClass('showed')) {
			$('div.body dl.api-level > dd > dl > dd').slideUp();
			$(this).removeClass('showed');
			$(this).html('Show Descriptions &dArr;');
			$.cookie('kivy.toggledesc', 'true');
		} else {
			$('div.body dl.api-level > dd > dl > dd').slideDown();
			$(this).addClass('showed');
			$(this).html('Hide Descriptions &uArr;');
			$.cookie('kivy.toggledesc', 'false');
		}
		console.log($.cookie('kivy.toggledesc'));
	});

	$('div.body dl dt').click(function() {
		$(this).next().slideToggle();
	});

	if ( $.cookie('kivy.toggledesc') == 'true' ) {
		$('div.body dl.api-level > dd > dl > dd').hide();
		$('#api-toggle-desc').removeClass('showed');
		$('#api-toggle-desc').html('Show Descriptions &dArr;');
	}

	if ( $.cookie('kivy.toggleall') == 'true' ) {
		$('div.body dl.api-level > dd').hide();
		$('#api-toggle').removeClass('showed');
		$('#api-toggle').html('Expand All &dArr;');
	}


	//----------------------------------------------------------------------------
	// Image reflexions
	//----------------------------------------------------------------------------

	$('div.body img').reflect({'opacity': .35, 'height': 40});

	//----------------------------------------------------------------------------
	// Getting started
	//----------------------------------------------------------------------------

	if ( $('div.section').attr('id') == 'getting-started' )
		gs_start();

});
