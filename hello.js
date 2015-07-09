var jzgc = {};

$(function(){
	var $container = $('<div id="container" class="container"><h1>金中成绩查询</h1><div id="content"><div id="alert-hello" class="alert"><a id="back-btn" class="btn">跳过介绍</a> <span>以后，在页面最下方“新手指南”可以回到本页面。</span></div></div></div>').appendTo($('<body />').replaceAll('body')),
		href = jzgc.config.urls.examList+'#noticeRead=1';

	$container.find('#back-btn').attr('href', href);

	jzgc.ajax.getExamList(
		function(r){
			jzgc.index.renderPage(r, $('#content'));

			$('#orig-announcement').hide();
			bootstro.set_bootstrap_version(2);
			bootstro.start('.bootstro', {
				stopOnBackdropClick: false,
				finishButton: '',
				items: [
					{"selector":"p.text-right:last small","title":"欢迎使用 jzGC "+jzgc.config.version[1],"content":'<p>这是一个帮你更好查成绩的扩展。下面带你看看它的基本功能吧。</p><p><small>如果不需要查看导览，<a href="'+href+'">请点这里退出</a>。下面这个地方可以重新打开导览。</small></p>',"width":"240px","placement":"top",step:0},
					{"selector":"#form-stuinfo","title":"输入信息","content":'<p>无论是查成绩还是导出成绩，你需要先输入你的学号和成绩查询密码。查成绩还需要选考试场次。</p><p>这些信息会保存下来，下次查成绩就不用输了。放心，扩展不会上传任何学号密码信息。</p><p>现在我帮你填好了信息。</p>',"width":"350px","placement":"bottom", step:1},
					{"selector":"div.form-actions:first .btn-group:last","title":"注意细节～","content":'<p>查成绩就按“查询”，要导出成绩，就<strong>不需要选择考试</strong>，直接点击“导出”。</p><p>注意导出按钮右边的小箭头，这里有导出数据查看器的入口。</p><p>下面我们来查一个成绩看看（不能返回到这里咯）。</p>',"width":"350px","placement":"top", step:2},
					{"selector":"div.form-actions:first","title":"查成绩去","content":'<p>请<a href="hello-result.html">点击这里继续导览</a>。</p>',"width":"300px","placement":"top", step:3}
				],
				onStep: function(d){
					if(d.idx == 1 && d.direction == 'next'){
						$('#orig-announcement').show();
						$('#alert-hello').hide();
					}
					if(d.idx == 1){
						var hidden = $('#exams-list').is(':hidden');
						$('#xuehao').val(23456).change();
						$('#password').val('******************');
						$('#exams-list label:visible:first input').prop('checked', true);
						if(hidden) bootstro.go_to(1);
					}

					var $btnExport = $('div.form-actions:first .btn-group:last');
					if(d.idx == 2){
						$btnExport.addClass('open');
					}else{
						$btnExport.removeClass('open');
					}
					if(d.idx == 3){
						location.href = 'hello-result.html';
					}
				},
				onExit: function(){
					$('#alert-hello').show();
					$('#back-btn')[0].click();
				}
			});
			$('#xuehao').blur();
		}, function(t, e){
			$('#content').find('span').text('无法加载新手指南 :(');
		}
	);
	jzgc.ce.appendCopyRight($container);
});