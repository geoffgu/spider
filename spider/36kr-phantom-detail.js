var system = require('system');
var url = system.args[1];
var webpage = require('webpage'), page = webpage.create();
var stepIndex = 0;

phantom.cookiesEnabled = true;
phantom.javascriptEnabled = true;

page.settings = {
  javascriptEnabled: true,
  loadImages: false,
  webSecurityEnabled: false,
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36'
};

page.customHeaders = {
  'Referer': 'https://rong.36kr.com/'
};

page.onLoadStarted = function () {
  console.log('----------------start-----------------');
};

page.onConsoleMessage = function (msg) {
  console.log(msg);
}

page.onNavigationRequested = function (url, type, willNavigate, main) {
  console.log('Trying to navigate to: ' + url);
  console.log('Caused by: ' + type);
  console.log('Will actually navigate: ' + willNavigate);
  console.log('Sent from the page\'s main frame: ' + main);
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
    if (url == 'https://passport.36kr.com/pages/?ok_url=http%3A%2F%2F36kr.com%2F#/login?pos=header') {
      setTimeout(loginPage, 8000);
    } else {
      setTimeout(checkPageReady, 8000);
    }
  } else {
    page.close();
    phantom.exit();
  }

  function loginPage () {
    if (page.injectJs('./node_modules/jquery/dist/jquery.min.js')) {
      var steps = [
        function () {
          //Enter username
          page.evaluate(function () {
            $("input[name='username']").trigger( "focus" );
          });
          page.sendEvent('keypress', '18811350342');
        },
        function () {
          //Enter password
          page.evaluate(function () {
            $("input[name='password']").trigger( "focus" );
          });
          page.sendEvent('keypress', '100200');
        },
        function () {
          //Login
          page.evaluate(function() {
            $("form[name='LoginForm'] > button").trigger( "click" );
          });
        },
        function () {
          //Get redirected page cookie
          var cookies = page.cookies;
          for(var i = 0, length = cookies.length; i < length; i++) {
            phantom.addCookie(cookies[i]);
          }
        }
      ];

      var interval = setInterval(function () {
        if (typeof steps[stepIndex] == 'function') {
          console.log('step ' + (stepIndex + 1));
          steps[stepIndex]();
          stepIndex++;
        } else {
          console.log('------steps complete------');
          clearInterval(interval);
          page.evaluate(function () {
            console.log('login success');
          });
          page.close();
          phantom.exit();
        }
      }, 5000);
    } else {
      console.log('cannot load jquery');
      page.close();
      phantom.exit();
    }
  }

  function checkPageReady () {
    if (page.injectJs('./node_modules/jquery/dist/jquery.min.js')) {
      page.evaluate(function() {
        var obj = {};
        obj.avatar = $('.main-wrap .l-sidebar .company-logo img').attr('src');
        obj.time = $('.main-wrap .main .name-info .year').text();
        obj.tags = [];
        for (var i = 0, tagLength = $('.main-wrap .main .tags .i-tag').length; i < tagLength; i++) {
          obj.tags.push($('.main-wrap .main .tags .i-tag').eq(i).text());
        }
        obj.location = $('.main-wrap .main .links .address').text().trim();
        obj.website = $('.main-wrap .main .links .website').text().trim();
        obj.detail = '';
        for (var j = 0, detailLength = $('.intro-list li').length; j < detailLength; j++) {
          obj.detail += '/标题/' + $('.intro-list li').eq(j).find('.i-content .i-title').text();
          obj.detail += '/内容/' + $('.intro-list li').eq(j).find('.i-content p span').html();
        }
        obj.isForeign = 0;
        obj.raiseFunds = [];
        for (var m = 0, raiseLength = $('#mPastFinancing ul li').length; m < raiseLength; m++) {
          var fund = {};
          fund.times = $('#mPastFinancing ul li').eq(m).find('.times').text();
          fund.phace = $('#mPastFinancing ul li').eq(m).find('.phace').text();
          fund.valuation = $('#mPastFinancing ul li').eq(m).find('.content .sp strong span').eq(0).text();
          fund.amount = $('#mPastFinancing ul li').eq(m).find('.content .sp strong span').eq(1).text();
          fund.organizations = [];
          for (var n = 0, orgLength = $('#mPastFinancing ul li').eq(m).find('.c-body .content span').length; n < orgLength; n++) {
            var org = {};
            org.name = $('#mPastFinancing ul li').eq(m).find('.c-body .content span').eq(n).find('a:not(.ng-hide)').text();
            org.link = 'https://rong.36kr.com' + $('#mPastFinancing ul li').eq(m).find('.c-body .content span').eq(n).find('a:not(.ng-hide)').attr('href');
            fund.organizations.push(org);
          }
          obj.raiseFunds.push(fund);
        }
        console.log('data:' + JSON.stringify(obj));
      });
      page.close();
      phantom.exit();
    } else {
      console.log('cannot load jquery');
      page.close();
      phantom.exit();
    }
  }
});
