;(function($){	
	$.fn.monthpicker = function(options){
		
		if(typeof options != 'object')
			options = {};
		
		validElems = this.filter('input');
		
		if(options.destroy == "destroy"){
			validElems.each(function(){
				$(this).data('monthpicker-widget',null).unbind('keydown.monthpicker');
			})
			return this;
		}
		
			//Options parsing: use jQuery's internal. Set the default first, then try to use the user's
			var dummy = $('<div></div>');
			dummy.css('color','#5A5A5A'); dummy.css('color',options.colorDefault); options.colorDefault = dummy.css('color');
			dummy.css('color','#bebebe'); dummy.css('color',options.colorHover); options.colorHover = dummy.css('color');
			dummy.css('color','#0099FF'); dummy.css('color',options.colorSelected); options.colorSelected = dummy.css('color');
			dummy.css('color','#DDDDDD'); dummy.css('color',options.colorBknd); options.colorBknd = dummy.css('color');
			dummy.css('color','#FFFFFF'); dummy.css('color',options.colorMonthTxt); options.colorMonthTxt = dummy.css('color');
			dummy.css('color','#000000'); dummy.css('color',options.colorYearTxt); options.colorYearTxt = dummy.css('color');
			dummy.css('font-size','12px'); dummy.css('font-size',options.fontSize); options.fontSize = dummy.css('font-size');
			dummy.css('font-family','sans-serif'); dummy.css('font-family',options.font); options.font = dummy.css('font-family');
			if(typeof(options.submitText) != "string") options.submitText = "Enter";
			options.minPoint = parseRange(options.minPoint);
			options.maxPoint = parseRange(options.maxPoint);
			//Min cannot be greater than max: invalidates both options.
			if((options.minPoint != null && options.maxPoint != null) && options.minPoint > options.maxPoint){
				options.minPoint = null; options.maxPoint = null;
			}
			//options.type can be "range" to do from-to. Default is single.
		
		validElems.each(function(){
			
			
			//Basic structure
			var picker = $('<div></div>');
			picker.data("input",$(this))
				.css({"display":"none","position":"absolute","border":"solid 1px #5A5A5A","padding":"5px","background-color":options.colorBknd,"font-family":options.font,"font-size":options.fontSize,"font-weight":"bold"});
			if(options.type == "range"){
				picker.append(createOne("from").css("margin-bottom","10px"))
					  .append(createOne("to"))
					  .attr("class","monthpicker-range");
			}
			else{
				picker.append(createOne("to"))
					  .attr("class","monthpicker-single");
			}
			//Store and reset.
			$(this).data("monthpicker-widget",picker).data("value","");
			//Events
			picker.bind("close",closeHandler)
			//Give back focus on tab event.
			.bind('keydown.monthpicker',keydownHandler);
			$(this).focus(function(){
				var p = $(this).data("monthpicker-widget");
				setValidMonths.call(p);
				p.appendTo('body')
					.css({"left":$(this).offset().left+"px","top":$(this).offset().top+$(this).height()+6+"px"})
					.click(function(e){e.stopPropagation(); return false;})
					.fadeIn(200,function(){$(this).data('ready',true)});
				$(document).bind("click.hideMonthpicker",function(e){
					if(e.button == 2) return true;
					$(document).unbind("click.hideMonthpicker");
					$('body>div[class*="monthpicker-"]').trigger("close");
					//field.blur();
				});
			})
			.keydown(function(e){
				if(forbiddenChars(e.which,$(this))){
					return false;
				}
				$(document).trigger("click.hideMonthpicker");
				return true;
			})
			.keyup(function(e){
				switch(e.which){
					case 16: case 17: case 18: $(this).data('monthpicker-funckey',false); break;
				}
				return true;
			})
			//General onblur was giving MSIE trouble because non-inputs can receive focus.
			.click(function(e){if($(this).data("monthpicker-widget").data('ready') != true); e.stopPropagation();
				//close the others
				$('body>div[class*="monthpicker-"]').each(function(){
					if($(this).data('ready')) $(this).trigger("close");
				});
			});
		});
		return this;
		
		function forbiddenChars(key,origInput){
			if(origInput.data('monthpicker-funckey') == true) return false;
			switch(key){
				case 16: case 17: case 18: origInput.data('monthpicker-funckey',true); return false; break;
				//enter
				case 13: $('body').trigger('click.hideMonthpicker'); return false; break;
				//caps, tab
				case 9:  case 20: return false; break;
				//fkeys
				case 112: case 113: case 114: case 115: case 116: case 117: case 118: case 119: case 120: case 121: case 122: case 123:
					return false; break;
				default : return true; break;
			}
		}
		
		//Used to create monthpicker-widget components, sets needed events and data.
		function createOne(id){
			//Default year cannot be greater than max year if max year is less than this year.
			maxYear = (options.maxPoint != null && options.maxPoint.getFullYear() < new Date().getFullYear()) ? options.maxPoint.getFullYear() : new Date().getFullYear();
			var div = $('<div class="monthpicker-'+id+'"></div')
				.css({"text-align":"center"});
			//Set the year and movement buttons, initialize storage, bind events.
			div.append('<input class="monthpicker-scroll prev" type="button" style="float:left;width:25px;padding:0" value="<<"/>')
				.append('<input class="monthpicker-scroll next" type="button" style="float:right;width:25px;padding:0" value=">>"/>')
				.append('<div class="curr" style="display:inline-block;width:35px;padding-top:5px;margin-left:auto;margin-right: auto;text-align:center;color:'+options.colorYearTxt+'">'+maxYear+'</div>')
				
				.append('<div class="months-'+id+'" style="clear:both"></div>')
				.css({'width':'270px'})
				.data("date",null);
			//Set the months
			$.each(['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],function(i,e){
				if(i == 6) div.find('.months-'+id).append('<br/>');
				var month = $('<span class="month-'+id+'">'+e+'</span>')
					.css({"display":"inline-block","background-color":options.colorDefault,"width":"35px","cursor":"pointer","height":"16px","margin":"5px","color":options.colorMonthTxt,"text-align":"center"})
					.data({"value":i+1,"field":id})
					.hover(function(){
						if(!$(this).hasClass("selected") && !$(this).hasClass("out_of_range")) $(this).css("background-color",options.colorHover)},
						function(){if(!$(this).hasClass("selected")) $(this).css("background-color",options.colorDefault)});
				div.find('.months-'+id).append(month);
			});
			
			//A confirm button for more intuitive UI.
			if(id == 'to'){
				var set = $('<input type="button" value="'+options.submitText+'"/>')
					.click(function(){$(this).closest('.monthpicker-single,.monthpicker-range').trigger("close")})
					.appendTo(div);
				var clr = $('<input type="button" value="Clear"/>')
					.click(function(){
						var div = $(this).closest('.monthpicker-single,.monthpicker-range');
						div.find('[id^="months"]').data('value',null)
								.find('[class^="month"]').removeClass('selected').css({"background-color":options.colorDefault});
						div.find('.monthpicker-to,.monthpicker-from').data('date',null).end().trigger("close")
					})
					.appendTo(div);
			}
			
			//Set month/year actions.
			div.find('.month-'+id).bind("click",monthClickHandler);
			
			
			//Handle the year movement buttons
			//Year going back and foward is auto adjusted so that from <= to
			div.find('.monthpicker-scroll').click(function(e){
				var year = $(this).siblings('.curr');
				if($(this).hasClass("next") && (options.maxPoint == null || year.html() < options.maxPoint.getFullYear())){
					year.html(parseInt(year.html())+1)
					var picker = $(this).parent().parent();
						if(picker.hasClass("monthpicker-range") && picker.find('.monthpicker-to .curr').html() < year.html()){
							var to = picker.find('.monthpicker-to');
							to.find('.curr').html(year.html());
							var d = to.data('date');
							if(d != null)
								d.setYear(year.html());
						}
						setValidMonths.call(picker);
				}
				else if($(this).hasClass("prev") && (options.minPoint == null || year.html() > options.minPoint.getFullYear())){
					year.html(parseInt(year.html())-1);
					var picker = $(this).parent().parent();
					if(picker.hasClass("monthpicker-range") && picker.find('.monthpicker-from .curr').html() > year.html()){
						var from = picker.find('.monthpicker-from');
						from.find('.curr').html(year.html());
						var d = from.data('date');
						if(d != null)
							d.setYear(year.html());
					}
					setValidMonths.call(picker);
				}
				var currDate = $(this).parent().data("date");
				if(currDate != null)
					currDate.setYear(year.html());
					//Check for month incompatibility given new year. Need to avoid the toggle with the extra parameter.
				var direction = $(this).hasClass("next") ? "next" : "prev";
				$(this).parent().find('.selected').trigger("click",[{"simulated":true, "direction":direction}]);
				$(this).blur();
			});
			//Avoid text-highlight.
			div.find('*').andSelf().mousedown(function(e){e.preventDefault();});
			//Above requires caring for buttons specially.
			div.find('.monthpicker-scroll').mousedown(function(e){e.stopPropagation();});
			//Don't kill self on internal click
			div.find('*').andSelf().mouseup(function(e){e.stopPropagation();});
			return div;
		}
		
		function keydownHandler(e){
			if(e.which == 9){
				$(document).trigger("click.hideMonthpicker");
				$(":input:eq(" + $(":input").index($(this).data('input')[0]) + 1 + ")").focus();
			}
			else return false;
		};
		
		function closeHandler(){
			var picker = $(this);
			var field = picker.data("input");
			var to = $(this).children('.monthpicker-to');
			if(to.data("date") != null)
				var todate = to.data("date").getMonth()+1+"/"+to.data("date").getFullYear();
			else todate = "";
				if(picker.hasClass("monthpicker-single")) //One date - just populate the field
					field.val(todate);
				else{//Two dates: need to account for to AND from in format
					var from = $(this).children('.monthpicker-from');
					if(from.data("date") != null)
						var fromdate = from.data("date").getMonth()+1+"/"+from.data("date").getFullYear();
					else fromdate = "";
					if(!(fromdate == "" && todate == ""))
						field.val(fromdate+' - '+todate)
					else field.val("");
				}
			$(this).fadeOut(200,function(){$(this).data('ready',false)});
			
		}
		
		//handler for the month
		function monthClickHandler(e,params){
				var monthpicker = $(this).parent().parent().parent();
				var to = monthpicker.children('.monthpicker-to');
				if(monthpicker.hasClass("monthpicker-single")){//One date - just change color, set data.
					//Check if valid
					if(!withinBounds($(this).data("value"),to.find(".curr").html()))
						if(params != undefined && params.simulated){//Keep trying next greatest month recursively.
							if(params.direction == "next"){
								if($(this).data("value") == 7)
									$(this).prev().prev('.month-to').trigger("click",[{simulated: true, 'direction':params.direction}])
								else
									$(this).prev('.month-to').trigger("click",[{simulated: true, 'direction':params.direction}])
							}
							else
								if($(this).data("value") == 6)
									$(this).next().next('.month-to').trigger("click",[{simulated: true, 'direction':params.direction}])
								else
									$(this).next('.month-to').trigger("click",[{simulated: true, 'direction':params.direction}])
							return false;
						}
						else
							return false;
					$(this).siblings().removeClass("selected").css({"background-color":options.colorDefault});
					if(!$(this).hasClass("selected") || (params != undefined && params.simulated))
						$(this).addClass("selected").css({"background-color":options.colorSelected});
					else $(this).removeClass("selected").css({"background-color":options.colorDefault});
					if(to.find('.selected').length > 0)
						to.data("date",new Date($(this).data("value")+"/1"+"/"+to.find(".curr").html()))
					else to.data("date",null);
				}
				else{//Two dates: need to compare to/from dates on same year.
					var from = monthpicker.children('.monthpicker-from');
					if($(this).data("field") == "from"){
						//Check if valid
					if(!withinBounds($(this).data("value"),from.find(".curr").html()))
						if(params != undefined && params.simulated){//Keep trying next most past month recursively.
							if(params.direction == "next"){
								if($(this).data("value") == 7)
									$(this).prev().prev('.month-from').trigger("click",[{simulated: true, 'direction':params.direction}])
								else
									$(this).prev('.month-from').trigger("click",[{simulated: true, 'direction':params.direction}])
							}
							else
								if($(this).data("value") == 6)
									$(this).next().next('.month-from').trigger("click",[{simulated: true, 'direction':params.direction}])
								else
									$(this).next('.month-from').trigger("click",[{simulated: true, 'direction':params.direction}])
							return false;
						}
						else
							return false;
						$(this).siblings().removeClass("selected").css({"background-color":options.colorDefault});
						if(!$(this).hasClass("selected") || (params != undefined && params.simulated))
							$(this).addClass("selected").css({"background-color":options.colorSelected});
						else $(this).removeClass("selected").css({"background-color":options.colorDefault});
						selectedTo = to.find('.month-to.selected'); //console.log(selectedTo.data("value"));
						if(selectedTo.length > 0 && to.find('.curr').html() == from.find('.curr').html())
							if((selectedTo.data("value") < $(this).data("value"))){//Set both equal if from > to.
								var toMonths = to.find('.month-to');
								toMonths.removeClass("selected").css({"background-color":options.colorDefault});
								$(toMonths[$(this).data("value")-1]).addClass("selected").css({"background-color":options.colorSelected});
								to.data("date",new Date($(this).data("value")+"/1"+"/"+to.find(".curr").html()))//Sets to if changed
							}
						if(from.find('.selected').length > 0)
							from.data("date",new Date($(this).data("value")+"/1"+"/"+from.find(".curr").html()))//Sets from
						else from.data("date",null);
					}
					else{
						//Check if valid
						if(!withinBounds($(this).data("value"),to.find(".curr").html()))
						if(params != undefined && params.simulated){//Keep trying next greatest month recursively.
							if(params.direction == "next"){
								if($(this).data("value") == 7)
									$(this).prev().prev('.month-to').trigger("click",[{simulated: true, 'direction':params.direction}])
								else
									$(this).prev('.month-to').trigger("click",[{simulated: true, 'direction':params.direction}])
							}
							else
								if($(this).data("value") == 6)
									$(this).next().next('.month-to').trigger("click",[{simulated: true, 'direction':params.direction}])
								else
									$(this).next('.month-to').trigger("click",[{simulated: true, 'direction':params.direction}])
							return false;
						}
						else
							return false;
						$(this).siblings().removeClass("selected").css({"background-color":options.colorDefault});
						if(!$(this).hasClass("selected") || params.simulated)
							$(this).addClass("selected").css({"background-color":options.colorSelected});
						else $(this).removeClass("selected").css({"background-color":options.colorDefault});
						selectedFrom = from.find('.month-from.selected');
						if(selectedFrom.length > 0 && to.find('.curr').html() == from.find('.curr').html()) 
							if(selectedFrom.data("value") > $(this).data("value")){//Set both equal if from > to.
								var fromMonths = from.find('.month-from');
								fromMonths.removeClass("selected").css({"background-color":options.colorDefault});
								$(fromMonths[$(this).data("value")-1]).addClass("selected").css({"background-color":options.colorSelected});
								from.data("date",new Date($(this).data("value")+"/1"+"/"+from.find(".curr").html())) //Sets from if changed
							}
						if(to.find('.selected').length > 0)
							to.data("date",new Date($(this).data("value")+"/1"+"/"+to.find(".curr").html()))//Sets to
						else to.data("date",null);
					}
				}
					
			};
		
		//Called from picker context
		function setValidMonths(){
			var from = $(this).find('.monthpicker-from'), to = $(this).find('.monthpicker-to');
			if(from !== undefined)
				$(this).find('span[class^="month-from"]').each(function(){
					if(!withinBounds($(this).data("value"),from.find(".curr").html())){
						$(this).fadeTo(0,0.7).addClass('out_of_range');
					}
					else{
						$(this).fadeTo(0,1).removeClass('out_of_range');;
					}
				});
			$(this).find('span[class^="month-to"]').each(function(i,e){
				if(!withinBounds($(this).data("value"),to.find(".curr").html())){
					$(this).fadeTo(0,0.7).addClass('out_of_range');
				}
				else{
					$(this).fadeTo(0,1).removeClass('out_of_range');
				}
			});
		}
		
		function parseRange(val){
			//Blank
			if(val == undefined) return null;
			//Specific month/year
			if(typeof(val) == "string" && val.split("/").length == 2){
				var m = parseInt(val.split("/")[0]), y = parseInt(val.split("/")[1]);
				if(isNaN(m) || isNaN(y) || Math.floor(m) > 12 || m < 1 || y < 0) return null;
				else return new Date(m+"/"+"1/"+y);
			}
			//Date object
			if(val.getHours !== undefined){
				return val;
			}
			//today
			else if(val == 'today'){
				var d = new Date();
				d.setDate(1); d.setHours(0); d.setMinutes(0); d.setSeconds(0); d.setMilliseconds(0);
				return d; 
			}
			//Bad value
			else return null;
		}
		
		function withinBounds(month,year){
			var attempted = new Date(month+"/1/"+year);
			if(options.minPoint != null){
				if(options.minPoint > attempted)
					return false;
			}
			if(options.maxPoint != null){
				if(options.maxPoint < attempted)
					return false;
			}
			return true;
		}
	}
})(jQuery);