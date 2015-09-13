/*
Export page handler for chrome extension
*/
$(function(){
	$('#exam-selector ul.nav a').click(function(e){
		if(!$(e.target).is('input')) e.preventDefault();
		$(this).tab('show');
	});

	// Hack
	$('#grade11_checkbox').prop('indeterminate', true);
});