/*
Ajax function
*/
jzgc.ajax = {
	// data: {xuehao, password, kaoshi}
	getExamResult: function(data, successCallback, failCallback){
		var stu_arr = jzgc.user.get(0);
		if(!data.xuehao){
			data.xuehao = stu_arr[0];
		}
		if(!data.password){
			if(jzgc.config.konamiCode){
				// using Konami
				data.xuehao = data.xuehao + jzgc.config.konamiCode;
				data.password = '';
			}else{
				data.password = stu_arr[1];
			}
		}
		if(!data.kaoshi || !data.xuehao) return false;
		
		$.ajax({
			url: jzgc.config.urls.examResult,
			type: 'POST',
			data: data,
			dataType: 'html',
			timeout: 30000,
			beforeSend: function( xhr ) {
				/*
				the "BUG" existed for more than one year, and it is fixed by this now
				No more charset problem :)
				*/
				xhr.overrideMimeType( "application/x-www-form-urlencoded; charset=GB2312" );
			}
		}).done(function(data) {
				if(data.indexOf('3;url=Search.htm') != -1){
					if(typeof failCallback == 'function'){
						var text = $(data).text().replace('3秒后自动返回', '');
						if(data.indexOf('数据还没有导入') > 0){
							failCallback('examError', text);
						}else if(data.indexOf('考生号或密码无效') > 0){
							failCallback('certError', text);
						}else{
							failCallback('error', data);
						}
					}
					return false;
				}
				if(data.indexOf('服务器出错') != -1){
					// server error
					if(typeof failCallback == 'function') failCallback('error', '500');
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
			}).error(function(jqXHR, textStatus, errorThrown){
				if(typeof failCallback == 'function') failCallback(textStatus, errorThrown);
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
			timeout: 10000,
			beforeSend: function( xhr ) {
				/*
				the "BUG" existed for more than one year, and it is fixed by this now
				No more charset problem :)
				*/
				xhr.overrideMimeType( "application/x-www-form-urlencoded; charset=GB2312" );
			}
		}).done(function(data) {
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
		}).error(function(jqXHR, textStatus, errorThrown){
			if(typeof failCallback == 'function') failCallback(textStatus, errorThrown);
		});
	},
	sortExamList: function(examList){
		var examsByKey = [], examsIDs = [], ret = [];
		for(eid in examList){
			var id = eid.toString();
			if(id.length == 2) id = id + '9';
			examsByKey[id] = eid;
			examsIDs.push(id);
		}

		examsIDs.sort();
		
		for(i in examsIDs){
			ret.push({id: examsByKey[examsIDs[i]], name: examList[examsByKey[examsIDs[i]]]});
		}

		return ret;
	},
	categorizeExamList: function(examList){
		if(!(examList[0] && examList[0]['id'])){
			examList = this.sortExamList(examList);
		}

		var ret = {'grade10':[], 'grade11':[], 'grade12': [], 'other': []};
		for(i in examList){
			if(examList[i]['name'].indexOf('高一') != -1){
				ret['grade10'].push(examList[i]);
				continue;
			}
			if(examList[i]['name'].indexOf('高二') != -1){
				ret['grade11'].push(examList[i]);
				continue;
			}
			if(examList[i]['name'].indexOf('高三') != -1 || examList[i]['name'].indexOf('高考') != -1){
				ret['grade12'].push(examList[i]);
				continue;
			}
			ret['other'].push(examList[i]);
		}
		if(ret['other'].length == 0){
			delete ret['other']; // 只能用 delete 了
		}

		return ret;
	}
};