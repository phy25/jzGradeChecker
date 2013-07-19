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

		var q = parseQuery(e.state);
		var $radio = $('#exams-list').find('input[value='+q['kaoshi']+']').attr('checked', true);

		if(window.sessionStorage && sessionStorage['result_error']){
			if(sessionStorage['result_error'] == 'cert'){
				// 考生信息错误
				if(+new Date() - +jzgc.user.attrGet('lastUpgraded') < 5000){
					// 5 秒前更新过
					jzgc.user.attrSave('lastUpgraded', 0); // 重设掉
					var stu_arr_0 = jzgc.user.get(0);
					if(stu_arr_0[0] > 20100) stu_arr_0[0] = +stu_arr_0[0] - 10000;
					jzgc.user.saveArray(stu_arr_0, 0);
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

		var indexData = jzgc.index.fetchIndexData($(document.body));

		// Start to render page
		var $container = $('<div id="container" class="container"><h1>金中成绩查询</h1><div id="content" /></div>').appendTo($('<body />').replaceAll('body'));
		jzgc.index.renderPage(indexData, $('#content'));

		jzgc.ce.appendCopyRight($container);

		// Finally show the page
		$('body').addClass('loaded');
	});
}