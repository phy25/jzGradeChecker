//chrome.extension.getURL("images/myimage.png")
//console.log('Hello World!', jQuery);

var exam_list = {};
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

$("#xuehao").change(function(){
	var no = $(this).val();
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
});


$('div.Section1>div>table>tbody>:first-child>td>:first-child>table>tbody>:nth-child(5)').append('<td rowspan="1" style="padding:0cm 0cm 0cm 0cm" background="images/search_r4_c4.jpg"><p class="MsoNormal" style="line-height:150%;word-break:break-all"><span style="font-size:9.0pt;line-height:150%"><span lang="EN-US"><o:p></o:p></span></span></p></td>');
//

/*
  
  
  
*/