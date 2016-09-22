var system = require('system');
var url = system.args[1];
var webpage = require('webpage'), page = webpage.create();
var stepIndex = 0;
var tempObj = {};

page.settings = {
  javascriptEnabled: true,
  loadImages: false,
  webSecurityEnabled: false,
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36'
};

phantom.cookiesEnabled = true;
phantom.javascriptEnabled = true;

page.customHeaders = {
  'Referer': 'https://rong.36kr.com/'
};

page.onLoadStarted = function () {
  console.log('----------------start-----------------');
};

var click = function (el) {
  var ev = document.createEvent("MouseEvent");
  ev.initMouseEvent(
    'click',
    true /* bubble */, true /* cancelable */,
    window, null,
    0, 0, 0, 0, /* coordinates */
    false, false, false, false, /* modifier keys */
    0 /*left*/, null
  );
  el.dispatchEvent(ev);
}

page.open(url, function(status) {
  if (status === 'success') {
    setTimeout(checkPageReady, 8000);
  } else {
    page.close();
    phantom.exit();
  }

  function checkPageReady() {
    if (page.injectJs('./node_modules/jquery/dist/jquery.min.js')) {
      var steps = [
        function () {
          page.evaluate(function (click, url) {
            if (url.indexOf('organization') > -1) {
              if ($('div').hasClass('invest-cases')) {
                // top invest org
                var ele = document.querySelector('.members .container .toggle-more:not(.ng-hide) a');
                if (ele) {
                  click(ele);
                }
              } else {
                // normal invest org
                var ele = document.querySelector('.finance-case > .toggle-more > a');
                if (ele) {
                  click(ele);
                }
                for (var j = 0, secLen = $('.org-section.ng-scope').length; j < secLen; j++) {
                  if ($('.org-section.ng-scope').eq(j).attr('ng-include') == '\'templates/organization/user.html\'') {
                    click(document.querySelectorAll('.org-section.ng-scope')[j].querySelector('.toggle-more a'));
                    break;
                  }
                }
              }
            }
          }, click, url);
        },
        function () {
          tempObj = page.evaluate(function(url) {
            if (url.indexOf('organization') > -1) {
              if ($('div').hasClass('invest-cases')) {
                var obj = {};
                obj.investDetailLink = url;
                obj.logo = $('.basic-info .logo img').attr('src');
                obj.name = $('.basic-info .name').contents().filter(function () {
                  return this.nodeType === 3;
                }).text().trim();
                obj.ename = $('.basic-info .name .en').text();
                obj.website = $('.basic-info .website').text();
                obj.desc = $('.intro .content').text().trim();
                obj.foundTime = $('.guide-item').eq(0).find('.item-val').eq(0).text();
                obj.investAmount = $('.guide-item').eq(0).find('.item-val').eq(1).text();
                obj.members = [];
                for (var i = 0, memberLen = $('.members').eq(0).find('.scroll-wrap .item').length; i < memberLen; i++) {
                  var member = {};
                  member.name = $('.members').eq(0).find('.scroll-wrap .item').eq(i).find('.name').text().trim();
                  member.title = $('.members').eq(0).find('.scroll-wrap .item').eq(i).children('span').text().trim();
                  member.avatar = $('.members').eq(0).find('.scroll-wrap .item').eq(i).find('.avatar img').attr('src');
                  member.detailLink = 'https://rong.36kr.com' + $('.members').eq(0).find('.scroll-wrap .item').eq(i).find('.name').attr('href');
                  obj.members.push(member);
                }
                return obj;
              } else {
                var obj = {};
                obj.investDetailLink = url;
                obj.logo = $('.organization-basic .logo img').attr('src');
                obj.name = $('.organization-basic .basic-info .company-name h1').contents().filter(function () {
                  return this.nodeType === 3;
                }).text().trim();
                obj.ename = $('.organization-basic .basic-info .company-name h1 small').text().trim();
                obj.website = $('.organization-basic .basic-info .info a').text();
                obj.desc = $('.intro .content').text().trim();
                obj.foundTime = $('.guide-item').eq(0).find('.item-val').eq(0).text();
                obj.investAmount = $('.guide-item').eq(0).find('.item-val').eq(1).text();
                obj.financeCases = [];
                for (var j1 = 0, fLen = $('.finance-case > ul > li').length; j1 < fLen; j1++) {
                  var financeCase = {};
                  financeCase.name = $('.finance-case > ul > li').eq(j1).find('.panel-header .info .info-heading a').text();
                  financeCase.desc = $('.finance-case > ul > li').eq(j1).find('.panel-header .info p').text();
                  financeCase.avatar = $('.finance-case > ul > li').eq(j1).find('.panel-header > a img').attr('src');
                  financeCase.detailLink = 'https://rong.36kr.com' + $('.finance-case > ul > li').eq(j1).find('.panel-header .info .info-heading a').attr('href');
                  financeCase.phases = [];
                  for (var j2 = 0, f2Len = $('.finance-case > ul > li').eq(j1).find('.panel-body > ul > li').length; j2 < f2Len; j2++) {
                    var phase = {};
                    phase.time = $('.finance-case > ul > li').eq(j1).find('.panel-body > ul > li').eq(j2).find('.time').text().trim();
                    var str = $('.finance-case > ul > li').eq(j1).find('.panel-body > ul > li').eq(j2).find('.content p').eq(0).find('span').eq(0).text().trim();
                    var round = str.replace('|', '');
                    phase.round = round.trim();
                    phase.amount = $('.finance-case > ul > li').eq(j1).find('.panel-body > ul > li').eq(j2).find('.content p').eq(0).find('span').eq(1).text().trim();
                    phase.investPartner = $('.finance-case > ul > li').eq(j1).find('.panel-body > ul > li').eq(j2).find('.content p').eq(1).children('span').text().trim();
                    financeCase.phases.push(phase);
                  }
                  obj.financeCases.push(financeCase);
                }
                obj.members = [];
                obj.addresses = [];
                for (var j = 0, secLen = $('.org-section.ng-scope').length; j < secLen; j++) {
                  if ($('.org-section.ng-scope').eq(j).attr('ng-include') == '\'templates/organization/user.html\'') {
                    for (var k = 0, memberLen2 = $('.org-section.ng-scope').eq(j).find('.intro .thumbnail').length; k < memberLen2; k++) {
                      var member = {};
                      member.name = $('.org-section.ng-scope').eq(j).find('.intro .thumbnail').eq(k).find('.caption h4').text().trim();
                      member.title = $('.org-section.ng-scope').eq(j).find('.intro .thumbnail').eq(k).find('.caption p').text().trim();
                      member.avatar = $('.org-section.ng-scope').eq(j).find('.intro .thumbnail').eq(k).find('a img').attr('src');
                      member.detailLink = 'https://rong.36kr.com' + $('.org-section.ng-scope').eq(j).find('.intro .thumbnail').eq(k).find('a').attr('href');
                      obj.members.push(member);
                    }
                  }
                  if ($('.org-section.ng-scope').eq(j).attr('ng-include') == '\'templates/organization/contact.html\'') {
                    for (var m = 0, addrLen = $('.org-section.ng-scope').eq(j).find('.contact-address dl').length; m < addrLen; m++) {
                      var address = {};
                      address.city = $('.org-section.ng-scope').eq(j).find('.contact-address dl').eq(m).find('dt').text();
                      for (var n = 0, addrLen2 = $('.org-section.ng-scope').eq(j).find('.contact-address dl').eq(m).find('dd').length; n < addrLen2; n++) {
                        var info = $('.org-section.ng-scope').eq(j).find('.contact-address dl').eq(m).find('dd').eq(n).attr('ng-if');
                        var temp = $('.org-section.ng-scope').eq(j).find('.contact-address dl').eq(m).find('dd').eq(n).text();
                        switch (info) {
                          case 'item.website':
                            address.website = temp.substring(8).trim();
                            break;
                          case 'item.address':
                            address.detailAddress = temp.substring(8).trim();
                            break;
                          case 'item.phone':
                            address.phone = temp.substring(6).trim();
                            break;
                          case 'item.email':
                            address.email = temp.substring(6).trim();
                            break;
                        }
                      }
                      obj.addresses.push(address);
                    }
                  }
                }
                obj.type = '普通投资机构';
                obj.referer = '36Kr';
                console.log('org:' + JSON.stringify(obj));
                return null;
              }
            } else if (url.indexOf('company') > -1) {
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
                fund.time = $('#mPastFinancing ul li').eq(m).find('.times').text();
                fund.round = $('#mPastFinancing ul li').eq(m).find('.phace').text();
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
              obj.investDetailLink = url;
              obj.type = '公司投资';
              obj.referer = '36Kr';
              console.log('org:' + JSON.stringify(obj));
              return null;
            } else if (url.indexOf('userinfo') > -1) {
              var obj = {};
              obj.name = $('.basic-section .basic-info .user-name > h1').text();
              obj.avatar = $('.basic-section .logo img').attr('src');
              obj.des = $('.basic-section .basic-info .info .ng-binding.ng-scope').text();
              obj.industry = [];
              for (var i = 0, industryLength = $('.basic-section .basic-info .industry .content span').length; i < industryLength; i++) {
                obj.industry.push($('.basic-section .basic-info .industry .content span').eq(i).text());
              }
              obj.investCases = [];
              obj.founderCases = [];
              obj.workedCases = [];
              for (var j = 0, len = $('.user-container .user-profile > div').length; j < len; j++) {
                if ($('.user-container .user-profile > div').eq(j).attr('ng-include') == '\'templates/user/finacing.html\'') {
                  for (var l = 0, iLen = $('.user-container .user-profile > div').eq(j).find('.panel-body > .item').length; l < iLen; l++) {
                    var investCase = {};
                    investCase.avatar = $('.user-container .user-profile > div').eq(j).find('.panel-body > .item').eq(l).find('.avatar img').attr('src');
                    investCase.name = $('.user-container .user-profile > div').eq(j).find('.panel-body > .item').eq(l).find('.info .info-heading a').text();
                    investCase.detailLink = 'https://rong.36kr.com' + $('.user-container .user-profile > div').eq(j).find('.panel-body > .item').eq(l).find('.info .info-heading a').attr('href');
                    investCase.status = $('.user-container .user-profile > div').eq(j).find('.panel-body > .item').eq(l).find('.info .info-heading span').text();
                    investCase.desc = $('.user-container .user-profile > div').eq(j).find('.panel-body > .item').eq(l).find('.info .intro p').text().trim();
                    investCase.phases = [];
                    for (var k = 0, phanseLen = $('.user-container .user-profile > div').eq(j).find('.panel-body > .item').eq(l).find('.detail > li').length; k < phanseLen; k++) {
                      var phase = {};
                      phase.time = $('.user-container .user-profile > div').eq(j).find('.panel-body > .item').eq(l).find('.detail > li').eq(k).find('.time').text().trim();
                      var str = $('.user-container .user-profile > div').eq(j).find('.panel-body > .item').eq(l).find('.detail > li').eq(k).find('.content p').eq(0).children('span').eq(0).text().trim();
                      var round = str.replace('|', '');
                      phase.round = round.trim();
                      phase.amount = $('.user-container .user-profile > div').eq(j).find('.panel-body > .item').eq(l).find('.detail > li').eq(k).find('.content p').eq(0).children('span').eq(1).text().trim();
                      phase.investPartner = $('.user-container .user-profile > div').eq(j).find('.panel-body > .item').eq(l).find('.detail > li').eq(k).find('.content p').eq(0).children('span').eq(2).text().trim();
                      investCase.phases.push(phase);
                    }
                    obj.investCases.push(investCase);
                  }
                }
                if ($('.user-container .user-profile > div').eq(j).attr('ng-include') == '\'templates/user/company.html\'') {
                  for (var k = 0, itemLength = $('.user-container .user-profile > div').eq(j).find('.panel-body > .item').length; k < itemLength; k++) {
                    var founderCase = {};
                    founderCase.avatar = $('.user-container .user-profile > div').eq(j).find('.panel-body > .item').eq(k).find('.avatar img').attr('src');
                    founderCase.name = $('.user-container .user-profile > div').eq(j).find('.panel-body > .item').eq(k).find('.info .info-heading a').text();
                    founderCase.des = $('.user-container .user-profile > div').eq(j).find('.panel-body > .item').eq(k).find('.info .intro p').text();
                    founderCase.title = $('.user-container .user-profile > div').eq(j).find('.panel-body > .item').eq(k).find('.info .round').contents().filter(function () {
                      return this.nodeType === 3;
                    }).text().trim();
                    founderCase.time = $('.user-container .user-profile > div').eq(j).find('.panel-body > .item').eq(k).find('.info .round .date').text().trim();
                    obj.founderCases.push(founderCase);
                  }
                }
                if ($('.user-container .user-profile > div').eq(j).attr('ng-include') == '\'templates/user/work.html\'') {
                  for (var k = 0, itemLength = $('.user-container .user-profile > div').eq(j).find('.panel-body > .item').length; k < itemLength; k++) {
                    var workedCase = {};
                    workedCase.avatar = $('.user-container .user-profile > div').eq(j).find('.panel-body > .item').eq(k).find('.avatar img').attr('src');
                    workedCase.name = $('.user-container .user-profile > div').eq(j).find('.panel-body > .item').eq(k).find('.info .info-heading a').text();
                    workedCase.des = $('.user-container .user-profile > div').eq(j).find('.panel-body > .item').eq(k).find('.info .intro p').text();
                    workedCase.title = $('.user-container .user-profile > div').eq(j).find('.panel-body > .item').eq(k).find('.info .round').contents().filter(function () {
                      return this.nodeType === 3;
                    }).text().trim();
                    workedCase.time = $('.user-container .user-profile > div').eq(j).find('.panel-body > .item').eq(k).find('.info .round .date').text().trim();
                    obj.workedCases.push(workedCase);
                  }
                }
              }
              obj.investDetailLink = url;
              obj.type = '个人投资';
              obj.referer = '36Kr';
              console.log('org:' + JSON.stringify(obj));
              return null;
            } else {
              console.log('error');
              return null;
            }
          }, url);
        }, function () {
          page.evaluate(function (click, url) {
            if (url.indexOf('organization') > -1) {
              if ($('div').hasClass('invest-cases')) {
                // top invest org
                var ele = document.querySelector('.invest-cases .container .hd .more a');
                if (ele) {
                  click(ele);
                }
              }
            }
          }, click, url);
        }, function () {
          page.evaluate(function (click, url) {
            if (url.indexOf('organization') > -1) {
              if ($('div').hasClass('invest-cases')) {
                // top invest org
                for (var i = 0, len = document.querySelectorAll('.invest-cases .container .filters .items.tags a').length; i < len; i++) {
                  if (document.querySelectorAll('.invest-cases .container .filters .items.tags a')[i].firstChild.nodeValue == '医疗健康') {
                    click(document.querySelectorAll('.invest-cases .container .filters .items.tags a')[i]);
                  }
                }
              }
            }
          }, click, url);
        }, function () {
          page.evaluate(function (tempObj, url) {
            if (url.indexOf('organization') > -1) {
              if ($('div').hasClass('invest-cases')) {
                tempObj.financeCases = [];
                for (var i = 0, fLen = $('.invest-cases .bd.list > div').length; i < fLen; i++) {
                  var financeCase = {};
                  financeCase.name = $('.invest-cases .bd.list > div').eq(i).find('.basic .desc a').text();
                  financeCase.desc = $('.invest-cases .bd.list > div').eq(i).find('.basic .desc div').text();
                  financeCase.avatar = $('.invest-cases .bd.list > div').eq(i).find('.basic .logo img').attr('src');
                  financeCase.detailLink = 'https://rong.36kr.com' + $('.invest-cases .bd.list > div').eq(i).find('.basic .desc a').attr('href');
                  financeCase.phases = [];
                  for (var j = 0, f2Len = $('.invest-cases .bd.list > div').eq(i).find('.detail > li').length; j < f2Len; j++) {
                    var phase = {};
                    phase.time = $('.invest-cases .bd.list > div').eq(i).find('.detail > li').eq(j).find('.time').text().trim();
                    var str = $('.invest-cases .bd.list > div').eq(i).find('.detail > li').eq(j).find('.content p').eq(0).find('span').eq(0).text().trim();
                    var round = str.replace('|', '');
                    phase.round = round.trim();
                    phase.amount = $('.invest-cases .bd.list > div').eq(i).find('.detail > li').eq(j).find('.content p').eq(0).find('span').eq(1).text().trim();
                    phase.investPartner = $('.invest-cases .bd.list > div').eq(i).find('.detail > li').eq(j).find('.content p').eq(1).children('span').text().trim();
                    financeCase.phases.push(phase);
                  }
                  tempObj.financeCases.push(financeCase);
                }
                tempObj.type = '顶级投资机构';
                tempObj.referer = '36Kr';
                console.log('org:' + JSON.stringify(tempObj));
              }
            }
          }, tempObj, url);
        }
      ];

      var interval = setInterval(function () {
        if (typeof steps[stepIndex] == 'function') {
          console.log('step ' + (stepIndex + 1));
          steps[stepIndex]();
          stepIndex++;
        }
      }, 5000);
    } else {
      console.log('cannot load jquery');
      page.close();
      phantom.exit();
    }
  }
});

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
