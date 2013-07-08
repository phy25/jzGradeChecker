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
		var $oldDOM = $('html').clone(); // temp
		// No result
		var innerText = document.body.innerText;
		if(innerText.indexOf('您未被授权查看该页') != -1){
			jzgc.ce.errorPage();
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
		var $container = $('<div id="container" class="container-fluid" />').appendTo($('<body />').replaceAll('body'));

		var $append = $('<h1>金中成绩查询</h1>')
			.after('<ul id="breadcrumb" class="breadcrumb"><li><a href="search.htm">主页</a> <span class="divider">&rsaquo;</span></li></ul>')
			.after($content);

		$container.append($append);

		// 考生信息
		var $info = $container.find('p:first').remove(), info_o = $info.text(), info_text = '', info_arr = {};
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

		// 成绩
		var $table = $container.find('table:eq(0)').addClass('table table-striped table-condensed').removeAttr('width border cellpadding cellspacing bordercolor');

		$table.find('tr:first').unwrap().wrapAll('<thead />');
		$table.find('thead').prependTo($table).find('td').children().wrap('<th />');
		$table.find('thead>tr').prepend($table.find('th')).parent().find('td').remove();
		
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
			var resize = function(){var c = $('#chart')[0]; chart.setSize(c.offsetWidth, c.offsetHeight)};
			$(window).on('resize orientationchange', resize); // Tablet support added
		})();

		// Copyright
		$container.append('<p class="text-right"><small><i class="icon-heart" /> <a href="' + jzgc.config.version[2] + '" target="_blank" class="muted">jzGradeChecker ' + jzgc.config.version[1] + '</a></small></p>');

		function fetchResultData($dom){
			var $content = $('table:eq(2) div:first', $dom).children(), data = {};

			// 考生信息
			var metaData = {};
			var metaByLine = function($para, opt){
				var info_o = $para.text().replace(/(\s)(\s)+/g,'$1').replace(/:/g, '：').split('：'), info_arr = [];
				for(e in info_o){
					var space_arr = info_o[e].split(/\s/g);
					if(e > 0){
						info_arr[info_arr.length-1][1] = space_arr[0];
					}
					if(e == 0 || space_arr[1]){
						info_arr[info_arr.length] = [ space_arr[e > 0 ? 1 : 0] ];
					}
				}
				// 整理成 key => value
				for(e in info_arr){
					opt[info_arr[e][0]] = info_arr[e][1];
				}
				$para = undefined;
				info_arr = undefined;
				info_o = undefined;
				space_arr = undefined;
			};

			metaByLine($content.filter('p:eq(0)'), metaData);
			metaByLine($content.filter('p:eq(1)'), metaData);

			// 成绩
			var gradeData = getTableData($content.filter('table:first'), true);
			data.gradeData = gradeData;
			
			// 平均分
			var $average = $dom.find('table:eq(4)').find('td:first').children();
			$average.each(function(i, e){
				data.averageHTML = (data.averageHTML || '') + $.trim(e.innerHTML) + "\n";
			});

			data.meta = metaData;
			
			$content = undefined;
			$average = undefined;
			return data;
		}
		function renderPage(resultData, $dest){
			/*
			var $container = $('<div id="container" class="container-fluid" />').appendTo($('<body />').replaceAll('body'));
			*/
			// 考生信息
			$dest.append('<ul id="breadcrumb" class="breadcrumb"><li><a href="search.htm">主页</a> <span class="divider">&rsaquo;</span></li></ul>');

			$('#breadcrumb', $dest).append('<li title="学号"><i class="icon-user" /> '+ resultData.meta['学号'] +'</li> <li title="姓名" class="dropdown">'+ resultData.meta['姓名'] +' <a href="javascript:void(0)" id="meta-detail-btn" class="dropdown-toggle" title="更多信息"><i class="icon-chevron-down"></i></a><ul id="meta-detail-menu" class="dropdown-menu" role="menu" aria-labelledby="dropdownMenu"></ul> <span class="divider">&rsaquo;</span></li> <li class="active" title="考试场次（名称可能与首页不符）"><i class="icon-book" /> '+ resultData.meta['考试场次'] +'</li>');
			var $mdm = $('#meta-detail-menu', $dest);
			for(key in resultData.meta){
				if(!resultData.meta[key]) continue;
				$('<li><a href="javascript:void(0)"></a></li>').find('a').attr('title', key).data('value', resultData.meta[key])
					.text(key + '：' + resultData.meta[key])
					.end().appendTo($mdm);
			}
			$('#meta-detail-menu', $dest).on('click', 'a', function(){prompt('按 Ctrl+C 复制'+this.title, $(this).data('value')); return false;});
			$('#meta-detail-btn', $dest).dropdown();


		}
		var resultData = fetchResultData($oldDOM);
		console.log(resultData);
		renderPage(resultData, $('<div id="content"></div>').appendTo('#container'));

		// Finally show the page
		$('body').addClass('loaded');
	});
};