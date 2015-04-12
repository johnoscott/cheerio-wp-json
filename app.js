// http://www.hacksparrow.com/jquery-with-node-js.html

var // = require('jquery');
     http = require('http'),
	_ = require('lodash'),
	cheerio = require('cheerio');

var options = {
    host: 'http://bn-cms.appspot.com/wp-json/posts?filter[category_name]=press',
    port: 80,
    path: '/'
};

var batch = [
	{url:"http://bn-cms.appspot.com/wp-json/posts?filter[category_name]=press",parser:"parsePressItems"},
	{url:"",parser:"parsePressItems"}
]

function parsePressItems (data) {

	var items = [];

	_.each(data, function (item) {
		/* = [

		 {
		 title: "SOCIETY",
		 link: "assets/img/press/SOCIETY/Blainey-North-SBID_Volume3-Issue1-2014.pdf",
		 thumbnail: "assets/img/press/SOCIETY/bn_press_covers.jpg"
		 },

		 ] */

		// http://stackoverflow.com/questions/450108/regular-expression-to-extract-src-attribute-from-img-tag
		var matches = item.content.match(/\<img.+src\=(?:\"|\')(.+?)(?:\"|\').*?\>[\s\S]*?\<a.+href\=(?:\"|\')(.+?)(?:\"|\').*?\>/i);

		if (!matches) return $log.debug("no match: %s ", item.content);

		var thumbnail = matches[1];
		var link = matches[2];
		var
			o = {
				title: item.title,
				link: link,
				thumbnail: thumbnail
			}

		items.push(o);

	})

	return items;

};

function parseJournalItems(data) {

		var items = [];

		_.each(data, function (item) {
			/*
			 {
			 title: "Conservatory Crowned in London",
			 images: [
			 {url:"assets/img/journal/1-CONSERVATORY-CROWNED-IN-LONDON/1-Blainey-North-SBID-2013.jpg"}
			 ],
			 date: "December 2, 2013",
			 body: "<p>We are absolutely delighted to announce that Blainey North has won the Society of British and International Design, International Design Excellence Award 2013 for Conservatory. The award was accepted by Blainey North at a ceremony held at The Dorchester hotel in London on Friday 29 November.</p>" +
			 "<p>We are very grateful to the SBID and to the esteemed judging panel for selecting Conservatory amongst the worlds best and we thank everyone that took the time to vote for the project.</p>" +
			 "<p>As designers, it’s always really satisfying to have your work recognised by both your peers and the public, but it is especially satisfying to win it for the Conservatory restaurant – which is extremely successful commercially – because it shows that design can be beautiful and exciting while still being functional. To be acknowledged by the Society of British and International Design is both thrilling and humbling.</p>"
			 },
			 */

			// http://stackoverflow.com/questions/450108/regular-expression-to-extract-src-attribute-from-img-tag
			// var matches = item.content.match(/\<img.+src\=(?:\"|\')(.+?)(?:\"|\').*?\>[\s\S]*?\<a.+href\=(?:\"|\')(.+?)(?:\"|\').*?\>/i);

			// if (!matches) return $log.debug("no match: %s ", item.content);

			// var thumbnail = matches[1];
			// var link = matches[2];

			/*
			var el = $('<div></div>');
			*/
			var $ = cheerio.load(item.content);
			// el.html(item.content);

			// http://api.jquery.com/has-selector/
			// http://api.jquery.com/not-selector/
			// http://stackoverflow.com/questions/7055053/jquery-select-attributes-into-an-array
			//var body = $('p:not(:has(img))', el).wrapAll('<div>').html(); // All the paragraphs
			var body = "";
			$('p:not(:has(img))').each(function (i, e) {
				body += $.html(e);
			});

			// $log.info(body);
			// var bodyArr = $('p:not(:has(img))').toArray();

			// var images = $('img', el) // All the images
			var images = $('img').map(function (i, e) {
				return {url: $(e).attr("src")};
			}).get();

			var p = new Date(item.date);
			var published = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][p.getMonth()] + ' ' + p.getDay() + ', ' + p.getFullYear();

			var o = {
				title: item.title,
				images: images,
				date: "December 2, 2013",
				body: body
			};

			items.push(o);

		});

		return items;
};


http.get("http://bn-cms.appspot.com/wp-json/posts?filter[category_name]=journal", function(res) {
    
    var payload = '';
    
    res.on('data', function(chunk) {
        // collect the data chunks to the variable named "html"
        payload += chunk;
    }).on('end', function() {
        
        /*
            [ { ID: 133,
                  title: 'Society',
                  status: 'publish',
                  type: 'post',
                  author:
                  content: '<p><img class="alignnone size-full wp-image-134" ... 
            }, ... ]
        */
        var posts = JSON.parse(payload);
        
        // the whole of webpage data has been collected. parsing time!
        // $ = cheerio.load(html);

        // var title = $('html').find('title').text();

        
//        $('h2.title').text('Hello there!');
//        $('h2').addClass('welcome');
//
//        $.html();
        
		var items = parseJournalItems(posts);
        
        console.log(JSON.stringify(items, null, 2));
     });
});
