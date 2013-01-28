
function refreshFlex() { 
	
    var allSize = $('.flexcontainer').innerHeight();
 	var accHeight = 0;	
    var listItems = new Array(); 

	$('.flex').each( function () { 
		var hh = $(this).innerHeight();
        var curr = $(this).attr('data-flex');
		if(curr != 'expand') { 
            listItems.push(this);
		    accHeight+=hh;	
		} 
	} );
		
	var done = false;
	$('.flex[data-flex="expand"]').each( function () { 
		$(this).css('height',parseInt(allSize-accHeight)+'px');	
	});

} 

