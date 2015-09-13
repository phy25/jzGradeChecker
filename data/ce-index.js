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
var popfunc = function() {
	console.log('pop');
	var f = function(){
		c++;
		if(!$('body').is('.loaded') && c<10){
			setTimeout(f, 50);
			return;
		}

		var q = parseQuery(history.state);
		var $radio = $('#exams-list').find('input[value='+q['kaoshi']+']').attr('checked', true);
		if($radio.length) $radio.end().addClass('load-selected');

		if(!q['xuehao']) q['xuehao'] = '';

		if(window.sessionStorage && sessionStorage['result_error']){
			if(sessionStorage['result_error'] == 'cert'){
				// 考生信息错误
				var date = new Date();
				if(+date - +jzgc.user.attrGet('lastUpgraded') < 5000){
					// 5 秒前更新过
					jzgc.user.attrSave('lastUpgraded', 0); // 重设掉
					var stu_arr_0 = jzgc.user.get(0);
					if(jzgc.user.attrGet('xuehaoBefore')) stu_arr_0[0] = jzgc.user.attrGet('xuehaoBefore');
					jzgc.user.attrClear('xuehaoBefore');
					jzgc.user.saveArray(stu_arr_0, 0);
					$('#xuehao').val(stu_arr_0[0]).change();

					$('h1:first').after('<div id="result_error" class="alert alert-error"><strong>考生信息错误 :( 。</strong>下次查询再试着升年级吧。已经恢复了你原来的学号，请直接提交查询。</div>');
					$('#us-change').click();
				}else{
					var month = new Date().getMonth();
					if(q['xuehao'].indexOf('3') == 0){ // 高三提示
						$('h1:first').after('<div id="result_error" class="alert alert-error"><strong>考生信息错误。</strong> <span>你毕业了吗？ <button type="button" id="result_error_isover_yes" class="btn btn-small" tabindex="5">是</button> <button type="button" id="result_error_isover_no" class="btn btn-small" tabindex="6">否</button></span></div>');
						$('#result_error_isover_yes').click(function(){
							$('#result_error span').html('可能因为你毕业了，师弟师妹已经薪火相传，继承了你的学号。你已经不能在这里查询成绩了 :( 。');
						});
						$('#result_error_isover_no').click(function(){
							$('#result_error span').html('检查一下再试试吧。');
						});
					}else if(q['xuehao'].indexOf('1') == 0
						&& q['xuehao'].indexOf('1') == 0 && month > 0 && month < 5 // 高一：2-5月
						){ // 高一分班提示
						$('h1:first').after('<div id="result_error" class="alert alert-error"><strong>考生信息错误。</strong> <span>'+decodeURIComponent(q.xuehao || '').replace(/\D/g, '').replace(jzgc.config.konamiCode, '')+' 这是你分班后的新学号吗？ <button type="button" id="result_error_isnew_yes" class="btn btn-small" tabindex="5">是</button> <button type="button" id="result_error_isnew_no" class="btn btn-small" tabindex="6">否</button></span></div>');
						$('#result_error_isnew_yes').click(function(){
							$('#result_error span').html('可能学校还没有修改学号，或者密码错误。请检查密码是否正确，或尝试使用旧学号登录。');
						});
						$('#result_error_isnew_no').click(function(){
							$('#result_error span').html('请检查密码是否正确，并修改为新学号登录。');
						});
					}else{
						$('h1:first').after('<div id="result_error" class="alert alert-error"><strong>学号或密码错误。</strong>检查一下再试试吧。</div>');
					}

					$('#us-change').click();
					var $form_stuinfo = $('#group-stuinfo').one('change', 'input', function(){
						// $('#result_error').remove();
						// 暂时注释掉，避免控件位置突然移动，降低用户体验
						$form_stuinfo.removeClass('error');
					}).children('div').addClass('error');
				}
			}else if(sessionStorage['result_error'] == 'exam'){
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
			}else{
				// 服务器错误
				$('h1:first').after('<div id="result_error" class="alert alert-error"><strong>服务器错误。</strong>检查一下再试试吧，或者等明天老师修好服务器了再来。</div>');
			}
			delete sessionStorage['result_error'];
		}else{
			jzgc.user.attrClear('xuehaoBefore');
		}
		
		if($radio.parent().is('.hide')){
			$('#expand_all').click();
		}
		if(q.konamiMode){
			if(q.xuehao){
				$('#xuehao').val(decodeURIComponent(q.xuehao || '').replace(/\D/g, '').replace(jzgc.config.konamiCode, '')).change();
			}
			jzgc.index.doKonami();
		}
	}, c = 0;
	f();
};
window.addEventListener('load', popfunc);
// We are in Firefox, so popstate will be triggered on load
window.addEventListener('popstate', popfunc);

function startExecution(){
	(function(){
		if(jzgc.ce.checkErrorPage()){return;}

		var indexData = jzgc.index.fetchIndexData($(document.body));

		if((+jzgc.user.attrGet('noticeRead') || 0) < 1){
			if(location.hash == '#noticeRead=1'){
				jzgc.user.attrSave('noticeRead', 1);
			}else{
				// 新手指引，编号 1
				self.port.emit('pushUrlChange', 'hello.html');
				// location = self.options.localUrl+"hello.html";
			}
		}

		// Start to render page
		var $container = $('<div id="container" class="container"><h1>金中成绩查询</h1><div id="content" /></div>').appendTo($('<body />').replaceAll('body'));
		jzgc.index.renderPage(indexData, $('#content'));

		jzgc.ce.appendCopyRight($container);

		// Finally show the page
		$('body').addClass('loaded');
	})();
}