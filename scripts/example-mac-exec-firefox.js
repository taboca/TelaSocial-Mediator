{
"rules": [

{ "about":"start",
 "function":"timer",
 "data":{"value":3000},
 "to":"start/checked"
},
{
 "about":"start/checked",
 "function":"execCommand",
 "data":{"argument":"/Applications/Firefox.app"},
 "to":"start"
}


]

}

