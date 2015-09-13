// Import the page-mod API
var pageMod = require("sdk/page-mod");
var self = require("sdk/self");

// Create page-mods
pageMod.PageMod({
  include: [
  	/http:\/\/jszx\.stedu\.net\/jszxcj\/.*\.htm/,
  	/http:\/\/(www\.)?stjszx\.net\/jszxcj\/.*\.htm/
  ],
  contentScriptFile: [self.data.url("jquery-1.8.3.min.js"), self.data.url("func-common.js"), self.data.url("bootstrap/js/bootstrap.min.js"), self.data.url("func-ce.js"), self.data.url("func-index.js"), self.data.url("ce-index.js"), self.data.url("func-ajax.js"), self.data.url("func-result.js"), self.data.url("func-export.js")],
  contentScriptWhen: "start",
  contentStyleFile: [self.data.url("bootstrap/css/bootstrap.min.css"), self.data.url("style.css"), self.data.url("ce.css")]
});
//http://jszx.stedu.net/jszxcj/search.htm

pageMod.PageMod({
  include: [
  	"http://jszx.stedu.net/jszxcj/*.asp*",
    "http://www.stjszx.net/jszxcj/*.asp*",
    "http://stjszx.net/jszxcj/*.asp*"
  ],
  contentScriptFile: [self.data.url("jquery-1.8.3.min.js"), self.data.url("highcharts.js"), self.data.url("func-common.js"), self.data.url("bootstrap/js/bootstrap.min.js"), self.data.url("func-ce.js"), self.data.url("func-result.js"), self.data.url("ce-result.js")],
  contentScriptWhen: "start",
  contentStyleFile: [self.data.url("bootstrap/css/bootstrap.min.css"), self.data.url("style.css"), self.data.url("ce.css")]
});