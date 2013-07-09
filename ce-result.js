/*
Result Page Handler for chrome entension
*/

jzgc.ce.removebg();
jzgc.ce.conflictCheck(startExecution);

function startExecution(){
	$(function(){
		if(jzgc.ce.checkErrorPage()){return;}

		// No result
		var innerText = document.body.innerText;

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

		function fetchResultData($sourceElm){
			var $content = $('table:eq(2) div:first', $sourceElm).children(), data = {};

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

			data.meta = metaData;

			// 成绩
			var gradeData = getTableData($content.filter('table:first'), true);
			data.gradeData = gradeData;
			
			// 平均分
			data.averageHTML = $.trim($sourceElm.find('table:eq(4)').find('td:first').html().replace(/(\s)(\s)+/g,'$1'));

			// 备注
			data.notes = [];
			$content.filter('p').not(':eq(0), :eq(1), :eq(-1)') // 0, 1 是 meta 部分，-1 是科目总分解释
				.each(function(i, e){
					var $e = $(e);
					if($.trim($e.text())){
						data.notes.push($.trim( $e.html() ).replace(/(\s)(\s)+/g,'$1'));
					}
				});
			
			$content = undefined;
			// $average = undefined;
			return data;
		}

		function renderPage(resultData, $dest){
			// 考生信息
			$dest.append('<ul id="breadcrumb" class="breadcrumb"><li><a href="search.htm">主页</a> <span class="divider">&rsaquo;</span></li></ul>');

			$('#breadcrumb', $dest).append('<li title="学号"><i class="icon-user" /> '+ resultData.meta['学号'] +'</li> <li title="姓名" class="dropdown">'+ resultData.meta['姓名'] +' <a role="button" href="javascript:void(0)" id="meta-detail-btn" class="dropdown-toggle" title="更多信息" data-toggle="dropdown"><i class="icon-chevron-down"></i></a><ul role="menu" aria-labelledby="meta-detail-btn" id="meta-detail-menu" class="dropdown-menu"></ul> <span class="divider">&rsaquo;</span></li> <li class="active" title="考试场次（名称可能与首页不符）"><i class="icon-book" /> '+ resultData.meta['考试场次'] +'</li>');
			var $mdm = $('#meta-detail-menu', $dest);
			for(key in resultData.meta){
				if(!resultData.meta[key]) continue;
				$('<li role="presentation"><a role="menuitem" href="javascript:void(0)" tabindex="-1"></a></li>').find('a').attr('title', key).data('value', resultData.meta[key])
					.text(key + '：' + resultData.meta[key])
					.end().appendTo($mdm);
			}
			$('#meta-detail-menu', $dest).on('click', 'a', function(){prompt('按 Ctrl+C 复制'+this.title, $(this).data('value')); return false;});

			// 图表
			(function(){
				var gd = resultData.gradeData, subjects = gd.subjects, series = [];
				for(a in gd.series){
					if(gd.series[a].name == '前序'){
						series[0] = {name: '前排名', data: gd.series[a].data, color: '#BBB'};
					}
					if(gd.series[a].name == '序'){
						series[1] = {name: '级排名', data: gd.series[a].data, color: '#049CDB'};
					}
					if(gd.series[a].name == '市序'){
						series[2] = {name: '市排名', data: gd.series[a].data, color: '#49AFCD'};
					}
				}

				// 去除空集
				if(series[2].data[0] == 0) series.splice(2,1);
				if(series[0].data[0] == 0) series.splice(0,1);
				
				// var colors = Highcharts.getOptions().colors;
				$('<div id="chart" />').appendTo($dest).highcharts({
					chart: {type: 'column'},
					title: {text: null},
					xAxis: {categories: subjects},
					yAxis: {
						min: 0,
						reversed: true,
						title: {
							text: '排名'
						}
					},
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
				var resize = function(){var $c = $('#chart'); $c.highcharts().setSize($c[0].offsetWidth, $c[0].offsetHeight); $c = undefined;};
				$(window).on('resize orientationchange', resize); // Tablet support added
			})();

			// 成绩
			var $table = $('<table id="gradeTable" class="table table-hover table-striped examData"><thead><tr><th>科目</th></tr></thead><tbody></tbody></table>'),
				$thead = $table.find('thead tr:first'),
				$tbody = $table.find('tbody:first'),
				gd = resultData.gradeData;

			if(gd.series[2].data[0] == 0) gd.series.splice(2,1);
			if(gd.series[3].data[0] == 0) gd.series.splice(3,1);

			for(i in gd.series){
				$('<th />').text(gd.series[i].name).appendTo($thead);
			}
			for(i in gd.subjects){
				var $tr = $('<tr><td></td></tr>').find('td').text(gd.subjects[i]).end();
				for(sei in gd.series){
					$('<td />').text(gd.series[sei].data[i]).appendTo($tr);
				}
				$tr.appendTo($tbody);
			}
			$table.appendTo($dest);

			// 备注
			var $notes = $('<div id="notes" />');
			for(i in resultData.notes){
				$notes.append('<p>' + resultData.notes[i] + '</p>');
			}
			$notes.appendTo($dest);

			// 平均分
			var $average = $('<p><a id="expand_average" href="javascript:void(0)" class="btn"><i class="icon-chevron-down" /> 显示平均分数据</a> <a id="collapse_average" href="javascript:void(0)" style="display:none" class="btn"><i class="icon-chevron-up" /> 隐藏平均分数据</a></p><div id="average" class="hide"></div>');

			$average.filter('#average').html('<h2>平均分数据</h2>' + resultData.averageHTML);
			
			$('#expand_average', $average).click(function(){
				var offset = $('#average').stop(1,1).slideDown()
					.offset();
				$('body').stop(1,1).animate({'scrollTop':offset.top}, 400);
				$(this).hide();
				$('#collapse_average').show().focus();
			});
			$('#collapse_average', $average).click(function(){
				// $('body').stop(1,1).css('scrollTop', $('#gradeTable').offset().top);
				$('#average').stop(1,1).slideUp();
				$(this).hide();
				$('#expand_average').show().focus();
			});

			$average.appendTo($dest);
		}

		var resultData = fetchResultData($(document.body));
		
		// Start to render page
		var $container = $('<div id="container" class="container-fluid"><h1>金中成绩查询</h1><div id="content" /></div>').appendTo($('<body />').replaceAll('body'));
		renderPage(resultData, $('#content'));

		// Copyright
		jzgc.ce.appendCopyRight($container);

		// Finally show the page
		$('body').addClass('loaded');
	});
};