const db = require('./db');

//同级分类的数量
module.exports.count = (cb) => {
    let sql = 'select count(*) as total from categories';
    db.query(sql, cb);
}

//查询列表
module.exports.select = (cb) => {
    let sql = 'select * from categories';
    db.query(sql, cb);
}

// 新增分类
module.exports.insert = (data, cb) => {
    let sql = 'insert into categories set ?';
    db.query(sql, data, cb);
}

//删除分类
module.exports.delete = (id, cb) => {
    let sql = 'delete from categories where id=?';
    db.query(sql, id, cb);
}

//查询单一数据
module.exports.findCategory = (id, cb) => {
    let sql = 'select * from categories where id = ?';
    db.query(sql, id, (err, rows) => {
        if (!err) return cb(null, rows[0]);
        cb(err);
    });
}

//更新数据
module.exports.update = (data, cb) => {
    let id = data.id;
    delete id;
    let sql = 'update categories set ? where id=?';
    db.query(sql, [data, id], cb);
}