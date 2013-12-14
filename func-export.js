/*
Common functions for Chrome extension
*/

jzgc.export = {
	showUI: function(){
		if(!jzgc.config.examList){
			if(jzgc.ajax){
				jzgc.ajax.getExamList(
					function(d){
						jzgc.config.examList = d.examList;
						continueList();
					},
					function(t, d){
						alert('无法获取考试列表（'+t+'）。');
						if(console) console.error(t, d);
					}
				);
			}else{
				alert('无法获取考试列表。');
			}
		}else{
			continueList();
		}
		function continueList(){
			if(!jzgc.result){
				alert('缺少必要的组件，无法继续。');
				return false;
			}

			$('#content').hide().after('<div id="content-export" />');
			var $export = $('<div id="content-export" />'), user = jzgc.user.get(0);

			$('<ul id="breadcrumb" class="breadcrumb"><li><a href="search.htm">主页</a> <span class="divider">&rsaquo;</span></li></ul>').appendTo($export);

			$('#breadcrumb', $export).append('<li title="学号"><i class="icon-user" /> <span id="bc_xuehao">'+ user[0] +'</span></li> <li><span id="bc_name">'+ jzgc.user.attrGet('name') +'</span> <span class="divider">&rsaquo;</span></li> <li class="active">导出成绩数据</li>');
			$('<div id="export-progress" class="progress progress-striped active"><div id="export-progress-bar" class="bar"></div></div>').appendTo($export);
			$('<pre id="export-log" class="pre-scrollable"></pre>').appendTo($export);
			$('<table id="export-table" class="table"><caption></caption><thead><tr><th>学号</th><th>姓名</th><th>性别</th><th>排名</th><th>前排名</th></tr></thead><tbody></tbody></table>').appendTo($export);
			$('<p id="export-options" class="form-inline">&nbsp; <label class="checkbox"><input type="checkbox" id="export-average-checkbox" checked="checked" />导出平均分数据（可能不完整）</label></p>').appendTo($export);

			$('<a id="export-stopnow" href="javascript:void(0)" role="button" title="在当前考试下载完成后，立即停止继续下载" class="btn btn-danger">停止</a>').click(function(){
				window.jzgcStopNow = true;
				$(this).addClass('disabled').text('就到此为止');
			}).prependTo($('#export-options', $export));

			$('#content').after($export);

			jzgc.export.run(user);
		};
	},
	run: function(user){
		var $log = $('#export-log').css('height', '15em').append('<p>正在开始导出... 为了避免给学校服务器造成太大的压力，请耐心等待导出。</p>'), ret = {created: +new Date(), exams:[], xuehao: user[0]}, dataFirst, list = [], pointer = 0, timeout = 2000, errorCount = 0;
		function log(t, type){
			$('<p />').html(t).addClass(type ? ('text-' + type) : '').prependTo($log);
		}
		for(id in jzgc.config.examList){
			list.push([id, jzgc.config.examList[id]]);
		}

		// batch
		var endxuehao = prompt('输入终止学号', user[0]), thisxuehao = false, examID = prompt('输入考试序号');
		if(endxuehao == false || examID == false){
			alert('输入错误。');
			location.reload();
		}

		log('certError 错误提示：如果偶尔出现，是因为你没有考过这场试，不必在意；如果所有考试均报错，是考生信息错误。','info');
		$(window).on('beforeunload', function(){return "导出仍在进行。如果现在退出，导出的数据将不会保存。\n仍要退出吗？";});
		document.title = '【导出中】金中成绩查询';

		function getID(){
			// log('即将下载 '+ list[pointer][1] + ' (' + list[pointer][0] + ')');
			if(thisxuehao == false){
				thisxuehao = user[0];
			}else{
				thisxuehao++;
			}

			jzgc.ajax.getExamResult(
				{xuehao: thisxuehao, password: 0, kaoshi: examID},
				function(data){
					if(!dataFirst){
						dataFirst = jQuery.extend(true, {}, data);
						$('#export-table caption').text(data.meta['考试场次']);
						$('#bc_name').attr('title', '姓名').text('BATCHMODE');
					}
					data.notes = undefined;
					data.averageHTML = undefined;
					data.id = list[pointer][0];
					data.examName = list[pointer][1];
					ret.exams.push(data);

					var rankthis, ranklast;
					for(var sui in data.gradeData.subjects){
						if(data.gradeData.subjects[sui] == '总分'){
							for(var sei in data.gradeData.series){
								if(data.gradeData.series[sei]['name'] == '序'){
									rankthis = data.gradeData.series[sei]['data'][sui];
								}
								if(data.gradeData.series[sei]['name'] == '前序'){
									ranklast = data.gradeData.series[sei]['data'][sui];
								}
							}
							break;
						}
					}
					$('#export-table tbody').append('<tr><td>'+data.meta['学号']+'</td><td>'+data.meta['姓名']+'</td><td>'+data.meta['性别']+'</td><td>'+rankthis+'</td><td>'+ranklast+'</td></tr>');

					log('已保存 ' + data.meta['姓名'] + ' (' + data.meta['学号'] + ') ');
					pointer++;
					$('#export-progress-bar').css('width', pointer / (endxuehao - user[0] + 1) * 100 +'%');

					if(thisxuehao == endxuehao || window.jzgcStopNow){
						complete();
					}else{
						setTimeout(getID, timeout);
					}
				},
				function(t, d){
					log('保存  (' + thisxuehao + ') 时错误：' + (t=='error' ? d :t ), 'error');
					if(console) console.error(thisxuehao, t, d);

					pointer++;
					$('#export-progress-bar').css('width', pointer / (endxuehao - user[0] + 1) * 100 +'%');
					if(errorCount !== false) errorCount++;

					if(errorCount > 3 && pointer == errorCount){
						errorCount = false;
						$('#export-progress-bar').addClass('bar-warning');
						if(t == 'certError'){
							if(user[0].indexOf('3') == 0){
								log('<strong>您的考生信息可能有误。如果您已经毕业，学校可能已经删除了您的成绩数据，您不能在这里导出。导出会继续尝试进行。</strong>', 'warning');
							}else{
								log('<strong>出错好多次了，检查一下呗。导出会继续尝试进行。</strong>', 'warning');
							}
						}
						if(t == 'timeout' || d == 'Server Error'){
							log('<strong>学校服务器可能暂时罢工，建议您稍后再做导出。导出会继续尝试进行。</strong>', 'warning');
						}
						if(t == 'error' && !d){
							log('<strong>您的网络可能有问题，建议您检查一下。导出会继续尝试进行。</strong>', 'warning');
						}
						document.title = '【！！！】金中成绩查询';
					}
					if(thisxuehao == endxuehao || window.jzgcStopNow){
						complete();
					}else{
						setTimeout(getID, timeout);
					}
				}
			);
		}
		function complete(){
			$(window).off('beforeunload');
			document.title = '【导出完成】金中成绩查询';
			if(dataFirst){
				if($('#export-average-checkbox')[0].checked) ret.averageHTML = dataFirst.averageHTML;
			}
			$('#export-options').remove();
			if(ret.exams.length > 0){
				if(window.jzgcStopNow){
					log('导出已停止', 'success');
				}else{
					log('导出已完成', 'success');
				}
				$('#export-progress').removeClass('active progress-striped').find('div:first').removeClass().addClass('bar bar-success');
				var fileName = 'exams-' + ret.xuehao + (ret.name?('-'+ret.name):'') +'.json';
				$('#content-export').append('<h2>导出了 '+ret.exams.length+' 位同学的数据</h2><p>反正数据都在这里头了，先存着就是了。您可以在成绩查询页面的“导出”按钮旁的下拉菜单中找到查看器。<a href="'+ chrome.extension.getURL("jsonReader.html") +'" class="btn btn-small" target="_blank">打开查看器</a></p><p><span class="label label-info">ProTip</span> 文件是 JSON 格式，技术宅们也可以自己读数据出来。</p><p>请复制并保存文本框中的内容 <span>或直接 <a href="javascript:void(0)" id="save-btn" role="button" class="btn btn-primary btn-small" title="下载导出数据为 '+fileName+'"><i class="icon-file icon-white" /> 保存文件</a></span></p><textarea id="result" class="input-xxlarge" rows="6"></textarea><p>有空的话，来吐槽导出的使用体验吧！ <a href="http://github.phy25.com/jzGradeChecker/exportgotit.html" class="btn btn-small btn-success" target="_blank"><i class="icon-comment icon-white" /> 吐个槽</a></p>');
				$('#result').text(JSON.stringify(ret))[0];

				try{ var isFileSaverSupported = !!new Blob(); } catch(e){}
				if(isFileSaverSupported){
					$('#save-btn').click(function(){
						var blob = new Blob([JSON.stringify(ret)], {type: "application/json;charset=utf-8"});
						saveAs(blob, fileName);
					}).on('dragstart', function(){alert("不支持拖拽下载文件，抱歉啦。\n建议您点击下载后在下载栏处拖动文件。");return false;});
				}else{
					$('#save-btn').parent().hide();
				}
			}else{
				$('#export-progress').removeClass('active progress-striped').find('div:first').removeClass().addClass('bar bar-danger');
				log('导出已停止，没有获取到数据', 'error');
			}
		}
		getID();
	}
};