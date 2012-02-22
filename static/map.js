/* Grids On The Fly */

$(document).ready(function() {

   /* This needs to grows to become the grid system placement */

   /* The exercise here is that we want to load the sub elements and internal 
      iframe pages are ready. */

   register("/main/topright", "clock", "./tempo/index.html", iframeTemplate);
//   We failed miserably in the attempt to add the clock to the actual inner 
//   div in the iframe. This because we do not know the rule within the Iframe 
//   And it is so particular. A workaround would be the do path1,path2 but 
//   would that make sense? Why would we specifly precisely inner iframes to be 
//   loaded at the actual component level ( first layer ). We need to organize 
//   a bit better how the composition actually works here and this whole  
//   child -> iframe models..
//   register("/main/header/cabecalho", "clock", "./tempo/index.html", iframeTemplate);

   //register("/main/middle", "abas-meio", "./abas/index.html", iframeTemplate);
   register("/main/middle", "abas-meio", "./typing-json/index.html", iframeTemplate);
//   register("/main/lado", "acontece", "./acontece/index.html", iframeTemplate);
   compile();   
   setTimeout('startEngine()',5000);

});

function startEngine() { 
   s1();
   setTimeout("cicleMidia()",TEMPO_INICIO_MIDIA);
} 

function cicleMidia() { 
   setTimeout( function () { 
	var doc = $("#main #middle #abas").get();
	doc = document.getElementById("abas-meio").contentDocument;
	cc.send( doc.getElementById("galeria").contentDocument, "container", "rotate");
	cicleMidia();
   }, TEMPO_REFRESH_MIDIA);
} 

function s1() { 
  if(document.location.toString().indexOf("mode")>-1) { 
    var param = document.location.toString().split("mode=");
    if(param[1]=="tv") { 
      document.getElementById("viewport").style.width="100%";
      document.getElementById("viewport").style.height="100%";
      animate();
    } 
  } 
} 

function animate() { 
  tv.setup();
  tv.add($('#animation li'));
  tv.play();
  setTimeout("animate()",TEMPO_REFRESH);
} 


