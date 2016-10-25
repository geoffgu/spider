var system = require('system');
var url = system.args[1];
var webpage = require('webpage'), page = webpage.create();

phantom.cookiesEnabled = true;
phantom.javascriptEnabled = true;

page.settings = {
  javascriptEnabled: true,
  loadImages: false,
  webSecurityEnabled: false,
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36'
};

page.customHeaders = {
  'Referer': 'http://www.itjuzi.com/'
};

page.onLoadStarted = function () {
  console.log('----------------start-----------------');
};

page.onConsoleMessage = function (msg) {
  console.log(msg);
}

page.onError = function (msg, trace) {
  var msgStack = ['ERROR: ' + msg];
  if (trace && trace.length) {
    msgStack.push('TRACE:');
    trace.forEach(function(t) {
      msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function +'")' : ''));
    });
  }
  console.error(msgStack.join('\n'));
};

page.open(url, function(status) {
  console.log(status);
  if (status === 'success') {
    setTimeout(checkPageDetail, 5000);
  } else {
    page.close();
    phantom.exit();
  }

  function checkPageDetail () {
    if (page.injectJs('./node_modules/jquery/dist/jquery.min.js')) {
      page.evaluate(function() {
        var obj = {};
        obj.name = $('.picinfo > p').eq(0).find('span').text().trim();
        obj.tel = $('.list-block.aboutus > li').eq(1).find('span').text().trim();
        obj.address = $('.list-block.aboutus > li').eq(3).children('span').text().trim();
        console.log('data:' + JSON.stringify(obj));
      });
    } else {
      console.log('cannot load jquery');
      page.close();
      phantom.exit();
    }
  }
});
