import pool from "../config/connectDB";
let getAllUsers = async (req, res) => {
    const [rows, fields] = await pool.execute('SELECT * FROM users');
    return res.status(200).json({
        message: 'Nguyen Huynh Duc',
        data: rows
    })
}

let createNewUser = async (req, res) => {
    let { firstName, lastName, email, phone, address } = req.body;
    // check dieu kien (tham so truyen vao)
    if (!firstName || !lastName || !email || !phone || !address) {
        return res.status(200).json({
            // neu sai: in ra message:
            message: 'missing reqiuered params'
        })
    }

    await pool.execute('insert into users(firstName, lastName, email, phone, address) values (?, ?, ?, ?, ?)',
        [firstName, lastName, email, phone, address])

    return res.status(200).json({
        //neu dung: in ra message:
        message: 'ok'
    })
}

let updateUser = async (req, res) => {
    let { firstName, lastName, email, phone, address, id } = req.body;
    // check dieu kien (tham so truyen vao)
    if (!firstName || !lastName || !email || !phone || !address || !id) {
        return res.status(200).json({
            // neu sai: in ra message:
            message: 'missing reqiuered params'
        })
    }

    await pool.execute('update users set firstName = ?, lastName = ?, email = ?, phone = ?, address = ? where id = ?',
        [firstName, lastName, email, phone, address, id]);

    return res.status(200).json({
        //neu dung: in ra message:
        message: 'ok'
    })
}

let deleteUser = async (req, res) => {
    let userId = req.params.id;
    //check dieu kien: truyen id
    if (!userId) {
        return res.status(200).json({
            // neu sai: in ra message:
            message: 'missing reqiuered params'
        })
    }

    await pool.execute('delete from users where id = ?', [userId])
    return res.status(200).json({
        //neu dung: in ra message:
        message: 'ok'
    })
}

module.exports = {
    getAllUsers, createNewUser, updateUser, deleteUser
}