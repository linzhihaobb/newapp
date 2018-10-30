var FOOTER = {};
FOOTER.CORPNAME = "漳州市兴业电脑有限公司";
FOOTER.QQCODE = "6623****";
FOOTER.TELNO = "400-800-***";
FOOTER.CORPADDRESS = "漳州市芗城区金峰工业园区蔡前村550号";
FOOTER.ZIPCODE = "361000";
FOOTER.MOBILENO = "133 9596 0553";
FOOTER.FAXNO = "1560502****";
FOOTER.CORPEMAIL = "zzxingyie@163.com";
FOOTER.SIDEAUTHOR = "jack";
FOOTER.SIDERECORD = "粤ICP备12092924号-1";
var getUrlParameter = function (a) {
    try {
        var b = new RegExp("(^|&)" + a + "=([^&]*)(&|$)");
        var c = window.location.search.substr(1).match(b);
        if (c != null) {
            return window.unescape(c[2])
        }
    } catch (d) {
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
        "href": "case.html",
        "active": false,
        "target": "_self",
        "type": 0
    },
    {
        "id": "productPage",
        "name": "产品展示",
        "href": "product.html?type=all&page=1",
        "active": false,
        "target": "_self",
        "type": 0,
        "list": [{
                "id": "znjhPage",
                "name": "硬件产品",
                "href": "product.html?type=yjcp&page=1",
                "active": false,
                "target": "_self",
                "type": 1
            },
            {
                "id": "yyrjPage",
                "name": "应用软件",
                "href": "product.html?type=yyrj&page=1",
                "active": false,
                "target": "_self",
                "type": 1
            },
            {
                "id": "zbcpPage",
                "name": "周边产品",
                "href": "product.html?type=zbcp&page=1",
                "active": false,
                "target": "_self",
                "type": 1
            }
        ]
    },
    {
        "id": "fwalPage",
        "name": "服务案例",
        "href": "case.html",
        "active": false,
        "target": "_self",
        "type": 0
    },
    {
        "id": "aboutusPage",
        "name": "关于我们",
        "href": "about_us.html",
        "active": false,
        "target": "_self",
        "type": 0
    }
];
var id = (function GetRequest() {
    var url = location.search; //获取url中"?"符后的字串   
    var theRequest = new Object();
    if (url.indexOf("?") != -1) {
        var str = url.substr(1);
        strs = str.split("&");
        for (var i = 0; i < strs.length; i++) {
            theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
        }
    }
    return theRequest;
})()

var productList = (function () {
    var result
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function (e) {
        // 判断状态
        if (xhr.readyState == 4) {
            // console.log(xhr.response)
            var res = JSON.parse(xhr.response)
            // console.dir(res)  // 拼接数据在页面显示

            result = res.list
        }
    }
    xhr.open('get', 'http://localhost:3000/api/v1/productData?type=' + id.type +"&page=" +id.page , false);
    xhr.send()
    return result
})()
var pagecount = (function () {
    var result
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function (e) {
        // 判断状态
        if (xhr.readyState == 4) {
            // console.log(xhr.response)
            var res = JSON.parse(xhr.response)
            // console.dir(res)  // 拼接数据在页面显示
        //    console.log(res)
            result = res.list
        }
    }
    xhr.open('get', 'http://localhost:3000/api/v1/pagecount?type=' + id.type +"&page=" +id.page , false);
    xhr.send()
    return result
})()
console.log(pagecount.length)
var strHtml = ''
for (i = 0; i < Math.ceil( pagecount.length / 6); i++) {
    strHtml += `<a href="product.html?type=${id.type}&page=${i+1}">${i+1}</a>`
}


