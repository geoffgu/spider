var system = require('system');
var url = system.args[1];
var webpage = require('webpage'),
  page = webpage.create();

phantom.cookiesEnabled = true;
phantom.javascriptEnabled = true;

page.settings = {
  javascriptEnabled: true,
  loadImages: false,
  webSecurityEnabled: false,
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36'
};

page.customHeaders = {
  'Referer': 'https://www.crunchbase.com/'
};

page.onLoadStarted = function() {
  console.log('----------------start-----------------');
};

page.onConsoleMessage = function(msg) {
  if (msg.indexOf('Company:') > -1) {
    console.log(msg);
  }
}

page.onError = function(msg, trace) {
  var msgStack = ['ERROR: ' + msg];
  if (trace && trace.length) {
    msgStack.push('TRACE:');
    trace.forEach(function(t) {
      msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function+'")' : ''));
    });
  }
  console.error(msgStack.join('\n'));
};

page.open(url, function(status) {
  if (status === 'success') {
    setTimeout(checkPageReady, 3000);
  } else {
    page.close();
    phantom.exit();
  }

  function checkPageReady() {
    if (page.injectJs('./node_modules/jquery/dist/jquery.min.js')) {
      page.evaluate(function() {
        var company = {};
        for (var i = 0, len = $('div.definition-list.container').children('dt').length; i < len; i++) {
          var attr = $('div.definition-list.container').children('dt').eq(i).text().replace(':', '').trim();
          var value = $('div.definition-list.container').children('dd').eq(i).text().trim();
          if (attr == 'Categories' || attr == 'Social') {
            continue;
          }
          switch (attr) {
            case 'Headquarters':
              company.location = value;
              break;
            case 'Description':
              company.des = value;
              break;
            case 'Founders':
              company.founder = $('div.definition-list.container').children('dd').eq(i).children('a').eq(0).text().trim();
              company.founderDetailLink = 'https://www.crunchbase.com' + $('div.definition-list.container').children('dd').eq(i).children('a').eq(0).attr('href');
              break;
            case 'Website':
              company.website = value;
              break;
          }
        }
        for (var j = 0, jLen = $('.details.definition-list').children('dt').length; j < jLen; j++) {
          var detailAttr = $('.details.definition-list').children('dt').eq(j).text().replace(':', '').trim();
          var detailValue = $('.details.definition-list').children('dd').eq(j).text().trim();
          switch (detailAttr) {
            case 'Founded':
              company.time = detailValue;
              break;
            case 'Contact':
              company.contactInfo = detailValue;
              break;
            case 'Employees':
              company.scale = detailValue;
              break;
          }
        }
        company.detail = $('.description-ellipsis').text().trim();
        company.raiseFunds = [];
        for (var k = 0, kLen = $('.base.info-tab.funding_rounds .table.container tbody > tr').length; k < kLen; k++) {
          var fund = {};
          fund.times = $('.base.info-tab.funding_rounds .table.container tbody > tr').eq(k).children('td').eq(0).text().trim();
          fund.phase = $('.base.info-tab.funding_rounds .table.container tbody > tr').eq(k).children('td').eq(1).find('a').text().trim();
          fund.amount = $('.base.info-tab.funding_rounds .table.container tbody > tr').eq(k).children('td').eq(1).contents().filter(function () {
            return this.nodeType === 3;
          }).text().replace('/', '').trim();
          fund.valuation = $('.base.info-tab.funding_rounds .table.container tbody > tr').eq(k).children('td').eq(2).text().trim();
          fund.organizations = [];
          for (var n = 0, orgLength = $('.base.info-tab.funding_rounds .table.container tbody > tr').eq(k).children('td').eq(3).children('a').length; n < orgLength; n++) {
            var org = {};
            org.name = $('.base.info-tab.funding_rounds .table.container tbody > tr').eq(k).children('td').eq(3).children('a').eq(n).text().trim();
            org.link = 'https://www.crunchbase.com' + $('.base.info-tab.funding_rounds .table.container tbody > tr').eq(k).children('td').eq(3).children('a').eq(n).attr('href');
            fund.organizations.push(org);
          }
          company.raiseFunds.push(fund);
        }
        company.acquisitions = [];
        for (var m = 1, mLen = $('.base.info-tab.acquisitions .section-list.table.container tbody > tr').length; m < mLen; m++) {
          var acquisition = {};
          acquisition.date = $('.base.info-tab.acquisitions .section-list.table.container tbody > tr').eq(m).children('td').eq(0).text().trim();
          acquisition.name = $('.base.info-tab.acquisitions .section-list.table.container tbody > tr').eq(m).children('td').eq(1).text().trim();
          acquisition.amount = $('.base.info-tab.acquisitions .section-list.table.container tbody > tr').eq(m).children('td').eq(2).text().trim();
          company.acquisitions.push(acquisition);
        }
        company.investments = [];
        for (var q = 0, qLen = $('.base.info-tab.investments .section-list.table.investors tbody > tr').length; q < qLen; q++) {
          var investment = {};
          investment.date = $('.base.info-tab.investments .section-list.table.investors tbody > tr').eq(q).children('td').eq(0).text().trim();
          investment.name = $('.base.info-tab.investments .section-list.table.investors tbody > tr').eq(q).children('td').eq(1).text().trim();
          investment.round = $('.base.info-tab.investments .section-list.table.investors tbody > tr').eq(q).children('td').eq(2).text().trim();
          company.investments.push(investment);
        }
        company.members = [];
        for (var o = 0, oLen = $('.base.info-tab.people ul > li').length; o < oLen; o++) {
          var member = {};
          member.avatar = $('.base.info-tab.people ul > li').eq(o).find('.profile a img').attr('src');
          member.detailLink = 'https://www.crunchbase.com' + $('.base.info-tab.people ul > li').eq(o).find('.profile a').attr('href');
          member.name = $('.base.info-tab.people ul > li').eq(o).find('.info-block h4 a').text().trim();
          member.title = $('.base.info-tab.people ul > li').eq(o).find('.info-block h5').text().trim();
          company.members.push(member);
        }
        company.products = [];
        for (var p = 0, pLen = $('.base.info-tab.products ul.section-list.container > li').length; p < pLen; p++) {
          var product = {};
          product.logo = $('.base.info-tab.products ul.section-list.container > li').eq(p).find('.profile a img').attr('src');
          product.name = $('.base.info-tab.products ul.section-list.container > li').eq(p).find('.info-block h4 a').text().trim();
          product.link = 'https://www.crunchbase.com' + $('.base.info-tab.products ul.section-list.container > li').eq(p).find('.info-block h4 a').attr('href');
          product.desc = $('.base.info-tab.products ul.section-list.container > li').eq(p).find('.info-block h5').text().trim();
          company.products.push(product);
        }
        company.newsLink = 'https://www.crunchbase.com' + $('.base.info-tab.press_mentions .see-all a').attr('href');
        company.offices = [];
        for (var r = 0, rLen = $('.section-list.container.office > li').length; r < rLen; r++) {
          var office = {};
          office.name = $('.section-list.container.office > li').eq(r).find('.info-block h4').text().trim();
          office.address = $('.section-list.container.office > li').eq(r).find('.info-block p').eq(0).text().trim() + ' '
                         + $('.section-list.container.office > li').eq(r).find('.info-block p').eq(1).text().trim() + ' '
                         + $('.section-list.container.office > li').eq(r).find('.info-block p').eq(2).text().trim() + ' '
                         + $('.section-list.container.office > li').eq(r).find('.info-block p').eq(3).text().trim();
          company.offices.push(office);
        }
        console.log('Company:' + JSON.stringify(company));
      });
    } else {
      console.log('cannot load jquery');
      page.close();
      phantom.exit();
    }
  }
});
