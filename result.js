function removebg(){
	if(document.body && document.body.background){
		document.body.background = '';
	}else{
		setTimeout(removebg, 100);
	}
};
removebg();

function checkTitle(){
	if(document.title){
		if(document.title == '金中成绩查询'){
			// 另一个扩展 Javascript 已经接管页面
			console.error('Attempting to start an instance while another instance exists already');
		}else{
			document.title = '金中成绩查询';
			$(document).ready(startExecution);
		}
	}else{
		setTimeout(checkTitle, 50);
	}
};
checkTitle();


var startExecution = function(){
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

	// 去掉固有的 style
	$('link:first').remove();

	var $content = $('table:eq(2) div:first').children().detach();
	var $container = $('<div class="container" />').appendTo($('<body />').replaceAll('body'));

	var $append = $('<h1>金中成绩查询</h1>')
		.after($content);

	$container.append($append);

	var $table = $container.find('table:eq(0)').addClass('table table-striped table-condensed').removeAttr('width border cellpadding cellspacing bordercolor');

	$table.find('tr:first').unwrap().wrapAll('<thead />');
	$table.find('thead').prependTo($table).find('td').children().wrap('<th />');
	$table.find('thead>tr').prepend($table.find('th')).parent().find('td').remove();
	
	function getTableArr($Elem){
		var r = {'thead':[], 'tbody':[]}, $h, $b;
		$h = $Elem.find('thead tr:first');
		if(!$h.length){
			$h = $Elem.find('tbody tr:first');
			$b = $Elem.find('tbody tr:not(:first)');
		}else{
			$b = $Elem.find('tbody tr');
		}
		$h.find('th, td').each(function(i){
			if(i > 0){
				r.thead[r.thead.length] = $.text(this).replace(/(\s)/g,'');
			}
		});
		
		$b.each(function(){
			r.tbody[r.tbody.length] = {};
			var td = r.tbody[r.tbody.length-1], $td = $(this).find('td');
			td.subject = $td.eq(0).text().replace(/(\s)/g,'');
			$td.not(':first').each(function(i){
				td[r.thead[i]] = $(this).text().replace(/(\s)/g,'');
			});
		});

		return r;
	}

	// Finally show the page
	$('body').addClass('loaded');
};