
var typing =  {
	feedURL : URL_TYPING,
	feed    : null, 
	start : function() {
		this.elementTable = document.createElement("div");
		this.elementTable.innerHTML="<table><tr><td align='center' valign='middle' width='110'><div id='icon' style='' ></div></td><td><table ><tr><td height='255' valign='middle'><a class='typingPanel' id='typingcontainer'></a></td></tr><tr><td></td></tr></table></td></tr></table>";

		document.getElementById("main").appendChild(this.elementTable);
		document.getElementById("icon").innerHTML= '';
		this.tweetQueue = new Array();

		var first = document.createElement("div");
		this.firstId = "firsttyping";
		first.id = this.firstId;
		this.tweetRepeated = {};
		document.getElementById('typingcontainer').appendChild(first);

		var self = this;
		setTimeout( function(){self.updateFeed()},1000);
	},

	init : function () { 
		this.feed = $;
	} ,
	
	popTweet : function() {
		if (this.tweetQueue.length == 0) { 
			return false;
		} 
		var t = this.tweetQueue.pop();
		if (t.title in this.tweetRepeated) {
			return;
		}
		this.tweetRepeated[t] = true;
		this.cycleArray[this.cycleTotal++]= { content: t.title, link:t.link };
	// marcio	
		if(this.cycleArray.length>0 && !this.reading) { 
			this.readLine();
			this.reading = true; 
		} 
		return true;
	},

        cycleIndex: 0,
	cycleTotal: 0,
	cycleArray: new Array(), 

	reading : false,
	readIndex : 0,

	readLine: function () { 
		if(this.cycleIndex>=this.cycleArray.length) { 
			this.cycleIndex=0;
		} 
		var elCurr = this.cycleArray[this.cycleIndex];
		/* this has to become interception event */
		document.getElementById("typingcontainer").setAttribute("href", "file:///Users/marciogalli/Desktop/ted/ogg/ogv/"+ elCurr.link);
		var self = this;
		setTimeout( function(){self.readStep()},1000);
	}, 
	
	readStep: function () { 
		var elCurr = this.cycleArray[this.cycleIndex];
		var words = elCurr.content.split(" ");
		var sum = "";

		for(var i=0;i<this.readIndex;i++) { 
			sum+=words[i]+" ";
			if(i==0) { 
			} 
		} 
		document.getElementById("firsttyping").innerHTML=sum;
		this.readIndex++;
		if(this.readIndex>words.length) { 
			var self = this;
			this.readIndex=0;
			this.cycleIndex++;

			setTimeout( function(){self.readLine()},15000);
		} 
		else { 
			var self = this;
			setTimeout( function(){self.readStep()},150);
		} 
	},

	/* This is cycling.. */

	catchNext: function () { 
           var self =this;
           this.feed.ajax( { dataType: 'json', cache: false, type:"GET", url: this.feedURL, success: function (json) {  self.__feedUpdated(json) }, error: function (a,status) { 
              alert("from " + a + " status " + status) ;
           }});
 	},

	looping:false,

	updateFeed : function() {
		if (!this.popTweet()) {
			this.looping=false;
			var self =this;
			setTimeout(function () { self.catchNext() }, 5000);
		} else { 
			var self = this;
			if(this.looping) { 
				setTimeout( function(){self.updateFeed()},1000);
			}
		} 
	},

	__feedUpdated : function(json) {

		var self  = this;
		var items = json.list; 

		for( var k in items) { 
                        //self.tweetQueue.push( items[k].title );
                        self.tweetQueue.push( { title: items[k].title, link: items[k].link });
		} 
		
		this.looping=true;
		this.updateFeed();
		
//  $(xml.xmlDocument).find('item').each(function(){
//          var title = $(this).find('title').text();
                      //  self.tweetQueue.push( { title: title });
//	});
	}

}

