var system = require('system');
var url = system.args[1];
var webpage = require('webpage'), page = webpage.create();
// page.viewportSize = { width: 1024, height: 800 };
// page.clipRect = { top: 0, left: 0, width: 1024, height: 800 };
page.settings = {
  javascriptEnabled: true,
  loadImages: false,
  webSecurityEnabled: false,
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36'
};

page.customHeaders = {
  'Referer': 'https://rong.36kr.com/',
  'Cookie': 'gr_user_id=4b9ecb8a-fec8-457f-a36c-d9976686d2f1; kr_stat_uuid=vPEtG24444585; _ga=GA1.2.1720017031.1466675152; Hm_lvt_e8ec47088ed7458ec32cde3617b23ee3=1466675152; aliyungf_tc=AQAAANbzP1hnHw8A8hBuJF6jOe/zPjmt; c_name=point; Hm_lvt_713123c60a0e86982326bae1a51083e1=1471340450,1471510428; Hm_lpvt_713123c60a0e86982326bae1a51083e1=1471510428; Hm_lvt_e8ec47088ed7458ec32cde3617b23ee3=; Hm_lpvt_e8ec47088ed7458ec32cde3617b23ee3=1471605358; gr_session_id_76d36bd044527820a1787b198651e2f1=a96469da-f333-4fe0-865c-acd0abaffb8a; Z-XSRF-TOKEN=eyJpdiI6IlhDUU1FUXlQcTM5VTB2eGxhbFwvYzBRPT0iLCJ2YWx1ZSI6Im4xVmVSTFMxaDhUU0lQME5xQmRVaUhibHAwM1hmc3g1VGZsSW1NZ0tyVTlPK1RGcU9ERG9UeW4zQ1l2Q05FaSt1QWZTdzR0VW1oR0dKMnI5eGhrZXZ3PT0iLCJtYWMiOiIzOGYzZDU5ODgyNjk3MzM3ZTlmNDMwNzZhNzRkMDExNzdlN2JjMzYwODkzZjI2YTNmZTY4NzY2ZGMwZDZiMjMzIn0%3D; krchoasss=eyJpdiI6IkdyMFJXYjQyQkJJbTc0b1oyaEU4MGc9PSIsInZhbHVlIjoiNkJyRUI1RW5QazN4VzFWayt1YklkeFhDT1wvYVZTcmF0UnRvVWNEQ3puOUNzNGtVU3hWelRVMGk1NVNLb29UcDFKNWJoVjg4aTV4c1lQdmFsSnBSS1pBPT0iLCJtYWMiOiJiNTQ5NTRjN2QyZjgyZDkyODNmY2I1MDEwMDgyYzFmYzQxNmYwYWZmMDVjM2JjMWMyYjMzZmZmZTFjNTdhNzY0In0%3D'
};

page.onLoadStarted = function () {
  console.log('----------------start-----------------');
};

page.open(url, function(status) {
  if (status === 'success') {
    setTimeout(checkPageReady, 8000);
  } else {
    page.close();
    phantom.exit();
  }

  function checkPageReady() {
    if (page.injectJs('./node_modules/jquery/dist/jquery.min.js')) {
      page.evaluate(function() {
        var array = { 'data': [] };
        for (var i = 0, length = $('.company-list-body .table-row.ng-scope').length; i < length; i++) {
          var obj = {};
          var $currentEle = $('.company-list-body .table-row.ng-scope').eq(i);
          obj.name = $currentEle.find('.name a').text();
          obj.cpyDetailLink = $currentEle.find('.name a').attr('href');
          obj.avatar = $currentEle.find('.avatar img').attr('src');
          obj.des = $currentEle.find('.des').text();
          obj.founder = $currentEle.find('.founder a').text();
          obj.founderDetailLink = $currentEle.find('.founder a').attr('href');
          obj.industry = $currentEle.find('.industry').text();
          obj.location = $currentEle.find('.location').text();
          obj.round = $currentEle.find('.round').text();
          obj.referer = '36Kr';
          array.data.push(obj);
        }
        console.log(JSON.stringify(array));
      });
    }
    page.close();
    phantom.exit();
  }
});

page.onConsoleMessage = function (msg) {
  if (msg.indexOf('{\"data\":') > -1) {
    console.log('Data:' + msg);
  } else {
    console.log('Warning:' + msg);
  }
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
