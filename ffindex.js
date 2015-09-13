// Import the page-mod API
var pageMod = require("sdk/page-mod");
 
// Create page-mods
pageMod.PageMod({
  include: [
  	"http://jszx.stedu.net/jszxcj/*.htm*",
    "http://www.stjszx.net/jszxcj/*.htm*",
    "http://stjszx.net/jszxcj/*.htm*"
  ],
  contentScriptFile: [data.url("jquery-1.8.3.min.js"), data.url("func-common.js"), data.url("bootstrap/js/bootstrap.min.js"), data.url("func-ce.js"), data.url("func-index.js"), data.url("ce-index.js"), data.url("func-ajax.js"), data.url("func-result.js"), data.url("func-export.js")],
  contentScriptWhen: "start",
  contentStyleFile: [data.url("bootstrap/css/bootstrap.min.css"), data.url("style.css"), data.url("ce.css")]
});

pageMod.PageMod({
  include: [
  	"http://jszx.stedu.net/jszxcj/*.asp*",
    "http://www.stjszx.net/jszxcj/*.asp*",
    "http://stjszx.net/jszxcj/*.asp*"
  ],
  contentScriptFile: [data.url("jquery-1.8.3.min.js"), data.url("highcharts.js"), data.url("func-common.js"), data.url("bootstrap/js/bootstrap.min.js"), data.url("func-ce.js"), data.url("func-result.js"), data.url("ce-result.js")],
  contentScriptWhen: "start",
  contentStyleFile: [data.url("bootstrap/css/bootstrap.min.css"), data.url("style.css"), data.url("ce.css")]
});