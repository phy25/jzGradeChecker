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
	if(document.body.innerText.indexOf('对不起') != -1){
		if(window.sessionStorage){
			sessionStorage['no_result'] = 'true';
			//window.history.pushState({'no_result':true}, document.title, location.href);
			window.history.back();
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