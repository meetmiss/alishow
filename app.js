const express = require('express');
const app = express();
app.listen(3000, () => {
    console.log('running...');
})
const path = require('path');
const home = require('./router/home');
const admin = require('./router/admin');


const session = require('express-session');
app.use(session({
    secret: 'qwehwirouer',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));
app.use('/admin', (req, res, next) => {
    // 记录当前登录者信息
    app.locals.userInfo = req.session.userInfo;

    // 判断是否登录
    if (!req.session.userInfo && req.originalUrl != '/admin/login') {
        // return res.redirect('/admin/login');
    }

    next();
});
//ctpl是express的模板引擎
app.set('view engine', 'xtpl');
//默认路径设置
app.set('views', path.join(__dirname, 'views'))
// 静态资源托管
//使用相对路径可能会报错，故需都更改成绝对路径
app.use(express.static(path.join(__dirname, 'public')));
app.use('/public',express.static(path.join(__dirname, 'public')));

// 新方法处理post数据
// app.use(express.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: true }));

app.use('/home', home);
app.use('/admin', admin);
// app.use('/posts', admin);

app.get('/index', (req, res) => {
    res.render('home/index');
})
/* app.get('/admin', (req, res) => {
    res.render('admin/index');
}) */
