/*
Export page handler for chrome extension
*/
$(function(){
	if(jzgc.config && jzgc.config.examList){

	}else{
		jzgc.ajax.getExamList(
			function(r){
				jzgc.config.examList = r.examList;
			}, function(t, e){
				alert('无法加载考试列表，故无法继续导出。');
			}
		);
	}
	$('#exam-selector ul.nav a').click(function(e){
		if(!$(e.target).is('input')) e.preventDefault();
		$(this).tab('show');
	});

	// Hack
	$('#grade11_checkbox').prop('indeterminate', true);
});