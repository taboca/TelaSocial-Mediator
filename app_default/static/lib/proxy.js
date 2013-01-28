// Something here we need to work with a proxy model 
// We want to intercept functions 

// Something else..
// And probably to be able to keep injecting things in any order

// For example, t8l.config='google'; t8l.addProxy; or t8l.addProxy; t8l.config=google;; The order we add things to t8l won't matter since the init is the key point of startup...

var t8l = { 
    message: function (refWidget,obj) { 
	var id = refWidget.split('/')[2];
	var item = document.createElement('div');
	window.parent.document.getElementById(id).contentWindow.postMessage(obj,'*');
    },
    feeds: { 
       Feed: null
    }, 
    GOOGLE:1, JQUERY:2, STORE:3,
    init: function (mode) { 
  	if(mode==this.GOOGLE) { 
		this.mode=this.GOOGLE;
		document.write('<script src="http://www.google.com/jsapi" type="text/javascript"></script><script> google.load("feeds","1"); google.setOnLoadCallback(t8l.callbackWhenLoaded);</script>');
	} 
 	if(mode==this.JQUERY) { 
		this.mode=this.JQUERY;
		window.addEventListener("load", function () { 
			t8l.callbackWhenLoaded();
		} , false);
	}  
	if(mode==this.STORE) { 
		this.mode=this.STORE;
	} 
    }, 
    loaded: function (callbackCallAfter) { 
	this.callbackCallAfter = callbackCallAfter;
    },
    callbackWhenLoaded: function () { 
	if(t8l.mode==t8l.GOOGLE) { 
		t8l.feeds.Feed=google.feeds.Feed;
	}
	if(t8l.mode==t8l.JQUERY) { 
		t8l.feeds.Feed=t8l_Feed; 
  	} 
	if(t8l.mode==t8l.STORE) { 
		t8l.feeds.Feed=t8l_FeedStore; 
		//var store = document.createElement("div");
		//store.style.display='none';
		//store.setAttribute('id','t8l_store');
		//document.body.appendChild(store);
	} 
	t8l.callbackCallAfter();	
    },
} 

var t8l_Feed = function (url) { 
	this.url=url;
 	this.setNumEntries = function ( val ) { } 
        this.setResultFormat = function (data) {  
		// we ignore for now, this is for GOogle compatibility 
	} ;

	this.load = function ( functionSuccess ) { 
            $.ajax( { type:"GET", url: this.url, dataType: "xml", success: function (xml) { 
               var result = { xmlDocument:xml } 
               functionSuccess(result);
            }, error: function (xhr, ajaxOptions, thrownError) { 
               dump(document.location + " error: " + xhr.throwError);
	       var result = { error: { code: xhr.status, message: thrownError } }
               functionSuccess(result);
            }});
	} 
} 

var t8l_FeedStore = function (url) { 
	this.url=url;
	this.store = null;
 	this.setNumEntries = function ( val ) { } 
        this.setResultFormat = function (data) {  
		// we ignore for now, this is for GOogle compatibility 
	} ;

	// This is subscribe request ...
	this.load = function ( functionSuccess ) { 
		if(!this.store) { 
			window.addEventListener("message", functionSuccess, false);
			//document.getElementById('t8l_store').addEventListener("DOMNodeInserted", functionSuccess);		
			this.store=true;

		} 
	} 
} 



