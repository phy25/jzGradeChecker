/*
Common functions
*/
// Init object
if(!jzgc) var jzgc = {};

jzgc.config = {
	version: ['chrome-extension', '0.7.8', 'http://github.phy25.com/jzGradeChecker/'],
	// A sequential exam list **TODO**
	examListOrganized: [],
	konamiCode: "' or ''='",
	urls: {extSite: 'http://github.phy25.com/jzGradeChecker/', examResult: 'http://jszx.stedu.net/jszxcj/search.asp', examList: 'http://jszx.stedu.net/jszxcj/search.htm', contactDeveloper:'http://weibo.com/phy25', GitHubRepo: 'https://github.com/phy25/jzGradeChecker'},
	attrs: ['color', 'lastChecked', 'lastUpgraded', 'name', 'noticeRead', 'noticeReadKonami', 'xuehaoNew', 'xuehaoBefore']
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
	attrClear: function(key, id){
		if(localStorage){
			localStorage.removeItem('stu_arr_0_'+key);
			return true;
		}else{
			return false;
		}
	},
	clear: function(id){
		// Ignore ID; clear infomation only (attr uncleared)
		if(localStorage){
			localStorage.removeItem('stu_arr_0');
			var attrs = jzgc.config.attrs;
			for(key in attrs){
				localStorage.removeItem('stu_arr_0_' + attrs[key]);
			}
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
				return +this.get(id)[0] > 0;
			}
		}else{
			return false;
		}
	},
	_isSaveable: function(){
		return localStorage ? true : false;
	}
};

// Migration from 0.7.5
jzgc.user.attrClear('newxuehao');

jzgc.settings = {
	set: function(key, value){
		if(localStorage){
			localStorage[key] = value;
			return true;
		}else{
			return false;
		}
	},
	get: function(key){
		return localStorage ?
			localStorage[key] :
			false;
	},
	isSaveable: function(){
		return localStorage ? true : false;
	}
};

jzgc.utils = {
	loadingEff: function(state){
		if(state == true){
			this.loadingEffOff();
			return false;
		}

		$('body').fadeTo(100, 0.25)
			.one('contextmenu dblclick', this.loadingEffOff);
	},
	loadingEffOff: function(){
		$('body').fadeTo(100, 1);
		return false;
	}
};

// JSON2 from http://www.JSON.org/js.html
"object"!=typeof JSON&&(JSON={}),function(){function f(a){return 10>a?"0"+a:a}function quote(a){return escapable.lastIndex=0,escapable.test(a)?'"'+a.replace(escapable,function(a){var b=meta[a];return"string"==typeof b?b:"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+a+'"'}function str(a,b){var c,d,e,f,h,g=gap,i=b[a];switch(i&&"object"==typeof i&&"function"==typeof i.toJSON&&(i=i.toJSON(a)),"function"==typeof rep&&(i=rep.call(b,a,i)),typeof i){case"string":return quote(i);case"number":return isFinite(i)?String(i):"null";case"boolean":case"null":return String(i);case"object":if(!i)return"null";if(gap+=indent,h=[],"[object Array]"===Object.prototype.toString.apply(i)){for(f=i.length,c=0;f>c;c+=1)h[c]=str(c,i)||"null";return e=0===h.length?"[]":gap?"[\n"+gap+h.join(",\n"+gap)+"\n"+g+"]":"["+h.join(",")+"]",gap=g,e}if(rep&&"object"==typeof rep)for(f=rep.length,c=0;f>c;c+=1)"string"==typeof rep[c]&&(d=rep[c],e=str(d,i),e&&h.push(quote(d)+(gap?": ":":")+e));else for(d in i)Object.prototype.hasOwnProperty.call(i,d)&&(e=str(d,i),e&&h.push(quote(d)+(gap?": ":":")+e));return e=0===h.length?"{}":gap?"{\n"+gap+h.join(",\n"+gap)+"\n"+g+"}":"{"+h.join(",")+"}",gap=g,e}}"function"!=typeof Date.prototype.toJSON&&(Date.prototype.toJSON=function(){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z":null},String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(){return this.valueOf()});var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={"\b":"\\b","	":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},rep;"function"!=typeof JSON.stringify&&(JSON.stringify=function(a,b,c){var d;if(gap="",indent="","number"==typeof c)for(d=0;c>d;d+=1)indent+=" ";else"string"==typeof c&&(indent=c);if(rep=b,b&&"function"!=typeof b&&("object"!=typeof b||"number"!=typeof b.length))throw new Error("JSON.stringify");return str("",{"":a})}),"function"!=typeof JSON.parse&&(JSON.parse=function(text,reviver){function walk(a,b){var c,d,e=a[b];if(e&&"object"==typeof e)for(c in e)Object.prototype.hasOwnProperty.call(e,c)&&(d=walk(e,c),void 0!==d?e[c]=d:delete e[c]);return reviver.call(a,b,e)}var j;if(text=String(text),cx.lastIndex=0,cx.test(text)&&(text=text.replace(cx,function(a){return"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})),/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,"")))return j=eval("("+text+")"),"function"==typeof reviver?walk({"":j},""):j;throw new SyntaxError("JSON.parse")})}();


// Konami-JS
var Konami=function(a){var b={addEvent:function(a,b,c,d){a.addEventListener?a.addEventListener(b,c,!1):a.attachEvent&&(a["e"+b+c]=c,a[b+c]=function(){a["e"+b+c](window.event,d)},a.attachEvent("on"+b,a[b+c]))},input:"",pattern:"38384040373937396665",load:function(a){this.addEvent(document,"keydown",function(c,d){return d&&(b=d),b.input+=c?c.keyCode:event.keyCode,b.input.length>b.pattern.length&&(b.input=b.input.substr(b.input.length-b.pattern.length)),b.input==b.pattern?(b.code(a),b.input="",c.preventDefault(),!1):void 0},this),this.iphone.load(a)},code:function(a){window.location=a},iphone:{start_x:0,start_y:0,stop_x:0,stop_y:0,tap:!1,capture:!1,orig_keys:"",keys:["UP","UP","DOWN","DOWN","LEFT","RIGHT","LEFT","RIGHT","TAP","TAP","TAP"],code:function(a){b.code(a)},load:function(a){this.orig_keys=this.keys,b.addEvent(document,"touchmove",function(a){if(1==a.touches.length&&1==b.iphone.capture){var c=a.touches[0];b.iphone.stop_x=c.pageX,b.iphone.stop_y=c.pageY,b.iphone.tap=!1,b.iphone.capture=!1,b.iphone.check_direction()}}),b.addEvent(document,"touchend",function(){1==b.iphone.tap&&b.iphone.check_direction(a)},!1),b.addEvent(document,"touchstart",function(a){b.iphone.start_x=a.changedTouches[0].pageX,b.iphone.start_y=a.changedTouches[0].pageY,b.iphone.tap=!0,b.iphone.capture=!0})},check_direction:function(a){x_magnitude=Math.abs(this.start_x-this.stop_x),y_magnitude=Math.abs(this.start_y-this.stop_y),x=this.start_x-this.stop_x<0?"RIGHT":"LEFT",y=this.start_y-this.stop_y<0?"DOWN":"UP",result=x_magnitude>y_magnitude?x:y,result=1==this.tap?"TAP":result,result==this.keys[0]&&(this.keys=this.keys.slice(1,this.keys.length)),0==this.keys.length&&(this.keys=this.orig_keys,this.code(a))}}};return"string"==typeof a&&b.load(a),"function"==typeof a&&(b.code=a,b.load()),b};

// FileSaver.js, Chrome only
var saveAs=saveAs||navigator.msSaveBlob&&navigator.msSaveBlob.bind(navigator)||function(a){"use strict";var b=a.document,c=function(){return a.URL||a.webkitURL||a},d=a.URL||a.webkitURL||a,e=b.createElementNS("http://www.w3.org/1999/xhtml","a"),f=!a.externalHost&&"download"in e,g=function(c){var d=b.createEvent("MouseEvents");d.initMouseEvent("click",!0,!1,a,0,0,0,0,0,!1,!1,!1,!1,0,null),c.dispatchEvent(d)},h=a.webkitRequestFileSystem,i=a.requestFileSystem||h||a.mozRequestFileSystem,j=function(b){(a.setImmediate||a.setTimeout)(function(){throw b},0)},k="application/octet-stream",l=0,m=[],n=function(){for(var a=m.length;a--;){var b=m[a];"string"==typeof b?d.revokeObjectURL(b):b.remove()}m.length=0},o=function(a,b,c){b=[].concat(b);for(var d=b.length;d--;){var e=a["on"+b[d]];if("function"==typeof e)try{e.call(a,c||a)}catch(f){j(f)}}},p=function(b,d){var q,r,x,j=this,n=b.type,p=!1,s=function(){var a=c().createObjectURL(b);return m.push(a),a},t=function(){o(j,"writestart progress write writeend".split(" "))},u=function(){(p||!q)&&(q=s(b)),r?r.location.href=q:window.open(q,"_blank"),j.readyState=j.DONE,t()},v=function(a){return function(){return j.readyState!==j.DONE?a.apply(this,arguments):void 0}},w={create:!0,exclusive:!1};return j.readyState=j.INIT,d||(d="download"),f?(q=s(b),e.href=q,e.download=d,g(e),j.readyState=j.DONE,t(),void 0):(a.chrome&&n&&n!==k&&(x=b.slice||b.webkitSlice,b=x.call(b,0,b.size,k),p=!0),h&&"download"!==d&&(d+=".download"),(n===k||h)&&(r=a),i?(l+=b.size,i(a.TEMPORARY,l,v(function(a){a.root.getDirectory("saved",w,v(function(a){var c=function(){a.getFile(d,w,v(function(a){a.createWriter(v(function(c){c.onwriteend=function(b){r.location.href=a.toURL(),m.push(a),j.readyState=j.DONE,o(j,"writeend",b)},c.onerror=function(){var a=c.error;a.code!==a.ABORT_ERR&&u()},"writestart progress write abort".split(" ").forEach(function(a){c["on"+a]=j["on"+a]}),c.write(b),j.abort=function(){c.abort(),j.readyState=j.DONE},j.readyState=j.WRITING}),u)}),u)};a.getFile(d,{create:!1},v(function(a){a.remove(),c()}),v(function(a){a.code===a.NOT_FOUND_ERR?c():u()}))}),u)}),u),void 0):(u(),void 0))},q=p.prototype,r=function(a,b){return new p(a,b)};return q.abort=function(){var a=this;a.readyState=a.DONE,o(a,"abort")},q.readyState=q.INIT=0,q.WRITING=1,q.DONE=2,q.error=q.onwritestart=q.onprogress=q.onwrite=q.onabort=q.onerror=q.onwriteend=null,a.addEventListener("unload",n,!1),r}(self);