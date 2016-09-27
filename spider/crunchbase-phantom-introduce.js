var system = require('system');
var url = system.args[1];
var webpage = require('webpage'), page = webpage.create();

phantom.cookiesEnabled = true;
phantom.javascriptEnabled = true;

page.settings = {
  javascriptEnabled: true,
  loadImages: false,
  webSecurityEnabled: false,
  resourceTimeout: 8000,
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36'
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
  if (status === 'success') {
    setTimeout(checkPageDetail, 1000);
  } else {
    page.close();
    phantom.exit();
  }

  function checkPageDetail () {
    if (page.injectJs('./node_modules/jquery/dist/jquery.min.js')) {
      page.evaluate(function () {
        var offset = 720;
        var interval = setInterval(function () {
          retriveData(offset);
          offset += 8;
        }, 2000);

        function retriveData (offset) {
          var companies = [];
          for (var i = offset, len = offset + 8; i < len; i++) {
            var company = {};
            company.avatar = document.querySelectorAll('body > ul > li')[i].querySelector('.container .logo img').getAttribute('src');
            company.name = document.querySelectorAll('body > ul > li')[i].querySelector('.container .aggregate.identity.container > a .name').textContent.trim();
            company.cpyDetailLink = 'https://www.crunchbase.com' + document.querySelectorAll('body > ul > li')[i].querySelector('.container .aggregate.identity.container > a').getAttribute('href');
            company.tags = [];
            for (var j = 1, tagLength = document.querySelectorAll('body > ul > li')[i].querySelectorAll('.container .aggregate.identity.container .content.container > a').length; j < tagLength; j++) {
              company.tags.push(document.querySelectorAll('body > ul > li')[i].querySelectorAll('.container .aggregate.identity.container .content.container > a')[j].textContent.trim());
            }
            company.referer = 'crunchbase';
            companies.push(company);
          }
          console.log('Company:' + JSON.stringify(companies));
        }
      });
    } else {
      console.log('cannot load jquery');
      page.close();
      phantom.exit();
    }
  }
});
