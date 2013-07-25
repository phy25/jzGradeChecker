/*
Common functions
*/
// Init object
if(!jzgc) var jzgc = {};

jzgc.config = {
	version: ['chrome-extension', '0.7.0', 'http://github.phy25.com/jzGradeChecker/'],
	// A sequential exam list **TODO**
	examListOrganized: [],
	konamiCode: "' or ''='"
};

jzgc.user = {
	save: function(xuehao, password, id){
		// Ignore ID
		if(localStorage){
			var old = this.get(id);
			if(!xuehao) xuehao = old[0];
			if(!password) password = old[1];
			localStorage['stu_arr_0'] = xuehao + ';' + password;
			return true;
		}else{
			return false;
		}
	},
	saveArray: function(array, id){
		// Ignore ID
		if(localStorage){
			localStorage['stu_arr_0'] = array.join(';');
			return true;
		}else{
			return false;
		}
	},
	get: function(id){
		// Ignore ID
		return localStorage ?
			(localStorage['stu_arr_0'] || '').split(';') :
			[0, 0];
	},
	attrSave: function(key, value, id){
		// Ignore ID
		if(localStorage){
			localStorage['stu_arr_0_'+key] = value;
			return true;
		}else{
			return false;
		}
	},
	attrGet: function(key, id){
		// Ignore ID
		return localStorage ?
			localStorage['stu_arr_0_'+key] :
			false;
	},
	clear: function(id){
		// Ignore ID; clear infomation only (attr uncleared)
		if(localStorage){
			localStorage['stu_arr_0'] = undefined;
			return true;
		}else{
			return false;
		}
	},
	isAvailable: function(id){
		if(this._isSaveable()){
			if(id === undefined){
				return true;
			}else{
				return this.get(id)[0] > 0;
			}
		}else{
			return false;
		}
	},
	_isSaveable: function(){
		return localStorage ? true : false;
	}
};

// JSON2 from http://www.JSON.org/js.html
"object"!=typeof JSON&&(JSON={}),function(){function f(a){return 10>a?"0"+a:a}function quote(a){return escapable.lastIndex=0,escapable.test(a)?'"'+a.replace(escapable,function(a){var b=meta[a];return"string"==typeof b?b:"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+a+'"'}function str(a,b){var c,d,e,f,h,g=gap,i=b[a];switch(i&&"object"==typeof i&&"function"==typeof i.toJSON&&(i=i.toJSON(a)),"function"==typeof rep&&(i=rep.call(b,a,i)),typeof i){case"string":return quote(i);case"number":return isFinite(i)?String(i):"null";case"boolean":case"null":return String(i);case"object":if(!i)return"null";if(gap+=indent,h=[],"[object Array]"===Object.prototype.toString.apply(i)){for(f=i.length,c=0;f>c;c+=1)h[c]=str(c,i)||"null";return e=0===h.length?"[]":gap?"[\n"+gap+h.join(",\n"+gap)+"\n"+g+"]":"["+h.join(",")+"]",gap=g,e}if(rep&&"object"==typeof rep)for(f=rep.length,c=0;f>c;c+=1)"string"==typeof rep[c]&&(d=rep[c],e=str(d,i),e&&h.push(quote(d)+(gap?": ":":")+e));else for(d in i)Object.prototype.hasOwnProperty.call(i,d)&&(e=str(d,i),e&&h.push(quote(d)+(gap?": ":":")+e));return e=0===h.length?"{}":gap?"{\n"+gap+h.join(",\n"+gap)+"\n"+g+"}":"{"+h.join(",")+"}",gap=g,e}}"function"!=typeof Date.prototype.toJSON&&(Date.prototype.toJSON=function(){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z":null},String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(){return this.valueOf()});var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={"\b":"\\b","	":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},rep;"function"!=typeof JSON.stringify&&(JSON.stringify=function(a,b,c){var d;if(gap="",indent="","number"==typeof c)for(d=0;c>d;d+=1)indent+=" ";else"string"==typeof c&&(indent=c);if(rep=b,b&&"function"!=typeof b&&("object"!=typeof b||"number"!=typeof b.length))throw new Error("JSON.stringify");return str("",{"":a})}),"function"!=typeof JSON.parse&&(JSON.parse=function(text,reviver){function walk(a,b){var c,d,e=a[b];if(e&&"object"==typeof e)for(c in e)Object.prototype.hasOwnProperty.call(e,c)&&(d=walk(e,c),void 0!==d?e[c]=d:delete e[c]);return reviver.call(a,b,e)}var j;if(text=String(text),cx.lastIndex=0,cx.test(text)&&(text=text.replace(cx,function(a){return"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})),/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,"")))return j=eval("("+text+")"),"function"==typeof reviver?walk({"":j},""):j;throw new SyntaxError("JSON.parse")})}();


/*
	* Konami-JS ~ 
	* :: Now with support for touch events and multiple instances for 
	* :: those situations that call for multiple easter eggs!
	* Code: http://konami-js.googlecode.com/
	* Examples: http://www.snaptortoise.com/konami-js
	* Copyright (c) 2009 George Mandis (georgemandis.com, snaptortoise.com)
	* Version: 1.4.1 (3/1/2013)
	* Licensed under the GNU General Public License v3
	* http://www.gnu.org/copyleft/gpl.html
	* Tested in: Safari 4+, Google Chrome 4+, Firefox 3+, IE7+, Mobile Safari 2.2.1 and Dolphin Browser
*/

var Konami = function(callback){
	var konami = {
		addEvent:function ( obj, type, fn, ref_obj ){
			if (obj.addEventListener)
				obj.addEventListener( type, fn, false );
			else if (obj.attachEvent){
				// IE
				obj["e"+type+fn] = fn;
				obj[type+fn] = function() { obj["e"+type+fn]( window.event,ref_obj ); }
				obj.attachEvent( "on"+type, obj[type+fn] );
			}
		},
		input:"",
		pattern:"38384040373937396665",		
		load: function(link) {					
			this.addEvent(document,"keydown", function(e, ref_obj) {											
				if (ref_obj) konami = ref_obj; // IE
				konami.input+= e ? e.keyCode : event.keyCode;
				if (konami.input.length > konami.pattern.length)
					konami.input = konami.input.substr((konami.input.length - konami.pattern.length));
				if (konami.input == konami.pattern) {
					konami.code(link);
					konami.input = "";
					e.preventDefault();
					return false;
				}
			},this);
	  		this.iphone.load(link);
		},
		code: function(link){window.location=link},
		iphone:{
			start_x:0,
			start_y:0,
			stop_x:0,
			stop_y:0,
			tap:false,
			capture:false,
			orig_keys:"",
			keys:["UP","UP","DOWN","DOWN","LEFT","RIGHT","LEFT","RIGHT","TAP","TAP","TAP"],
			code: function(link) { konami.code(link);},
			load: function(link){
				this.orig_keys = this.keys;
				konami.addEvent(document, "touchmove", function(e){
					if(e.touches.length == 1 && konami.iphone.capture==true){ 
						var touch = e.touches[0]; 
						konami.iphone.stop_x = touch.pageX;
						konami.iphone.stop_y = touch.pageY;
						konami.iphone.tap = false; 
						konami.iphone.capture=false;
						konami.iphone.check_direction();
					}
				});               
				konami.addEvent(document, "touchend", function(evt){
					if(konami.iphone.tap == true) konami.iphone.check_direction(link);           
				},false);
				konami.addEvent(document, "touchstart", function(evt){
					konami.iphone.start_x = evt.changedTouches[0].pageX;
					konami.iphone.start_y = evt.changedTouches[0].pageY;
					konami.iphone.tap = true;
					konami.iphone.capture = true;
				});
			},
			check_direction: function(link){
				x_magnitude = Math.abs(this.start_x-this.stop_x);
				y_magnitude = Math.abs(this.start_y-this.stop_y);
				x = ((this.start_x-this.stop_x) < 0) ? "RIGHT" : "LEFT";
				y = ((this.start_y-this.stop_y) < 0) ? "DOWN" : "UP";
				result = (x_magnitude > y_magnitude) ? x : y;
				result = (this.tap == true) ? "TAP" : result;                     

				if (result == this.keys[0]) this.keys = this.keys.slice(1,this.keys.length);
				if (this.keys.length == 0) { 
					this.keys = this.orig_keys;
					this.code(link);
				}
			}
		}
	}
	
	typeof callback === "string" && konami.load(callback);
	if(typeof callback === "function")  {
		konami.code = callback;
		konami.load();
	}

	return konami;
};