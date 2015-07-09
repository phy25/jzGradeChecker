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

			$('<ul id="breadcrumb" class="breadcrumb"><li><a href="search.htm">返回查询主页</a> <span class="divider">|</span></li></ul>').appendTo($export);

			$('#breadcrumb', $export).append('<li title="原学号"><i class="icon-user" /> <span id="bc_xuehao">'+ user[0] +'</span></li> <li><span id="bc_name">'+ (jzgc.user.attrGet('name') || '') +'</span> <span class="divider">&rsaquo;</span></li> <li class="active">导出成绩数据</li>');
			$('<div id="export-progress" class="progress progress-striped active"><div id="export-progress-bar" class="bar"></div></div>').appendTo($export);
			$('<pre id="export-log" class="pre-scrollable"></pre>').appendTo($export);
			$('<p id="export-options" class="form-inline">&nbsp; <label class="checkbox"><input type="checkbox" id="export-average-checkbox" checked="checked" />导出平均分数据（可能不完整）</label></p>').appendTo($export);

			$('<a id="export-stopnow" href="javascript:void(0)" role="button" title="在当前考试下载完成后，立即停止继续下载" class="btn btn-danger">停止</a>').click(function(){
				window.jzgcStopNow = true;
				$(this).addClass('disabled').text('请稍等');
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

		if(user[1] == 'KONAMIMODE'){
			jzgc.user.clear(0);
			user[0] = user[0];
			user[1] = 0;
		}

		log('提示：有些高三的考试，学校不会把成绩放上网，也有些考试你并没有考过。这些考试没有数据，我们无能为力 :(','info');
		$(window).on('beforeunload', function(){return "导出仍在进行。如果现在退出，导出的数据将不会保存。\n仍要退出吗？";});
		document.title = '【导出中】金中成绩查询';

		function getID(){
			// log('即将下载 '+ list[pointer][1] + ' (' + list[pointer][0] + ')');
			jzgc.ajax.getExamResult(
				{xuehao: user[0], password: user[1], kaoshi: list[pointer][0]},
				function(data){
					if(!dataFirst){
						dataFirst = jQuery.extend(true, {}, data);
						$('#bc_xuehao').text(data.meta['原学号']);
						$('#bc_name').attr('title', '姓名').text(data.meta['姓名']);
						if(user[1] != 0) jzgc.user.attrSave('name', data.meta['姓名']);
					}
					data.notes = undefined;
					data.averageHTML = undefined;
					data.id = list[pointer][0];
					data.examName = list[pointer][1];
					ret.exams.push(data);

					log('已保存 ' + list[pointer][1] + ' (' + list[pointer][0] + ') ');
					pointer++;
					$('#export-progress-bar').css('width', pointer / list.length * 100 +'%');

					if(pointer == list.length || window.jzgcStopNow){
						complete();
					}else{
						setTimeout(getID, timeout);
					}
				},
				function(t, d){
					var errorShown = (t=='error' ? d :t );
					if(t == 'certError') errorShown = '学号或密码错误';
					if(t == 'examError') errorShown = '无成绩数据';
					if(t == 'timeout') errorShown = '请求超时';

					log('保存 ' + list[pointer][1] + ' (' + list[pointer][0] + ') 时错误：' + errorShown, 'error');
					if(console) console.error(list[pointer][0], t, d);

					pointer++;
					$('#export-progress-bar').css('width', pointer / list.length * 100 +'%');
					if(errorCount !== false) errorCount++;

					if(errorCount > 1 && pointer == errorCount){
						errorCount = false;
						$('#export-progress-bar').addClass('bar-warning');
						if(t == 'certError'){
							// 强制停止
							window.jzgcStopNow = true;
							if(user[0].indexOf('3') == 0){
								log('<strong>您的学号或密码有误。如果您已经毕业，学校可能已经删除了您的成绩数据，您无法导出成绩。导出将停止进行。</strong>', 'warning');
							}else{
								log('<strong>您的学号或密码有误，检查一下再试试吧。导出将停止进行。</strong>', 'warning');
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
					if(pointer == list.length || window.jzgcStopNow){
						complete();
					}else{
						setTimeout(getID, timeout);
					}
				}
			);
		}
		function complete(){
			$(window).off('beforeunload');
			document.title = (ret.exams.length>0?'【导出完成】':'【！！！】')+'金中成绩查询';
			if(dataFirst){
				ret.notes = dataFirst.notes;
				if($('#export-average-checkbox')[0].checked) ret.averageHTML = dataFirst.averageHTML;
				ret.xuehao = dataFirst.meta['原学号'];
				ret.name = dataFirst.meta['姓名'];
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
				$('#content-export').append('<h2>导出了 '+ret.exams.length+' 场考试的成绩</h2><p>请复制保存文本框中的内容<span>或直接点击 <a href="javascript:void(0)" id="save-btn" role="button" class="btn btn-primary btn-small" title="下载导出数据为 '+fileName+'"><i class="icon-file icon-white" /> 另存为文件</a></span>。<strong>这样才算完成导出。</strong></p><textarea id="result" class="input-xxlarge" rows="6"></textarea><p>您可以在查询首页“导出”按钮旁的下拉菜单中找到查看器。<a href="'+ chrome.extension.getURL("jsonReader.html") +'" class="btn btn-small btn-info" target="_blank">现在打开查看器</a></p><p><span class="label label-info">ProTip</span> 请把文件保存为诸如 <code>'+fileName+'</code> 的文件名。技术宅们也可以自己读 JSON 格式的数据出来。</p><p><i class="icon-comment " /> 有空的话，来说说导出的使用体验吧！ <a href="'+jzgc.config.urls.extSite+'exportgotit.html" class="btn btn-small" target="_blank">吐个槽</a></p>');
				$('#result').text(JSON.stringify(ret)).click(function(){this.select()});

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