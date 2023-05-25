// get the client
import mysql from 'mysql2/promise';

// tạo kết nối tới database (dùng tk root hết, xong vào database phân quyền dữa vào bảng usertype)
console.log("Creating connection pool...");
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'truongtieuhoc',
    // password: 'pass word'
});


export default pool;