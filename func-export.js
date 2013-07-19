/*
Common functions for Chrome extension
*/

jzgc.export = {
	showUI: function(){
		if(!jzgc.config.examList){
			if(jzgc.ajax){
				jzgc.ajax.getExamList(
					function(d){
						jzgc.config.examList = d.examList;
						continueList();
					},
					function(t, d){
						alert('无法获取考试列表（'+t+'）。');
						if(console) console.error(t, d);
					}
				);
			}else{
				alert('无法获取考试列表。');
			}
		}else{
			continueList();
		}
		function continueList(){
			if(!jzgc.result){
				alert('缺少必要的组件，无法继续。');
				return false;
			}

			$('#content').hide().after('<div id="content-export" />');
			var $export = $('<div id="content-export" />'), user = jzgc.user.get(0);

			$('<ul id="breadcrumb" class="breadcrumb"><li><a href="search.htm">主页</a> <span class="divider">&rsaquo;</span></li></ul>').appendTo($export);

			$('#breadcrumb', $export).append('<li title="学号"><i class="icon-user" /> '+ user[0] +'</li> <li id="bc_name"><span class="divider">&rsaquo;</span></li> <li class="active">导出成绩数据</li>');
			$('<div id="export-progress" class="progress progress-striped active"><div id="export-progress-bar" class="bar"></div></div>').appendTo($export);
			$('<pre id="export-log" class="pre-scrollable"></pre>').appendTo($export);
			$('<a id="export-stopnow" href="javascript:void(0)" role="button" title="在当前考试下载完成后，立即停止继续下载" class="btn btn-danger">到此为止吧</a>').click(function(){
				window.jzgcStopNow = true;
				$(this).addClass('disabled').text('就到此为止');
			}).appendTo($export);

			$('#content').after($export);

			jzgc.export.run(user);
		};
	},
	run: function(user){
		var $log = $('#export-log').css('height', '15em').append('<p>正在开始导出... 为了避免给学校服务器造成太大的压力，请耐心等待导出。</p>'), ret = {xuehao: user[0], created: +new Date(), exams:[]}, dataFirst, list = [], pointer = 0, timeout = 2000;
		function log(t, type){
			$('<p />').text(t).addClass(type ? ('text-' + type) : '').prependTo($log);
		}
		for(id in jzgc.config.examList){
			list.push([id, jzgc.config.examList[id]]);
		}

		function getID(){
			// log('即将下载 '+ list[pointer][1] + ' (' + list[pointer][0] + ')');
			jzgc.ajax.getExamResult(
				{xuehao: user[0], password: user[1], kaoshi: list[pointer][0]},
				function(data){
					if(!dataFirst){
						dataFirst = jQuery.extend(true, {}, data);
						$('#bc_name').attr('title', '姓名').prepend(data.meta['姓名']);
					}
					data.notes = undefined;
					data.averageHTML = undefined;
					data.id = list[pointer][0];
					data.examName = list[pointer][1];
					ret.exams.push(data);

					log('已保存 ' + list[pointer][1] + ' (' + list[pointer][0] + ') ');
					pointer++;
					$('#export-progress-bar').css('width', pointer / list.length * 100 +'%');
					if(pointer == list.length || window.jzgcStopNow){
						complete();
					}else{
						setTimeout(getID, timeout);
					}
				},
				function(t, d){
					log('保存 ' + list[pointer][1] + ' (' + list[pointer][0] + ') 时错误：' + t 
						+ (t=='certError' ? '（如果偶尔出现，是因为没有考过这场试，而其他届考过，不必在意）':''), 'error');
					if(console) console.error(list[pointer][0], t, d);

					pointer++;
					$('#export-progress-bar').css('width', pointer / list.length * 100 +'%');
					if(pointer == list.length || window.jzgcStopNow){
						complete();
					}else{
						setTimeout(getID, timeout);
					}
				}
			);
		}
		function complete(){
			$('#export-stopnow').remove();
			ret.notes = dataFirst.notes;
			ret.averageHTML = dataFirst.averageHTML;
			log('已完成导出', 'success');
			$('#export-progress').removeClass('active progress-striped').find('div:first').addClass('bar-success');
			$('#content-export').append('<h2>结果在这里，拷贝走吧</h2><p><span class="label label-info">怎么用？</span> 反正数据都在里头了，先存着就是了。以后我们会开发读取这种格式的工具，敬情留意。</p><textarea id="result" class="input-xxlarge" rows="6"></textarea>');
			$('#result').text(JSON.stringify(ret))[0].select();
		}
		getID();
	}
};