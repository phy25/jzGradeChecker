/*
Result Page Functions
*/
jzgc.result = {
	fetchResultData: function($sourceElm){
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
		var gradeData = this.getTableData($content.filter('table:first'), true);
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
	},
	renderPage: function(resultData, $dest){
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

		$('#breadcrumb', $dest).append('<li class="btn-group pull-right"><a id="color-select-btn" class="btn btn-small btn-info dropdown-toggle" data-toggle="dropdown" href="javascript:void(0)" title="设置着色样式"><i class="icon-adjust icon-white" /> <span>着色</span></a><ul class="dropdown-menu" role="menu" aria-labelledby="color-select-btn" id="color-select-menu"><li role="presentation"><a role="menuitem" href="javascript:void(0)" data-type="0" tabindex="-1" class="strong">默认</a></li><li role="presentation"><a role="menuitem" href="javascript:void(0)" data-type="1" tabindex="-1">股市</a></li><li role="presentation"><a role="menuitem" href="javascript:void(0)" data-type="2" tabindex="-1">现代</a></li></ul></li>');

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

		if(!gd.series[3] || gd.series[3].data[0] == 0) gd.series.splice(3,1); // 市序
		if(!gd.series[2] || gd.series[2].data[0] == 0) gd.series.splice(2,1); // 序

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

		// 成绩着色
		$('#color-select-menu', $dest).on('click', 'a', function(){
			setTableColor($(this).data('type'), true);
			//return false;
		});

		function setTableColor(type, isUserAction){
			// type is a string!
			var datas = [];
			if(type == '1'){
				var colors = {'+': '#EBCCCC', '-': '#D0E9C6', '0':'#049CDB'},
					classes = {'+': 'error', '-': 'success', '0':''};
			}
			if(type == '2'){
				var colors = {'+': '#D0E9C6', '-': '#FAF2CC', '0':'#049CDB'},
					classes = {'+': 'success', '-': 'warning', '0':''};
			}
			if(type == '0'){
				var colors = {'+': '#049CDB', '-': '#049CDB', '0':'#049CDB'},
					classes = {'+': '', '-':'', '0':''};
			}

			$('#gradeTable tbody>tr').each(function(i,t){
				var $t = $(t).removeClass('error success warning');
				var rankt = +$t.find('td:eq(2)').text(), rankl = +$t.find('td:eq(3)').text();

				// 判断成绩颜色
				if(rankl){
					if(rankt < rankl) datas.push('+');
					if(rankt > rankl) datas.push('-');
					if(rankt == rankl) datas.push('0');
				}else{
					if(rankt > 0 && rankt < 500) datas.push('+');
					if(rankt >= 500) datas.push('-');
					if(rankt == 0) datas.push('0');
				}
				$t.addClass(classes[datas[i]]);
			});

			var chart = $('#chart').highcharts(), chartSeries;

			if(chart.series[1]){
				chartSeries = chart.series[1];
			}else{
				chartSeries = chart.series[0];
				if($('#ext-tip').length) $('#ext-tip').remove();
				$('#breadcrumb').after('<div id="ext-tip" class="alert alert-info alert-color-select-nocolor">这次考试没有前次排序可以对比……所以色彩就随意啦。</div>');
				$('<button type="button" class="close" title="隐藏">&times;</button>')
					.click(function(){
						$(this).parent().fadeOut();
						return false;
					}).prependTo('#ext-tip');
			}
			for(l in chartSeries.data){
				chartSeries.data[l].update({'color': colors[datas[l]]}, false);
			}
			chart.redraw();

			jzgc.user.attrSave('color', type);

			var text = '着色';
			$('#color-select-menu a').each(function(i, t){
				var $t = $(t);
				$t[i == +type ? 'addClass' : 'removeClass']('strong');
				if(i == +type) text = $t.text();
			});
			$('#color-select-btn span').text(text);
			$('#ext-tip.alert-color-select').hide();
		}

		if(jzgc.user.attrGet('color') != undefined){
			setTableColor(jzgc.user.attrGet('color'));
		}else{
			$('#breadcrumb', $dest).after('<div id="ext-tip" class="alert alert-info alert-color-select">查看更直观的色彩成绩，请在右上角设置。</div>');
			$('<button type="button" class="close" title="不再提示">&times;</button>')
				.click(function(){
					$(this).parent().fadeOut();
					jzgc.user.attrSave('color', 0);
					return false;
				}).prependTo('#ext-tip');
		}

		// 备注
		var $notes = $('<div id="notes" />');
		for(i in resultData.notes){
			$notes.append('<p>' + resultData.notes[i] + '</p>');
		}
		$notes.appendTo($dest);

		// 平均分
		var $average = $('<div id="average" class="hide"></div><p><a id="expand_average" href="javascript:void(0)" class="btn"><i class="icon-chevron-down" /> 显示平均分数据</a> <a id="collapse_average" href="javascript:void(0)" style="display:none" class="btn"><i class="icon-chevron-up" /> 隐藏平均分数据</a></p>');

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

		// 平均分高亮
		$average.find('hr:first').remove();
		$average.find('table').addClass('table table-condensed table-bordered examData').removeAttr('style width border cellpadding cellspacing bordercolor');
		$average.find('colgroup').remove();
		$average.find('tr').removeAttr('style height');
		$average.find('td').removeAttr('style width');
		$average.find('p').each(function(i, t){
			var text = t.innerText.replace(/(\s)/g,''), $t = $(t);
			if(text == ''){
				$t.remove();
			}else if(text.indexOf('高') != -1){
				$('<caption />').text(text).prependTo($t.next('table'));
				$t.remove();
			}
		});

		if(resultData.meta['科类']){
			$average.find('tr').each(function(i, t){
				var $t = $(t);
				if($t.find('td:first').text().replace(/(\s)/g,'') == resultData.meta['科类']){
					$t.next().addBack().addClass('info');
					$t.find('td').css('font-weight', 'bold');
				}
			});
		}

		$average.appendTo($dest);
		$dest = undefined;
	},
	getTableData: function($Elem, useInt){
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
};