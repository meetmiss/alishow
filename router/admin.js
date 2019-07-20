const express = require('express');
const router = express.Router();
const users = require('../model/users');
const posts = require('../model/posts');
const categories = require('../model/categories');
const comments = require('../model/comments');
const moment = require('moment');
const path = require('path');
// 文件上传中间件/调用
const multer = require('multer');
// const upload = multer({ dest: 'uploads/' });
const storage = multer.diskStorage({
    //设置文件路径
    destination: (req, file, cb) => {
        cb(null, './public/uploads');
    },
    //设置文件后缀
    filename: (req, file, cb) => {
        //用parse方式是获取文件的所有信息名字、后缀等
        // const ext = path.parse(file.originalname).ext;
        // console.log(ext);

        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + Date.now() + ext);
    }
})
const upload = multer({ storage: storage });

// 后台主页
router.get('/', (req, res) => {
    posts.count((err, post) => {    //为什么此处填写posts会报错→drafted不是函数
        // console.log(post);
        posts.drafted((err, drafted) => {
            // console.log(drafted);
            categories.count((err, category) => {
                // console.log(category);
                comments.count((err, comment) => {
                    // console.log(comment);
                    comments.held((err, held) => {
                        // console.log(held);
                        res.render('admin/index', {
                            post: post.total,
                            drafted: drafted[0].drafted,
                            category: category[0].total,
                            comment: comment[0].total,
                            held: held[0].held
                        });
                    })
                })
            })
        })
    })
})
// 登录页
router.get('/login', (req, res) => {
    res.render('admin/login');
})
// 处理登录逻辑
router.post('/login', (req, res) => {
    users.auth(req.body, (err, row) => {
        if (!err) {
            req.session.userInfo = row;
            res.json({
                code: 1000,
                msg: '登录成功---'
            });
        } else {
            res.json({
                code: 1001,
                msg: '登录失败'
            });
        }
    });
})

//个人中心
router.get('/profile', (req, res) => {
    let id = req.session.userInfo.id;
    // console.log(id);

    users.findUser(id, (err, row) => {
        // 语法糖
        if (!err) return res.render('admin/profile', row);
        res.send('失败'); //只是传字符串，用send即可
    })

})

// 接收上传信息
router.post('/uploader', upload.single('pic'), (req, res) => {
    // multer文件提交
    res.json(req.file);
})

// 处理个人资料更新
router.post('/profile/update', (req, res) => {
    // console.log(req.body);
    req.body.id = req.session.userInfo.id;
    users.update(req.body, (err) => {
        if (!err) res.json({ code: 10000, mag: '成功' });
        res.json({ code: 10001, mag: '失败' });
    })

    // res.json();
})

//退出登录
router.get('/logout', (req, res) => {
    // 第一种：将session的内容赋值为空
    // req.session.userInfo = null;
    //第二种：直接删除session
    req.session.destroy();
    res.redirect('admin/login');

})

// 渲染修改密码页面
router.get('/password', (req, res) => {
    res.render('admin/password');
})

// 修改密码逻辑
router.post('/password', (req, res) => {
    // 判断旧密码
    if (req.body.oldpassword != req.session.userInfo.password) {
        return res.json({ code: 10001, msg: '原始密码有误' })
    }

    // 更新密码
    req.body.id = req.session.userInfo.id;
    //只能在这儿删除，因为其他页面还需要password这项，故user中不能删除
    delete req.body.oldpassword;

    users.update(req.body, (err) => {
        if (!err) {
            req.session.userInfo = null;
            return res.json({ code: 10000, msg: '修改成功' });
        }
        res.json({ code: 10001, msg: '修改失败' });
    });

})

//处理删除用户
router.post('/users/delete', (req, res) => {
    // console.log(req.body.id);

    users.delete(req.body.id, (err) => {
        if (!err) return res.json({ code: 10000, msg: '成功' });
        res.json({ code: 10001, msg: '失败' });
    })
})

// 渲染用户管理页面
router.get('/users', (req, res) => {
    users.select((err, rows) => {
        if (!err) return res.render('admin/users',
            {
                users: rows,
                title: '添加新用户',
                url: '/admin/users/add'
            });
        res.send('列表失败');
    })

})

// 添加新用户
router.post('/users/add', (req, res) => {
    // 增加status字段
    req.body.status = 'actived';

    users.insert(req.body, (err) => {
        if (!err) return res.json({ code: 10000, msg: '添加成功' });
        res.json({ code: 10001, msg: '添加失败' });
    })

})

// 渲染用户编辑
router.get('/users/edit', (req, res) => {
    users.findUser(req.query.id, (err, row) => {
        // 有问题
        users.select((err, rows) => {
            if (!err) return res.render('admin/users',
                {
                    //单一用户
                    user: row,
                    //用户列表
                    users: rows,
                    title: '编辑用户',
                    url: '/admin/users/update'

                });
            // console.log(user);
            res.send('编辑失败');
        })

        // if (!err) return res.render('admin/users', row);
    })

})

//修改用户
router.post('/users/update', (req, res) => {

    users.update(req.body, (err) => {
        if (!err) return res.json({ code: 10000, msg: '修改成功' });
        res.json({ code: 10001, msg: '修改失败' });
    })

})

//文章
router.get('/posts', (req, res) => {
    let { page = 1, size = 2 } = req.query;

    posts.count((err, row) => {
        // 获取页数
        /* let pages = [];
        let number = Math.ceil(row.total / size);
        for (let i = 1; i <= number; i++){
            pages.push(i);
        } */

        posts.select(page, size, (err, rows) => {
            rows.forEach((val) => {
                val.created = moment(val.created).format('YYYY-MM-DD');
            })

            if (!err) {
                return res.render('admin/posts',
                    {
                        posts: rows,
                        total: row.total,
                        number: Math.ceil(row.total / size),
                        // pages: pages
                        currentPage: page
                    }
                );
            }
            res.send('查询失败');
        })

    })


})

// 渲染文章添加
router.get('/posts/add', (req, res) => {
    res.render('admin/addpost');
})

//添加逻辑
router.post('/posts/add', (req, res) => {
    req.body.user_id = req.session.userInfo.id;

    posts.insert(req.body, (err) => {
        if (!err) return res.json({ code: 1000, msg: '添加成功' });
        res.json({ code: 10001, msg: '添加失败' });
    })
})

//删除文章
router.post('/posts/delete', (req, res) => {
    posts.delete(req.body.id, (err) => {
        if (!err) return res.json({ code: 10000, msg: '删除成功' });
        res.json({ code: 10001, msg: '删除失败' });
    })
})

//渲染文章编辑页面
router.get('/posts/edit', (req, res) => {
    posts.findPost(req.query.id, (err, rows) => {
        if (!err) return res.render('admin/editpost', rows[0]);
        res.send('查询失败');
    })

    // res.render('admin/editpost');
})

// 编辑文章
router.post('/posts/update', (req, res) => {
    posts.update(req.body, (err) => {
        if (!err) return res.json({ code: 10000, msg: '修改成功' });
        res.json({ code: 10001, msg: '修改失败' });
    })
})

//渲染分类页面
router.get('/categories', (req, res) => {
    categories.select((err, rows) => {
        if (!err) {
            return res.render('admin/categories', {
                categories: rows,
                title: '添加分类',
                url: '/admin/categories/add',
            });
        }
    })
})

// 分类数据的添加逻辑
router.post('/categories/add', (req, res) => {
    categories.insert(req.body, (err) => {
        if (!err) return res.json({ code: 10000, msg: '添加成功' });
        res.json({ code: 10001, msg: '添加失败' });
    })
    
})

//删除分类逻辑
router.post('/categories/delete', (req, res) => {
    categories.delete(req.body.id, (err) => {
        if (!err) return res.json({ code: 10000, msg: '删除成功' });
        res.json({ code: 10001, msg: '删除失败' });
    })
})

//渲染编辑页面
router.get('/categories/edit', (req, res) => {
    categories.select((err, rows) => {
        //单一查询
        categories.findCategory(req.query.id, (err, row) => {
            res.render('admin/categories', {
                categories: rows,
                category: row,
                title: '编辑分类',
                url: '/admin/categories/update',
            });
        })
    })
})

//编辑分类逻辑
router.post('/categories/update', (req, res) => {
    categories.update(req.body, (err) => {
        if (!err) return res.json({ code: 10000, msg: '更新成功' });
        res.json({ code: 10001, msg: '更新失败' });
    })
})

//渲染评论页面
router.get('/comments', (req, res) => {
    comments.select((err, rows) => {
        rows.forEach((val) => {
            val.content = val.content.slice(0, 30) + '...';
            val.created = moment(val.created).format('YYYY-MM-DD');
        })
        if (!err) return res.render('admin/comments', { comments: rows });
        res.send('渲染失败');
    })
})

router.get('/comments/handle', (req, res) => {
    comments.update(req.query, (err) => {
        if (!err) return res.json({ code: 10000, msg: '操作成功' });
        res.json({ code: 10001, msg: '操纵失败' });
    })
})





module.exports = router;