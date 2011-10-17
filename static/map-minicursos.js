/* Grids On The Fly */

$(document).ready(function() {
   register("#main #topright", "clock", "./relogio/index.html", iframeTemplate);
   register("#main #topmiddle", "typing", "./typing/index.html", iframeTemplate);
   register("#main #middle", "abas-meio", "./middle-grade/minicursos.html", iframeTemplate);
   register("#main #middle2", "abas-meio", "./social/latinoware.html", iframeTemplate);
   compile();  

});

function startEngine() { 

   s1();
   setTimeout("cicleMidia()",TEMPO_INICIO_MIDIA);

} 

function cicleMidia() { 
   setTimeout( function () { 
	var doc = $("#main #middle #abas").get();
	doc = document.getElementById("abas-meio").contentDocument;
	cc.send( doc.getElementById("midia").contentDocument, "container", "rotate");
	cicleMidia();
   }, TEMPO_REFRESH_MIDIA);
} 

function s1() { 
	if(document.location.toString().indexOf("mode")>-1) { 
		var param = document.location.toString().split("mode=");
		if(param[1]=="tv") { 
			document.getElementById("viewport").style.width="1080";
			document.getElementById("viewport").style.height="1920";
			tv.setup();
               		tv.add($('#animation li'));
			animate();
		} 
	} 
} 
function animate() { 
        tv.play();
	setTimeout("animate()",TEMPO_REFRESH_ABAS);
 } 


