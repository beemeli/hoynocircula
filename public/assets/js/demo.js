// Copyright IBM Corp. 2015  All Rights Reserved.
// IBM Insights for Twitter Demo App

// optimized for speed
                           
var resultados = [];

var cellColors = [ "689fd5", "87b2dd", "a3c4e5", "c7ddf3", "e1edfb" ];

function getCellColor(depth) {
	return cellColors[Math.min(depth, cellColors.length - 1)];
}

function renderArray(arr, depth) {
	depth = depth || 0;
	var s = "";
	if (arr.length) {
		s += '<div class="cde_array">'

		for (var i = 0; i < arr.length; i++) {
			s += '<div class="cde_item">';
			if (typeof arr[i] == "object") {
				if (arr[i] instanceof Array) {
					s += renderArray(arr[i], depth + 1);
				} else {
					s += renderObject(arr[i], depth + 1);
				}
			} else {
				s += '<span style="padding:3px;">' + arr[i] + '</span>';
			}
			s += '</div>';
		}
		s += '</div>';
	}
	return s;
}

function renderObject(obj, depth) {
	depth = depth || 0; 
	var s = "";
	s += '<div class="cde_object">'
	+		'<table cellpadding="0" cellspacing="0px" width="100%">'
	for (var n in obj) {
		s +=	'<tr>'
		+	 		'<td  align="left" valign="top" class="cde_cell_property"'
		+					' bgcolor="#' + getCellColor(depth) + '" style="border:1px solid #cccccc;">' 
		+ 				'<span style="padding:5px; color:' + (depth == 0 ? '#FFFFFF' : '#000000') + '" style="border:1px solid silver;">'
		+					n
		+				'</span>'
		+ 			'</td>'
		+			'<td align="left" valign="top" width="100%" class="cde_cell_value" bgcolor="#' + getCellColor(depth) + '"' 
		+				(typeof obj[n] != "object" ? ' style="border:1px solid #cccccc;"' : '') + '>';

		if (n == "image") {
			s += '<img src="' + obj[n] + '"/>'
		} else if (typeof obj[n] == "object") {
			if (obj[n] instanceof Array) {
				s += renderArray(obj[n], depth + 1);
			} else {
				s += renderObject(obj[n], depth + 1);
			}
		} else {
			s += '<span style="padding:5px;">' + obj[n] + '</span>';
		}

		s += 		'</td>'
		+		'</tr>';
	}
	s +=	'</table>'
	+	'</div>';
	return s;
}

function renderTweetBody(body, evidence) {
	if (evidence && evidence.length) {
		var i, l = evidence.length;
		for (i = 0; i < l; i++) {
			body = body.split(evidence[i].sentimentTerm)
					.join('<span class="sentiment_' + evidence[i].polarity.toLowerCase() + '">' + evidence[i].sentimentTerm + '</span>')
		}
	}
	return body;
}

function renderSMATweet(tweet, id) {
	var actor = tweet.message.actor || {};
	var sentiment = "";
	var evidence = [];
	if (tweet && tweet.cde && tweet.cde.content && tweet.cde.content.sentiment) {
		if (tweet.cde.content.sentiment.polarity) {
			sentiment = tweet.cde.content.sentiment.polarity.toLowerCase();
		}
		if (tweet.cde.content.sentiment.evidence) {
			evidence = tweet.cde.content.sentiment.evidence;
		}
	}
	var s = 
		'<div class="i4twitter_item">'
	+		'<table style="width:700px; margin: 0 auto;">'
	+			'<tr>'
	+				'<td valign="top" rowspan="3">'
	+					'<img class="i4twitter_image" src="' + actor.image + '">'
	+				'</td>'
	+				'<td width="100%">'
	+					'<span class="i4twitter_name">' + actor.displayName + '</span>'
	+					'<span class="i4twitter_user">@' + actor.preferredUsername + '</span>'
	+				'</td>'
	+			'</tr>'
	+			'<tr>'
	+				'<td>'
	+					'<div style="border-bottom:1px solid silver;">'
	+						'<span class="i4twitter_sentiment i4twitter_sentiment_' + sentiment + '">'
	+							'&nbsp;'
	+						'</span>'
	+						'<span class="i4twitter_body">' 
	+ 							renderTweetBody(tweet.message.body, evidence) 
	+ 						'</span>'
	+					'</div>'
	+				'</td>'
	+			'</tr>'
	+			'<tr>'
	+				'<td>'
	+					'<span class="i4twitter_insight">IBM </span>'
	+					'<a href="javascript:showSection(\'tweet\', \'insight\', ' + id + ')">'
	+						'<span id="i4twitter_insight_link_' + id + '" class="i4twitter_insight">Insights</span>'
	+					'</a>'
	+					'<span class="i4twitter_insight"> for </span>'
	+					'<a href="javascript:showSection(\'insight\', \'tweet\', ' + id + ')">'
	+						'<span id="i4twitter_tweet_link_' + id + '" class="i4twitter_tweet">Twitter</span>'
	+					'</a>'
	+				'</td>'
	+			'</tr>'
	+		'<table>'
	+	'</div>'
	+ 	'<div id="i4twitter_insight_' + id + '" style="display:none;"></div>'
	+ 	'<div id="i4twitter_tweet_' + id + '" style="display:none;"></div>';
	return s;
}

var activeViews = {};
var activeTweets = [];

function renderSMATweets(tweets) {
	var s = "";
	activeViews = {};
	activeTweets = tweets;
	var i, l = tweets.length;
	for (i = 0; i < l; i++) {
		s += renderSMATweet(tweets[i], i);
	}
	return s;
}

function showSection(from, to, id) {
	var efrom = $('#i4twitter_' + from + '_' + id);
	var efromlink = $('#i4twitter_' + from + '_link_' + id);
	var eto = $('#i4twitter_' + to + '_' + id);
	var etolink = $('#i4twitter_' + to + '_link_' + id);
	if (eto.is(":visible")) {
		eto.hide("slow");
		etolink.css("font-size", "10px");
	} else {
		efrom.hide("slow");
		efromlink.css("font-size", "10px");
		if (!activeViews[to + id]) {
			eto.html(renderObject(to == "insight" ? { cde: activeTweets[id].cde } : { message: activeTweets[id].message }));
			activeViews[to + id] = true;
		}
		eto.show("slow");
		etolink.css("font-size", "14px");
	}
}

function searchEnter() {
	if (searchText().trim() != "") {
		document.getElementById('search_button').click();
	}
}

// 332x270  166x135
function spinnerStart() {
	$("#display_spinner").html('<img class="spinner" width="166px" height="135px" src="images/twitter_flapping.gif"/>');
}

function spinnerStop() {
	$("#display_spinner").html('');
}

function searchText() {
	return $("#search_text").val();
}

function searchReset() {
	$("#display_query").text("");
	$("#display_count").text("");
	$("#display_markup").text("");
}

function displaySearch(result) {
	if (result.error) {
		$("#display_query").text("Error: " + result.status_code);
		$("#display_markup").text(result.error.description);
	} else if (result.search && result.search.results) {
		$("#display_query").text(searchText());
		$("#display_count").text(result.search.results);
		$("#display_markup").html(renderSMATweets(result.tweets));
	} else {
		$("#display_query").text("No results");
	}
}

function displayCount(query, count) {
	$("#display_query").text(query);
	$("#display_count").text(count);
	$("#display_markup").text("");
}

function showError(msg) {
	$("#display_query").text(msg);
	$("#display_count").text("");
}

function countTweets(term) {
	if (term != "") {
		searchReset();
		spinnerStart();
	   	$.ajax({
			url: "/api/count",
			type: 'GET',
			contentType:'application/json',
			data: {
				q: term
			},
	  		success: function(data) {
	  			spinnerStop();
				displayCount(data.query, data.count);
			},
			error: function(xhr, textStatus, thrownError) {
	  			spinnerStop();
				showError("Error: " + textStatus);
			}
		});
	}
}
function searchTweets(term) {
	if (term != "") {
		searchReset();
		spinnerStart();
	   	$.ajax({
			url: "/api/search",
			type: 'GET',
			contentType:'application/json',
			data: {
				q: term
			},
	  		success: function(data) {
	  			spinnerStop();
                                
				displaySearch(data);
                                console.log(data);
			},
			error: function(xhr, textStatus, thrownError) {
	  			spinnerStop();
				showError("Error: " + textStatus);
			}
		});
	}
}

function generar_query1(){

    //buscarTweets(generadorquery(0));
    //contarTweets(generadorquery(0));
    
    //generarValoresGrafica1();
        var fecha = "posted:2016-04-05";

    var genero = $("#genero").val();
    var transporte = $("#transporte").val();

    return generarValoresGrafica2("HoyNoCircula",fecha,"","","");//1
    

}

function generar_query2(transporte){
    var fecha = "posted:2016-04-05";
    var genero = $("#genero").val();

    return generarValoresGrafica2("HoyNoCircula",fecha,"",transporte,"");//2
    
}
function generar_query3(){
    var fecha = "posted:2016-04-05";

    var genero = $("#genero").val();
    var transporte = $("#transporte").val();

    return generarValoresGrafica2("(DobleNoCircula OR DobleHoyNoCircula)",fecha,"","","");//3
}
function generar_query4(transporte, genero){
    var fecha = "posted:2016-04-05";

    //var genero = $("#genero").val();
    //var transporte = $("#transporte").val();

   return generarValoresGrafica2("HoyNoCircula",fecha,"",transporte,genero);//4   
}
function generar_query5(){
    var fecha = $("#fecha").val();
    var genero = $("#genero").val();
    var transporte = $("#transporte").val();

   return generarValoresGrafica2("HoyNoCircula",fecha,"sinsentimientos","","");//4   
}
function generar_query6(transporte, fecha, genero){
    //var fecha = $("#fecha").val();
    //var genero = $("#genero").val();
    //var transporte = $("#transporte").val();

   return generarValoresGrafica2("HoyNoCircula",fecha,"sinsentimientos",transporte,"");//4   
}
function generarValoresGrafica2(hoynocircula,fecha,sentimiento,transporte,genero){
    
   // var hoynocircula = "HoyNoCircula";
    //var genero="";
    resultados =[];
    console.log(  $("#transporte").val());
    
    if(sentimiento==""){
    contarTweets(query_grafica2(hoynocircula,fecha,"positive",transporte,genero));
    contarTweets(query_grafica2(hoynocircula,fecha,"negative",transporte,genero));
    contarTweets(query_grafica2(hoynocircula,fecha,"neutral",transporte,genero));
    //contarTweets(query_grafica2(hoynocircula,fecha,"ambivalent",transporte,genero));
    }
    else{
        contarTweets(query_grafica2(hoynocircula,fecha,"",transporte,genero));

    }


    for(var i=0; i<resultados.length; i++){
            console.log("Resultados2["+ i+"]: " + resultados[i]);

    }
    console.log("");
    return resultados;


}
function query_grafica2(hoynocircula,fecha,sentimiento,transporte,genero){
   // var hoynocircula = "HoyNoCircula";
    fecha = " AND "+fecha;
   if(sentimiento!=""){
    sentimiento =  " AND sentiment:" + sentimiento;
   }
    if(transporte!=""){
        transporte = " AND "+ transporte;
    }
    if(genero!=""){
        genero = " AND gender:"+genero; 
    }
    var query = hoynocircula  + fecha  +sentimiento  + transporte + genero ;
    console.log("2: "+ query);
    return query;
}




function generadorquery(opcion){
    var hoynocircula = "HoyNoCircula";
    var fecha = "posted:2016-04-05";
    
    var query;
            
    switch(opcion){
        case 0: 
            var transporte =  $("#transporte").val();
            var sentimiento = "sentiment:"+ $("#sentimiento").val();
            var genero = "gender:"+ $("#genero").val();
            query = hoynocircula + " AND " + fecha +" AND " + transporte + " AND "+sentimiento +" AND " +genero;   
            break;
        case 1:
            var sentimiento = "sentiment:"+ $("#sentimiento").val();
            query = hoynocircula + " AND " + fecha  + " AND "+sentimiento;
            break;
        
        
    }
    return query;
}
function buscarTweets(query) {
	if (query != "") {
		searchReset();
		spinnerStart();
	   	$.ajax({
			url: "/api/search",
			type: 'GET',
			contentType:'application/json',
			data: {
				q: query
			},
	  		success: function(data) {
	  			spinnerStop();    
                                pintarJson(data);
                                console.log(data);
                                $("body").html(data);

			},
			error: function(xhr, textStatus, thrownError) {
	  			spinnerStop();
				showError("Error: " + textStatus);
			}
		});
	}
}
function pintarJson(data){
    
    $("#jsonresult").html(data);

}

function contarTweets(query) {
	if (query != "") {
		searchReset();
		spinnerStart();
	   	$.ajax({
			url: "/api/count",
			type: 'GET',
                        async: false,

			contentType:'application/json',
			data: {
				q: query
			},
	  		success: function(data) {
	  			spinnerStop();
                                //console.log("contarTweets " + data.count);
                                displayCount(data.query, data.count);

                                resultados.push(data.count);
                                return(data.count);
				//displayCount(data.query, data.count);
			},
			error: function(xhr, textStatus, thrownError) {
	  			spinnerStop();
				showError("Error: " + textStatus);
			}
		});
	}
}
    	
//Y++++++++++++++++++++++GENERAL-+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
general = {
    initPickColor: function(){
        $('.pick-class-label').click(function(){
            var new_class = $(this).attr('new-class');  
            var old_class = $('#display-buttons').attr('data-class');
            var display_div = $('#display-buttons');
            if(display_div.length) {
            var display_buttons = display_div.find('.btn');
            display_buttons.removeClass(old_class);
            display_buttons.addClass(new_class);
            display_div.attr('data-class', new_class);
            }
        });
    },
    
    initChartist: function(){    
        
    //************BARRAS*******************
        //JSON
        var autoarr = generar_query2("(auto OR coche OR carro)");
        var metroarr = generar_query2("metro");
        var metrobusarr = generar_query2("metrobus"); 
        var trenligeroarr = generar_query2("((Tren Ligero)OR trenLigero)"); 
        var uberarr = generar_query2("(uber OR cabify)"); 
        var biciarr = generar_query2("(bicicleta OR bici)");
        var camionarr = generar_query2("(RTP OR camion)");

        var transportePositivos = [autoarr[0], metroarr[0], metrobusarr[0], trenligeroarr[0], uberarr[0], biciarr[0], camionarr[0]];  
        var transporteNegativos = [autoarr[1], metroarr[1], metrobusarr[1], trenligeroarr[1], uberarr[1], biciarr[1], camionarr[1]];  
        
        var data = {
          labels: ['Autos', 'Metro', 'Metrobús', 'Tren Ligero', 'Uber/Cabify', 'Bicicleta', 'Camión'],
          series: [
            transportePositivos,
            transporteNegativos
          ]
        };
        
        var options = {
            seriesBarDistance: 10,
            axisX: {
                showGrid: false
            },
            height: "245px"
        };
        
        var responsiveOptions = [
          ['screen and (max-width: 640px)', {
            seriesBarDistance: 5,
            axisX: {
              labelInterpolationFnc: function (value) {
                return value[0];
              }
            }
          }]
        ];
        
        Chartist.Bar('#chartActivity', data, options, responsiveOptions) 
        
    //**********PIE NIVELES DE FELICIDAD***************
        //JSON
        //hoy no circula
        //var felicidadHombres = [5, 10, 2];
        var felicidadHombres = generar_query1();
        //doble hoy no circula
        var felicidadMujeres = generar_query3();
        
        var dataPreferences = {
            series: [
                []
            
        ]};
        
        var optionsPreferences = {
            donut: true,
            donutWidth: 40,
            startAngle: 0,
            total: 100,
            showLabel: false,
            axisX: {
                showGrid: false
            }
        };
        
        
        Chartist.Pie('#chartPreferences', dataPreferences, optionsPreferences);
        Chartist.Pie('#chartPreferences2', dataPreferences, optionsPreferences);
        
    //HOYNOCIRCULA
        Chartist.Pie('#chartPreferences', {
            series: felicidadHombres,
          labels: [''+felicidadHombres[0],''+felicidadHombres[1],''+felicidadHombres[2]]
        });  
        
    //DOBLEHOYNOCIRCULA
        Chartist.Pie('#chartPreferences2', {
            series: felicidadMujeres,
          labels: [''+felicidadMujeres[0],''+felicidadMujeres[1],''+felicidadMujeres[2]]
        });  
    },
}

//Y+++++++++++++++++++++++++++AUTO/CARRO/COCHE+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
autos = {
    initPickColor: function(){
        $('.pick-class-label').click(function(){
            var new_class = $(this).attr('new-class');  
            var old_class = $('#display-buttons').attr('data-class');
            var display_div = $('#display-buttons');
            if(display_div.length) {
            var display_buttons = display_div.find('.btn');
            display_buttons.removeClass(old_class);
            display_buttons.addClass(new_class);
            display_div.attr('data-class', new_class);
            }
        });
    },
    
    initChartist: function(){    
    /************TIEMPO********************************/
        //JSON
        var autos0 = generar_query6("(auto OR coche OR carro)", "posted:2016-04-05T00:00:00Z,2016-04-05T06:00:00Z");
        var autos1 = generar_query6("(auto OR coche OR carro)", "posted:2016-04-05T06:00:00Z,2016-04-05T09:00:00Z");
        var autos2 = generar_query6("(auto OR coche OR carro)", "posted:2016-04-05T09:00:00Z,2016-04-05T12:00:00Z");
        var autos3 = generar_query6("(auto OR coche OR carro)", "posted:2016-04-05T12:00:00Z,2016-04-05T15:00:00Z");
        var autos4 = generar_query6("(auto OR coche OR carro)", "posted:2016-04-05T15:00:00Z,2016-04-05T18:00:00Z");
        var autos5 = generar_query6("(auto OR coche OR carro)", "posted:2016-04-05T18:00:00Z,2016-04-05T20:00:00Z");
        var autos6 = generar_query6("(auto OR coche OR carro)", "posted:2016-04-05T20:00:00Z,2016-04-05T23:59:59Z");
        var autos7 = generar_query6("(auto OR coche OR carro)", "posted:2016-04-05T00:00:00Z,2016-04-05T06:00:00Z");
        var autosHorarioTweets = [autos0[0], autos1[0], autos2[0], autos3[0], autos4[0], autos5[0], autos6[0], autos7[0]]
       
        var dataSales = {
          labels: ['0:00AM', '6:00AM', '9:00AM', '12:00PM', '3:00PM', '6:00PM', '9:00PM', '12:59PM'],
          series: [
             autosHorarioTweets
          ]
        };
        
        var optionsSales = {
          lineSmooth: false,
          low: 0,
          high: 50,
          showArea: true,
          height: "245px",
          axisX: {
            showGrid: false,
          },
          lineSmooth: Chartist.Interpolation.simple({
            divisor: 3
          }),
          showLine: false,
          showPoint: false,
        };
        
        var responsiveSales = [
          ['screen and (max-width: 640px)', {
            axisX: {
              labelInterpolationFnc: function (value) {
                return value[0];
              }
            }
          }]
        ];
    
        Chartist.Line('#chartHours', dataSales, optionsSales, responsiveSales);
        
    //**********PIE NIVELES DE FELICIDAD***************
        //JSON
        var felicidadHombres = generar_query4("(auto OR coche OR carro)", "male");
        var felicidadMujeres = generar_query4("(auto OR coche OR carro)", "female");
        
        var dataPreferences = {
            series: [
                []
            
        ]};
        
        var optionsPreferences = {
            donut: true,
            donutWidth: 40,
            startAngle: 0,
            total: 100,
            showLabel: false,
            axisX: {
                showGrid: false
            }
        };
        
        
        Chartist.Pie('#chartPreferences', dataPreferences, optionsPreferences);
        Chartist.Pie('#chartPreferences2', dataPreferences, optionsPreferences);
        
    //PIE HOMBRES 
        Chartist.Pie('#chartPreferences', {
            series: felicidadHombres,
          labels: [''+felicidadHombres[0],''+felicidadHombres[1],''+felicidadHombres[2]]
        });  
        
    //PIE MUJERES
        Chartist.Pie('#chartPreferences2', {
            series: felicidadMujeres,
          labels: [''+felicidadMujeres[0],''+felicidadMujeres[1],''+felicidadMujeres[2]]
        });  
    },
}

//Y+++++++++++++++++++++++++++METROBUS+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
metrobus = {
    initPickColor: function(){
        $('.pick-class-label').click(function(){
            var new_class = $(this).attr('new-class');  
            var old_class = $('#display-buttons').attr('data-class');
            var display_div = $('#display-buttons');
            if(display_div.length) {
            var display_buttons = display_div.find('.btn');
            display_buttons.removeClass(old_class);
            display_buttons.addClass(new_class);
            display_div.attr('data-class', new_class);
            }
        });
    },
    
    initChartist: function(){    
    /************TIEMPO********************************/
        //JSON
        var autos0 = generar_query6("metrobus", "posted:2016-04-05T00:00:00Z,2016-04-05T06:00:00Z");
        var autos1 = generar_query6("metrobus", "posted:2016-04-05T06:00:00Z,2016-04-05T09:00:00Z");
        var autos2 = generar_query6("metrobus", "posted:2016-04-05T09:00:00Z,2016-04-05T12:00:00Z");
        var autos3 = generar_query6("metrobus", "posted:2016-04-05T12:00:00Z,2016-04-05T15:00:00Z");
        var autos4 = generar_query6("metrobus", "posted:2016-04-05T15:00:00Z,2016-04-05T18:00:00Z");
        var autos5 = generar_query6("metrobus", "posted:2016-04-05T18:00:00Z,2016-04-05T20:00:00Z");
        var autos6 = generar_query6("metrobus", "posted:2016-04-05T20:00:00Z,2016-04-05T23:59:59Z");
        var autos7 = generar_query6("metrobus", "posted:2016-04-05T00:00:00Z,2016-04-05T06:00:00Z");
        var autosHorarioTweets = [autos0[0], autos1[0], autos2[0], autos3[0], autos4[0], autos5[0], autos6[0], autos7[0]]
       
        var dataSales = {
          labels: ['0:00AM', '6:00AM', '9:00AM', '12:00PM', '3:00PM', '6:00PM', '9:00PM', '12:59PM'],
          series: [
             autosHorarioTweets
          ]
        };
        
        var optionsSales = {
          lineSmooth: false,
          low: 0,
          high: 20,
          showArea: true,
          height: "245px",
          axisX: {
            showGrid: false,
          },
          lineSmooth: Chartist.Interpolation.simple({
            divisor: 3
          }),
          showLine: false,
          showPoint: false,
        };
        
        var responsiveSales = [
          ['screen and (max-width: 640px)', {
            axisX: {
              labelInterpolationFnc: function (value) {
                return value[0];
              }
            }
          }]
        ];
    
        Chartist.Line('#chartHours', dataSales, optionsSales, responsiveSales);
        
    //**********PIE NIVELES DE FELICIDAD***************
        //JSON
        var felicidadHombres = generar_query4("metrobus", "male");
        var felicidadMujeres = generar_query4("metrobus", "female");
        
        var dataPreferences = {
            series: [
                []
            
        ]};
        
        var optionsPreferences = {
            donut: true,
            donutWidth: 40,
            startAngle: 0,
            total: 100,
            showLabel: false,
            axisX: {
                showGrid: false
            }
        };
        
        
        Chartist.Pie('#chartPreferences', dataPreferences, optionsPreferences);
        Chartist.Pie('#chartPreferences2', dataPreferences, optionsPreferences);
        
    //PIE HOMBRES 
        Chartist.Pie('#chartPreferences', {
            series: felicidadHombres,
          labels: [''+felicidadHombres[0],''+felicidadHombres[1],''+felicidadHombres[2]]
        });  
        
    //PIE MUJERES
        Chartist.Pie('#chartPreferences2', {
            series: felicidadMujeres,
          labels: [''+felicidadMujeres[0],''+felicidadMujeres[1],''+felicidadMujeres[2]]
        });  
    },
}
//Y+++++++++++++++++++++++++++METRO+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
metro = {
    initPickColor: function(){
        $('.pick-class-label').click(function(){
            var new_class = $(this).attr('new-class');  
            var old_class = $('#display-buttons').attr('data-class');
            var display_div = $('#display-buttons');
            if(display_div.length) {
            var display_buttons = display_div.find('.btn');
            display_buttons.removeClass(old_class);
            display_buttons.addClass(new_class);
            display_div.attr('data-class', new_class);
            }
        });
    },
    
    initChartist: function(){    
    /************TIEMPO********************************/
        //JSON
        var autos0 = generar_query6("metro", "posted:2016-04-05T00:00:00Z,2016-04-05T06:00:00Z");
        var autos1 = generar_query6("metro", "posted:2016-04-05T06:00:00Z,2016-04-05T09:00:00Z");
        var autos2 = generar_query6("metro", "posted:2016-04-05T09:00:00Z,2016-04-05T12:00:00Z");
        var autos3 = generar_query6("metro", "posted:2016-04-05T12:00:00Z,2016-04-05T15:00:00Z");
        var autos4 = generar_query6("metro", "posted:2016-04-05T15:00:00Z,2016-04-05T18:00:00Z");
        var autos5 = generar_query6("metro", "posted:2016-04-05T18:00:00Z,2016-04-05T20:00:00Z");
        var autos6 = generar_query6("metro", "posted:2016-04-05T20:00:00Z,2016-04-05T23:59:59Z");
        var autos7 = generar_query6("metro", "posted:2016-04-05T00:00:00Z,2016-04-05T06:00:00Z");
        var autosHorarioTweets = [autos0[0], autos1[0], autos2[0], autos3[0], autos4[0], autos5[0], autos6[0], autos7[0]]
       
        var dataSales = {
          labels: ['0:00AM', '6:00AM', '9:00AM', '12:00PM', '3:00PM', '6:00PM', '9:00PM', '12:59PM'],
          series: [
             autosHorarioTweets
          ]
        };
        
        var optionsSales = {
          lineSmooth: false,
          low: 0,
          high: 20,
          showArea: true,
          height: "245px",
          axisX: {
            showGrid: false,
          },
          lineSmooth: Chartist.Interpolation.simple({
            divisor: 3
          }),
          showLine: false,
          showPoint: false,
        };
        
        var responsiveSales = [
          ['screen and (max-width: 640px)', {
            axisX: {
              labelInterpolationFnc: function (value) {
                return value[0];
              }
            }
          }]
        ];
    
        Chartist.Line('#chartHours', dataSales, optionsSales, responsiveSales);
        
    //**********PIE NIVELES DE FELICIDAD***************
        //JSON
        var felicidadHombres = generar_query4("metro", "male");
        var felicidadMujeres = generar_query4("metro", "female");
        
        var dataPreferences = {
            series: [
                []
            
        ]};
        
        var optionsPreferences = {
            donut: true,
            donutWidth: 40,
            startAngle: 0,
            total: 100,
            showLabel: false,
            axisX: {
                showGrid: false
            }
        };
        
        
        Chartist.Pie('#chartPreferences', dataPreferences, optionsPreferences);
        Chartist.Pie('#chartPreferences2', dataPreferences, optionsPreferences);
        
    //PIE HOMBRES 
        Chartist.Pie('#chartPreferences', {
            series: felicidadHombres,
          labels: [''+felicidadHombres[0],''+felicidadHombres[1],''+felicidadHombres[2]]
        });  
        
    //PIE MUJERES
        Chartist.Pie('#chartPreferences2', {
            series: felicidadMujeres,
          labels: [''+felicidadMujeres[0],''+felicidadMujeres[1],''+felicidadMujeres[2]]
        });  
    },
}
//Y+++++++++++++++++++++++++++TREN LIGERO+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
trenLigero = {
      initPickColor: function(){
          $('.pick-class-label').click(function(){
              var new_class = $(this).attr('new-class');  
              var old_class = $('#display-buttons').attr('data-class');
              var display_div = $('#display-buttons');
              if(display_div.length) {
              var display_buttons = display_div.find('.btn');
              display_buttons.removeClass(old_class);
              display_buttons.addClass(new_class);
              display_div.attr('data-class', new_class);
              }
          });
      },
      
      initChartist: function(){    
      /************TIEMPO********************************/
          //JSON
         var autos0 = generar_query6("((Tren Ligero)OR trenLigero)", "posted:2016-04-05T00:00:00Z,2016-04-05T06:00:00Z");
 	var autos1 = generar_query6("((Tren Ligero)OR trenLigero)", "posted:2016-04-05T06:00:00Z,2016-04-05T09:00:00Z");
 	var autos2 = generar_query6("((Tren Ligero)OR trenLigero)", "posted:2016-04-05T09:00:00Z,2016-04-05T12:00:00Z");
 	var autos3 = generar_query6("((Tren Ligero)OR trenLigero)", "posted:2016-04-05T12:00:00Z,2016-04-05T15:00:00Z");
 	var autos4 = generar_query6("((Tren Ligero)OR trenLigero)", "posted:2016-04-05T15:00:00Z,2016-04-05T18:00:00Z");
 	var autos5 = generar_query6("((Tren Ligero)OR trenLigero)", "posted:2016-04-05T18:00:00Z,2016-04-05T20:00:00Z");
 	var autos6 = generar_query6("((Tren Ligero)OR trenLigero)", "posted:2016-04-05T20:00:00Z,2016-04-05T23:59:59Z");
         var autos7 = generar_query6("((Tren Ligero)OR trenLigero)", "posted:2016-04-05T00:00:00Z,2016-04-05T06:00:00Z");
         var autosHorarioTweets = [autos0[0], autos1[0], autos2[0], autos3[0], autos4[0], autos5[0], autos6[0], autos7[0]]
        
       
         
          var dataSales = {
            labels: ['0:00AM', '6:00AM', '9:00AM', '12:00PM', '3:00PM', '6:00PM', '9:00PM', '12:59PM'],
            series: [
               autosHorarioTweets
            ]
          };
          
          var optionsSales = {
            lineSmooth: false,
            low: 0,
            high: 20,
            showArea: true,
            height: "245px",
            axisX: {
              showGrid: false,
            },
            lineSmooth: Chartist.Interpolation.simple({
              divisor: 3
            }),
            showLine: false,
            showPoint: false,
          };
          
          var responsiveSales = [
            ['screen and (max-width: 640px)', {
              axisX: {
                labelInterpolationFnc: function (value) {
                  return value[0];
                }
              }
            }]
          ];
      
          Chartist.Line('#chartHours', dataSales, optionsSales, responsiveSales);
          
      //**********PIE NIVELES DE FELICIDAD***************
          //JSON
          var felicidadHombres = generar_query4("((Tren Ligero)OR trenLigeroi)", "male");
          var felicidadMujeres = generar_query4("((Tren Ligero)OR trenLigeroi)", "female");
          
          var dataPreferences = {
              series: [
                  []
              
          ]};
          
          var optionsPreferences = {
              donut: true,
              donutWidth: 40,
              startAngle: 0,
              total: 100,
              showLabel: false,
              axisX: {
                  showGrid: false
              }
          };
          
          
          Chartist.Pie('#chartPreferences', dataPreferences, optionsPreferences);
          Chartist.Pie('#chartPreferences2', dataPreferences, optionsPreferences);
          
      //PIE HOMBRES 
          Chartist.Pie('#chartPreferences', {
              series: felicidadHombres,
            labels: [''+felicidadHombres[0],''+felicidadHombres[1],''+felicidadHombres[2]]
          });  
          
      //PIE MUJERES
          Chartist.Pie('#chartPreferences2', {
              series: felicidadMujeres,
            labels: [''+felicidadMujeres[0],''+felicidadMujeres[1],''+felicidadMujeres[2]]
          });  
      },
}

//Y+++++++++++++++++++++++++++UBER/YXI/CABIFY+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
uber = {
     initPickColor: function(){
         $('.pick-class-label').click(function(){
             var new_class = $(this).attr('new-class');  
             var old_class = $('#display-buttons').attr('data-class');
             var display_div = $('#display-buttons');
             if(display_div.length) {
             var display_buttons = display_div.find('.btn');
             display_buttons.removeClass(old_class);
             display_buttons.addClass(new_class);
             display_div.attr('data-class', new_class);
             }
         });
     },
     
     initChartist: function(){    
     /************TIEMPO********************************/
         //JSON
         var autos0 = generar_query6("(uber OR cabify)", "posted:2016-04-05T00:00:00Z,2016-04-05T06:00:00Z");
 	var autos1 = generar_query6("(uber OR cabify)", "posted:2016-04-05T06:00:00Z,2016-04-05T09:00:00Z");
 	var autos2 = generar_query6("(uber OR cabify)", "posted:2016-04-05T09:00:00Z,2016-04-05T12:00:00Z");
 	var autos3 = generar_query6("(uber OR cabify)", "posted:2016-04-05T12:00:00Z,2016-04-05T15:00:00Z");
 	var autos4 = generar_query6("(uber OR cabify)", "posted:2016-04-05T15:00:00Z,2016-04-05T18:00:00Z");
 	var autos5 = generar_query6("(uber OR cabify)", "posted:2016-04-05T18:00:00Z,2016-04-05T20:00:00Z");
 	var autos6 = generar_query6("(uber OR cabify)", "posted:2016-04-05T20:00:00Z,2016-04-05T23:59:59Z");
         var autos7 = generar_query6("(uber OR cabify)", "posted:2016-04-05T00:00:00Z,2016-04-05T06:00:00Z");
         var autosHorarioTweets = [autos0[0], autos1[0], autos2[0], autos3[0], autos4[0], autos5[0], autos6[0], autos7[0]]
        
         var dataSales = {
           labels: ['0:00AM', '6:00AM', '9:00AM', '12:00PM', '3:00PM', '6:00PM', '9:00PM', '12:59PM'],
           series: [
              autosHorarioTweets
           ]
         };
         
         var optionsSales = {
           lineSmooth: false,
           low: 0,
           high: 20,
           showArea: true,
           height: "245px",
           axisX: {
             showGrid: false,
           },
           lineSmooth: Chartist.Interpolation.simple({
             divisor: 3
           }),
           showLine: false,
           showPoint: false,
         };
         
         var responsiveSales = [
           ['screen and (max-width: 640px)', {
             axisX: {
               labelInterpolationFnc: function (value) {
                 return value[0];
               }
             }
           }]
         ];
     
         Chartist.Line('#chartHours', dataSales, optionsSales, responsiveSales);
         
     //**********PIE NIVELES DE FELICIDAD***************
         //JSON
         var felicidadHombres = generar_query4("(uber OR cabify)", "male");
         var felicidadMujeres = generar_query4("(uber OR cabify)", "female");
         
         var dataPreferences = {
             series: [
                 []
             
         ]};
         
         var optionsPreferences = {
             donut: true,
             donutWidth: 40,
             startAngle: 0,
             total: 100,
             showLabel: false,
             axisX: {
                 showGrid: false
             }
         };
         
         
         Chartist.Pie('#chartPreferences', dataPreferences, optionsPreferences);
         Chartist.Pie('#chartPreferences2', dataPreferences, optionsPreferences);
         
     //PIE HOMBRES 
         Chartist.Pie('#chartPreferences', {
             series: felicidadHombres,
           labels: [''+felicidadHombres[0],''+felicidadHombres[1],''+felicidadHombres[2]]
         });  
         
     //PIE MUJERES
         Chartist.Pie('#chartPreferences2', {
             series: felicidadMujeres,
           labels: [''+felicidadMujeres[0],''+felicidadMujeres[1],''+felicidadMujeres[2]]
         });  
     },
}

//Y+++++++++++++++++++++++++++BICICLETA+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
bici = {
     initPickColor: function(){
         $('.pick-class-label').click(function(){
             var new_class = $(this).attr('new-class');  
             var old_class = $('#display-buttons').attr('data-class');
             var display_div = $('#display-buttons');
             if(display_div.length) {
             var display_buttons = display_div.find('.btn');
             display_buttons.removeClass(old_class);
             display_buttons.addClass(new_class);
             display_div.attr('data-class', new_class);
             }
         });
     },
     
     initChartist: function(){    
     /************TIEMPO********************************/
         //JSON
        var autos0 = generar_query6("(bicicleta OR bici)", "posted:2016-04-05T00:00:00Z,2016-04-05T06:00:00Z");
        var autos1 = generar_query6("(bicicleta OR bici)", "posted:2016-04-05T06:00:00Z,2016-04-05T09:00:00Z");
        var autos2 = generar_query6("(bicicleta OR bici)", "posted:2016-04-05T09:00:00Z,2016-04-05T12:00:00Z");
        var autos3 = generar_query6("(bicicleta OR bici)", "posted:2016-04-05T12:00:00Z,2016-04-05T15:00:00Z");
        var autos4 = generar_query6("(bicicleta OR bici)", "posted:2016-04-05T15:00:00Z,2016-04-05T18:00:00Z");
        var autos5 = generar_query6("(bicicleta OR bici)", "posted:2016-04-05T18:00:00Z,2016-04-05T20:00:00Z");
        var autos6 = generar_query6("(bicicleta OR bici)", "posted:2016-04-05T20:00:00Z,2016-04-05T23:59:59Z");
        var autos7 = generar_query6("(bicicleta OR bici)", "posted:2016-04-05T00:00:00Z,2016-04-05T06:00:00Z");
        var autosHorarioTweets = [autos0[0], autos1[0], autos2[0], autos3[0], autos4[0], autos5[0], autos6[0], autos7[0]]
        
         var dataSales = {
           labels: ['0:00AM', '6:00AM', '9:00AM', '12:00PM', '3:00PM', '6:00PM', '9:00PM', '12:59PM'],
           series: [
              autosHorarioTweets
           ]
         };
         
         var optionsSales = {
           lineSmooth: false,
           low: 0,
           high: 20,
           showArea: true,
           height: "245px",
           axisX: {
             showGrid: false,
           },
           lineSmooth: Chartist.Interpolation.simple({
             divisor: 3
           }),
           showLine: false,
           showPoint: false,
         };
         
         var responsiveSales = [
           ['screen and (max-width: 640px)', {
             axisX: {
               labelInterpolationFnc: function (value) {
                 return value[0];
               }
             }
           }]
         ];
     
         Chartist.Line('#chartHours', dataSales, optionsSales, responsiveSales);
         
     //**********PIE NIVELES DE FELICIDAD***************
         //JSON
         var felicidadHombres = generar_query4("(bicicleta OR bici)", "male");
         var felicidadMujeres = generar_query4("(bicicleta OR bici)", "female");
         
         var dataPreferences = {
             series: [
                 []
             
         ]};
         
         var optionsPreferences = {
             donut: true,
             donutWidth: 40,
             startAngle: 0,
             total: 100,
             showLabel: false,
             axisX: {
                 showGrid: false
             }
         };
         
         
         Chartist.Pie('#chartPreferences', dataPreferences, optionsPreferences);
         Chartist.Pie('#chartPreferences2', dataPreferences, optionsPreferences);
         
     //PIE HOMBRES 
         Chartist.Pie('#chartPreferences', {
             series: felicidadHombres,
           labels: [''+felicidadHombres[0],''+felicidadHombres[1],''+felicidadHombres[2]]
         });  
         
     //PIE MUJERES
         Chartist.Pie('#chartPreferences2', {
             series: felicidadMujeres,
           labels: [''+felicidadMujeres[0],''+felicidadMujeres[1],''+felicidadMujeres[2]]
         });  
     },
}

//Y+++++++++++++++++++++++++++CAMION+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
camion = {
    initPickColor: function(){
        $('.pick-class-label').click(function(){
            var new_class = $(this).attr('new-class');  
            var old_class = $('#display-buttons').attr('data-class');
            var display_div = $('#display-buttons');
            if(display_div.length) {
            var display_buttons = display_div.find('.btn');
            display_buttons.removeClass(old_class);
            display_buttons.addClass(new_class);
            display_div.attr('data-class', new_class);
            }
        });
    },
    
    initChartist: function(){    
    /************TIEMPO********************************/
        //JSON
        var autos0 = generar_query6("(RTP OR camion)", "posted:2016-04-05T00:00:00Z,2016-04-05T06:00:00Z");
        var autos1 = generar_query6("(RTP OR camion)", "posted:2016-04-05T06:00:00Z,2016-04-05T09:00:00Z");
        var autos2 = generar_query6("(RTP OR camion)", "posted:2016-04-05T09:00:00Z,2016-04-05T12:00:00Z");
        var autos3 = generar_query6("(RTP OR camion)", "posted:2016-04-05T12:00:00Z,2016-04-05T15:00:00Z");
        var autos4 = generar_query6("(RTP OR camion)", "posted:2016-04-05T15:00:00Z,2016-04-05T18:00:00Z");
        var autos5 = generar_query6("(RTP OR camion)", "posted:2016-04-05T18:00:00Z,2016-04-05T20:00:00Z");
        var autos6 = generar_query6("(RTP OR camion)", "posted:2016-04-05T20:00:00Z,2016-04-05T23:59:59Z");
        var autos7 = generar_query6("(RTP OR camion)", "posted:2016-04-05T00:00:00Z,2016-04-05T06:00:00Z");
        var autosHorarioTweets = [autos0[0], autos1[0], autos2[0], autos3[0], autos4[0], autos5[0], autos6[0], autos7[0]]
       
        var dataSales = {
          labels: ['0:00AM', '6:00AM', '9:00AM', '12:00PM', '3:00PM', '6:00PM', '9:00PM', '12:59PM'],
          series: [
             autosHorarioTweets
          ]
        };
        
        var optionsSales = {
          lineSmooth: false,
          low: 0,
          high: 30,
          showArea: true,
          height: "245px",
          axisX: {
            showGrid: false,
          },
          lineSmooth: Chartist.Interpolation.simple({
            divisor: 3
          }),
          showLine: false,
          showPoint: false,
        };
        
        var responsiveSales = [
          ['screen and (max-width: 640px)', {
            axisX: {
              labelInterpolationFnc: function (value) {
                return value[0];
              }
            }
          }]
        ];
    
        Chartist.Line('#chartHours', dataSales, optionsSales, responsiveSales);
        
    //**********PIE NIVELES DE FELICIDAD***************
        //JSON
        var felicidadHombres = generar_query4("(RTP OR camion)", "male");
        var felicidadMujeres = generar_query4("(RTP OR camion)", "female");
        
        var dataPreferences = {
            series: [
                []
            
        ]};
        
        var optionsPreferences = {
            donut: true,
            donutWidth: 40,
            startAngle: 0,
            total: 100,
            showLabel: false,
            axisX: {
                showGrid: false
            }
        };
        
        
        Chartist.Pie('#chartPreferences', dataPreferences, optionsPreferences);
        Chartist.Pie('#chartPreferences2', dataPreferences, optionsPreferences);
        
    //PIE HOMBRES 
        Chartist.Pie('#chartPreferences', {
            series: felicidadHombres,
          labels: [''+felicidadHombres[0],''+felicidadHombres[1],''+felicidadHombres[2]]
        });  
        
    //PIE MUJERES
        Chartist.Pie('#chartPreferences2', {
            series: felicidadMujeres,
          labels: [''+felicidadMujeres[0],''+felicidadMujeres[1],''+felicidadMujeres[2]]
        });  
    },
}

