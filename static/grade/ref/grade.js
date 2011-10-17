/*

	event is an event item 
	attributes 
	we create axis by 2 attributes 
	pick focus ( rows and cols ) 
	process event

*/
var dias = [10,11,12];
var espacos = ['brasil','paraguai','3','4','5','6','7'];
var titleEspacos = ['Espaço Brasil','Espaco Paraguai','Espaço Uruguai','Espaço Bolívia','Espaço Chile','Espaço Peru','Espaço Equador'];

var horarios = [10,11,12,13,14,15,16,16];
var titleHorarios = ['10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'];

var grade =  {

	descricao : new Array(),
	head : '',
	local : new Array(),

	start : function () { 

		this.element = document.createElement('div');
		this.element.setAttribute("class","gradeContainer");
		document.getElementById('container').appendChild(this.element);
		var ddate = new Date();

		dday = ddate.getDate();
/*
		var currentDay = this.evento[dday];
*/

		var strBuffer = "<table class='grade'>";

/*
		var strBuffer ="<tr><td colspan='7'><h2> " + this.descricao[dday] + "</h2></td>";
		strBuffer+="<td><h3> " + this.local[dday] + "</h3></td></tr>";

*/
		strBuffer += '<tr> <th class="EmptyHeader"> Horário </th> <th class="RoomCell">Espaço Brasil</th> <th class="RoomCell">Espaço Paraguai</th> <th class="RoomCell">Espaço Uruguai</th> <th class="RoomCell">Espaço Bolívia</th> <th class="RoomCell">Espaço Chile</th> <th class="RoomCell">Espaço Peru</th> <th class="RoomCell">Espaço Equador</th> </tr>';

		for ( horario in horarios ) { 
			strBuffer +="<tr>";
			var cols=0;
			for ( local in espacos ) { 
				if(cols==0) { 
				    strBuffer+="<td id=''></td>";
				} 
				var currentItemId="local_"+espacos[local]+"_horario_"+horarios[horario];
				strBuffer+="<td class='cellEvent' id='"+currentItemId+"'></td>";
				cols++;
			} 
			strBuffer += "</tr>";
		} 

		strBuffer+="</table>";

		this.element.innerHTML += strBuffer;

		this.updateEvent();

		this.tick();

	} ,

	updateEvent: function () { 
		var eventItem;
		while (eventItem = this.eventos.pop()) { 
			var hours = 0;
			var mins  = 0;
			hours = parseInt(eventItem.inicio.split(":")[0]);
			local = eventItem.local;
			descricao = eventItem.descricao;
			mins  = parseInt(eventItem.fim.split(":")[1]);
			try  { 
				var strId = "local_"+ local +"_horario_"+hours;
				var locati = document.getElementById(strId);
				$("#"+strId).addClass("cellActive");
				locati.innerHTML=eventItem.descricao;
			} catch (i) { 

			} 
		}
	}, 

	tick : function () {
		this.data = new Date();
		this.month = this.data.getMonth() + 1;
		this.day = this.data.getDate();
		
		this.hours = this.data.getHours();
		this.minutes = this.data.getMinutes();
                var ddate = new Date();
                var currentDay = this.evento[ddate.getDate()];
                var innerAll = "";

		var font=200;
		var actual = this.hours * 60 + this.minutes; 

                for (key in currentDay) {
                        var eventItem = currentDay[key];
			var hours =0;
			try { 
				hours =   parseInt(eventItem.fim.split(":")[0])*60 + parseInt(eventItem.fim.split(":")[1]);
			} catch(i) { hours = 3600 } 

			if( hours<actual ) { 
 				document.getElementById("rule_"+hours).style.display="none";	
			} else { 
 				document.getElementById("rule_"+hours).style.fontSize=font+"%";	
				font*=.9;
			}  
			

                }

		var scopedThis = this;
		setTimeout( function () { scopedThis.tick() }, 5000);
	},

	init : function () { 
		this.descricao["11"] = "11th International Workshop on Real and Complex Singularities";
		this.local["11"] = "Wednesday 28th @ ICMC USP";
		this.descricao["12"] = "11th International Workshop on Real and Complex Singularities";
		this.local["12"] = "Thursday 29th @ ICMC USP";
	} ,

eventos : [ 

{ 
  date: '19/10/2011',
  inicio: "10:00",
  fim: "18:00 ",
  descricao: "PHP in 2011Rasmus LerdorfKeynote",
  sigla: "- ", 
  local: "brasil",
  apresentador: ""
},

{ 
  date: '19/10/2011',
  inicio: "11:00",
  fim: "12:00 ",
  descricao: "Novas APIs do Drupal 7José San MartinDrupalCamp",
  sigla: "- ", 
  local: "brasil",
  apresentador: ""
},

{ 
  date: '19/10/2011',
  inicio: "11:00",
  fim: "12:00 ",
  descricao: "O Software Público Brasileiro como agente de mudança no modelo de desenvolvimento de softwaresSeyr Lemos de Souza",
  sigla: "- ", 
  local: "paraguai",
  apresentador: ""
},

] 


} // end of grade 


