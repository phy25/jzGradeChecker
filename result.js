function removebg(){
	if(document.body && document.body.background){
		document.body.background = '';
	}else{
		setTimeout(removebg, 100);
	}
};
removebg();

$(function(){
	// No result
	var innerText = document.body.innerText;
	if(innerText.indexOf('您未被授权查看该页') != -1){
		$('style').remove();
		$('<div class="container" />').appendTo($('<body />').replaceAll('body'))
			.append('<h1>金中成绩查询</h1><div class="alert"><strong>网站维护中。</strong> 成绩要出来了，你懂的。</div><div id="progressbar" class="progress progress-striped active" title="老师很忙的啦不要再 DDOS 我嘛……"><div class="bar" style="width: 0%;">请等待自动刷新</div></div>');
		$('body').addClass('loaded');
		$('#progressbar div:first').animate({'width':'100%'}, {duration: 30000, complete:function(){$(this).addClass('bar-success');location.reload();}});
		return;
	}

	if(innerText.indexOf('对不起') != -1){
		if(window.sessionStorage){
			sessionStorage['result_error'] = innerText.indexOf('考生号或密码无效') != -1 ? 'cert': 'exam';
		}
		window.history.back();
	}else{
		// Save the time to give hints on index.js
		if(window.localStorage){
			localStorage['stu_arr_0_lastChecked'] = +new Date();
		}
	}

	var $content = $('table:eq(2)').detach();
	var $container = $('<div class="container" />').appendTo($('<body />').replaceAll('body'));

	var $append = $('<h1>金中成绩查询</h1>')
		.after($content);

	$container.append($append);

	var $table = $container.find('table:eq(1)').addClass('table').removeAttr('width border cellpadding cellspacing bordercolor');

	$table.find('tr:first').wrap('<thead />').parent().detach().prependTo($table);

	// Finally show the page
	$('body').addClass('loaded');
});