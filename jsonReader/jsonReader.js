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

		if(obj.xuehao == undefined && obj.exams && obj.exams[0] && obj.exams[0].meta){
			// Trying to fix it
			obj.xuehao = obj.exams[0].meta['原学号'] || obj.exams[0].meta['学号'];
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

			var $e = $('<section id="exam-'+e.id+'"><h3>'+e.examName+' <small>总分排名 '+(getTotalRank(e) || '未知')+'</small></h3></section>');
			jzgc.result.renderTable(e.gradeData, $e);
			$e.appendTo($c.find('#content'));
		}

		if(json.averageHTML){
			$m.append('<li class="divider"></li><li><a href="#averagedata">平均分数据</a></li>');
			$avg = $('<section id="averagedata"><h3>平均分数据</h3></section>').append(json.averageHTML).appendTo($c.find('#content'));
		}
		
		$('body').scrollspy({offset: 25, target: '#exams-menu-well'});
		$('#exams-menu-well').affix({offset: 80});
		$('#chart-reset').click(resetChart);
		$('#chart-option').submit(function(event){
			event.preventDefault();
			var subject = $('#chart-subject').val(), categories = [], series = [{name:'分数', data: [], yAxis:0}, {name:'排名', data:[], yAxis:1}],
				$table = $('<table class="table table-hover table-striped examData"><thead><tr><th>考试</th><th>分数</th><th>排名</th><th></th></tr></thead><tbody></tbody></table>'), $tbody = $table.find('tbody:first');
			for(i in examsIDs){
				var e = examsByKey[examsIDs[i]], hasit = false, cur = [];
				for (n in e.gradeData.subjects){
					if(e.gradeData.subjects[n] == subject){
						cur[0] = e.examName;
						cur[1] = e.gradeData.series[0].data[n];
						cur[2] = e.gradeData.series[1].data[n];
						series[0].data.push(cur[1]);
						series[1].data.push(cur[2]);
						hasit = true;
					}
				}
				if(hasit){
					categories.push(e.examName);
					$('<tr><td><a href="#exam-'+e.id+'">'+cur[0]+'</a></td><td>'+cur[1]+'</td><td>'+cur[2]+'</td><td><a title="去除异常点" href="javascript:void(0)" class="removePoint"><i class="icon-trash"></i></a></td></tr>').appendTo($tbody);
				}
			}
			if(categories.length > 0){
				$tbody.find('a.removePoint').click(function(){
					var $tr = $(this).parents('tr'), i = $tbody.find('tr').index($tr), hc = $('#chart-charts').highcharts();
					hc.series[0].data[i].remove(false);
					hc.series[1].data[i].remove(false);
					hc.redraw();
					$tr.remove();
				});
				$('#chart-table').empty().append($table);
				$('#chart-charts').highcharts({
					chart: {type: 'line'},
					title: {text: null},
					xAxis: {categories: categories, labels:{enabled:false}},
					yAxis: [{
						title: {text: '分数'},
						allowDecimals: false,
					},{
						title: {text: '排名'},
						min: 0,
						allowDecimals: false,
						opposite: true,
						reversed: true
					}],
					series: series,
					tooltip: {
						headerFormat: '<span>{point.key}</span><br />',
						pointFormat: '<span style="color:{series.color};">{series.name}</span> <b>{point.y}</b><br />',
						footerFormat: '',
						shared: true,
						useHTML: true
					},
					plotOptions: {
						column: {
							pointPadding: 0.2,
							borderWidth: 0,
							dataLabels: {
								enabled: true,
								style: {fontWeight: 'bold'}
							}
						},
						series: {
							allowPointSelect: true,
							states: {
								select: {
									color: null,
									borderWidth: 1,
									borderColor: '#f89406'
								}
							}
						}
					}
				});
			}else{
				$('#chart-table').empty().append('<p class="text-muted text-center">找不到此科目的结果</p>');
				$('#chart-charts').highcharts().destroy();
			}
			return false;
		});
		$('#toggle-exam-data-generator').click(function(){
			$('#exam-data-generator').toggle();
		});
		$('#exam-data-generator').submit(function(event){
			event.preventDefault();
			var d = '{"meta":{"原学号":"'+json.xuehao+'","新学号":"","姓名":"'+json.name+'","考试场次":"'+$('#edg-examname').val()+'","学号说明":"第1位－年级，第2-3位-班号，第4-5位-班内号"},"gradeData":{"subjects":["语文","数学","英语","语数英","综合","总分","物理","化学","生物"],"series":[{"name":"成绩","data":['+$('#chinese-mark').val()+','+$('#math-mark').val()+','+$('#english-mark').val()+','+$('#cme-mark').val()+','+$('#ligeneral-mark').val()+','+$('#total-mark').val()+','+$('#physics-mark').val()+','+$('#chemistry-mark').val()+','+$('#biology-mark').val()+']},{"name":"序","data":['+$('#chinese-rank').val()+','+$('#math-rank').val()+','+$('#english-rank').val()+','+$('#cme-rank').val()+','+$('#ligeneral-rank').val()+','+$('#total-rank').val()+','+$('#physics-rank').val()+','+$('#chemistry-rank').val()+','+$('#biology-rank').val()+']}]},"id":"'+$('#edg-examid').val()+'","examName":"'+$('#edg-examname').val()+'"}';
			$('#edg-result').text(d)[0].select();
			return false;
		});
		$('#edg-calculate').click(function(){
			$('#cme-mark').val((+$('#chinese-mark').val())+(+$('#math-mark').val())+(+$('#english-mark').val()));
			$('#ligeneral-mark').val((+$('#physics-mark').val())+(+$('#chemistry-mark').val())+(+$('#biology-mark').val()));
			$('#total-mark').val((+$('#cme-mark').val())+(+$('#ligeneral-mark').val()));
		});
	}
	function resetChart(){
		$('#chart-table').empty();
		$('#chart-charts').highcharts().destroy();
	}
	function getTotalRank(examData){
		var ti = false;
		for(i in examData.gradeData.subjects){
			if(examData.gradeData.subjects[i] == '总分') ti = i;
		}
		if(ti === false) return 0;
		for(i in examData.gradeData.series){
			if(examData.gradeData.series[i].name == '序'){
				return examData.gradeData.series[i].data[ti] || 0;
			}
		}
		return 0;
	}
});