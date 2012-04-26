## Welcome to TelaSocial Mediator ( Aka feedMediator ) 

The mediator application is a NodeJS-based app that acts as a middleware agent between a web client ( our use case is a web kiosk ) and the web ( think feeds .) It uses a configuration file [1] to fetch remote feeds and it keeps it in the disk so it can be served when the client application requests it. In a way it's a subscription as it uses rules from this config file to load the associated feed and save it in the disk from time to time. 

# Installation

* NodeJS ( https://github.com/joyent/node/ ) 
* npm ( http://npmjs.org/) 
* Forever ( http://www.telasocial.com/p/d/nodejs/forever.html ) 
* npm install xml2js ( https://github.com/Leonidas-from-XIV/node-xml2js )
* npm install ftp-server ( https://github.com/naholyr/node-ftp-server ) 
* ImageMagick ( experiental, for 0.2 ) 

# Launching version 0.1 

sudo node mediator 

Point your browser to: 

    http://localhost/static/index.html
   
    If you want to launch a ./static/index.html app you need to install yourself

## The concept of channel 

The application can serve, via http ( get post ) a representation of the remote feed. Version 0.1 simply returns the raw data for a given registered feed. The data is kept in the disk and can be retrieved using the "/channel/" parameter: 

    http://localhost/channel/noticias.xml

The rule that loads the remote feed is defined in the config file: 

    {
      "channel":"noticias",
      "timer": "30000",
      "function":"reloadRSS",
      "url":"http://twitter.com/statuses/user_timeline/394023468.rss"
    }

    Config file https://github.com/taboca/TelaSocial-Mediator/blob/master/config.json

## Scenario 1: Repurposing a feed ( Cached and Resized Images ) 

This use case refers to a client ( web social kiosk ) that wants to display a number of pictures associated with a given feed — think a flickr feed with URLs to some images. However is wants to display smaller version for each of the images and it also does not want to reload the images from the network for every feed request initiated by the client. It only needs the resized images and new resized images when a new URL is found in the feed data. 

The proposed architecture is a means to repurpose feeds in the mediator. In this case, a configuration rule script should define associated operation to the feed: 

    {
      "channel":"flickrresized",
      "timer": "30000",
      "function":"cacheandresize",
      "url":"http://api.flickr.com/services/feeds/photos_public.gne?tags=flower&lang=pt-br&format="
    }

So when the feed is loaded, all images are to be fetched, resized, and stored in the disk. What is new is that we will need to serve a new feed file to the actual client because now the images are in the disk. 

## Requirements

 * NodeJS
 * npm
 * Forever
 * xml2js ( https://github.com/Leonidas-from-XIV/node-xml2js ) 
 * ImageMagick ( for the media transcoding converter channel = 0.2 ) 
 
## LICENSE

All files that are part of this project are covered by the following
license, except where explicitly noted.

    Version: MPL 1.1/GPL 2.0/LGPL 2.1

    The contents of this file are subject to the Mozilla Public License Version
    1.1 (the "License"); you may not use this file except in compliance with
    the License. You may obtain a copy of the License at
    http://www.mozilla.org/MPL/

    Software distributed under the License is distributed on an "AS IS" basis,
    WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
    for the specific language governing rights and limitations under the
    License.

    The Original Code is TelaSocial

    The Initial Developer of the Original Code is the Marcio dos Santos Galli 

    Portions created by the Initial Developer are Copyright (C) 2011
    the Initial Developer. All Rights Reserved.

    Contributor(s):

    Alternatively, the contents of this file may be used under the terms of
    either the GNU General Public License Version 2 or later (the "GPL"), or
    the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
    in which case the provisions of the GPL or the LGPL are applicable instead
    of those above. If you wish to allow use of your version of this file only
    under the terms of either the GPL or the LGPL, and not to allow others to
    use your version of this file under the terms of the MPL, indicate your
    decision by deleting the provisions above and replace them with the notice
    and other provisions required by the GPL or the LGPL. If you do not delete
    the provisions above, a recipient may use your version of this file under
    the terms of any one of the MPL, the GPL or the LGPL.
