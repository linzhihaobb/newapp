var FOOTER = {};
FOOTER.CORPNAME = "漳州知书达人自动化办公设备有限公司";
FOOTER.QQCODE = "513453932";
FOOTER.TELNO = "262-1009";
FOOTER.CORPADDRESS = "漳州市芗城区金峰工业园区蔡前村550号";
FOOTER.ZIPCODE = "361000";
FOOTER.MOBILENO = "138 5920 6069";
FOOTER.FAXNO = "262-1883";
FOOTER.CORPEMAIL = "zzxingyie@163.com";
FOOTER.SIDEAUTHOR = "jack";
FOOTER.SIDERECORD = "粤ICP备12092924号-1";
var getUrlParameter = function(a) {
    try {
        var b = new RegExp("(^|&)" + a + "=([^&]*)(&|$)");
        var c = window.location.search.substr(1).match(b);
        if (c != null) {
            return window.unescape(c[2])
        }
    } catch(d) {
        return ""
    }
};
var menuList = [{
    "id": "mainPage",
    "name": "首页",
    "href": "/",
    "active": false,
    "target": "_self",
    "type": 0
},
{
    "id": "casePage",
    "name": "方案展示",
    "href": "/plan",
    "active": false,
    "target": "_self",
    "type": 0
},
{
    "id": "productPage",
    "name": "产品展示",
    "href": "/products?type=all&page=1",
    "active": false,
    "target": "_self",
    "type": 0,
    "list": [{
        "id": "znjhPage",
        "name": "硬件产品",
        "href": "/products?type=yjcp&page=1",
        "active": false,
        "target": "_self",
        "type": 1
    },
    {
        "id": "yyrjPage",
        "name": "应用软件",
        "href": "/products?type=yyrj&page=1",
        "active": false,
        "target": "_self",
        "type": 1
    },
    {
        "id": "zbcpPage",
        "name": "周边产品",
        "href": "/products?type=zbcp&page=1",
        "active": false,
        "target": "_self",
        "type": 1
    }]
},
{
    "id": "fwalPage",
    "name": "服务案例",
    "href": "/case",
    "active": false,
    "target": "_self",
    "type": 0
},
{
    "id": "aboutusPage",
    "name": "关于我们",
    "href": "/about",
    "active": false,
    "target": "_self",
    "type": 0
}];

// var productList = (function(){
//     var result
//     var xhr = new XMLHttpRequest();
//     xhr.onreadystatechange = function (e) {
//       // 判断状态
//       if (xhr.readyState == 4) {
//           // console.log(xhr.response)
//           var res = JSON.parse(xhr.response)
//           // console.dir(res)  // 拼接数据在页面显示
//         //   console.log(res.list)
//         result = res.list
//       }
//   }

//   xhr.open('get','http://localhost:3000/api/v1/productlist',false);
//   xhr.send()
//   return result
// })()
