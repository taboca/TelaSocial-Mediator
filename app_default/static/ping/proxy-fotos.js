doFilter = function (that)  { 

 var title = $(that).find('title').text();
 var image = $(that).find('img').attr('src');
 var link = $(that).find('description').text();
 $('#temp').html(link);
 var plainText = $('#temp').text();
 var src = 'http://fotos.mixar.com.br'+image;
 return {'title':title, 'description': plainText, 'src':src};

} 
