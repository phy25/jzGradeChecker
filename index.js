//chrome.extension.getURL("images/myimage.png")

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
	if(no.indexOf('1') == 0){
		console.log($kaoshi_new);
		$kaoshi_new.filter('label').each(function(){
			if(this.innerText.indexOf('高一') == -1){
				$(this).hide();
			}else{
				$(this).show();
			}
		});
		$kaoshi_new.find('input:first')[0].checked = true;
	}
	if(no.indexOf('2') == 0){
		$kaoshi_new.show().not('label:contains(高二)').hide();
		console.log($kaoshi_new.filter(':visible'));
		$kaoshi_new.filter(':visible').find('input')[0].checked = true;
	}
	if(no.indexOf('3') == 0){
		$kaoshi_new.show().not('label:contains(高三), label:contains(高考)').hide();
		$kaoshi_new.filter('label:contains(高三):first').find('input')[0].checked = true;
	}
	$('#exam-control .controls').empty().append($kaoshi_new);
});