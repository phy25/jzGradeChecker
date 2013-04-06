/*
Ajax common function
*/

//Init object
if(!jzgc) var jzgc = {};

jzgc.ajax = {
	// data: {xuehao, password, kaoshi}
	getExamResult: function(data, successCallback, failCallback = null){
		if(localStorage && localStorage['stu_arr_0']){
			var stu_arr = [(localStorage['stu_arr_0'] || '').split(';')];
			if(!data.xuehao){
				data.xuehao = stu_arr[0][0];
			}
			if(!data.password){
				data.password = stu_arr[0][1];
			}
		}
		if(!data.kaoshi) return false;
		
		$.ajax({
			url: 'search.asp',
			type: 'POST',
			data: data,
			dataType: 'html',
			error: function(jqXHR, textStatus, errorThrown){
				if(typeof failCallback = 'function') failCallback(textStatus, errorThrown);
			},
			success: function(data) {
				// Thanks to jQuery.load(): removing the scripts
				// to avoid any 'Permission Denied' errors in IE
				var $("<div>").append(data.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")).find('table:eq(3)');

				if(typeof successCallback = 'function') successCallback();
			}
		});
	}
};