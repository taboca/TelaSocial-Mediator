{
"rules": [

{
 "about":"start",
 "function":"execCommand",
 "data":{"argument":"open /Applications/Mozilla/Chromeless.app"},
 "to":"start/checked"
},

{ "about":"start/checked",
 "function":"timer",
 "data":{"value":30000},
 "to":"start"
}

]

}

