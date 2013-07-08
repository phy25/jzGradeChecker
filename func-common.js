/*
Common functions
*/
// Init object
if(!jzgc) var jzgc = {};

jzgc.config = {
	version: ['chrome-extension', '0.5.1', 'http://github.phy25.com/jzGradeChecker/'],
	// A sequential exam list **TODO**
	examListOrganized: []
};

$('body').off('.data-api');