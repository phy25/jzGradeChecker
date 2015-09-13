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
		}

		if(innerText.indexOf('该页无法显示') != -1 || innerText.indexOf('服务器出错') != -1){
			if(window.sessionStorage){
				sessionStorage['result_error'] = 'server';
			}
			window.history.back();
		}
		
		// 去掉固有的 style
		$('link:first').remove();
		
		
		var resultData = jzgc.result.fetchResultData($(document.body));

		// Save the time to give hints on index.js
		jzgc.user.attrSave('lastChecked', +new Date());
		jzgc.user.attrSave('name', resultData.meta['姓名']);
		if(resultData.meta['新学号'] && resultData.meta['新学号'].substr(1, 4) != resultData.meta['原学号'].substr(1, 4)){
			jzgc.user.attrSave('newxuehao', resultData.meta['新学号']);
		}else{
			jzgc.user.attrClear('newxuehao');
		}
		
		// Start to render page
		var $container = $('<div id="container" class="container-fluid"><h1>金中成绩查询</h1><div id="content" /></div>').appendTo($('<body />').replaceAll('body'));
		jzgc.result.renderPage(resultData, $('#content'));

		// Copyright
		jzgc.ce.appendCopyRight($container);

		// Finally show the page
		$('body').addClass('loaded');
	});
};