var jzgc = {};

$(function(){
	var $container = $('<div id="container" class="container"><h1>金中成绩查询</h1><div id="content"><div id="alert-hello" class="alert"><a id="back-btn" class="btn">跳过介绍</a> <span>以后，在页面最下方“新手指南”可以回到本页面。</span></div></div></div>').appendTo($('<body />').replaceAll('body')),
		href = jzgc.config.urls.examList+'?noticeRead=1';

	$container.find('#back-btn').attr('href', href);

	var r = {"meta":{"原学号":"23456","新学号":"","姓名":"金中人","考试场次":"高二上期初","学号说明":"第1位－年级，第2-3位-班号，第4-5位-班内号"},"gradeData":{"subjects":["语文","数学","英语","语数英","综合","总分","物理","化学","生物"],"series":[{"name":"成绩","data":[110,110,120,340,255,80,90,85,595]},{"name":"平均分","data":[106.4,92.07,106.33,304.77,220.34,74.63,68.25,77.47,525.13]},{"name":"序","data":[412,367,168,286,245,252,409,276,100]},{"name":"前序","data":[500,300,200,300,249,300,30,350,380]}]},"fake":true};
	jzgc.result.renderPage(r, $('#content'));

	$('#alert-hello').hide();
	$('#color-select-menu').addClass('text-right');
	var chartAnimation = function(){
		var s = $('#chart').highcharts().series[0];
		cAto = setTimeout(function(){
			s.hide();
			setTimeout(function(){
				s.show();
			}, 600);
		},2000);
	}, cAto;
	bootstro.set_bootstrap_version(2);
	bootstro.start('.bootstro', {
		stopOnBackdropClick: false,
		finishButton: '',
		items: [
			{"selector":"#chart","title":"查到啦","content":'<p>这个图表显示的是各科排名情况。下面的“图例”部分是可点击的，可以关闭某一项的显示。</p>',"width":"350px","placement":"bottom",step:0},
			{"selector":"#color-select-btn","title":"成绩着色","content":'<p>排名升降，也可以用颜色表示。最近股市比较火，我们会用股市的颜色看看如何（你也可以现在选择成另一种配色）。</p>',"width":"240px","placement":"left",step:1},
			{"selector":"#gradeTable","title":"成绩详情","content":'<p>颜色很直观吧？这个是根据排名情况显示的。</p><p>如果程序能够成功判断的话，还会自动提取显示本次考试的平均分。</p><p>有时学校写了两个一样的“高二上期中”，那我就无能为力了。你可以滚动页面到下方，查看所有平均分数据。</p>',"width":"400px","placement":"top",step:2},
			{"selector":"#breadcrumb","title":"谢谢观看导览！","content":'<p>看起来很简单嘛！忘了告诉你这一页的成绩都是我编的 = =</p><p>这个扩展还有很多彩蛋呢，比如学校网站坏掉、你长大一岁的时候，都会出现。</p><p>你还可以试试导出功能，这里就不展示了，导出数据查看器可以显示分数走势图什么的我会说？</p><p>点击继续，开始高大上地查成绩吧。</p>',"width":"400px","placement":"bottom",step:3},
			{"selector":"h1:first","title":"结束导览","content":'<p>请<a href="'+href+'">点击这里结束导览</a>。</p>',"width":"300px","placement":"bottom", step:4}
		],
		onStep: function(d){
			if(d.idx == 0){
				chartAnimation();
			}else{
				clearTimeout(cAto);
			}

			var $btnColor = $('#color-select-btn').parent();
			if(d.idx == 1){
				$btnColor.addClass('open');
			}else{
				$btnColor.removeClass('open');
			}
			if(d.idx == 2){
				var text = $('#color-select-btn span').text(), selected = (text == '现代' ? text : '股市');
				$('#color-select-menu a:first').click();
				setTimeout(function(){
					$('#color-select-menu a:contains('+selected+')').click();
				}, 800);
			}
			if(d.idx == 4){
				bootstro.stop();
			}
		},
		onExit: function(){
			jzgc.user.clear();
			$('#alert-hello').show();
			$('#back-btn')[0].click();
			location.href = href;
		}
	});
	chartAnimation();

	jzgc.ce.appendCopyRight($container);
});