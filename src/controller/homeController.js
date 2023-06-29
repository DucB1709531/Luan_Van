import { render } from "ejs";
import pool from "../config/connectDB";
import { json } from "body-parser";
import nodemailer from 'nodemailer';
import smtpTransport from 'nodemailer-smtp-transport';
import axios from 'axios';
const crypto = require('crypto');
// var XLSX = require('xlsx');
// const multer = require("multer");
const Lead = require("../../node_modules/lead");
const path = require('path');

let getChatPage = async (req, res) => {
    return res.render('chat.ejs')
}

// home page
let getHomepage = async (req, res) => {
    // await pool.execute(`update phuhuynh SET email = 'ducb1709531@student.ctu.edu.vn'`)

    // let workbook = XLSX.readFile('./src/public/file/diem.xlsx');
    // let sheet_name_list = workbook.SheetNames;
    // let xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
    // let a = Object.values(JSON.parse(JSON.stringify(xlData[0])))
    // console.log(xlData.length);

    // let [a] = await pool.execute('select id from hocsinh')
    // // console.log(a)
    // for (let i = 0; i < a.length; i++) {
    //     let chieuCao = 100 + Math.floor(Math.random() * 10);
    //     let canNang = 40 + Math.floor(Math.random() * 10);
    //     let tt = Math.floor(Math.random() * (4 - 1)) + 1;
    //     let soMuiCovid = Math.floor(Math.random() * (4 - 1)) + 1;
    //     let tinhTrangSK = ""
    //     switch (tt) {
    //         case 1: tinhTrangSK = "Tot";
    //             break;
    //         case 2: tinhTrangSK = "Beo Phi";
    //             break;
    //         case 3: tinhTrangSK = "Suy Dinh Duong";
    //             break;
    //     }
    //     await pool.execute('update suckhoe set chieuCao = ?, canNang = ?, tinhTrangSK = ?, soMuiCovid = ?, lichKham = "2023-06-2" where idHS = ?',
    //         [chieuCao, canNang, tinhTrangSK, soMuiCovid, a[i].id])
    // }

    // let a = new Date()
    // console.log(a.toLocaleString())
    // let [b] = await pool.execute('select * from date')
    // let ngay = b[0].date.getDate()
    // console.log(ngay)
    // console.log(b[0].date)

    // let [hs] = await pool.execute('select id from hocsinh')
    // console.log(hs)
    // for (let i = 0; i < hs.length; i++) {
    //     await pool.execute('update hocsinh set ngaySinh = "2016-01-01" where id = ?', [hs[i].id])
    // }

    return res.render('index.ejs')
}

// dang nhap page
let getDangNhapPage = (req, res) => {
    // console.log('ok')
    return res.render('dangNhap.ejs')
}

// thuc hien dang nhap khi nhan nut 'dang nhap'
let dangNhap = async (req, res) => {
    // console.log(req.body.taiKhoan)
    let { taiKhoan, matKhau } = req.body
    // console.log(taiKhoan)
    let [tk] = await pool.execute('select * from `taikhoan` where `taiKhoan` = ? and `matKhau` = ?', [taiKhoan, matKhau])
    // console.log(tk[0])
    let a = JSON.stringify(tk)
    if (a != '[]') {
        // neu loai tai khoan == 1 (Admin) -> tra ve view cua admin
        if (tk[0].loaiTK == 1) {
            // return res.send('Hello Admin!')
            return res.redirect('/admin')
        }

        if (tk[0].loaiTK == 2) {// neu loaiTK == 2 (Giao Vien):
            // lay id Giao Vien
            let [idGV] = await pool.execute('select id from giaovien where coTK = ?', [tk[0].idTK])
            let id = idGV[0].id
            // chuyen id ve dang chuoi~ stringA: id
            let stringA = JSON.stringify(id)
            // tao 1 chuoi la link duong dan~
            let stringB = '/giao-vien/'
            // cộng hai link này lại thành 1 chuỗi là đường dẫn cho router
            let stringC = stringB + stringA // stringC: "/giao-vien/:id"
            // console.log(stringC)
            // trả về đường dẫn view giáo viên aka getViewGiaoVien -> /giao-vien/:id (yes! I'm a genius :v)
            // dùng stringC như là 1 đường dẫn bình thường và có thể lấy được params:
            return res.redirect(stringC) // trời ơi sao mà mình thông minh quá vậy ta! muahahahahahahahaha!!!! :)))
        }
        if (tk[0].loaiTK == 3) {
            // lấy id phụ huynh
            let [idPH] = await pool.execute('select id from phuhuynh where coTK = ?', [tk[0].idTK])
            // console.log(idPH[0].id)
            let stringA = '/phu-huynh/' + idPH[0].id
            // console.log(stringA)
            return res.redirect(stringA)
        }
        if (tk[0].loaiTK == 4) {
            return res.send('Hello Khach!')
        }
    }
    return res.render('loiDangNhap.ejs')
}

let quenMatKhau = async (req, res) => {
    return res.render('quenMatKhau.ejs')
}

let maXacMinh = async (req, res) => {
    // console.log(req.body.taikhoan)
    let [tk] = await pool.execute('select * from taikhoan where taiKhoan = ?', [req.body.taikhoan])
    let stringa = JSON.stringify(tk)
    if (stringa == '[]') {
        res.send('tài khoản không tồn tại!')
    }
    req.session.taikhoan = req.body.taikhoan
    // console.log(tk)
    let [phuhuynh] = await pool.execute('select * from phuhuynh where coTK = ?', [tk[0].idTK])
    let email = phuhuynh[0].email
    // console.log(email)
    // Tạo mã xác minh ngẫu nhiên gồm 6 chữ số
    var verificationCode = Math.floor(100000 + Math.random() * 900000);
    req.session.verificationCode = verificationCode;
    let transporter = nodemailer.createTransport(
        smtpTransport({
            service: 'gmail',
            auth: {
                user: 'huynhduc22031999st@gmail.com',
                pass: 'ylgrlwtegwebxssj', // pass lấy trong cài đặt app password của gmail, KHÔNG PHẢI mật khẩu của gmail!
                // nghĩa là giáo viên phải vào cài đặt của gmail -> tạo app password -> nhập password (ở đây lấy pass xong nhập vô code luôn để demo, sau này làm chức năng cho giáo viên nhập sau :v )
            },
        })
    );

    let mailOptions = {
        from: 'huynhduc22031999st@gmail.com', // người gửi (ở đây làm ví dụ nên lấy email riêng của em)
        to: email, //người nhận (email của phụ huy), ở đây làm ví dụ nên lấy email của em (email trường cấp)
        subject: 'Mã xác minh', //tiêu đề email
        text: 'mã xác minh của bạn là: ' + verificationCode, // nội dung e mail
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) { // nếu lỗi: console.log lỗi
            console.log('Lỗi Gửi Email:', error);
        } else {// nếu đã gửi được: thông báo đã gửi xong
            console.log('Email đã gửi đến <' + email + '> thành công!');
        }
    });

    return res.render('nhapMaXacMinh.ejs', { verificationCode })
}

let nhapMatKhauMoi = async (req, res) => {
    const { maXM } = req.body;
    // console.log(maXM)
    // console.log(req.session.verificationCode)
    // console.log(req.session.taikhoan)
    // Kiểm tra mã xác minh
    if (maXM != req.session.verificationCode) {
        return res.send('Mã xác minh không đúng. Vui lòng thử lại.');
    }

    return res.render('nhapMatKhauMoi.ejs')
}

let resetMatKhau = async (req, res) => {
    // console.log(req.body.matKhauMoi)
    // console.log(req.session.taikhoan)
    let taiKhoan = req.session.taikhoan
    let matKhau = req.body.matKhauMoi
    await pool.execute('UPDATE taikhoan SET matKhau = ? where taiKhoan = ?', [matKhau, taiKhoan])
    return res.render('doiMatKhauXong.ejs')
}

// view admin
let getViewAdmin = (req, res) => {
    return res.render('viewAdmin.ejs')
}

// view Giao Vien
let getViewGiaoVien = async (req, res) => {
    // console.log('params truyen len: ', req.params.id)
    let idGV = req.params.id
    let [giaovien] = await pool.execute('select * from giaovien where id = ?', [idGV])
    // console.log(giaovien[0].hoTenGV)
    let hoTenGV = giaovien[0].hoTenGV
    return res.render('viewGiaoVien.ejs', { detailsGiaoVien: giaovien[0], idGV, hoTenGV })
}


let getViewPhuHuynh = async (req, res) => {
    // console.log(req.params.idPH)
    let idPH = req.params.idPH
    let [phuhuynh] = await pool.execute('select * from phuhuynh where id = ?', [idPH])
    // console.log(phuhuynh[0])
    let hoTenPH = phuhuynh[0].hoTenPH
    // console.log(hoTenPH)
    let [dsHocSinh] = await pool.execute('select id, hoTen from hocsinh where idPH = ?', [idPH])
    // console.log(dsHocSinh)
    return res.render('viewPhuHuynh.ejs', { idPH, hoTenPH, dsHocSinh })
}




module.exports = {
    getHomepage, getViewAdmin, dangNhap, getDangNhapPage, quenMatKhau, maXacMinh, getViewGiaoVien,
    getViewPhuHuynh, getChatPage, nhapMatKhauMoi, resetMatKhau
}