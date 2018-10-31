"use strict";
var express = require("express");
var path = require("path");
var template = require("art-template");
var session = require("express-session");
var bodyparser = require("body-parser");
var mongoose = require("mongoose");
var multer = require("multer");
var fs = require("fs");
var ueditor = require("ueditor");
var app = express();

app.use(bodyparser.json()); // 使用bodyparder中间件，
app.use(
  bodyparser.urlencoded({
    extended: true
  })
);
// 下面设置渲染的引擎模板
app.engine("html", require("express-art-template"));
app.set("view engine", "html");

mongoose.connect("mongodb://localhost/zsdr");

mongoose.connection.on("error", function(err) {
  console.log(err);
  console.log("连接数据库失败");
});
mongoose.connection.once("open", function() {
  console.log("连接数据库成功");
});
// Schema 数据库模型，一种以文件形式存储数据库的模型骨架／／
var Schema = mongoose.Schema;

// 创建用户信息模型，参数一表示模型的内容，参数二表示模型的名字
var productSchema = Schema(
  {
    id: String,
    title: String, // 标题
    imgSrc: String, //图片
    remark: String, //介绍
    href: String, //跳转地址
    content: String,
    type: String,
    types: String,
    imgList: Array,
    otherList: Array,
    subTitle: String,
    date: String
  },
  {
    collection: "Products"
  }
);
var slideshowSchema = Schema(
  {
    id: String,
    link: String,
    title: String,
    uploaddate: String
  },
  {
    collection: "Slideshows"
  }
);
var caseshowSchema = Schema(
  {
    id: String,
    imgSrc: String,
    title: String,
    content: String,
    remark: String,
    date: String,
    year:String,
    month:String,
    day:String
  },
  {
    collection: "Caseshows"
  }
);
var newsshowSchema = Schema(
  {
    id: String,
    imgSrc: String,
    title: String,
    content: String,
    remark: String,
    date: String,
    year:String,
    month:String,
    day:String
  },
  {
    collection: "Newsshows"
  }
);
// 根据创建的用户数据库模型创建用户模型
// User 由schema生成的模型，具有抽象属性和行为的数据库操作对。
var Product = mongoose.model("Product", productSchema);
var Slideshow = mongoose.model("Slideshow", slideshowSchema);
var Caseshow = mongoose.model("Case", caseshowSchema);
var Newsshow = mongoose.model("News", newsshowSchema);
// app.use(express.static(path.join(__dirname, "views")))
app.use(express.static(path.join(__dirname, "public")));
app.use(
  "/ueditor/ue",
  ueditor(path.join(__dirname, "public"), function(req, res, next) {
    //客户端上传文件设置
    var imgDir = "/img/ueditor/";
    var ActionType = req.query.action;
    if (
      ActionType === "uploadimage" ||
      ActionType === "uploadfile" ||
      ActionType === "uploadvideo"
    ) {
      var file_url = imgDir; //默认图片上传地址
      /*其他上传格式的地址*/
      if (ActionType === "uploadfile") {
        file_url = "/file/ueditor/"; //附件
      }
      if (ActionType === "uploadvideo") {
        file_url = "/video/ueditor/"; //视频
      }
      res.ue_up(file_url); //你只要输入要保存的地址 。保存操作交给ueditor来做
      res.setHeader("Content-Type", "text/html");
    }
    //  客户端发起图片列表请求
    else if (req.query.action === "listimage") {
      var dir_url = imgDir;
      res.ue_list(dir_url); // 客户端会列出 dir_url 目录下的所有图片
    }
    // 客户端发起其它请求
    else {
      // console.log('config.json')
      res.setHeader("Content-Type", "application/json");
      res.redirect("/ueditor/nodejs/config.json");
    }
  })
);

// 使用 session 中间件
app.use(
  session({
    secret: "secret", // 对session id 相关的cookie 进行签名
    resave: true,
    saveUninitialized: false, // 是否保存未初始化的会话
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 // 设置 session 的有效时间，单位毫秒
    }
  })
);

let uploadMulti = multer({
  dest: "public/upload/"
});

// 主页 轮播图渲染
app.get("/", (req, res) => {
  Slideshow.find(function(err, data) {
    if (err) {
      console.log(err);
    } else {
      Newsshow.find(function(err,data1){
        if(err){
          console.log(err)
        }else{
          res.render("index", {
            list: data.map(function(item) {
              var slideshow = item.toObject();
              slideshow.id = slideshow._id.toString();
              delete slideshow._id;
              return slideshow;
            }),
            newsshow:data1.map(function(item){
              var newsshow = item.toObject()
              return newsshow
            })
          });  
        }
      }).sort({date:-1}).limit(5)  
    }
  });
});
// 获取登录页面
app.get("/login", function(req, res) {
  res.sendFile(__dirname + "/login.html");
});
// 用户登录
app.post("/login", function(req, res) {
  function send(code, message) {
    res.status(200).json({
      code,
      message
    });
  }
  if (req.body.username == "admin" && req.body.password == "admin123") {
    req.session.userName = req.body.username; // 登录成功，设置 session
    send("success", "登录成功");
  } else {
    send("error", "用户名或密码错误");
    // 若登录失败，重定向到登录页面
  }
});
app.get("/home", function(req, res) {
  if (req.session.userName) {
    res.render("home");
  } else {
    res.redirect("/login");
  }
});
// 获取首页产品数据
app.get("/api/v1/productlist", function(req, res) {
  Product.find(function(err, data) {
    if (err) {
      console.log(err);
    } else {
      // console.log(data)
      res.json({
        list: data.map(function(item) {
          var product = item.toObject();
          return product;
        })
      });
    }
  }).limit(6);
});
// product_detail.html产品详细信息页面获取数据
app.get("/api/v2/productlist", function(req, res) {
  if (req.query.type == "yjcp") {
    Product.find(
      {
        type: req.query.type
      },
      function(err, data) {
        if (err) {
          res.json({
            code: "error",
            message: "查询失败"
          });
        } else {
          res.json({
            list: data
          });
        }
      }
    ).limit(8);
  } else if (req.query.type == "yyrj") {
    Product.find(
      {
        type: req.query.type
      },
      function(err, data) {
        if (err) {
          res.json({
            code: "error",
            message: "查询失败"
          });
        } else {
          // console.log(data)
          res.json({
            list: data
          });
        }
      }
    ).limit(8);
  } else {
    Product.find(
      {
        type: req.query.type
      },
      function(err, data) {
        if (err) {
          res.json({
            code: "error",
            message: "查询失败"
          });
        } else {
          // console.log(data)
          res.json({
            list: data
          });
        }
      }
    ).limit(8);
  }
});
// 渲染news.html
app.get("/news/:page",function(req,res){
  function getPages(currentPage, pageCount) {
    var pages = [currentPage];
    var left = currentPage - 1;
    var right = currentPage + 1;
    while (pages.length < 15 && (left >= 1 || right <= pageCount)) {
      if (left > 0) {
        pages.unshift(left--)
      }
      if (right <= pageCount) {
        pages.push(right++)
      }
    }
    return pages
  }
  var currentPage = 1
  if (req.params.page) {
    currentPage = req.params.page * 1
  }
  var pageSize = 5
  Newsshow.count({}, function (err, count) {
    if (err) {
      console.log(err)
    } else {
      var pageCount = Math.ceil(count / pageSize)
      Newsshow.find(function (err1, data1) {
        if (err1) {
          console.log(err1);
        } else {
          var pages = getPages(currentPage, pageCount);
          res.render("news", {
            newsshow: data1.map(function (item) {
              var product = item.toObject()
              return product
            }),
            page: currentPage,
            pageCount: pageCount,
            pages: pages,
          });
        }
      }).limit(pageSize).skip((currentPage - 1) * pageSize);
    }
  })
})
// add.html产品添加
app.post(
  "/admin/product/add",
  uploadMulti.array("img", 3),
  (req, res, next) => {
    if (req.session.userName) {
      var product = Product(req.body);
      var id = product.toObject()._id.toString();
      var files = req.files;
      var fileInfos = [];
      var otherList = [];
      var types = "";
      fs.exists(`public/upload/product/${id}`, function(exists) {
        if (exists) {
          for (let i in files) {
            var file = files[i];
            fs.rename(
              file.path,
              "public/upload/product/" + id + "/" + file.originalname,
              function(err) {
                if (err) {
                  throw err;
                }
              }
            );
          }
        } else {
          fs.mkdir(`public/upload/product/${id}`, function(err) {
            if (err) {
              console.log(err);
            } else {
              for (let i in files) {
                var file = files[i];
                fs.rename(
                  file.path,
                  "public/upload/product/" + id + "/" + file.originalname,
                  function(err) {
                    if (err) {
                      throw err;
                    }
                  }
                );
              }
            }
          });
        }
      });
      for (let i in files) {
        var file = files[i];
        var fileInfo = {};
        var style = {};
        style.backgroundImage =
          "url(/upload/product/" + id + "/" + file.originalname + ")";
        style.backgroundSize = "100%";
        style.backgroundRepeat = "no-repeat";
        style.backgroundPosition = "center";
        fileInfo.style = style;
        fileInfos.push(fileInfo);
      }
      if (req.body.type == "yjcp") {
        types = "硬件产品";
        otherList = [
          {
            label: "应用软件",
            link: "product_detail.html?id=" + id + "&type=yyrj"
          },
          {
            label: "周边产品",
            link: "product_detail.html?id=" + id + "&type=zbcp"
          }
        ];
      } else if (req.body.type == "yyrj") {
        types = "应用软件";
        otherList = [
          {
            label: "硬件产品",
            link: "product_detail.html?id=" + id + "&type=yjcp"
          },
          {
            label: "周边产品",
            link: "product_detail.html?id=" + id + "&type=zbcp"
          }
        ];
      } else {
        types = "周边产品";
        otherList = [
          {
            label: "硬件产品",
            link: "product_detail.html?id=" + id + "&type=yjcp"
          },
          {
            label: "应用软件",
            link: "product_detail.html?id=" + id + "&type=yyrj"
          }
        ];
      }
      product.id = id;
      product.imgSrc = "upload/product/" + id + "/" + files[0].originalname;
      product.href =
        "product_detail.html?id=" + id + "&" + "type=" + req.body.type;
      product.imgList = fileInfos;
      product.otherList = otherList;
      product.types = types;
      product.save(function(err) {
        if (err) {
          res.json({
            code: "error",
            message: "添加失败"
          });
        } else {
          res.json({
            code: "success",
            message: "添加成功"
          });
        }
      });
    } else {
      res.redirect("/login");
    }
  }
);
// product.html按照分类查询数据的条数
app.get("/api/v1/pagecount", function(req, res) {
  if (req.query.type == "all") {
    Product.find(function(err, data) {
      if (err) {
        res.json({
          code: "error",
          message: "查询失败"
        });
      } else {
        res.json({
          list: data
        });
      }
    });
  } else {
    Product.find(
      {
        type: req.query.type
      },
      function(err, data) {
        if (err) {
          res.json({
            code: "error",
            message: "查询失败"
          });
        } else {
          res.json({
            list: data
          });
        }
      }
    );
  }
});
// product.html按照分类查询数据
app.get("/api/v1/productData", function(req, res, next) {
  if (req.query.type == "all") {
    var currentpage = req.query.page;
    var pageSize = 6;
    Product.find(function(err, data) {
      if (err) {
        res.json({
          code: "error",
          message: "查询失败"
        });
      } else {
        res.json({
          list: data
        });
      }
    })
      .limit(pageSize)
      .skip((currentpage - 1) * pageSize);
  } else {
    var currentpage = req.query.page;
    var pageSize = 6;
    Product.find(
      {
        type: req.query.type
      },
      function(err, data) {
        if (err) {
          res.json({
            code: "error",
            message: "查询失败"
          });
        } else {
          res.json({
            list: data
          });
        }
      }
    )
      .limit(pageSize)
      .skip((currentpage - 1) * pageSize);
  }
});

// 根据id获取产品数据
app.get("/api/v1/productorData", function(req, res, next) {
  Product.findById(req.query.id, function(err, data) {
    if (err) {
      res.json({
        code: "error",
        message: "查询失败"
      });
    } else {
      res.json({
        list: data
      });
    }
  });
});
// 渲染case。html
app.get("/case", function(req, res) {
  Caseshow.find(function(err, data) {
    if (err) {
      console.log(err);
    } else {
      res.render("case", {
        caseshow: data.map(function(item) {
          var product = item.toObject();
          return product;
        })
      });
    }
  });
});
// 渲染new-detail
app.get("/api/case/:id", function(req, res) {
  Caseshow.findById(req.params.id, function(err, data) {
    if (err) {
      console.log(err);
    } else {
      var caseshow = data.toObject();
      res.render("news_detail", {
        caseshow: caseshow
      });
    }
  });
});
app.get("/api/news/:id", function(req, res) {
  Newsshow.findById(req.params.id, function(err, data) {
    if (err) {
      console.log(err);
    } else {
      var newsshow = data.toObject();
      res.render("news_detail", {
        caseshow: newsshow
      });
    }
  });
});
//渲染 picture-list.html
app.get("/picture", function(req, res) {
  Slideshow.find(function(err, data) {
    res.render("picture-list", {
      picture: data.map(function(item) {
        var picture = item.toObject();
        return picture;
      }),
      count: data.length
    });
  });
});
// 渲染product-list.html
app.get("/product", function(req, res) {
  Product.find(function(err, data) {
    res.render("product-list", {
      product: data.map(function(item) {
        var product = item.toObject();
        return product;
      }),
      count: data.length
    });
  });
});
// 渲染case-list.html
app.get("/apicase", function(req, res) {
  Caseshow.find(function(err, data) {
    res.render("case-list", {
      caseshow: data.map(function(item) {
        var product = item.toObject();
        return product;
      }),
      count: data.length
    });
  });
});
// 渲染news-list.html
app.get("/apinews", function(req, res) {
  Newsshow.find(function(err, data) {
    res.render("news-list", {
      newsshow: data.map(function(item) {
        var product = item.toObject();
        return product;
      }),
      count: data.length
    });
  });
});
// 渲染plan。html
app.get('/plan',function(req,res){
  res.render("plan",{})
})
// 渲染about_us。html
app.get('/about',function(req,res){
  res.render("about_us",{})
})
// 渲染product.html
app.get('/products',function(req,res){
  res.render("product",{})
})
app.get('/history',function(req,res){
  res.render("about_history",{})
})
app.get('/contact',function(req,res){
  res.render("contact",{})
})

// 案例添加
app.post("/caseadd", uploadMulti.single("imgSrc"), (req, res) => {
  var file = req.file;
  var filename = file.originalname || "";
  var d = new Date();
  var ears = filename.split(".");
  var newname = d.getTime() + "." + ears[1];
  fs.rename(file.path, "public/upload/case/" + newname, function(err) {
    if (err) {
      throw err;
    }
  });
  var caseshow = Caseshow(req.body);
  var years = caseshow.date.split("-")
  caseshow.year = years[0]
  caseshow.month = years[1]
  caseshow.day = years[2]
  var id = caseshow.toObject()._id.toString();
  caseshow.imgSrc = newname;
  caseshow.id = id;
  caseshow.save(function(error) {
    if (error) {
      res.json({
        code: "error",
        message: "添加失败"
      });
    } else {
      res.json({
        code: "success",
        message: "添加成功"
      });
    }
  });
});
// 动态添加
app.post("/newsadd", uploadMulti.single("imgSrc"), (req, res) => {
  var file = req.file;
  var filename = file.originalname || "";
  var d = new Date();
  var ears = filename.split(".");
  var newname = d.getTime() + "." + ears[1];
  fs.rename(file.path, "public/upload/news/" + newname, function(err) {
    if (err) {
      throw err;
    }
  });
  var newsshow = Newsshow(req.body);
  var years = newsshow.date.split("-")
  newsshow.year = years[0]
  newsshow.month = years[1]
  newsshow.day = years[2]
  var id = newsshow.toObject()._id.toString();
  newsshow.imgSrc = newname;
  newsshow.id = id;
  newsshow.save(function(error) {
    if (error) {
      res.json({
        code: "error",
        message: "添加失败"
      });
    } else {
      res.json({
        code: "success",
        message: "添加成功"
      });
    }
  });
});
// 轮播图添加
app.post("/add", uploadMulti.single("slideshow"), (req, res, next) => {
  var file = req.file;
  var filename;
  filename = file.originalname;
  var d = new Date();
  var ears = filename.split(".");
  var newname = d.getTime() + "." + ears[1];
  fs.rename(file.path, "public/upload/slideshow/" + newname, function(err) {
    if (err) {
      throw err;
    }
  });

  var slideshow = Slideshow(req.body);
  var id = slideshow.toObject()._id.toString();
  slideshow.link = newname;
  slideshow.id = id;
  slideshow.save(function(error) {
    if (error) {
      res.json({
        code: "error",
        message: "添加失败"
      });
    } else {
      res.json({
        code: "success",
        message: "添加成功"
      });
    }
  });
});
// 跳转到案例修改
app.get("/updata/case/:id", function(req, res) {
  Caseshow.findById(req.params.id, function(err, data) {
    if (err) {
      console.log(err);
    } else {
      var caseshow = data.toObject();
      res.render("case-updata", {
        caseshow: caseshow
      });
    }
  });
});
// 跳转到方案修改
app.get("/updata/news/:id", function(req, res) {
  Newsshow.findById(req.params.id, function(err, data) {
    if (err) {
      console.log(err);
    } else {
      var newsshow = data.toObject();
      res.render("news-updata", {
        newsshow: newsshow
      });
    }
  });
});
//跳转到轮播图修改
app.get("/updata/picture/:id", function(req, res) {
  Slideshow.findById(req.params.id, function(err, data) {
    if (err) {
      console.log(err);
    } else {
      res.render("picture-updata", {
        picture: data
      });
    }
  });
});
// 上传案例修改
app.post("/api/v3/edit/:id", uploadMulti.single("imgSrc"), function(req, res) {
  var data = req.body;
  var file = req.file;
  var filename= file.originalname;  
  var d = new Date();
  var ears = filename.split(".");
  var newname = d.getTime() + "." + ears[1];
  fs.rename(file.path, "public/upload/case/" + newname, function(err) {
    if (err) {
      throw err;
    }
  });
  Caseshow.findById(req.params.id, function(err, data) {
    fs.unlink("public/upload/case/" + data.imgSrc, function(err) {
      if (err) {
        console.log(err);
      }
    });
  });
  data.imgSrc = newname;
  var years =  data.date.split("-")
  data.year = years[0]
  data.month= years[1]
  data.day = years[2]
  Caseshow.findByIdAndUpdate(req.params.id, data, function(error) {
    if (error) {
      res.json({
        code: "error",
        message: "修改失败"
      });
    } else {
      res.json({
        code: "success",
        message: "修改成功"
      });
    }
  });
});
// 上传修改动态
app.post("/api/v4/edit/:id", uploadMulti.single("imgSrc"), function(req, res) {
  var data = req.body;
  var file = req.file;
  var filename= file.originalname;
  var d = new Date();
  var ears = filename.split(".");
  var newname = d.getTime() + "." + ears[1];
  fs.rename(file.path, "public/upload/news/" + newname, function(err) {
    if (err) {
      throw err;
    }
  });
  Newsshow.findById(req.params.id, function(err, data) {
    fs.unlink("public/upload/news/" + data.imgSrc, function(err) {
      if (err) {
        console.log(err);
      }
    });
  });
  data.imgSrc = newname;  
  var years =  data.date.split("-")
  data.year = years[0]
  data.month= years[1]
  data.day = years[2]
  Newsshow.findByIdAndUpdate(req.params.id, data, function(error) {
    if (error) {
      res.json({
        code: "error",
        message: "修改失败"
      });
    } else {
      res.json({
        code: "success",
        message: "修改成功"
      });
    }
  });
});
// 删除单个案例
app.post("/delete/case/:id",function(req,res){
  Caseshow.findById(req.params.id, function(err, data) {
    fs.unlink("public/upload/case/" + data.imgSrc, function(err) {
      if (err) {
        console.log(err);
      }
    });
  });
  Caseshow.findByIdAndRemove(req.params.id, function(err) {
    if (err) {
      res.json({
        code: "error",
        message: "删除数据失败"
      });
    } else {
      res.json({
        code: "success",
        message: "删除数据成功"
      });
    }
  });
})
// 删除单个方案
app.post("/delete/news/:id",function(req,res){
  Newsshow.findById(req.params.id, function(err, data) {
    fs.unlink("public/upload/news/" + data.imgSrc, function(err) {
      if (err) {
        console.log(err);
      }
    });
  });
  Newsshow.findByIdAndRemove(req.params.id, function(err) {
    if (err) {
      res.json({
        code: "error",
        message: "删除数据失败"
      });
    } else {
      res.json({
        code: "success",
        message: "删除数据成功"
      });
    }
  });
})
// 轮播图修改后上传
app.post("/api/v2/edit/:id", uploadMulti.single("slideshow"), function(
  req,
  res
) {
  var data = req.body;
  var file = req.file;
  var filename;
  filename = file.originalname;
  var d = new Date();
  var ears = filename.split(".");
  var newname = d.getTime() + "." + ears[1];

  fs.rename(file.path, "public/upload/slideshow/" + newname, function(err) {
    if (err) {
      throw err;
    }
  });
  Slideshow.findById(req.params.id, function(err, data) {
    fs.unlink("public/upload/slideshow/" + data.link, function(err) {
      if (err) {
        console.log(err);
      }
    });
  });
  data.link = newname;
  Slideshow.findByIdAndUpdate(req.params.id, data, function(error) {
    if (error) {
      res.json({
        code: "error",
        message: "修改失败"
      });
    } else {
      res.json({
        code: "success",
        message: "修改成功"
      });
    }
  });
});
// 单个轮播图删除
app.post("/delete/:id", function(req, res) {
  Slideshow.findById(req.params.id, function(err, data) {
    fs.unlink("public/upload/slideshow/" + data.link, function(err) {
      if (err) {
        console.log(err);
      }
    });
  });
  Slideshow.findByIdAndRemove(req.params.id, function(err) {
    if (err) {
      res.json({
        code: "error",
        message: "删除数据失败"
      });
    } else {
      res.json({
        code: "success",
        message: "删除数据成功"
      });
    }
  });
});
// 批量删除案例
app.post("/deletecase",function(req,res){
  var id =req.body.checkedId.split(",");
  for(let i in id){
    Caseshow.findById(id[i], function(err, data) {
      fs.unlink("public/upload/case/" + data.imgSrc, function(err) {
        if (err) {
          console.log(err);
        }
      });
      Caseshow.findByIdAndRemove(id[i], function(err) {
        if (err) {
          console.log(err);
        }
      });
    });
  }
  res.json({
    code: "success",
    message: "删除数据成功"
  });
})
// 批量删除方案
app.post("/deletenews",function(req,res){
  var id =req.body.checkedId.split(",");
  for(let i in id){
    Newsshow.findById(id[i], function(err, data) {
      fs.unlink("public/upload/news/" + data.imgSrc, function(err) {
        if (err) {
          console.log(err);
        }
      });
      Newsshow.findByIdAndRemove(id[i], function(err) {
        if (err) {
          console.log(err);
        }
      });
    });
  }
  res.json({
    code: "success",
    message: "删除数据成功"
  });
})
// 批量轮播图删除
app.post("/deleteall", function(req, res) {
  var id = req.body.checkedId.split(",");
  for (let i in id) {
    Slideshow.findById(id[i], function(err, data) {
      fs.unlink("public/upload/slideshow/" + data.link, function(err) {
        if (err) {
          console.log(err);
        }
      });
      Slideshow.findByIdAndRemove(id[i], function(err) {
        if (err) {
          console.log(err);
        }
      });
    });
  }
  res.json({
    code: "success",
    message: "删除数据成功"
  });
});
// 批量删除产品
app.post("/deleteproduct", function(req, res) {
  var id = req.body.checkedId.split(",");
  for (let i in id) {
    // 删除文件夹
    function delFile(url) {
      var data = fs.readdirSync(url);
      for (var i = 0; i < data.length; i++) {
        var path = url + "/" + data[i];
        var stat = fs.statSync(path);
        if (stat.isFile()) {
          fs.unlinkSync(path);
        } else {
          delFile(path);
        }
      }
      fs.rmdirSync(url);
    }
    Product.findById(id[i], function(err, data) {
      if (err) {
        console.log(err);
      } else {
        fs.exists(`public/upload/product/${id[i]}`, function(exists) {
          if (exists) {
            delFile(`public/upload/product/${id[i]}`); //删除文件夹
          }
        });
      }
    });
    Product.findByIdAndRemove(id[i], function(err) {
      if (err) {
        console.log(err);
      } else {
      }
    });
  }
  res.json({
    code: "success",
    message: "删除数据成功"
  });
});
// 删除产品
app.post("/delete/product/:id", function(req, res) {
  // 删除文件夹
  function delFile(url) {
    var data = fs.readdirSync(url);
    for (var i = 0; i < data.length; i++) {
      var path = url + "/" + data[i];
      var stat = fs.statSync(path);
      if (stat.isFile()) {
        fs.unlinkSync(path);
      } else {
        delFile(path);
      }
    }
    fs.rmdirSync(url);
  }
  Product.findById(req.params.id, function(err, data) {
    if (err) {
      console.log(err);
    } else {
      fs.exists(`public/upload/product/${req.params.id}`, function(exists) {
        if (exists) {
          delFile(`public/upload/product/${req.params.id}`); //删除文件夹
        }
      });
    }
  });
  Product.findByIdAndRemove(req.params.id, function(err) {
    if (err) {
      res.json({
        code: "error",
        message: "删除数据失败"
      });
    } else {
      res.json({
        code: "success",
        message: "删除数据成功"
      });
    }
  });
});
// 获取修改页面
app.get("/edit/:id", function(req, res) {
  Product.findById(req.params.id, function(error, data) {
    if (error) {
      res.send("产品不存在");
    } else {
      var product = data.toObject();
      res.render("product-updata", {
        product: product
      });
    }
  });
});
// 上传修改内容
app.post("/api/v1/edit/:id", uploadMulti.array("img", 3), function(req, res) {
  if (req.session.userName) {
    var data = req.body;
    var files = req.files;
    var fileInfos = [];
    var otherList = [];
    var types = "";
    fs.exists(`public/upload/product/${req.params.id}`, function(exists) {
      if (exists) {
        for (let i in files) {
          var file = files[i];
          fs.rename(
            file.path,
            "public/upload/product/" + req.params.id + "/" + file.originalname,
            function(err) {
              if (err) {
                throw err;
              }
            }
          );
        }
      } else {
        fs.mkdir(`public/upload/product/${req.params.id}`, function(err) {
          if (err) {
            console.log(err);
          } else {
            for (let i in files) {
              var file = files[i];
              fs.rename(
                file.path,
                "public/upload/product/" +
                  req.params.id +
                  "/" +
                  file.originalname,
                function(err) {
                  if (err) {
                    throw err;
                  }
                }
              );
            }
          }
        });
      }
    });
    for (let i in files) {
      var file = files[i];
      var fileInfo = {};
      var style = {};
      style.backgroundImage =
        "url(/upload/product/" + req.params.id + "/" + file.originalname + ")";
      style.backgroundSize = "100%";
      style.backgroundRepeat = "no-repeat";
      style.backgroundPosition = "center";
      fileInfo.style = style;
      fileInfos.push(fileInfo);
    }
    if (req.body.type == "yjcp") {
      types = "硬件产品";
      otherList = [
        {
          label: "应用软件",
          link: "product_detail.html?id=" + req.params.id + "&type=yyrj"
        },
        {
          label: "周边产品",
          link: "product_detail.html?id=" + req.params.id + "&type=zbcp"
        }
      ];
    } else if (req.body.type == "yyrj") {
      types = "应用软件";
      otherList = [
        {
          label: "硬件产品",
          link: "product_detail.html?id=" + req.params.id + "&type=yjcp"
        },
        {
          label: "周边产品",
          link: "product_detail.html?id=" + req.params.id + "&type=zbcp"
        }
      ];
    } else {
      types = "周边产品";
      otherList = [
        {
          label: "硬件产品",
          link: "product_detail.html?id=" + req.params.id + "&type=yjcp"
        },
        {
          label: "应用软件",
          link: "product_detail.html?id=" + req.params.id + "&type=yyrj"
        }
      ];
    }

    data.imgSrc =
      "upload/product/" + req.params.id + "/" + files[0].originalname;
    data.href =
      "product_detail.html?id=" + req.params.id + "&" + "type=" + req.body.type;
    data.imgList = fileInfos;
    data.otherList = otherList;
    data.types = types;
    Product.findByIdAndUpdate(req.params.id, data, function(error) {
      if (error) {
        res.json({
          code: "error",
          message: "修改失败"
        });
      } else {
        res.json({
          code: "success",
          message: "修改成功"
        });
      }
    });
  } else {
    res.redirect("/login");
  }
});

// 退出
app.get("/logout", function(req, res) {
  req.session.userName = null; // 删除session
  res.redirect("/");
});
app.listen(3000, function() {
  console.log("http://localhost:3000");
});
