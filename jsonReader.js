var jzgc = {};

$(function(){
	var json = false, examsByKey = {}, examsIDs = [];
	$('body').on('drop.dnd', fileHandler)
		.on('dragenter dragover dragexit dragend drop', function(event){
			event.stopPropagation && event.stopPropagation();
			event.preventDefault && event.preventDefault();
		})
		.on('dragenter.dnd', function(event){
			var $dh = $('#drop-hint');
			if(!$dh.length){
				$dh = $('<div id="drop-hint" class="alert alert-info"><i class="icon-file"></i> 请放下文件。</div>').prependTo('#landing');
			}
			$dh.show();
			return false;
		})
		.on('dragend.dnd', function(event){
			$('#drop-hint').hide();
			return false;
		});

	$('#selectFile').click(function(){
		$('<input type="file" accept=".json" />').on('change', fileHandler).click();
		return false;
	});

	if(window.FileReader){
		$('#not-supported').hide();
	}

	function fileHandler(event){
		$('#drop-hint').hide();
		$('body').off('.dnd');

		var files = event.originalEvent[event.originalEvent.dataTransfer ? 'dataTransfer' : 'target'].files;
		if(files.length == 0) return false;

		var reader = new FileReader();
		reader.onload = function(event) {
			if(event.target.readyState == 2){
				loadJSON(event.target.result);
			}else{ // 出错
				alert('读取文件时出错：'+ event.target.error);
			}
		};
		reader.readAsText(files[0]);
		
		return false;
	}

	var parseJSON = (JSON && JSON.parse) ? JSON.parse: $.parseJSON;
	function JSONLoadValidation(j){
		var obj;
		try{
			obj = parseJSON(j);	
		}
		catch(e){
			console.error(e);
			return false;
		}

		if(obj.created && obj.xuehao && obj.exams && obj.exams.length>0){
			return obj;
		}else{
			return false;
		}
	}
	function loadJSON(j){
		json = JSONLoadValidation(j);
		if(json == false){
			alert('读取文件时出错：文件格式错误。');
			location.reload();
			return false;
		}
		
		var created = new Date(json.created);
		$('#landing').remove();
		var $c = $('#main').show();
		$c.find('#title-name').text(json.name);
		$c.find('#title-xuehao').text(json.xuehao);
		$c.find('time:first').text(created.toLocaleDateString()).attr('title', created.toUTCString());
		$c.find('#exams-count-badge').text(json.exams.length).attr('title', '共有 '+json.exams.length+' 场考试');

		var $m = $c.find('#exams-menu');
		for(eid in json.exams){
			var id = json.exams[eid].id.toString();
			if(id.length == 2) id = id + '9';
			examsByKey[id] = json.exams[eid];
			examsIDs.push(id);
		}

		examsIDs.sort();
		
		// $c.find('#meta h3 small').append('<a href="#'+json.exams[0].id+'">'+json.exams[0].examName+'</a>');
		var $meta = $c.find('#meta ul:first'), metaarr = json.exams[0].meta;
		for(n in metaarr){
			if(n == '考试场次') continue;
			$c.find('#meta ul:first').append('<li>'+n+': '+metaarr[n]+'</li>');
		}
		

		var etitle = '';
		for(i in examsIDs){
			var e = examsByKey[examsIDs[i]];
			if(etitle != e.examName.substr(0, 2)){
				etitle = e.examName.substr(0, 2);
				$m.append('<li class="nav_header">'+etitle+'</li>');
			}
			$m.append('<li><a href="#exam-'+e.id+'">'+e.examName+'</a></li>');

			var $e = $('<section id="exam-'+e.id+'"><div class="page-header"><h3>'+e.examName+' <small>总分排名 '+getTotalRank(e)+'</small></h3></div></section>');
			jzgc.result.renderTable(e.gradeData, $e);
			$e.appendTo($c.find('#content'));
		}

		if(json.averageHTML){
			$m.append('<li class="divider"></li><li><a href="#averagedata">平均分数据</a></li>');
			$avg = $('<section id="averagedata"><div class="page-header"><h3>平均分数据</h3></div></section>').append(json.averageHTML).appendTo($c.find('#content'));
		}
		
		$('body').scrollspy({offset: 25, target: '#exams-menu-well'});
		$('#exams-menu-well').affix({offset: 80});
	}
	function getTotalRank(examData){
		var ti = false;
		for(i in examData.gradeData.subjects){
			if(examData.gradeData.subjects[i] == '总分') ti = i;
		}
		if(ti === false) return 0;
		for(i in examData.gradeData.series){
			if(examData.gradeData.series[i].name == '序'){
				return examData.gradeData.series[i].data[ti];
			}
		}
		return 0;
	}
});