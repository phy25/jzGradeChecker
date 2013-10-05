$(function(){
	var json = false, examsByKey = {}, examsIDs = [];
	$('body').on('drop', fileHandler)
		.on('dragenter dragover', function(event){
			event.stopPropagation && event.stopPropagation();
			event.preventDefault && event.preventDefault();
			var $dh = $('#drop-hint');
			if(!$dh.length){
				$dh = $('<div id="drop-hint" class="alert alert-info"><i class="icon-file"></i> 请放下文件。</div>').prependTo('#content');
			}
			$dh.show();
			return false;
		})
		.on('dragexit dragend', function(event){
			event.stopPropagation && event.stopPropagation();
			event.preventDefault && event.preventDefault();
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
		if(event.preventDefault){event.preventDefault();}
		$('#drop-hint').hide();

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

	function loadJSON(j){
		json = $.parseJSON(j);
		var created = new Date(json.created);
		$('#landing').remove();
		var $c = $('#content').show();
		$c.find('#title-name').text(json.name);
		$c.find('#title-xuehao').text(json.xuehao);
		$c.find('#title-count').text(json.exams.length);
		$c.find('time:first').text(created.toLocaleDateString()).attr('title', created.toUTCString());

		var $m = $c.find('#exams-menu');
		for(eid in json.exams){
			var id = json.exams[eid].id.toString();
			examsByKey[id] = json.exams[eid];
			examsIDs.push(id);
		}

		examsIDs.sort();
		
		for(i in examsIDs){
			var eid = examsIDs[i];
			$m.append('<li><a href="#exam-'+examsByKey[eid].id+'">'+examsByKey[eid].examName+'</a></li>');
			var $e = $('<div class="page-header"><h3 id="exam-'+examsByKey[eid].id+'">'+examsByKey[eid].examName+' <small>总分排名 '+getTotalRank(examsByKey[eid])+'</small></h3></div>');
			$e.appendTo($c);
		}
		
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