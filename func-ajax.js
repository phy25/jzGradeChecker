/*
Ajax function
*/
jzgc.ajax = {
	// data: {xuehao, password, kaoshi}
	getExamResult: function(data, successCallback, failCallback){
		if(jzgc.user.isAvailable()){
			var stu_arr = jzgc.user.get(0);
			if(!data.xuehao){
				data.xuehao = stu_arr[0];
			}
			if(!data.password){
				data.password = stu_arr[1];
			}
		}
		if(!data.kaoshi) return false;
		
		$.ajax({
			url: jzgc.config.urls.examResult,
			type: 'POST',
			data: data,
			dataType: 'html',
			error: function(jqXHR, textStatus, errorThrown){
				if(typeof failCallback == 'function') failCallback(textStatus, errorThrown);
			},
			success: function(data) {
				if(data.indexOf('3;url=Search.htm') != -1){
					// I am sorry but the encoding there is wrong,
					// and thus I cannot judge the error type... 
					if(typeof failCallback == 'function') failCallback('certError', data);
					return false;
				}
				// Thanks to jQuery.load(): removing the scripts
				// to avoid any 'Permission Denied' errors in IE
				var $d = $("<div>").append(data.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")), ret;
				
				if(jzgc.result && typeof jzgc.result.fetchResultData == 'function'){
					ret = jzgc.result.fetchResultData($d);
				}else{
					$d = $d.find('table:eq(3)');
					ret = jzgc.ajax.getTableArr($d);
					ret.isOldType = true;
				}
				
				$d = undefined;
				if(typeof successCallback == 'function') successCallback(ret);
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
	},
	getExamList: function(successCallback, failCallback){
		$.ajax({
			url: jzgc.config.urls.examList,
			type: 'GET',
			dataType: 'html',
			error: function(jqXHR, textStatus, errorThrown){
				if(typeof failCallback = 'function') failCallback(textStatus, errorThrown);
			},
			success: function(data) {
				// Thanks to jQuery.load(): removing the scripts
				// to avoid any 'Permission Denied' errors in IE
				var $data = $("<div>").append(data.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")),
					$ks = $('#kaoshi', $data),
					ret = {examList:[]};

				if(!$ks.length){
					if(typeof failCallback == 'function') failCallback('resolveErr', data);
					return;
				}

				if(jzgc.index && typeof jzgc.index.fetchIndexData == 'function'){
					ret = jzgc.index.fetchIndexData($data);
				}else{
					$ks.find('option').each(function(){
						if(this.defaultSelected) ret.examListCurrent = this.value;
						ret.examList[this.value] = this.text.replace(/(\s)/g,'');
					});
				}
				
				$data = $ks = undefined;
				if(typeof successCallback == 'function') successCallback(ret);
			}
		});
	}
};