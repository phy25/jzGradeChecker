/*
Common Data
*/

// A sequential exam list **TODO**
var exam_list_organized = [], extVersion = ['0.5.1', 'http://github.phy25.com/jzGradeChecker/'];

function errorPage(){
	$('style').remove();
	$('<div class="container" />').appendTo($('<body />').replaceAll('body'))
		.append('<h1>金中成绩查询</h1><div class="alert"><strong>网站维护中。</strong> 成绩可能要出来了，你懂的。</div><div id="progressbar" class="progress progress-striped active" title="老师很忙的啦不要再 DDOS 我嘛……"><div class="bar" style="width: 0%;">等待第<span id="count">0</span>次刷新</div></div>');
	$('body').addClass('loaded');
	var wait = function(){
		var $bar = $('#progressbar div:first').animate(
			{width:'100%'},
			{
				duration: 15000,
				complete: function(){
					$bar.addClass('bar-warning');
					$.ajax({
						url: 'search.htm',
						type: 'GET',
						complete: function(xhr){
							if(xhr.status == 200){
								// 正常了
								$bar.removeClass('bar-warning').addClass('bar-success');
								location.reload();
							}else{
								// 仍在维护
								$bar.removeClass('bar-warning').animate({width:0},{duration:400, complete:wait});
								wait();
							}
						}
					});
					
				}
			}
		);
		$('#count').html(function(i, v){return v+1;});
	};
}