## WHere to go 

To read more about the other components, please see http://www.telasocial.com

## Welcome to TelaSocial Mediator ( Aka feedMediator ) 

The mediator application is a NodeJS-based app that acts as a middleware agent between a web client ( our use case is a web kiosk ) and the web ( think feeds .) It uses a configuration file [1] to fetch remote feeds and it keeps it in the disk so it can be served when the client application requests it. In a way it's a subscription as it uses rules from this config file to load the associated feed and save it in the disk from time to time. 

# Installation

* install Node, with nvm 
* npm install
* ImageMagick ( some scripts may try to take screenshots ) 

# Launching  

sudo node mediator 

Point your browser to: 

    http://localhost:8888/static/index.html
   
    If you want to launch a ./static/index.html app you need to install yourself

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
