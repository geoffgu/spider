'use strict';

const async = require('async');
const iconv = require('iconv-lite');
const mongoose = require('mongoose');
const childProcess = require('child_process');
const models = require('./models');
var fs = require('fs');
var path = require('path');
var Company = models.Company;
var Founder = models.Founder;
var count = 0;
// Company.aggregate().group({ _id: "$name", count: {$sum : 1}}).exec(function(err, companies) {
//   if (err) console.error(err);
//   companies.forEach(function(company, index) {
//     if (company.count > 1) {
//
//       // console.log(count + ': ' + JSON.stringify(company));
//       Company.find({'name': company._id}, 'name referer isForeign', function(Err, doc) {
//         count++;
//         doc.forEach(function (item) {
//           console.log(count + ': ' + JSON.stringify(item));
//           // if (item.toObject().isForeign == 1) {
//           //   Company.remove({ _id: item._id}, function (errE) {
//           //     console.log('success');
//           //   })
//           // }
//         });
//       });
//     }
//   });
// });

// Founder.update({}, { $unset: { company_id: 1, title: 1 } }, { multi: true }, function(err, doc) {
//   if (err) console.error(err);
//   console.log(doc);
// });

// var o = {};
// o.map = function () {
//   emit({"name":this.name,"avatar":this.avatar,"founderDetailLink":this.founderDetailLink}, 1);
// }
// o.reduce = function (key, values) {
//   return Array.sum(values);
// }
// o.out = { replace: 'founder_total' }
// Founder.mapReduce(o, function (err, model) {
//   model.find().where('value').gt(1).exec(function (error, docs) {
//     docs.forEach(function (doc, index2) {
//       if (index2 < 100) {
//         Company.find({members: {$elemMatch: {"name": doc._id.name, "avatar": doc._id.avatar, "detailLink": doc._id.founderDetailLink}}}, 'name members', function(Err, companies) {
//           let founderId = '';
//           companies.forEach(function(company) {
//             company.toObject().members.forEach(function (member) {
//               if (!founderId && member.name == doc._id.name && member.avatar == doc._id.avatar && member.detailLink == doc._id.founderDetailLink) {
//                 founderId = member.founder_id;
//                 return;
//               }
//             });
//           });
//           Founder.find({'name': doc._id.name}, function(Error3, founders) {
//             if (Error3) console.error(Error3);
//             founders.forEach(function(founder) {
//               if (JSON.stringify(founder.toObject()._id) !== JSON.stringify(founderId)) {
//                 Founder.remove({_id: founder.toObject()._id}, function(error4, data) {
//                   if (error4) console.error(error4);
//                   console.log(data);
//                 });
//               }
//             });
//           });
          // companies.forEach(function(company) {
          //   company.toObject().members.forEach(function (member, index) {
          //     if (!founderId && member.name == doc._id.name && member.avatar == doc._id.avatar && member.detailLink == doc._id.founderDetailLink) {
          //       founderId = member.founder_id;
          //       return;
          //     }
          //     if (founderId && member.name == doc._id.name && member.avatar == doc._id.avatar && member.detailLink == doc._id.founderDetailLink) {
          //       let newMembers = company.toObject().members;
          //       newMembers[index].founder_id = founderId;
          //       Company.update({ _id: company._id }, {members: newMembers}, function (Error2, doc) {
          //         if (Error2) console.error(Error2);
          //         console.log(doc);
          //       });
          //       Founder.remove({ _id: member.founder_id }, function(Error3) {
          //         if (Error3) console.error(Error3);
          //       });
          //     }
          //   });
          // });
//         });
//       }
//     })
//   });
// });

// var locationArr = [
//   'beijing',
//   'shanghai',
//   'tianjin',
//   'chongqing',
//   'shijiazhuang',
//   'qinhuangdao',
//   'langfang',
//   'taiyuan',
//   'datong',
//   'huhehaote',
//   'chifeng',
//   'hulunbeier',
//   'tongliao',
//   'baotou',
//   'eerduosi',
//   'haerbin',
//   'changchun',
//   'jilin',
//   'shenyang',
//   'fushun',
//   'dalian',
//   'nanjing',
//   'xuzhou',
//   'yangzhou',
//   'zhenjiang',
//   'nantong',
//   'changzhou',
//   'wuxi',
//   'suzhou',
//   'hangzhou',
//   'shaoxing',
//   'jiaxing',
//   'ningbo',
//   'wenzhou',
//   'hefei',
//   'huaibei',
//   'bengbu',
//   'fuyang',
//   'huainan',
//   'wuhu',
//   'fuzhou',
//   'longyan',
//   'putian',
//   'sanming',
//   'quanzhou',
//   'xiamen',
//   'nanchang',
//   'jiujiang',
//   'shangrao',
//   'ganzhou',
//   'jinan',
//   'yantai',
//   'weihai',
//   'qingdao',
//   'zhengzhou',
//   'wuhan',
//   'changsha',
//   'guangzhou',
//   'shantou',
//   'foshan',
//   'dongguan',
//   'shenzhen',
//   'zhuhai',
//   'nanning',
//   'sanya',
//   'haikou',
//   'chengdu',
//   'guiyang',
//   'kunming',
//   'lasa',
//   'xian',
//   'zhangye',
//   'lanzhou',
//   'xining',
//   'yinchuan',
//   'wulumuqi',
//   'hebei',
//   'shanxi',
//   'neimenggu',
//   'heilongjiang',
//   'jilin',
//   'liaoning',
//   'jiangsu',
//   'zhejiang',
//   'anhui',
//   'fujian',
//   'jiangxi',
//   'shandong',
//   'henan',
//   'hubei',
//   'hunan',
//   'guangdong',
//   'guangxi',
//   'hainan',
//   'sichuan',
//   'guizhou',
//   'yunnan',
//   'xizang',
//   'shanxi',
//   'gansu',
//   'qinghai',
//   'xinjiang'
// ]
//
// var comSet = new Set();
//
// async.mapLimit(locationArr, 1, function(location, callback) {
//   fetch(location, callback);
// }, function(err, result) {
//   console.log('***async done***');
//   console.log(comSet);
// });
//
// function fetch(loca, callback) {
//   Company.find({'referer': 'crunchbase', 'location': new RegExp(loca, 'i')}, 'name location', function(err, companies) {
//     companies.forEach(function(company, index) {
//       comSet.add(company);
//     });
//     callback(null, loca);
//   });
// }

// var peopleArr = [];
//
// Company.find({'referer':'crunchbase', 'members.0': {$exists: true}}, 'name members', {skip: 14000, limit: 2000}, function(err, companies) {
//   companies.forEach(function(company, index) {
//     let newMembers = [];
//     let comName = company.name;
//     company.toObject().members.forEach(function (member) {
//       let obj = { _id: new mongoose.mongo.ObjectID(), company_id: comName, name: member.name, title: member.title, avatar: member.avatar, founderDetailLink: member.detailLink };
//       let obj2 = { founder_id: obj._id, name: member.name, title: member.title, avatar: member.avatar, detailLink: member.detailLink };
//       peopleArr.push(obj);
//       newMembers.push(obj2);
//     });
//     Company.update({ _id: company._id }, {members: newMembers}, function (err, doc) {
//       if (err) console.error(err);
//       console.log(doc);
//     });
//   });
//   peopleArr.forEach(function (member) {
//     Founder.create(member, function (err, founder) {
//       if (err) console.error(err);
//       console.log(founder);
//     });
//   });
// });

// Company.find({'founder': {$exists: true}}, 'founder', {skip:0, limit: 5000}, function(err, companies) {
//   companies.forEach(function(company, index) {
//     // if (typeof company.toObject().des === 'string') {
//     //   var arr = [];
//     //   arr.push(company.toObject().founder);
//       // Company.update({ _id: company._id }, {founder: []}, function (err, doc) {
//       //   if (err) console.error(err);
//       //   console.log(doc);
//       // });
//       console.log(typeof company.toObject().founder);
//     // }
//   });
// });
// Company.find({'referer':'36Kr', 'raiseFunds.amount_o': {$eq: null}, 'raiseFunds': {$exists: true}}, function(err, companies) {
//   companies.forEach(function(company, index) {
//     // if (index < 10) {
//       var arr = company.toObject().raiseFunds.map(function(raise, index) {
//         var obj = raise
//         if (obj.amount === '未透露') {
//           obj.amount_o = '未透露'
//         }
//         if (obj.amount === '数十万人民币') {
//           obj.amount_o = '¥300K'
//         }
//         if (obj.amount === '数百万人民币') {
//           obj.amount_o = '¥3M'
//         }
//         if (obj.amount === '数千万人民币') {
//           obj.amount_o = '¥30M'
//         }
//         if (obj.amount === '数亿人民币') {
//           obj.amount_o = '¥300M'
//         }
//         if (obj.amount === '亿元及以上人民币') {
//           obj.amount_o = '¥150M'
//         }
//         if (obj.amount === '数十万美元') {
//           obj.amount_o = '$300K'
//         }
//         if (obj.amount === '数百万美元') {
//           obj.amount_o = '$3M'
//         }
//         if (obj.amount === '数千万美元') {
//           obj.amount_o = '$30M'
//         }
//         if (obj.amount === '数亿美元') {
//           obj.amount_o = '$300M'
//         }
//         if (obj.amount === '亿元及以上美元') {
//           obj.amount_o = '$150M'
//         }
//         if (obj.amount === '未披露') {
//           obj.amount_o = '未披露'
//         }
//         if (obj.amount === '¥数千万') {
//           obj.amount_o = '¥30M'
//         }
//         if (obj.amount === '¥数百万') {
//           obj.amount_o = '¥3M'
//         }
//         if (obj.amount === '¥数十万') {
//           obj.amount_o = '¥300K'
//         }
//         if (obj.amount === '$数十万') {
//           obj.amount_o = '$300K'
//         }
//         if (obj.amount === '$数百万') {
//           obj.amount_o = '$3M'
//         }
//         if (obj.amount === '$数千万') {
//           obj.amount_o = '$30M'
//         }
//         if (parseInt(obj.amount / 100) == 0 ) {
//           obj.amount_o = `$${obj.amount * 10}K`
//         }
//         if (parseInt(obj.amount / 100) > 0 && parseInt(obj.amount / 100000) == 0) {
//           obj.amount_o = `$${obj.amount / 100}M`
//         }
//         if (parseInt(obj.amount / 100000) > 0) {
//           obj.amount_o = `$${obj.amount / 100000}B`
//         }
//         return obj;
//       })
//       console.log(arr);
//       Company.update({ _id: company._id }, {raiseFunds: arr}, function (err, doc) {
//         if (err) console.error(err);
//         console.log(doc);
//       });
//     // }
//   });
// })

// Company.find({'referer':'crunchbase', 'raiseFunds': {$exists: true}}, 'name raiseFunds', {skip: 0, limit: 5000}, function(err, companies) {
//   companies.forEach(function(company, index) {
//     // if (index < 20) {
//       // var companyUpper = company.toObject().raiseFunds.map(function (item) {
//       //   var obj = item;
//       //   if (item.amount_o) {
//       //     obj.amount_o = item.amount_o.toString().toUpperCase();
//       //   }
//       //   if (item.amount) {
//       //     obj.amount = item.amount.toString().toUpperCase();
//       //   }
//       //   return obj;
//       // });
//       // Company.update({ _id: company._id }, { raiseFunds: companyUpper }, function (err, doc) {
//       //   if (err) console.error(err);
//       //   console.log(doc);
//       // });
//     // }
//       company.toObject().raiseFunds.forEach(function (item) {
//         fs.appendFile(path.join(__dirname, '/test.json'), item.amount_o + '\n', function(err) {
//           if (err) throw err;
//           console.log('err');
//         });
//       })
//
//     // })
//   });
//   // console.log(JSON.stringify(companies));
// })

// /^(?!.*k)/
// var stream = Company.find({'referer': 'crunchbase', 'raiseFunds.amount_o': /^[¥].*[B]$/ }, 'name').cursor({ batchSize: 100 });
// var cache = []
//
// stream.on('data', function (doc) {
//   // if (cache.length == 10) {
//   //   stream.pause()
//   //   console.log(cache[1])
//   //   return;
//   // }
//   console.log(doc);
//   // cache.push(doc)
//   // do something with the mongoose document
// }).on('error', function (err) {
//   // handle the error
// }).on('close', function () {
//   // the stream is closed
// });

// , function (err, companies) {
//   console.log('hi')
//   if (err) return console.error(err);
//   companies.forEach(function(company, index) {
//     if (index < 1) {
//       console.log(company.toObject())
//     }
//   });
// }
