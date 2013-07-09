/*
Common functions for Chrome extension
*/

jzgc.ce = {
	checkErrorPage: function(force){
		if(force || (document.body && document.body.innerText.indexOf('您未被授权查看该页') != -1)){
			this.errorPage();
			return true;
		}
	},
	errorPage: function(){
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
	},
	conflictCheck: function(complete){
		if(typeof complete == 'function') this._conflictCheckOnComplete = complete;

		if(document.body){
			if(document.title == '金中成绩查询'){
				// 另一个扩展 Javascript 已经接管页面
				console.error('Attempting to start an instance while another instance exists already');
			}else{
				document.title = '金中成绩查询';
				if(typeof this._conflictCheckOnComplete == 'function') this._conflictCheckOnComplete();
			}
		}else{
			setTimeout(this.conflictCheck, 50);
		}
	},
	removebg: function(){
		if(document.body && document.body.background){
			document.body.background = '';
		}else{
			setTimeout(this.removebg, 50);
		}
	}
};