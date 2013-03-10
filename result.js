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

	// Finally show the page
	$('body').addClass('loaded');
});