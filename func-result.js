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
		$dest.append('<ul id="breadcrumb" class="breadcrumb"><li><a href="search.htm" id="back-btn">主页</a> <span class="divider">&rsaquo;</span></li></ul>');

		$('#back-btn', $dest).click(function(){
			history.back();
			return false;
		});

		$('#breadcrumb', $dest).append('<li title="学号"><i class="icon-user" /> '+ resultData.meta['原学号'] +'</li> <li title="姓名" class="dropdown">'+ resultData.meta['姓名'] +' <a role="button" href="javascript:void(0)" id="meta-detail-btn" class="dropdown-toggle" title="更多信息" data-toggle="dropdown"><i class="icon-chevron-down"></i></a><ul role="menu" aria-labelledby="meta-detail-btn" id="meta-detail-menu" class="dropdown-menu"></ul> <span class="divider">&rsaquo;</span></li> <li class="active" title="考试场次（名称可能与首页不符）"><i class="icon-book" /> '+ resultData.meta['考试场次'] +'</li>');
		var $mdm = $('#meta-detail-menu', $dest);
		for(key in resultData.meta){
			if(!resultData.meta[key]) continue;
			$('<li role="presentation"><a role="menuitem" href="javascript:void(0)" tabindex="-1"></a></li>').find('a').attr('title', key).data('value', resultData.meta[key])
				.text(key + '：' + resultData.meta[key])
				.end().appendTo($mdm);
		}
		$('#meta-detail-menu', $dest).on('click', 'a', function(){prompt('按 Ctrl+C 复制'+this.title, $(this).data('value')); return false;});

		$('#breadcrumb', $dest).append('<li class="btn-group pull-right"><a id="color-select-btn" class="btn btn-small btn-info dropdown-toggle" data-toggle="dropdown" href="javascript:void(0)" title="设置着色样式"><i class="icon-adjust icon-white" /> <span>着色</span></a><ul class="dropdown-menu" role="menu" aria-labelledby="color-select-btn" id="color-select-menu"><li role="presentation"><a role="menuitem" href="javascript:void(0)" data-type="0" tabindex="-1" class="strong">默认</a></li><li role="presentation"><a role="menuitem" href="javascript:void(0)" data-type="1" tabindex="-1">股市</a></li><li role="presentation"><a role="menuitem" href="javascript:void(0)" data-type="2" tabindex="-1">现代</a></li></ul></li>');

		resultData.gradeData = this.gradeDataPreProcess(resultData.gradeData);

		// 图表
		this.renderChart(resultData.gradeData, $('<div id="chart" />').appendTo($dest));

		// 成绩
		this.renderTable(resultData.gradeData, $dest);

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
				$('#breadcrumb').after('<div id="ext-tip" class="alert alert-info alert-color-select-nocolor">这次考试没有前次排序可以对比，所以色彩就随意啦。</div>');
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
			if(resultData.notes[i].indexOf('平 均 成 绩 请 往 下 面 查 看') != -1) continue;
			$notes.append('<p>' + resultData.notes[i] + '</p>');
		}
		$notes.appendTo($dest);

		// 平均分
		this.renderAverageHTML(resultData.averageHTML, $dest);
		this.renderAverageHTMLafter_logged(resultData, $dest);

		$dest = undefined; // Release memory?
	},
	gradeDataPreProcess: function(gd){
		// 市序判断
		var hasCityRank = false;
		if(gd.series[3]){
			for(i in gd.series[3].data){
				if(gd.series[3].data[i] > 0) hasCityRank = true;
			}
		}
		if(!hasCityRank){
			gd.series.splice(3,1);
		}

		if(!gd.series[2] || gd.series[2].data[0] == 0) gd.series.splice(2,1); // 前序

		// 总分后移
		for(var i = gd.subjects.length-1; i>=0; i--){
			if(gd.subjects[i].indexOf('总分') != -1){
				gd.subjects.push(gd.subjects.splice(i, 1)[0]);
				for(is in gd.series){
					gd.series[is].data.push(gd.series[is].data.splice(i, 1)[0]);
				}
			}
		}

		return gd;
	},
	getSubjectType: function(d){
		var hasST = true, ST; // ST = Science / Literature
		for(i in d.gradeData.subjects){
			// 学校计算逻辑有变
			if(d.gradeData.subjects[i].indexOf('理科') != -1 || d.gradeData.subjects[i].indexOf('文综') != -1){
				hasST = false;
			}
			// 据说这里体现 Coder 偏好
			if(d.gradeData.subjects[i] == '物理'){
				ST = 'S';
			}
			if(d.gradeData.subjects[i] == '地理'){
				ST = 'L';
			}
		}
		return hasST ? (ST == 'L' ? '文科' : '理科') : false;
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
	},
	renderTable: function(gd, $appendTo){
		var $table = $('<table id="gradeTable" class="table table-hover table-striped examData"><thead><tr><th>科目</th></tr></thead><tbody></tbody></table>'),
			$thead = $table.find('thead tr:first'),
			$tbody = $table.find('tbody:first');

		for(i in gd.series){
			$('<th />').text(gd.series[i].name).appendTo($thead);
		}
		for(i in gd.subjects){
			var $tr = $('<tr><td></td></tr>').find('td').text(gd.subjects[i]).end();
			for(sei in gd.series){
				var data = gd.series[sei].data[i];
				if(data == -1 || data == 0){
					data = '<span title="无排名" class="no-data">-</span>';
				}
				$('<td />').html(data).appendTo($tr);
			}
			$tr.appendTo($tbody);
		}
		$table.appendTo($appendTo);
	},
	renderChart: function(gd, $dest){
		var subjects = gd.subjects.slice(0), series = [];
		for(a in gd.series){
			if(gd.series[a].name == '前序'){
				series[0] = {name: '前排名', data: gd.series[a].data.slice(0), color: '#BBB'};
			}
			if(gd.series[a].name == '序'){
				series[1] = {name: '级排名', data: gd.series[a].data.slice(0), color: '#049CDB'};
			}
		}

		for(i in subjects){
			if(!series[1].data[i]){
				// 去除空 subject
				if(series[0]) series[0].data.splice(i,1);
				series[1].data.splice(i,1);
				subjects.splice(i,1);
			}
		}

		// 手工修复 array 排序
		if(!series[0]) series.splice(0,1);

		// var colors = Highcharts.getOptions().colors;
		$dest.highcharts({
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
							color: 'orange'/*,
							borderWidth: 1,
							borderColor: '#f89406'*/
						}
					}
				}
			}
		});
		$(window).on('resize orientationchange', function(){
			var $c = $('#chart');
			$c.highcharts().setSize($c[0].offsetWidth, $c[0].offsetHeight);
			$c = undefined;
		}); // Tablet support added
	},
	renderAverageHTML: function(averageHTML, $dest){
		var $average = $('<div id="average" class="hide"><h2>平均分数据</h2><ul id="average_nav" class="nav nav-pills"></ul><div class="tab-content" id="average-tab-content"></div></div><p><a id="expand_average" href="javascript:void(0)" class="btn"><i class="icon-chevron-down" /> 显示平均分数据</a> <a id="collapse_average" href="javascript:void(0)" style="display:none" class="btn"><i class="icon-chevron-up" /> 隐藏平均分数据</a></p>');

		var avgs = averageHTML.split('<p><font size="6">');

		for(i in avgs){
			var $h = $((i!=0?'<p><font size="6">':'')+avgs[i]), $t = $h.filter('p:has(font[size=6])');
			//console.log($h, $t);

			var caption = false;
			if($t.length){
				caption = $t.text();
			}else{
				caption = $h.filter('p:first').text();
				if(caption.indexOf('级') != -1){
					caption = caption.split('级')[0]+'级';
				}else{
					caption = caption;
				}
			}
			$h = $h.not($t).not('hr'); // Prepare as content
			//console.log(caption, $h, $t);
			if($.trim($h.text()) == '') continue; // 去除标题前的空部分


			// caption && caption.indexOf('级') != -1
			// see if there is any duplicate block
			var $a_search = caption ? $('#average_nav>li>a:contains('+caption+')', $average) : [];
			if($a_search.length && /^#(\w|-)+$/.test($a_search.attr('href'))){
				$($a_search.attr('href'), $average).append($h);
			}else{
				// Not so ugly fallback
				$('#average_nav', $average).append('<li><a href="#average_tab'+i+'">'+(caption||('部分 '+i))+'</a></li>');
				$('<div id="average_tab'+i+'" class="tab-pane" />').append($h).appendTo($average.find('#average-tab-content'));
			}
		}

		$('#expand_average', $average).click(function(){
			var offset = $('#average').stop(1,1).slideDown()
				.offset();
			$('body').stop(1,1).animate({'scrollTop':offset.top}, 400);
			$(this).hide();
			$('#collapse_average').show().focus();
			return false;
		});
		$('#collapse_average', $average).click(function(){
			// $('body').stop(1,1).css('scrollTop', $('#gradeTable').offset().top);
			$('#average').stop(1,1).slideUp();
			$(this).hide();
			$('#expand_average').show().focus();
			return false;
		});
		$('#average_nav a', $average).click(function(e){
			e.preventDefault();
			$(this).tab('show');
		});

		// 美化
		// $average.find('hr:first').remove();
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

		$average.appendTo($dest);
	},
	renderAverageHTMLafter_logged: function(resultData, $dest){
		// Automatic open average block
		var grade_this = (resultData.meta['学籍号'] || '').substr(0, 2); // temp
		if(grade_this){ // 能读到学籍号就用学籍号判断级数
			grade_this = new Date().getFullYear().toString().substr(0, 2) + grade_this;
		}else{
			grade_this = new Date().getFullYear() - resultData.meta['原学号'].substr(0, 1);
			if(new Date().getMonth() > 6){ // 8-12 月
				grade_this++;
			}
		}

		var $grade_this = $('#average_nav a:contains("' + grade_this.toString() + '")', $dest)
			.parent().addClass('active').find('a:first');

		if(/^#(\w|-)+$/.test($grade_this.attr('href'))){
			// 防止 XSS
			$($grade_this.attr('href'), $dest).addClass('active');
		}

		if($grade_this.length == 0){
			$dest.find('#average').show();
			$('#expand_average', $dest).hide();
			$('#collapse_average', $dest).css('display', 'inline-block');
		}

		// 平均分高亮
		var $average = $dest.find('#average');
		var subjectType = this.getSubjectType(resultData);
		if(subjectType){
			$average.find('tr').each(function(i, t){
				var $t = $(t), title = $t.find('td:first').text().replace(/(\s)/g,'');
				if(title == subjectType || title == subjectType.substr(0, 1)){
					$t.next().addBack().addClass('info');
					$t.find('td').css('font-weight', 'bold');
				}
			});
		}
	}
};