const db = require('./db');
 
//统计总数
module.exports.count = (cb) => {
    let sql = 'select count(*) as total from comments';
    db.query(sql, cb);
}

// 统计待审核数
module.exports.held = (cb) => {
    let sql = 'select count(*) as held from comments where status="held"';
    db.query(sql, cb);
}

//查询
module.exports.select = (cb) => {
    let sql = 'SELECT comments.*, posts.title FROM `comments` LEFT JOIN `posts` ON comments.post_id=posts.id ORDER BY comments.id DESC LIMIT 0, 10';
    // let sql = 'select * from comments order by id desc limit 0,20';
    db.query(sql, cb);
}

//修改
module.exports.update = (data, cb) => {
    let id = data.id;
    delete id;
    let sql = 'update comments set ? where id = ?';
    db.query(sql, [data, id], cb);
}