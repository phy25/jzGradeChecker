function removebg(){
	if(document.body && document.body.background){
		document.body.background = '';
	}else{
		setTimeout(removebg, 100);
	}
};
removebg();

function checkTitle(){
	if(document.body){
		if(document.title == '金中成绩查询'){
			// 另一个扩展 Javascript 已经接管页面
			console.error('Attempting to start an instance while another instance exists already');
		}else{
			document.title = '金中成绩查询';
			startExecution();
		}
	}else{
		setTimeout(checkTitle, 50);
	}
};
checkTitle();

function startExecution(){
	$(function(){
		// No result
		var innerText = document.body.innerText;
		if(innerText.indexOf('您未被授权查看该页') != -1){
			errorPage();
			return;
		}

		if(innerText.indexOf('对不起') != -1){
			if(window.sessionStorage){
				sessionStorage['result_error'] = innerText.indexOf('考生号或密码无效') != -1 ? 'cert': 'exam';
			}
			window.history.back();
		}else{
			// Save the time to give hints on index.js
			if(window.localStorage){
				localStorage['stu_arr_0_lastChecked'] = +new Date();
			}
		}

		// 去掉固有的 style
		$('link:first').remove();

		var $content = $('table:eq(2) div:first').children().detach();
		var $container = $('<div class="container-fluid" />').appendTo($('<body />').replaceAll('body'));

		var $append = $('<h1>金中成绩查询</h1>')
			.after('<ul id="breadcrumb" class="breadcrumb"><li><a href="search.htm">主页</a> <span class="divider">&rsaquo;</span></li></ul>')
			.after($content);

		$container.append($append);

		// 考生信息
		var $info = $container.find('p:first'), info_o = $info.text(), info_text = '', info_arr = {};
		info_o = info_o.replace(/(\s)(\s)+/g,'$1').replace(/:/g, '：').split('：');
		for(e in info_o){
			var space_arr = info_o[e].split(/\s/g);
			if(e > 0){
				info_text = info_text + space_arr[0];
				if(e == info_o.length - 2){
					info_text = info_text + '<span class="divider">&rsaquo;</span></li> ';
				}else{
					info_text = info_text + '</li> ';
				}
			}
			if(e == 0 || space_arr[1]){
				if(e == info_o.length - 2){ // 提前给最后一项写标签头
					info_text = info_text + '<li class="active" title="'+ space_arr[e > 0 ? 1 : 0] +'"><i class="icon-book" /> ';
				}else{
					info_text = info_text + '<li title="'+ space_arr[e > 0 ? 1 : 0] +'">';
					if(e == 0) info_text = info_text + '<i class="icon-user" /> ';
				}
			}
		}
		$('#breadcrumb').append(info_text);
		$info.remove().html(info_text)
			.addClass('text-right').prepend('<a class="btn btn-small" href="search.htm" title="修改信息"><i class="icon-edit" /> 修改</a> ');

		// 成绩
		var $table = $container.find('table:eq(0)').addClass('table table-striped table-condensed').removeAttr('width border cellpadding cellspacing bordercolor');

		$table.find('tr:first').unwrap().wrapAll('<thead />');
		$table.find('thead').prependTo($table).find('td').children().wrap('<th />');
		$table.find('thead>tr').prepend($table.find('th')).parent().find('td').remove();
		
		// old function getTableArr
		function getTableArr($Elem){
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

		function getTableData($Elem, useInt){
			var r = {'subjects':[], 'series':[]},
				$h = $Elem.find('thead tr:first'),
				$b = $Elem.find('tbody tr'),
				makeInt = function(text){return useInt?Number(text):text;};

			if(!$h.length){
				$h = $Elem.find('tbody tr:first');
				$b = $b.not(':first');
			}

			$h.find('th, td').each(function(i){
				if(i > 0){
					r.series.push({'name': $.text(this).replace(/(\s)/g,''), 'data':[]});
				}
			});
			
			$b.each(function(){
				var $td = $(this).find('td');
				r.subjects.push($.text($td.eq(0)).replace(/(\s)/g,''));
				$td.not(':first').each(function(i){
					r.series[i].data.push(makeInt($.text(this).replace(/(\s)/g,'')));
				});
			});

			return r;
		}

		// 平均分
		var $average = $container.find('table:eq(1)').remove();
		$container.find('p').eq(-1).remove().end().eq(-2).remove(); // 移除科目解释
		$average.find('td:first').children().appendTo($container).wrapAll('<div id="average" class="hide"></div>');
		$('#average').prepend('<h2>平均分数据</h2>');
		$('<p><a id="expand_average" href="javascript:void(0)" class="btn"><i class="icon-chevron-down" /> 显示平均分数据</a><a id="collapse_average" href="javascript:void(0)" style="display:none" class="btn"><i class="icon-chevron-up" /> 隐藏平均分数据</a></p>').appendTo($container);

		$('#expand_average').click(function(){
			var offset = $('#average').stop(1,1).slideDown()
				.offset();
			$('body').stop(1,1).animate({'scrollTop':offset.top}, 400);
			$(this).hide();
			$('#collapse_average').show().focus();
		});
		$('#collapse_average').click(function(){
			$('#average').stop(1,1).slideUp();
			$(this).hide();
			$('#expand_average').show().focus();
		});

		// 图表
		(function(){
			var tableData = getTableData($table, true), subjects = tableData.subjects, series = [];
			for(a in tableData.series){
				if(tableData.series[a].name == '前序'){
					series[0] = {name: '前排名', data: tableData.series[a].data, color: '#BBB'};
				}
				if(tableData.series[a].name == '序'){
					series[1] = {name: '级排名', data: tableData.series[a].data, color: '#049CDB'};
				}
				if(tableData.series[a].name == '市序'){
					series[2] = {name: '市排名', data: tableData.series[a].data, color: '#49afcd'};
				}
			}
			if(series[2].data[0] == 0) series.splice(2,1);
			if(series[0].data[0] == 0) series.splice(0,1);
			

			$('#breadcrumb').after('<div id="chart" />');
			// var colors = Highcharts.getOptions().colors;
			var chart = $('#chart').highcharts({
				chart: {
					type: 'column'
				},
				title: {
					text: null
				},
				xAxis: {
					categories: subjects
				},
				yAxis: {
					min: 0,
					reversed: true,
					title: {
						text: '排名'
					}
				},
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
							style: {
								fontWeight: 'bold'
							}
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
				},
				series: series
			});
			$(window).resize(function(){var c = $('#chart')[0];chart.setSize(c.offsetWidth, c.offsetHeight)});
		})();

		// Copyright
		$container.append('<p class="text-right"><small><i class="icon-heart" /> <a href="' + extVersion[1] + '" target="_blank" class="muted">jzGradeChecker ' + extVersion[0] + '</a></small></p>');

		// Finally show the page
		$('body').addClass('loaded');
	});
};