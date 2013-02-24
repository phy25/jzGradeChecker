//chrome.extension.getURL("images/myimage.png")
//console.log('Hello World!', jQuery);

var exam_list = {};
var $kaoshi = $('#kaoshi');
$kaoshi.find('option').each(function(){
	exam_list[$(this).attr('value')] = $(this).text().replace(/(\s)/g,'');
});
//for(var i in a){console.log(i)}
//<label class="radio"><input type="radio" name="optionsRadios" id="optionsRadios1" value="option1" checked>Option one is this and that—be sure to include why it's great</label>


var $f = $('form:first'), update_status_t = $f.find('b').text().replace(/(\s)/g,''), orig_announcement_t = $f.next().text().replace(/(\s)(\s)+/g,'$1');

// Fetching ended, now start structure fill

var $fa = $('<div class="control-group"><label class="control-label" for="xuehao">学号</label><div class="controls"><input type="number" id="xuehao" name="xuehao" placeholder="学号" required="required" min="10101" max="32100" /></div></div>');
$fa.after('<div class="control-group"><label class="control-label" for="inputPassword">密码</label><div class="controls"><input type="text" id="password" name="password" placeholder="密码" required="required" pattern="^(\\d{15}$|^\\d{18}$|^\\d{17}(\\d|X|x))$" /></div></div>');
$fa.after('<div class="control-group" id="exam-control"><label class="control-label" for="kaoshi">考试</label><div class="controls"><span class="help-inline">请先输入学号</span></div></div>');
$fa.after('<div class="control-group"><div class="controls"><input type="submit" class="btn btn-primary" value="查询" /></div></div>');

$f.addClass('form-horizontal').html('').append($fa);

var $container = $('<div class="container-fluid" />').appendTo($('<body />').replaceAll('body'));

var $append = $('<h1>金中成绩查询</h1>')
	.after($f)
	.after('<h2>教务处通知</h2><div id="orig-announcement"></div>');

$container.append($append);

// Structure fill ended, now content fill

$('#orig-announcement').append('<div class="alert alert-info">'+update_status_t+'</div><p>'+orig_announcement_t.replace(/(\n|\r)/g,'</p><p>')+'</p>');

$("#xuehao").change(function(){
	var no = $(this).val();
	$kaoshi.detach();
	if(no.indexOf('1') == 0){
		$kaoshi.find('option').each(function(){
			if(this.innerText.indexOf('高一') == -1){
				$(this).hide();
			}else{
				$(this).show();
			}
		});
		$kaoshi.children()[0].selected = true;
	}
	if(no.indexOf('2') == 0){
		$kaoshi.find('option').each(function(){
			if(this.innerText.indexOf('高三') != -1 || this.innerText.indexOf('高考') != -1){
				$(this).hide();
			}else{
				$(this).show();
			}
		});
		$kaoshi.find('option:contains(高二):first')[0].selected = true;
	}
	if(no.indexOf('3') == 0){
		$kaoshi.children().show();
		$kaoshi.find('option:contains(高三):first')[0].selected = true;
	}
	$('#exam-control .controls').empty().append($kaoshi);
});