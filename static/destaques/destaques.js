var destaque =  {
	feedURL : URL_DESTAQUES,
	feed    : null, 

	start : function() {
		this.element = document.createElement('div');
		this.element.className="destaquePanel";
		this.element.id = Math.random();
		this.tweetQueue = new Array();
		var first = document.createElement("div");
		this.firstId = "firstdestaque";
		first.id = this.firstId;
		this.tweetRepeated = {};
		this.element.appendChild(first);
		document.getElementById("container").appendChild(this.element);
		var self = this;
		setTimeout( function(){self.updateFeed()},500);
	},

	init : function () { 
		/*
		this.feed = new google.feeds.Feed(this.feedURL);
		this.feed.setResultFormat(google.feeds.Feed.XML_FORMAT);
		this.feed.setNumEntries(10);
		*/
		this.feed = $;
	} ,
	
	popTweet : function() {
		if (this.tweetQueue.length == 0) return false;
		var obj = this.tweetQueue.pop();
		var t = obj.title; 
		var d = obj.desc; 
		
		var k = document.createElement('div');
		k.className = 'destaque_element';
		k.innerHTML = '<table height="200" width="100%" border="0"><tr><td valign="middle"><div class="desc">'+d+'</div><div class="title">'+t+'</div></td></tr></table>';
		var old = this.element.firstChild;
		this.element.insertBefore(k, this.element.firstChild);
		this.element.removeChild(old);
		return true;
	},

	updateFeed : function() {
		var self = this;
		if (! this.popTweet()) {
			/*
			this.feed.load( function (e) { self.__feedUpdated(e) } );
			*/
                        this.feed.ajax( { type:"GET", url: this.feedURL, dataType: "xml", success: function (xml) {  self.__feedUpdated(xml) } });

		}
		setTimeout( function(){self.updateFeed()},5000);
	},

	__feedUpdated : function(result) {
		var self  = this;
		if (result.error) {
			return;
		}
		this.feed(result).find('item').each(function(){
                        var title = self.feed(this).find('title').text();
                        var description = ""; //self.feed(this).find('description').text();
                        self.tweetQueue.push( { title: title, desc: description } );
                });

		/*
     		$(result.xmlDocument).find('item').each(function(){
                        var title = $(this).find('title').text();
                        //var description = $(this).find('description').text();
                        var description = "";
			$(this).find('description').contents().each(function() {
			        if(this.nodeName == "#text") { 
					description += this.textContent;
				} 
			});
                        //var image = $(this).find('image').text();
			//self.tweetQueue.push( { title: title, image: image } );
			self.tweetQueue.push( { title: title, desc: description } );
                });
		*/

	}
}


