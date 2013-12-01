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
		$('<button class="close" title="强制刷新" tabindex="80"><i class="icon-refresh" /></button>')
			.click(function(){
				location = '?'+ (+new Date());
				return false;
			}).prependTo($updates);
		$updates.appendTo($dest);

		$('<div id="ext-tip" class="alert" style="display:none;"></div>').appendTo($dest);

		//$f;
		var $f = $('<form id="form-stuinfo" action="search.asp" method="POST" enctype="application/x-www-form-urlencoded" class="form-horizontal" />');
		$('<div id="group-stuinfo"><div class="control-group"><label class="control-label" for="xuehao">学号</label><div class="controls"><input type="number" id="xuehao" name="xuehao" placeholder="五位数班学号" required="required" min="10101" max="32100" class="input-xlarge" tabindex="10" /></div></div><div class="control-group"><label class="control-label" for="password">密码</label><div class="controls"><div class="input-append"><input type="text" id="password" name="password" placeholder="身份证号码等" required="required" class="input-large" tabindex="20" /><button class="btn" type="button" title="密文显示密码" id="password-hide-btn" data-toggle="button" tabindex="25">隐藏</button></div></div></div></div>').appendTo($f);
		$('<div class="control-group" id="exam-control"><label class="control-label" for="kaoshi">考试</label><div id="exam-selector" class="controls"></div></div>').appendTo($f);
		$('<div class="form-actions"><input id="submit-btn" type="submit" class="btn btn-primary" value="查询" tabindex="50" /> <div class="btn-group"><button class="btn" type="button" title="导出当前学号下所有考试的成绩数据" id="export-btn" tabindex="60">导出</button><button id="export-more-btn" class="btn dropdown-toggle fixheight" data-toggle="dropdown" tabindex="61"><span class="caret"></span></button><ul class="dropdown-menu" role="menu" aria-labelledby="export-more-btn" id="export-more-menu"><li role="presentation"><a href="'+ chrome.extension.getURL("jsonReader.html") +'" role="menuitem" tabindex="-1">导出数据查看器</a></li></ul></div> </div>').appendTo($f);

		this.renderExamSelector(indexData, $f.find('#exam-selector'), $('#xuehao', $f));
		this.bindExamSelector(indexData, $f.find('#exam-selector'), $('#xuehao', $f));

		function dbc2sbc(t){
			return (t || '').replace(/[\uff01-\uff5e]/g, function(a){return String.fromCharCode(a.charCodeAt(0)-65248);}).replace(/\u3000/g," ");
		}

		$('#password', $f).change(function(){
			$(this).val(function(i, v){
				if(v == '     '){
					jzgc.index.doKonami();
				}
				return $.trim(String(dbc2sbc(v)).replace('X', 'x'))
			});
		});

		// 密文隐藏
		$('#password-hide-btn', $f).button().click(function(){
			if(!$(this).is('.active')){ // Bootstrap 的程序会慢一点控制 active
				$('#password').prop('type', 'password');
				jzgc.settings.set('passwordHide', true);
			}else{
				$('#password').prop('type', 'text');
				jzgc.settings.set('passwordHide', undefined);
			}
		});
			// .on('focus mouseover', function(){$('#password-after-hint').stop(1,1).show();})
			// .on('blur mouseout', function(){$('#password-after-hint').stop(1,1).fadeOut(200);});

		// 当填入学号后
		$('#xuehao', $f).change(function(){
			var no = this.value = $.trim(String(dbc2sbc(this.value))),
				$exams = $('#exams-list').detach(),
				month = new Date().getMonth(),
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
				// console.log($exams.is('.load-selected'), vc.checked, vf.checked, vfc.checked, vca.checked);
				
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
			// if($('#form-stuinfo').is('.konami-mode')) vfc.focus();
			// if(vca && $(vca).parent().is('.hide')) $('#expand_all').click();
			$exams.removeClass('load-selected');
		}).keydown(function(e){
			if(e.keyCode == 9 && e.shiftKey == false && $('#form-stuinfo').is('.konami-mode')){
				$(this).one('change', function(){$('#exams-list input:checked').focus();});
			}
		});

		$f.submit(function(){
			jzgc.utils.loadingEff();
			if($(this).is('.konami-mode')){
				var val = $('#xuehao').val();
				$('<input type="text" id="xuehao" name="xuehao" />').val(val + jzgc.config.konamiCode).replaceAll('#xuehao');
			}else{
				if(jzgc.user.isAvailable(0) && jzgc.user.get(0)[1] != $('#password').val() && confirm("你似乎修改了密码。要清除上一个查询者的所有本地设置吗（建议清除）？")){
					// 如果密码变了（= 换了个人）
					jzgc.user.clear(0);
				}

				jzgc.user.save($('#xuehao').val(), $('#password').val());
			}
			window.history.replaceState($f.serialize() + (val ? '&konamiMode=true' : ''), document.title, location.href);
		});

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

		if(jzgc.settings.get('passwordHide') == 'true'){
			$('#password-hide-btn', $f).click().hide();

			$('#password').parent().removeClass('input-append');
			$('#xuehao').removeClass('input-xlarge').addClass('input-large');
		}

		// remembered user info
		if(jzgc.user.isAvailable(0)){
			var stu_arr = jzgc.user.get(0), month = new Date().getMonth();
			// 加 10000 的年级升级
			if(
				(stu_arr[0].indexOf('2') == 0 && month > 6 && month < 9) // 高三：8-9月
				|| (stu_arr[0].indexOf('1') == 0 && month > 6 && month < 10) // 高二：8-10月
				){
				if(
					(!jzgc.user.attrGet('lastUpgraded')
					|| new Date().getYear() != new Date(jzgc.user.attrGet('lastUpgraded')).getYear())
					&& jzgc.user.attrGet('lastChecked')
					){
					// 今年没有更新过，就提示下；并且之前已经成功查询过
					$('#ext-tip').removeClass().addClass('alert alert-warning')
						.html('你似乎需要升年级啦。<button type="button" id="upgrade_btn" class="btn btn-small btn-warning" tabindex="5">升级</button>').show();
					$('#upgrade_btn').click(function(){
						$('#us-change').click();
						jzgc.user.attrSave('xuehaoBefore', stu_arr[0]);
						stu_arr[0] = +stu_arr[0] + 10000;
						$('#form-stuinfo').on('submit', function(){jzgc.user.attrSave('lastUpgraded', +new Date());});
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

			// 分班的升级
			if(
				stu_arr[0].indexOf('1') == 0 && month > 0 && month < 5 // 高一：2-5月
				&& (!jzgc.user.attrGet('lastUpgraded')
				|| new Date().getYear() != new Date(jzgc.user.attrGet('lastUpgraded')).getYear())
				&& jzgc.user.attrGet('lastChecked') && jzgc.user.attrGet('xuehaoNew')
				){
				$('#ext-tip').removeClass().addClass('alert alert-warning')
					.html('你似乎需要升年级啦。<button type="button" id="upgrade_btn" class="btn btn-small btn-warning"  tabindex="5">升级</button>').show();
				$('#upgrade_btn').click(function(){
					$('#us-change').click();
					jzgc.user.attrSave('xuehaoBefore', stu_arr[0]);
					stu_arr[0] = jzgc.user.attrGet('xuehaoNew');
					$('#form-stuinfo').on('submit', function(){jzgc.user.attrSave('lastUpgraded', +new Date());});
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
			
			$('#xuehao').val(stu_arr[0]).change();
			$('#password').val(stu_arr[1]);

			$('#group-stuinfo').hide().before('<div id="user-selecter" class="controls"><p><strong>欢迎回来 <span id="us-xuehao">'+stu_arr[0]+'</span> <span id="us-name">'+(jzgc.user.attrGet('name') || '')+'</span></strong> <button class="btn btn-mini" type="button" id="us-change" tabindex="45"><i class="icon-pencil" /> 修改信息</button></p></div>');
			$('#us-change').click(function(){
				$('#user-selecter').hide().next().show(); // 不用 remove
				$('#xuehao').focus();
				return false;
			});
		}else{
			$('#xuehao').focus();
		}

		$('<h2>教务处通知</h2><div id="orig-announcement"></div>')
			.filter('#orig-announcement').append('<p>' + indexData.notes.announcement.replace(/(\n|\r)/g,'</p><p>') + '</p>')
			.end().appendTo($dest);

		// Konami
		var konami = new Konami(this.doKonami);

		// $f = undefined;
	},
	renderExamSelector: function(indexData, $dest){
		$dest.addClass('row-fluid').html('<span class="help-block">请先输入学号</span>');

		var $exams = $('<div id="exams-list" class="hide" />');

		// 渐进部署，先排序，不分类
		var examList = jzgc.ajax.sortExamList(indexData.examList);
		for(var i in examList){
			var $eln = $('<label class="radio span5"><input type="radio" name="kaoshi" value="'+examList[i]['id']+'" tabindex="30"> '+examList[i]['name']+'</label>');
			$exams.append($eln);
		}

		var $exams_act = $('<p class="span12"><button id="expand_all" type="button" class="btn btn-mini" tabindex="40"><i class="icon-chevron-down" /> 显示更多</button><button id="collapse_all" type="button" style="display:none" class="btn btn-mini" tabindex="40"><i class="icon-chevron-up" /> 隐藏其他</button></p>');
		
		$dest.append($exams.append($exams_act));

		// <div class="tabbable tabs-left" id="exam-selector"><ul class="nav nav-tabs"><li class="active"><a href="#grade10"><input type="checkbox" title="全不选" checked /> 高一 <span class="badge badge-success">6</span></a></li></ul><div class="tab-content"><div class="tab-pane active row-fluid" id="grade10"><label class="radio span5"><input name="kaoshi" tabindex="30" type="checkbox" value="10" checked="checked" disabled> 高一上学期10月考 <span class="text-info">（已读取）</span></label></div></div></div>
	},
	bindExamSelector: function(indexData, $dest){
		$('#expand_all', $dest).click(function(){
			$('#exams-list').find('label.hide').show()
				.end().find('input:checked').focus();
			$(this).hide().parent().parent().removeClass('collapsed').addClass('expanded');
			$('#collapse_all').show();
		});
		$('#collapse_all', $dest).click(function(){
			$('#exams-list').find('label.hide').hide()
				.end().find('input:checked').focus();
			$(this).hide().parent().parent().removeClass('expanded').addClass('collapsed');
			$('#expand_all').show();
		});
	},
	selectExamSelector: function(grade, $dest){

	},
	doKonami: function(){
		$('#us-change').click();
		$('#submit-btn').removeClass().addClass('btn btn-warning').attr('title', '免密码查询');
		$('#form-stuinfo').addClass('konami-mode');
		$('#xuehao').removeClass()[0].select();
		$('#password').val('').removeAttr('required').parents('.control-group').hide();
		if((+jzgc.user.attrGet('noticeReadKonami') || 0) < 1){
			$('#ext-tip').removeClass().addClass('alert alert-success alert-konami').html('请尊重他人隐私，合理使用此功能。 <a href="http://github.phy25.com/jzGradeChecker/konamigotit.html">来签到一下</a>。').show();
			$('<button type="button" class="close" title="不再提示">&times;</button>')
				.click(function(){
					jzgc.user.attrSave('noticeReadKonami', 1);
					$(this).parent().fadeOut().end().remove();
					return false;
				}).prependTo('#ext-tip');
		}
	}
};