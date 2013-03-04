// No result
if(document.body.innerText.indexOf('对不起') != -1){
	if(window.sessionStorage){
		sessionStorage['no_result'] = 'true';
		//window.history.pushState({'no_result':true}, document.title, location.href);
		window.history.back();
	}
}