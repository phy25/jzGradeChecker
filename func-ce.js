/*
Common functions for Chrome extension
*/

$(function(){
	$('head').append('<link rel="shortcut icon" type="image/png" href="'+ chrome.extension.getURL("icon.png") +'" />');
});

jzgc.ce = {
	checkErrorPage: function(force){
		if(force || (document.body && document.body.innerText.indexOf('您未被授权查看该页') != -1)){
			this.errorPage();
			return true;
		}
	},
	errorPage: function(){
		$('style, link').remove(); // meta:refresh is of no use
		document.title = '【正维护】金中成绩查询';
		$('<div id="container" class="container-fluid" />').appendTo($('<body />').replaceAll('body'))
			.append('<h1>金中成绩查询</h1><div class="alert"><strong>网站维护中。</strong> 成绩可能要出来了，你懂的。</div><div id="progressbar" class="progress progress-striped active" title="老师很忙的啦不要再 DDOS 我嘛……"><div class="bar" style="width: 0%;">等待第 <span id="count">0</span> 次刷新</div></div>');
		$('body').addClass('loaded');
		var wait = function(){
			var sec = 0, $bar = $('#progressbar div:first').removeClass('bar-warning'),
				progress = setInterval(function() {
					if (sec == 15) {
						clearInterval(progress);
						$.ajax({
							url: 'search.htm?' + (+new Date()),
							type: 'GET',
							complete: function(xhr){
								if(xhr.status == 200){
									// 正常了
									$bar.removeClass('bar-warning').addClass('bar-success').html('似乎恢复了，正在刷新……');
									document.title = '金中成绩查询';
									setTimeout(function(){location.reload()}, 1000);
								}else{
									// 仍在维护
									$bar.css('width', 0);
									setTimeout(wait, 1000);
								}
							}
						});
					}else{
						sec++;
						$bar.css('width', sec/15*100 + '%');
						if(sec == 15) $bar.addClass('bar-warning');
					}
				}, 1000);

			$('#count').html(function(i, v){return (+v)+1;});
		};
		wait();
	},
	conflictCheck: function(complete){
		if(typeof complete == 'function') this._conflictCheckOnComplete = complete;

		if(document.body){
			if(document.jzgcEnabled === true){
				// 另一个扩展 Javascript 已经接管页面
				console.error('Attempting to start an instance while another instance exists already');
			}else{
				document.title = '金中成绩查询';
				document.jzgcEnabled = true;
				if(typeof this._conflictCheckOnComplete == 'function') this._conflictCheckOnComplete();
			}
		}else{
			setTimeout(function(){jzgc.ce.conflictCheck();}, 50);
		}
	},
	_conflictCheckOnComplete: false,
	removebg: function(){
		if(document.body && document.body.background){
			document.body.background = '';
		}else{
			setTimeout(this.removebg, 50);
		}
	},
	appendCopyRight: function($dest){
		var urls = jzgc.config.urls;
		$dest.append('<p class="text-right"><small><i class="icon-heart" /> <a href="javascript:void(0)" class="muted" id="ext-copyright">jzGradeChecker ' + jzgc.config.version[1] + '</a> <a href="/" class="muted">金中首页</a></small></p>');
		if($.fn.popover){
			$('#ext-copyright', $dest).popover({html:true, title:'jzGradeChecker ' + jzgc.config.version[1], content:'<ul class="unstyled"><li>开发者 <a href="'+urls.contactDeveloper+'" target="_blank">@phy25</a></li><li>联系项目<a href="'+urls.extSite+'" target="_blank">请上扩展网站</a></li><li>贡献代码<a href="'+urls.GitHubRepo+'" target="_blank">请到 GitHub</a></li></ul>', placement:'top', trigger:'click'});
		}else{
			$('#ext-copyright', $dest).attr('href', urls.extSite).attr('target', '_blank');
		}
	}
};