/*
Export page handler for chrome extension
*/
$(function(){
	if(jzgc.config && jzgc.config.examList){

	}else{
		jzgc.ajax.getExamList(
			function(r){
				jzgc.config.examList = r.examList;
				var cats = jzgc.ajax.categorizeExamList(r.examList), name = {'grade10':'高一', 'grade11':'高二', 'grade12':'高三', 'other':'其它'};

				for(label in cats){
					$('#exam-selector .nav-tabs').append('<li><a href="#'+label+'"><input type="checkbox" title="全不选" checked /> '+name[label]+' <span class="badge">'+cats[label].length+'</span></a></li>');
					var $c = $('<div class="tab-pane row-fluid" id="'+label+'"></div>');
					for(exam in cats[label]){
						$('<label class="radio span5"><input name="kaoshi" tabindex="30" type="checkbox" value="'+cats[label][exam].id+'" checked="checked"> '+cats[label][exam].name+' <span class="text-info"></span></label>').appendTo($c);
					}
					$c.appendTo('#exam-selector .tab-content');
				}
				$('#exam-selector .nav-tabs a:first').click();
				// console.log(cats);
			}, function(t, e){
				alert('无法加载考试列表，故无法继续导出。');
			}
		);
	}
	$('#exam-selector ul.nav').on('click', 'a', function(e){
		if(!$(e.target).is('input')) e.preventDefault();
		$(this).tab('show');
	});

	// Hack
	//$('#grade11_checkbox').prop('indeterminate', true);
});