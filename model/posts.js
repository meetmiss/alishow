const db = require('./db');

// 查询所有列表
module.exports.select = (page, size, cb) => {
    let offert = (page - 1) * size;

    let sql = 'select p.* , u.nickname, c.name from posts as p join users as u on p.id=u.id join categories as c on p.category_id=c.id limit ?,?';
    db.query(sql, [offert, size - 0], cb);
}

// 总数
module.exports.count = (cb) => {
    let sql = 'select count(*) as total from posts';
    db.query(sql, (err, rows) => {
        if (!err) return cb(null, rows[0]);
        cb(err);
    })
}

// 添加文章
module.exports.insert = (data, cb) => {
    let sql = 'insert into posts set ?';
    db.query(sql, data, cb);
}

// 删除
module.exports.delete = (id, cb) => {
    let sql = 'delete from posts where id=?';
    db.query(sql, id, cb);
}

// 查询单一文章
module.exports.findPost = (id, cb) => {
    let sql = 'select * from posts where id=?';
    db.query(sql, id, cb);
}

// 修改
module.exports.update = (data, cb) => {
    let id = data.id;
    delete id;
    let sql = 'update posts set ? where id=?';
    db.query(sql, [data, id], cb);
}

//草稿文章数量
module.exports.drafted = (cb) => {
    let sql = 'select count(*) as drafted from posts where status="drafted"';
    db.query(sql, cb);
}
