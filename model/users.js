const db = require('./db');

// 验证用户
module.exports.auth = (data, cd) => {
    let sql = 'select * from users where email=?';

    db.query(sql, data.email, (err, rows) => {
        if (rows.length && rows[0].password == data.password) {
            cd(false, rows[0]);
        } else {
            cd(true);
        }
    })
    /* 第二种方式
    let sql = 'select * from users where email=? and password=?';
    db.query(sql, [data.email, data.password], (err, result) => {
        if (result.length) {
            cd(false, { msg: '登录成功' });
        } else {
            cd(true);
        }
    })  */

}

// 根据用户id查询用户
module.exports.findUser = (id, cb) => {
    let sql = 'select * from users where id=?';
    db.query(sql, id, (err, rows) => {
        // 查询结果语法糖
        if (!err) return cb(null, rows[0]);
        cb({ msg: '查询失败' });
    })

}

// 修改用户信息
module.exports.update = (data, cb) => {
    let id = data.id;
    delete data.id;
    let sql = 'update users set ? where id=?';
    db.query(sql, [data,id], (err) => {
        if (!err) return cb(null);
        cb({ msg: '错误' });
    })
}

// 查询用户列表
module.exports.select = (cb) => {
    let sql = 'select * from users';
    db.query(sql, (err, rows) => {
        if (!err) return cb(null, rows);
        cb(err);
    })
}

// 删除用户
module.exports.delete = (id, cb) => {
    
    let sql = 'delete from users where id=?';
    // 语法盐
    /* db.query(sql, id, (err) => {
        if (!err) return cb(err);
        cb(err);
    }) */
    // 语法糖
    db.query(sql, id, cb);

}

// 新增用户
module.exports.insert = (data, cb) => {
    let sql = 'insert into users set ?';
    // 语法盐
    /* db.query(sql, data, (err) => {
        if (!err) return cb(null);
        cb(err);
    }) */
    // 语法糖
    db.query(sql, data, cb);

}

