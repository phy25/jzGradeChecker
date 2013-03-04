//chrome.extension.getURL("images/myimage.png")

function parseQuery(a){
	var queryString = {};
	a.replace(
		new RegExp("([^?=&]+)(=([^&]*))?", "g"),
		function($0, $1, $2, $3) { queryString[$1] = $3; }
	);
	return queryString;
}

// Pop state support
window.onpopstate = function(e) {
	if(window.sessionStorage){
		var q = parseQuery(e.state);
		var $radio = $('#exam-control').find('input[value='+q['kaoshi']+']').attr('checked', true);
		console.log(q);
		if(sessionStorage['no_result'] == 'true'){
			sessionStorage['no_result'] = 'false';
			$radio.parent().append('<span class="help-inline">无成绩数据</span>');
			$('#exam-control').addClass('error').one('change', 'input', function(){
				$('#exam-control').removeClass('error');
			});
		}
	}
};

$(function(){
	var exam_list = {};
	var $kaoshi = $('#kaoshi'), $kaoshi_new;
	$kaoshi.find('option').each(function(){
		exam_list[$(this).attr('value')] = $(this).text().replace(/(\s)/g,'');
	});


	for(var i in exam_list){
		var $eln = $('<label class="radio"><input type="radio" name="kaoshi" value="'+i+'"> '+exam_list[i]+'</label>');
		if($kaoshi_new){
			$kaoshi_new.after($eln);
		}else{
			$kaoshi_new = $eln;
		}
	}

	var $f = $('form:first'),
		update_status_t = $f.find('b').text().replace(/(\s)/g,''),
		orig_announcement_t = $f.next().text()
			.replace(/(\s)(\s)+/g,'$1')
			.replace(/．/g, '。')
			.replace(/,/g, '，')
			.replace(/;/g, '；')
			.replace(/\*/g, '* ')
			.replace(/\(/g, '（')
			.replace(/\)/g, '）');

	// Fetching ended, now start structure fill

	var $fa = $('<div class="control-group"><label class="control-label" for="xuehao">学号</label><div class="controls"><input type="number" id="xuehao" name="xuehao" placeholder="五位数班学号" required="required" min="10101" max="32100" /></div></div>');
	$fa.after('<div class="control-group"><label class="control-label" for="inputPassword">密码</label><div class="controls"><input type="text" id="password" name="password" placeholder="身份证号码等" required="required" /></div></div>');
	$fa.after('<div class="control-group" id="exam-control"><label class="control-label" for="kaoshi">考试</label><div class="controls"><span class="help-block">请先输入学号</span></div></div>');
	$fa.after('<div class="control-group"><div class="controls"><input type="submit" class="btn btn-primary" value="查询" /></div></div>');

	$f.addClass('form-horizontal').html('').append($fa);

	var $container = $('<div class="container-fluid" />').appendTo($('<body />').replaceAll('body'));

	var $append = $('<h1>金中成绩查询</h1>')
		.after($f)
		.after('<h2>教务处通知</h2><div id="orig-announcement"></div>');

	$container.append($append);

	// Structure fill ended, now content fill

	$('#orig-announcement').append('<div class="alert alert-info">'+update_status_t+'</div><p>'+orig_announcement_t.replace(/(\n|\r)/g,'</p><p>')+'</p>');

	// 全角转半角函数来自 http://www.jslab.org.cn
	function dbc2sbc(t){
		return t.replace(/[\uff01-\uff5e]/g, function(a){return String.fromCharCode(a.charCodeAt(0)-65248);}).replace(/\u3000/g," ");
	}

	$('#password').change(function(){
		$(this).val(function(i, v){return $.trim(String(dbc2sbc(v)).replace('X', 'x'))});
	});

	$('#xuehao').change(function(){
		var no = $(this).val();
		$kaoshi_new.detach();
		var vf = false;
		if(no.indexOf('1') == 0){
			$kaoshi_new.each(function(){
				var $this = $(this);
				if(this.innerText.indexOf('高一') == -1){
					$this.addClass('hide');
				}else{
					$this.removeClass('hide');
					if(!vf) vf = $this.find('input')[0];
				}
			});
			if(vf) vf.checked = true;
		}
		if(no.indexOf('2') == 0){
			$kaoshi_new.each(function(){
				var $this = $(this);
				if(this.innerText.indexOf('高二') == -1){
					$this.addClass('hide');
				}else{
					$this.removeClass('hide');
					if(!vf) vf = $this.find('input')[0];
				}
			});
			if(vf) vf.checked = true;
		}
		if(no.indexOf('3') == 0){
			$kaoshi_new.each(function(){
				var $this = $(this);
				if(this.innerText.indexOf('高三') == -1 && this.innerText.indexOf('高考') == -1){
					$(this).addClass('hide');
				}else{
					$(this).removeClass('hide');
					if(!vf) vf = $this.find('input')[0];
				}
			});
			//var $vf = $kaoshi_new.not('.hide').find('input')[0];
			if(vf) vf.checked = true;
		}
		$('#exam-control .controls').empty().append($kaoshi_new);
	});

	// Ajax and info saving
	$f.submit(function(){
		$('body').fadeTo(50, 0.25);
		if(localStorage){
			localStorage['stu_arr_0'] = $('#xuehao').val()+';'+$('#password').val();
		}
		window.history.replaceState($f.serialize(), document.title, location.href);
	});

	// Info read
	if(localStorage){
		var stu_arr = [(localStorage['stu_arr_0'] || '').split(';')];
		$('#xuehao').val(stu_arr[0][0]).change();
		$('#password').val(stu_arr[0][1]);
	}
});