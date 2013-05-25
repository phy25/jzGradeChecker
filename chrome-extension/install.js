function $id(id){
	return document.getElementById(id) || {};
}

if(window.chrome){
	var wsurl = 'https://chrome.google.com/webstore/detail/gghlnllohkclgmeefgaenonjjlndceap';
	$id('non-chrome-notice').style.display = 'none';
	if(chrome.webstore && chrome.webstore.install){
		// $id('install-link-quick').addEventListener('click', function(e){e.preventDefault();});
		// $id('install-link-crws').addEventListener('click', function(e){e.preventDefault();});
		$id('install-link-quick').addEventListener('click', function(e){
			e.preventDefault();
			var error = function(t){
				if(t == 'User cancelled install') return false;
				_gaq.push(['_trackEvent', 'jzGradeChecker', 'WebstoreFailure', t]);
				if(confirm("要在扩展官方下载扩展（推荐操作）吗？"+(t?("\n（在网上应用店安装失败："+t+"）"):""))){
					location = 'latest.crx';
					lightbox_init();
				}
			};
			try{
				chrome.webstore.install(wsurl,
					function(){ // for Chrome
						trackLinkEvent('../', 'jzGradeChecker', 'WebstoreSuccess');
					}, error);
			}catch(e){// for fxxking 360
				error(e.description);
			}
			return false;
		});
		$id('install-link-crws').addEventListener('click', function(e){
			e.preventDefault();
			var error = function(t){
				if(t == 'User cancelled install') return false;
				_gaq.push(['_trackEvent', 'jzGradeChecker', 'WebstoreFailure', t]);
				if(confirm('错误：'+t+"\n要到 Chrome 网上应用店页面安装吗？")){
					location = wsurl;
				}
			};
			try{
				chrome.webstore.install(wsurl,
					function(){ // for Chrome
						trackLinkEvent('../', 'jzGradeChecker', 'WebstoreSuccess');
					}, error);
			}catch(e){// for fxxking 360
				error(e.description);
			}
			return false;
		});
		$id('install-link-direct').addEventListener('click', function(){
			lightbox_init();
		});
		function lightbox_init(){
			_gaq.push(['_trackEvent', 'jzGradeChecker', 'Download', 'direct']);
			$id('shadowing').style.display = 'block';
			$id('box').style.display = 'block';
			$id('shadowing').addEventListener('click', function(){
				$id('shadowing').style.display = 'none';
				$id('box').style.display = 'none';
			});
		}
		function trackLinkEvent(loc, cat, act, attr, val){
			_gaq.push(['_trackEvent', cat, act, attr, val]);
			document.body.style.opacity = '0.5';
			setTimeout(function() {
				document.location.href = loc;
			}, 1000);
		}
		$id('install-direct-done').addEventListener('click', function(){
			trackLinkEvent(this.href, 'jzGradeChecker', 'UIDownloadLightboxContinue');
			return false;
		});
	}
}