{
"rules": [

{ 
 "channel":"latinoware-en", 
 "timer": "2000",
 "function":"saveRSS",
 "url":"http://www.latinoware.org/en/rss.xml"
}

,

{ 
 "channel":"localpictures", 
 "timer": "60000",
 "function":"ImageFetchAndResizeImagesFromRSS",
 "url":"http://api.flickr.com/services/feeds/photos_public.gne?tags=flower&lang=pt-br&format="
}
,

{ 
 "channel":"noticias", 
 "timer": "30000",
 "function":"saveRSS",
 "url":"http://twitter.com/statuses/user_timeline/394023468.rss"
}

]

}

