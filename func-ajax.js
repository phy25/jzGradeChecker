/*
Ajax function
*/
jzgc.ajax = {
	// data: {xuehao, password, kaoshi}
	getExamResult: function(data, successCallback, failCallback){
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
			url: 'http://jszx.stedu.net/jszxcj/search.asp',
			type: 'POST',
			data: data,
			dataType: 'html',
			error: function(jqXHR, textStatus, errorThrown){
				if(typeof failCallback = 'function') failCallback(textStatus, errorThrown);
			},
			success: function(data) {
				if(data.indexOf('3;url=Search.htm') != -1){
					if(typeof failCallback == 'function') failCallback('certError', data);
					return false;
				}
				// Thanks to jQuery.load(): removing the scripts
				// to avoid any 'Permission Denied' errors in IE
				var $d = $("<div>").append(data.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ""));
				$d = $d.find('table:eq(3)');

				if(typeof successCallback == 'function') successCallback(jzgc.ajax.getTableArr($d));
			}
		});
	},
	getTableArr: function($Elem){
		var r = {'thead':[], 'tbody':[]}, $h, $b;
		$h = $Elem.find('thead tr:first');
		if(!$h.length){
			$h = $Elem.find('tbody tr:first');
			$b = $Elem.find('tbody tr:not(:first)');
		}else{
			$b = $Elem.find('tbody tr');
		}
		$h.find('th, td').each(function(i){
			if(i > 0){
				r.thead[r.thead.length] = $.text(this).replace(/(\s)/g,'');
			}
		});
		
		$b.each(function(){
			r.tbody[r.tbody.length] = {};
			var td = r.tbody[r.tbody.length-1], $td = $(this).find('td');
			td.subject = $td.eq(0).text().replace(/(\s)/g,'');
			$td.not(':first').each(function(i){
				td[r.thead[i]] = $(this).text().replace(/(\s)/g,'');
			});
		});

		return r;
	}
};