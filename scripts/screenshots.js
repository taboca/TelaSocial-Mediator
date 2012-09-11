{
"rules": [

{ "about":"start",
 "function":"timer",
 "data":{"value":10000},
 "to":"start/checked"
},
{
 "about":"start/checked",
 "function":"execCommand",
 "data":{"argument":["./scripts/screenshots/index.sh"]},
 "to":"start"
}


]

}

