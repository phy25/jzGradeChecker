// Import the page-mod API
var pageMod = require("sdk/page-mod");
var self = require("sdk/self");
var tabs = require("sdk/tabs");

var workerFunc = function(worker){
	worker.port.on("pushUrlChange", function(message) {
		worker.tab.url = self.data.url(message);
	});
};

// Create page-mods
pageMod.PageMod({
  include: [
  	/^http:\/\/jszx\.stedu\.net\/jszxcj\/.*\.htm(\#.*)?/,
  	/^http:\/\/(www\.)?stjszx\.net\/jszxcj\/.*\.htm(\#.*)?/
  ],
  contentScriptFile: [self.data.url("jquery-2.1.4.min.js"), self.data.url("func-common.js"), self.data.url("bootstrap/js/bootstrap.min.js"), self.data.url("func-ce.js"), self.data.url("func-index.js"), self.data.url("func-ajax.js"), self.data.url("ce-index.js"), self.data.url("func-result.js"), self.data.url("func-export.js")],
  contentScriptWhen: "ready",
  contentScriptOptions: {"localUrl": self.data.url()},
  onAttach: workerFunc,
  contentStyleFile: [self.data.url("bootstrap/css/bootstrap.min.css"), self.data.url("style.css"), self.data.url("ce.css")],
  contentStyle: '[class^="icon-"], [class*=" icon-"] {background-image: url("'+self.data.url('bootstrap/img/glyphicons-halflings.png')+'") !important;}.icon-white,.nav-pills > .active > a > [class^="icon-"],.nav-pills > .active > a > [class*=" icon-"],.nav-list > .active > a > [class^="icon-"],.nav-list > .active > a > [class*=" icon-"],.navbar-inverse .nav > .active > a > [class^="icon-"],.navbar-inverse .nav > .active > a > [class*=" icon-"],.dropdown-menu > li > a:hover > [class^="icon-"],.dropdown-menu > li > a:focus > [class^="icon-"],.dropdown-menu > li > a:hover > [class*=" icon-"],.dropdown-menu > li > a:focus > [class*=" icon-"],.dropdown-menu > .active > a > [class^="icon-"],.dropdown-menu > .active > a > [class*=" icon-"],.dropdown-submenu:hover > a > [class^="icon-"],.dropdown-submenu:focus > a > [class^="icon-"],.dropdown-submenu:hover > a > [class*=" icon-"],.dropdown-submenu:focus > a > [class*=" icon-"] {  background-image: url("'+self.data.url('bootstrap/img/glyphicons-halflings-white.png')+'") !important;}'
});

pageMod.PageMod({
  include: [
  	/^http:\/\/jszx\.stedu\.net\/jszxcj\/.*\.asp/,
  	/^http:\/\/(www\.)?stjszx\.net\/jszxcj\/.*\.asp/
  ],
  contentScriptFile: [self.data.url("jquery-2.1.4.min.js"), self.data.url("highcharts.js"), self.data.url("func-common.js"), self.data.url("bootstrap/js/bootstrap.min.js"), self.data.url("func-ce.js"), self.data.url("func-result.js"), self.data.url("ce-result.js")],
  contentScriptWhen: "ready",
  contentScriptOptions: {"localUrl": self.data.url()},
  onAttach: workerFunc,
  contentStyleFile: [self.data.url("bootstrap/css/bootstrap.min.css"), self.data.url("style.css"), self.data.url("ce.css")],
  contentStyle: '[class^="icon-"], [class*=" icon-"] {background-image: url("'+self.data.url('bootstrap/img/glyphicons-halflings.png')+'") !important;}.icon-white,.nav-pills > .active > a > [class^="icon-"],.nav-pills > .active > a > [class*=" icon-"],.nav-list > .active > a > [class^="icon-"],.nav-list > .active > a > [class*=" icon-"],.navbar-inverse .nav > .active > a > [class^="icon-"],.navbar-inverse .nav > .active > a > [class*=" icon-"],.dropdown-menu > li > a:hover > [class^="icon-"],.dropdown-menu > li > a:focus > [class^="icon-"],.dropdown-menu > li > a:hover > [class*=" icon-"],.dropdown-menu > li > a:focus > [class*=" icon-"],.dropdown-menu > .active > a > [class^="icon-"],.dropdown-menu > .active > a > [class*=" icon-"],.dropdown-submenu:hover > a > [class^="icon-"],.dropdown-submenu:focus > a > [class^="icon-"],.dropdown-submenu:hover > a > [class*=" icon-"],.dropdown-submenu:focus > a > [class*=" icon-"] {  background-image: url("'+self.data.url('bootstrap/img/glyphicons-halflings-white.png')+'") !important;}'
});

pageMod.PageMod({
  include: "resource://jzgradechecker/data/hello.html",
  contentScriptFile: [self.data.url("jquery-2.1.4.min.js"), self.data.url("bootstrap/js/bootstrap.min.js"), self.data.url("bootstro.min.js"), self.data.url("hello.js"), self.data.url("func-common.js"), self.data.url("func-ce.js"), self.data.url("func-ajax.js"), self.data.url("func-index.js")],
  contentScriptWhen: "ready",
  contentScriptOptions: {"localUrl": self.data.url()},
  contentStyle: '[class^="icon-"], [class*=" icon-"] {background-image: url("'+self.data.url('bootstrap/img/glyphicons-halflings.png')+'") !important;}.icon-white,.nav-pills > .active > a > [class^="icon-"],.nav-pills > .active > a > [class*=" icon-"],.nav-list > .active > a > [class^="icon-"],.nav-list > .active > a > [class*=" icon-"],.navbar-inverse .nav > .active > a > [class^="icon-"],.navbar-inverse .nav > .active > a > [class*=" icon-"],.dropdown-menu > li > a:hover > [class^="icon-"],.dropdown-menu > li > a:focus > [class^="icon-"],.dropdown-menu > li > a:hover > [class*=" icon-"],.dropdown-menu > li > a:focus > [class*=" icon-"],.dropdown-menu > .active > a > [class^="icon-"],.dropdown-menu > .active > a > [class*=" icon-"],.dropdown-submenu:hover > a > [class^="icon-"],.dropdown-submenu:focus > a > [class^="icon-"],.dropdown-submenu:hover > a > [class*=" icon-"],.dropdown-submenu:focus > a > [class*=" icon-"] {  background-image: url("'+self.data.url('bootstrap/img/glyphicons-halflings-white.png')+'") !important;}',
  onAttach: workerFunc
});
tabs.activeTab.url = "http://jszx.stedu.net/jszxcj/search.htm#noticeRead=1";