//chrome.extension.getURL("images/myimage.png")
//console.log('Hello World!', jQuery);

var exam_list = [];
var $kaoshi = $('#kaoshi');
$kaoshi.find('option').each(function(){
	exam_list[$(this).attr('value')] = $(this).text();
});
//for(var i in a){console.log(i)}
console.log(exam_list);

var $f = $('form:first').addClass('form-horizontal').html('');

var $fa = $('<div class="control-group"><label class="control-label" for="xuehao">学号</label><div class="controls"><input type="number" id="xuehao" name="xuehao" placeholder="学号" required="required" min="10101" max="32100" /></div></div>');
$fa.after('<div class="control-group"><label class="control-label" for="inputPassword">密码</label><div class="controls"><input type="text" id="password" name="password" placeholder="密码" required="required" pattern="^(\\d{15}$|^\\d{18}$|^\\d{17}(\\d|X|x))$" /></div></div>');
$fa.after('<div class="control-group" id="exam-control"><label class="control-label" for="kaoshi">考试</label><div class="controls"></div></div>');
$fa.after('<div class="control-group"><div class="controls"><input type="submit" class="btn" value="查询" /></div></div>');

$f.append($fa);

$('#exam-control .controls').append($kaoshi);

/*
  
  
  
*/