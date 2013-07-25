/*
Index Page Functions
*/
jzgc.index = {
	fetchIndexData: function($sourceElm){
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

		// 随手存一下
		if(jzgc.config) jzgc.config.examList = data.examList;

		return data;
	},
	renderPage: function(indexData, $dest){
		var $updates = $('<div class="alert alert-info" />').text(indexData.notes.update);
		$('<a class="icon-refresh close" title="刷新"></a>')
			.click(function(){
				location.reload();
				return false;
			}).prependTo($updates);
		$updates.appendTo($dest);

		$('<div id="ext-tip" class="alert" style="display:none;"></div>').appendTo($dest);

		//$f;
		var $f = $('<form id="form-stuinfo" action="search.asp" method="POST" enctype="application/x-www-form-urlencoded" class="form-horizontal"></form>');
		$('<div class="control-group"><label class="control-label" for="xuehao">学号</label><div class="controls"><input type="number" id="xuehao" name="xuehao" placeholder="五位数班学号" required="required" min="10101" max="32100" /></div></div>').appendTo($f);
		$('<div class="control-group"><label class="control-label" for="password">密码</label><div class="controls"><input type="text" id="password" name="password" placeholder="身份证号码等" required="required" /></div></div>').appendTo($f);
		$('<div class="control-group" id="exam-control"><label class="control-label" for="kaoshi">考试</label><div class="controls row-fluid"><span class="help-block">请先输入学号</span></div></div>').appendTo($f);
		$('<div class="form-actions"><input id="submit-btn" type="submit" class="btn btn-primary" value="查询" /> <a role="button" class="btn" href="javascript:void(0)" title="导出当前学号下所有考试的成绩数据" id="export-btn">导出</a></div>').appendTo($f);

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
				vf = false, vc = false, vca = false; // 第一项 input; 学校选择的 input；后期选择的 input

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
						if(ti.checked) vca = ti;
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
						if(ti.checked) vca = ti;
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
						if(ti.checked) vca = ti;
					}
				});
			}

			// Tip
			if($('#ext-tip').is('.alert-40, alert-28')) $('#ext-tip').hide();
			if(no.indexOf('3') == 0){
				if(month > 3 && month < 7 && $('#ext-tip').text() == ''){ // 5-7 月
					$('#ext-tip').removeClass().addClass('alert alert-success alert-40').html('<strong title="祝好 :)">Best wishes!</strong> 在这里查分数的日子不多了，希望那最后一次不在这里查分数的考试一切顺利！<br />在退休前，我还可以帮你导出所有的成绩数据。').show();
					$('<button type="button" class="close" title="隐藏">&times;</button>')
						.click(function(){
							$(this).parent().hide().end().remove();
							return false;
						}).prependTo('#ext-tip');
					$('<a role="button" class="btn" href="javascript:void(0)" title="导出当前学号下所有考试的成绩数据">导出</a>')
						.click(function(){
							$('#export-btn').click();
							return false;
						}).appendTo('#ext-tip');
					
				}
			}
			if(no.indexOf('2') == 0){
				if(month > 3 && month < 7 && $('#ext-tip').text() == '' && (+jzgc.user.attrGet('noticeRead') || 0) < 28){
					// 5-7 月，编号 28
					$('#ext-tip').removeClass().addClass('alert alert-success alert-28').html('查询学业水平考试成绩，请<a href="http://query.5184.com/query/query_list.jsp?queryType=30">登录广东省考试服务网页面</a>。').show();
					$('<button type="button" class="close" title="不再提示">&times;</button>')
						.click(function(){
							jzgc.user.attrSave('noticeRead', 28);
							$(this).parent().fadeOut().end().remove();
							return false;
						}).prependTo('#ext-tip');
				}
			}

			if(vf){
				if(!$exams.is('.load-selected')) $exams.find('input').removeAttr('checked');
				var vfc; // v_final_checked
				// console.log(vc, vf);
				if(vc && !$(vc).parent().is('.hide')){ // 如果学校提供的被选中的项在不折叠范围
					vfc = vc;
				}else{ // 否则选中第一项
					vfc = vf;
				}
				if(!$exams.is('.load-selected')) vfc.checked = true;
				
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
			if($('#form-stuinfo').is('.konami-mode')) vfc.focus();
			// console.log(vca, $(vca).parent().is('.hide'));
			// if(vca && $(vca).parent().is('.hide')) $('#expand_all').click();
			$exams.removeClass('load-selected');
		});

		$f.submit(function(){
			$('body').fadeTo(100, 0.25);
			if($(this).is('.konami-mode')){
				var val = $('#xuehao').val();
				$('<input type="text" id="xuehao" name="xuehao" />').val(val + jzgc.config.konamiCode).replaceAll('#xuehao');
			}else{
				jzgc.user.save($('#xuehao').val(), $('#password').val());
			}
			window.history.replaceState($f.serialize() + (val ? '&konamiMode=true' : ''), document.title, location.href);
		});

		$f.find('#exam-control .controls').append($exams.append($exams_act));

		// 导出
		$('#export-btn', $f).click(function(){
			// HTML5 only!!!
			var isKonami = $('#form-stuinfo').is('.konami-mode');
			if(isKonami && !confirm('如果继续，您以前自动保存的考生信息会丢失。是否继续导出？')){
				return false;
			}
			if($('#xuehao').is(':invalid') ){
				$('#xuehao')[0].focus();
				return false;
			}
			if( !isKonami && $('#password').is(':invalid') ){
				$('#password')[0].focus();
				return false;
			}
			if(isKonami){
				$('#password').val('KONAMIMODE');
			}

			if(jzgc.user.isAvailable()){
				jzgc.user.save($('#xuehao').val(), $('#password').val());
				jzgc.export.showUI();
			}else{
				alert('抱歉，本功能不可用。请联系开发者。');
			}
			return false;
		});

		$f.appendTo($dest);

		// remembered user info
		if(jzgc.user.isAvailable(0)){
			var stu_arr = jzgc.user.get(0), month = new Date().getMonth();
			if(
				(stu_arr[0].indexOf('2') == 0 && month > 6 && month < 9) // 高三：8-9月
				|| (stu_arr[0].indexOf('1') == 0 && month > 7 && month < 10) // 高二：9-10月
				){
				if(!jzgc.user.attrGet('lastUpgraded') || new Date().getYear() != new Date(jzgc.user.attrGet('lastUpgraded')).getYear()){
					// 今年没有更新过，就提示下
					$('#ext-tip').removeClass().addClass('alert alert-warning')
						.html('你似乎需要升年级啦。<a id="upgrade_btn" href="javascript:void(0)" class="btn btn-small btn-warning">升级</a>').show();
					$('#upgrade_btn').click(function(){
						stu_arr[0] = +stu_arr[0] + 10000;
						jzgc.user.attrSave('lastUpgraded', +new Date());
						$('#xuehao').val(stu_arr[0]).change();
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
			
			$('#xuehao').val(stu_arr[0]).change();
			$('#password').val(stu_arr[1]);
		}

		$('<h2>教务处通知</h2><div id="orig-announcement"></div>')
			.filter('#orig-announcement').append('<p>' + indexData.notes.announcement.replace(/(\n|\r)/g,'</p><p>') + '</p>')
			.end().appendTo($dest);

		// Konami
		var konami = new Konami(this.doKonami);

		// $f = undefined;
	},
	doKonami: function(){
		$('#submit-btn').removeClass().addClass('btn btn-inverse').attr('title', '免密码查询');
		$('#form-stuinfo').addClass('konami-mode');
		$('#xuehao')[0].select();
		$('#password').val('').removeAttr('required').parents('.control-group').hide();
	}
};