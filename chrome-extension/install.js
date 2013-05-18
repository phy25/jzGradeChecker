if(window.chrome){
	var wsurl = 'https://chrome.google.com/webstore/detail/gghlnllohkclgmeefgaenonjjlndceap';
	document.getElementById('non-chrome-notice').style.display = 'none';
	if(chrome.webstore && chrome.webstore.install){
		document.getElementById('install-link-quick').addEventListener('click', function(e){e.preventDefault();});
		document.getElementById('install-link-crws').addEventListener('click', function(e){e.preventDefault();});
		document.getElementById('install-link-quick').addEventListener('click', function(){
			var error = function(t){
				if(confirm("网上应用店安装失败"+(t?("（"+t+"）\n"):"")+"。建议您在官方安装扩展，需要继续吗？")){
					location = 'latest.crx';
					lightbox_init();
				}
			};
			try{
				chrome.webstore.install(wsurl,
					function(){ // for Chrome
						location = '../';
					}, error);
			}catch(e){// for fxxking 360
				error(e.description);
			}
			return false;
		});
		document.getElementById('install-link-crws').addEventListener('click', function(){
			var error = function(t){
				if(t){
					if(confirm('错误：'+t+"\n是否到 Chrome 网上应用店页面安装？")){
						location = wsurl;
					}
				}
			};
			try{
				chrome.webstore.install(wsurl,
					function(){ // for Chrome
						location = '../';
					}, error);
			}catch(e){// for fxxking 360
				error(e.description);
			}
			return false;
		});
		document.getElementById('install-link-direct').addEventListener('click', function(){
			lightbox_init();
		});
		function lightbox_init(){
			document.getElementById('shadowing').style.display = 'block';
			document.getElementById('box').style.display = 'block';
			document.getElementById('shadowing').addEventListener('click', function(){
				document.getElementById('shadowing').style.display = 'none';
				document.getElementById('box').style.display = 'none';
			});
		}
	}
}