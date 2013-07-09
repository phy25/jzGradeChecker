/*
Index Page Handler for chrome entension
*/

jzgc.ce.conflictCheck(startExecution);

function parseQuery(a){
	var queryString = {};
	(a || '').replace(
		new RegExp("([^?=&]+)(=([^&]*))?", "g"),
		function($0, $1, $2, $3) { queryString[$1] = $3; }
	);
	return queryString;
}

// Pop state support
window.onpopstate = function(e) {
	var f = function(){
		c++;
		if(!$('body').is('.loaded') && c<10){
			setTimeout(f, 50);
			return;
		}

		var q = parseQuery(e.state);console.log(q);
		var $radio = $('#exams-list').find('input[value='+q['kaoshi']+']').attr('checked', true);

		if(window.sessionStorage && sessionStorage['result_error']){
			if(sessionStorage['result_error'] == 'cert'){
				// 考生信息错误
				if(window.localStorage && +new Date() - +localStorage['stu_arr_0_lastUpgraded'] < 5000){
					// 5 秒前更新过
					localStorage['stu_arr_0_lastUpgraded'] = 0; // 重设掉
					var stu_arr_0 = (localStorage['stu_arr_0'] || '').split(';');
					if(stu_arr_0[0] > 20100) stu_arr_0[0] = +stu_arr_0[0] - 10000;
					localStorage['stu_arr_0'] = stu_arr_0.join(';');
					$('#xuehao').val(stu_arr_0[0]).change();

					$('h1:first').after('<div id="result_error" class="alert alert-error"><strong>考生信息错误 :( 。</strong>扩展猜错了，下次查询再升年级吧。请重新进行查询。</div>');
				}else{
					$('h1:first').after('<div id="result_error" class="alert alert-error"><strong>考生信息错误 :( 。</strong>检查下再试试吧。</div>');
					var $form_stuinfo = $('#form-stuinfo').children('div').addClass('error').one('change', 'input', function(){
						// $('#result_error').remove();
						// 暂时注释掉避免降低用户体验
						$form_stuinfo.removeClass('error');
					});
				}
			}else{
				// 无成绩
				$('h1:first').after('<div id="result_error" class="alert alert-error" title="肯定会有的，只是等多久的问题 :)">查不到 <strong>'+ $radio.parent().text() +'</strong> 的数据。</div>');
				if($radio.parent().append('<span class="help-inline">无成绩数据</span>').is('.hide')){
					$('#expand_all').click();
				}
				$('#exam-control').addClass('error').one('change', 'input', function(){
					// $('#result_error').remove();
					// 暂时注释掉避免降低用户体验
					$('#exam-control').removeClass('error');
				});
			}
			delete sessionStorage['result_error'];
		}
	}, c = 0;
	f();
};

function startExecution(){
	$(function(){
		if(jzgc.ce.checkErrorPage()){return;}

		function fetchIndexData($sourceElm){
			var data = {examList:{}, notes:{}}; //, $exam_list_current;
			// var $kaoshi = $('#kaoshi'), $kaoshi_new;
			$('#kaoshi', $sourceElm).find('option').each(function(){
				if(this.defaultSelected) data.examListCurrent = this.value;
				data.examList[this.value] = this.text.replace(/(\s)/g,'');
			});

			var $f = $('form:first', $sourceElm);
			data.notes.update = $f.find('b').text().replace(/(\s)/g,'').replace(/\(/g, '（').replace(/\)/g, '）').replace('注:', ''),
			data.notes.announcement = $f.next().text()
				.replace(/(\s)(\s)+/g,'$1')
				.replace(/．/g, '。')
				.replace(/,/g, '，')
				.replace(/;/g, '；')
				.replace(/\*/g, '* ')
				.replace(/\(/g, '（')
				.replace(/\)/g, '）');

			return data;
		}

		function renderPage(indexData, $dest){
			$('<div class="alert alert-info" />').text(indexData.notes.update).appendTo($dest);
			$('<div id="ext-tip" class="alert" style="display:none;"></div>').appendTo($dest);

			//$f;
			var $f = $('<form id="form-stuinfo" action="search.asp" method="POST" enctype="application/x-www-form-urlencoded" class="form-horizontal"></form>');
			$('<div class="control-group"><label class="control-label" for="xuehao">学号</label><div class="controls"><input type="number" id="xuehao" name="xuehao" placeholder="五位数班学号" required="required" min="10101" max="32100" /></div></div>').appendTo($f);
			$('<div class="control-group"><label class="control-label" for="inputPassword">密码</label><div class="controls"><input type="text" id="password" name="password" placeholder="身份证号码等" required="required" /></div></div>').appendTo($f);
			$('<div class="control-group" id="exam-control"><label class="control-label" for="kaoshi">考试</label><div class="controls row-fluid"><span class="help-block">请先输入学号</span></div></div>').appendTo($f);
			$('<div class="form-actions"><input type="submit" class="btn btn-primary" value="查询" /></div>').appendTo($f);

			var $exams = $('<div id="exams-list" class="hide" />'), $examCurrent;
			for(var i in indexData.examList){
				var $eln = $('<label class="radio span5"><input type="radio" name="kaoshi" value="'+i+'"> '+indexData.examList[i]+'</label>');
				$exams.append($eln);

				if(i == indexData.examListCurrent) $examCurrent = $eln;
			}

			var $exams_act = $('<p class="span12"><a id="expand_all" href="javascript:void(0)" class="btn btn-mini"><i class="icon-chevron-down" /> 显示更多</a><a id="collapse_all" href="javascript:void(0)" style="display:none" class="btn btn-mini"><i class="icon-chevron-up" /> 隐藏其他</a></p>');
			$('#expand_all', $exams_act).click(function(){
				$('#exams-list').find('label.hide').show()
					.end().find('input:checked').focus();
				$(this).hide().parent().parent().removeClass('collapsed').addClass('expanded');
				$('#collapse_all').show();
			});
			$('#collapse_all', $exams_act).click(function(){
				$('#exams-list').find('label.hide').hide()
					.end().find('input:checked').focus();
				$(this).hide().parent().parent().removeClass('expanded').addClass('collapsed');
				$('#expand_all').show();
			});

			function dbc2sbc(t){
				return (t || '').replace(/[\uff01-\uff5e]/g, function(a){return String.fromCharCode(a.charCodeAt(0)-65248);}).replace(/\u3000/g," ");
			}

			$('#password', $f).change(function(){
				$(this).val(function(i, v){return $.trim(String(dbc2sbc(v)).replace('X', 'x'))});
			});

			// 当填入学号后
			$('#xuehao', $f).change(function(){
				var no = this.value, $exams = $('#exams-list').detach(), month = new Date().getMonth(),
					vf = false, vc = false; // 第一项 input; 学校选择的 input

				if(no.indexOf('1') == 0){
					$exams.find('label').each(function(i,t){
						var $t = $(t);
						if(t.innerText.indexOf('高一') == -1){
							$t.addClass('hide');
						}else{
							$t.removeClass('hide');
							var ti = $t.find('input')[0];
							if(!vf) vf = ti;
							if(ti.value == indexData.examListCurrent) vc = ti;
						}
					});
				}
				if(no.indexOf('2') == 0){
					$exams.find('label').each(function(i,t){
						var $t = $(t);
						if(t.innerText.indexOf('高二') == -1){
							$t.addClass('hide');
						}else{
							$t.removeClass('hide');
							var ti = $t.find('input')[0];
							if(!vf) vf = ti;
							if(ti.value == indexData.examListCurrent) vc = ti;
						}
					});
				}
				if(no.indexOf('3') == 0){
					$exams.find('label').each(function(i,t){
						var $t = $(t);
						if(t.innerText.indexOf('高三') == -1 && this.innerText.indexOf('高考') == -1){
							$(t).addClass('hide');
						}else{
							$(t).removeClass('hide');
							var ti = $t.find('input')[0];
							if(!vf) vf = ti;
							if(ti.value == indexData.examListCurrent) vc = ti;
						}
					});
				}

				// Tip
				if($('#ext-tip').is('.alert-40, alert-28')) $('#ext-tip').hide();
				if(no.indexOf('3') == 0){
					if(month > 3 && month < 7 && $('#ext-tip').text() == ''){ // 5-7 月
						$('#ext-tip').removeClass().addClass('alert alert-success alert-40').html('<strong title="祝好 :)">Best wishes!</strong> 在这里查分数的日子不多了，希望那最后一次不在这里查分数的考试一切顺利！<br /><span class="muted">其实对你来说这个扩展快要退休了……</span>').show();
						$('<button type="button" class="close" title="隐藏">&times;</button>')
							.click(function(){
								$(this).parent().hide().end().remove();
								return false;
							}).prependTo('#ext-tip');
					}
				}
				if(no.indexOf('2') == 0){
					if(month > 3 && month < 7 && $('#ext-tip').text() == '' && (+localStorage['stu_arr_0_noticeRead'] || 0) < 28){
						// 5-7 月，编号 28
						$('#ext-tip').removeClass().addClass('alert alert-success alert-28').html('查询学业水平考试成绩，请<a href="http://query.5184.com/query/query_list.jsp?queryType=30">登录广东省考试服务网页面</a>。').show();
						$('<button type="button" class="close" title="不再提示">&times;</button>')
							.click(function(){
								localStorage['stu_arr_0_noticeRead'] = 28;
								$(this).parent().fadeOut().end().remove();
								return false;
							}).prependTo('#ext-tip');
					}
				}

				if(vf){
					$exams.find('input').removeAttr('checked');
					// console.log(vc, vf);
					if(vc && !$(vc).parent().is('.hide')){ // 如果学校提供的被选中的项在不折叠范围
						vc.checked = true;
					}else{ // 否则选中第一项
						vf.checked = true;
					}
					
					$('#exam-control .controls').removeClass('expanded').addClass('collapsed');
					$exams.show().find('label.hide').hide().end().find('label:not(.hide)').show();
					$('#expand_all').show();
					$('#collapse_all').hide();
					$('#exam-control .controls .help-block').hide();
				}else{
					// 学号输入错误
					$exams.hide();
					$('#exam-control .controls .help-block').show();
				}
				$exams.prependTo('#exam-control .controls');
			});

			$f.submit(function(){
				$('body').fadeTo(100, 0.25);
				if(localStorage){
					localStorage['stu_arr_0'] = $('#xuehao').val() + ';' + $('#password').val();
				}
				window.history.replaceState($f.serialize(), document.title, location.href);
			});

			$f.find('#exam-control .controls').append($exams.append($exams_act));
			$f.appendTo($dest);

			// remembered user info
			if(localStorage && localStorage['stu_arr_0']){
				var stu_arr = [(localStorage['stu_arr_0'] || '').split(';')], month = new Date().getMonth();
				if(
					(stu_arr[0][0].indexOf('2') == 0 && month > 6 && month < 9) // 高三：8-9月
					|| (stu_arr[0][0].indexOf('1') == 0 && month > 7 && month < 10) // 高二：9-10月
					){
					if(!localStorage['stu_arr_0_lastUpgraded'] || new Date().getYear() != new Date(localStorage['stu_arr_0_lastUpgraded']).getYear()){
						// 今年没有更新过，就提示下
						$('#ext-tip').removeClass().addClass('alert alert-warning')
							.html('你似乎需要升年级啦。<a id="upgrade_btn" href="javascript:void(0)" class="btn btn-small btn-warning">升级</a>').show();
						$('#upgrade_btn').click(function(){
							stu_arr[0][0] = +stu_arr[0][0] + 10000;
							localStorage['stu_arr_0_lastUpgraded'] = +new Date();
							$('#xuehao').val(stu_arr[0][0]).change();
							$('#ext-tip').removeClass().addClass('alert alert-success').html('如果学校还没有更新学号，将会提示恢复原学号。');
							$('<button type="button" class="close" title="隐藏">&times;</button>')
								.click(function(){
									$(this).parent().hide().end().remove();
									return false;
								}).prependTo('#ext-tip');
							return false;
						});
					}
				}
				
				$('#xuehao').val(stu_arr[0][0]).change();
				$('#password').val(stu_arr[0][1]);
			}

			$('<h2>教务处通知</h2><div id="orig-announcement"></div>')
				.filter('#orig-announcement').append('<p>' + indexData.notes.announcement.replace(/(\n|\r)/g,'</p><p>') + '</p>')
				.end().appendTo($dest);
			$('<p class="text-right"><small><i class="icon-heart" /> <a href="' + jzgc.config.version[2] + '" target="_blank" class="muted">jzGradeChecker ' + jzgc.config.version[1] + '</a></small></p>').appendTo($dest);
		}
		var indexData = fetchIndexData($(document.body));
		console.log(indexData);

		// Start to render page
		var $container = $('<div id="container" class="container"><h1>金中成绩查询</h1><div id="content" /></div>').appendTo($('<body />').replaceAll('body'));
		renderPage(indexData, $('#content'));

		// Finally show the page
		$('body').addClass('loaded');
	});
}