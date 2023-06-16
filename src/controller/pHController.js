import { render } from "ejs";
import pool from "../config/connectDB";
import { json } from "body-parser";
import nodemailer from 'nodemailer';
import smtpTransport from 'nodemailer-smtp-transport';
const puppeteer = require('puppeteer');
// var XLSX = require('xlsx');
// const multer = require("multer");
const Lead = require("../../node_modules/lead");
const path = require('path');




let phuHuynhXemThongTinHocSinh = async (req, res) => {
    // console.log(req.params)
    let { idPH, idHS } = req.params

    let [hocsinh] = await pool.execute('select * from hocsinh where id = ?', [idHS])
    // console.log(hocsinh[0])
    let hoTenHS = hocsinh[0].hoTen

    let [phuhuynh] = await pool.execute('select * from phuhuynh where id = ?', [idPH])
    // console.log(phuhuynh[0].hoTenPH)
    let hoTenPH = phuhuynh[0].hoTenPH
    let soDienThoaiPH = phuhuynh[0].soDienThoai

    let idLop = hocsinh[0].idLop
    let [lop] = await pool.execute('select * from lophoc where id = ?', [idLop])
    // console.log(lop)
    let tenLop = lop[0].tenLop

    let [giaovien] = await pool.execute('select * from giaovien where id = ?', [lop[0].idGV])
    // console.log(giaovien[0])
    let hoTenGV = giaovien[0].hoTenGV
    let soDienThoaiGV = giaovien[0].soDienThoaiGV

    let [namhoc] = await pool.execute('select id from namhoc where tinhTrang = 1')
    // console.log(namhoc[0].id)
    let idNamHoc = namhoc[0].id

    let [diem1] = await pool.execute('select * from diem where idHS = ? AND idHK = 1 AND idNamHoc = ?', [idHS, idNamHoc])
    // console.log(diem1[0])
    let diemHK1 = diem1[0]
    let a = JSON.stringify(diem1)
    if (a == '[]') {
        diemHK1 = {
            diemToan: 'chưa có',
            diemTiengViet: 'chưa có',
            diemDaoDuc: 'chưa có',
            diemTNXH: 'chưa có',
            diemKhoaHoc: 'chưa có',
            diemLSDL: 'chưa có',
            diemTheDuc: 'chưa có',
            diemAmNhac: 'chưa có',
            diemRenLuyen: 'chưa có',
            nhanXet: 'chưa có'
        }
    }

    let [diem2] = await pool.execute('select * from diem where idHS = ? AND idHK = 2 AND idNamHoc = ?', [idHS, idNamHoc])
    // console.log(diem2[0])
    let diemHK2 = diem2[0]
    let b = JSON.stringify(diem2)
    if (b == '[]') {
        diemHK2 = {
            diemToan: 'chưa có',
            diemTiengViet: 'chưa có',
            diemDaoDuc: 'chưa có',
            diemTNXH: 'chưa có',
            diemKhoaHoc: 'chưa có',
            diemLSDL: 'chưa có',
            diemTheDuc: 'chưa có',
            diemAmNhac: 'chưa có',
            diemRenLuyen: 'chưa có',
            nhanXet: 'chưa có'
        }
    }
    let diemCN = {}
    if (a != '[]' && b != '[]') {
        diemCN = {
            diemToan: (diemHK1.diemToan + diemHK2.diemToan * 2) / 3,
            diemTiengViet: (diemHK1.diemTiengViet + diemHK2.diemTiengViet * 2) / 3,
            diemDaoDuc: (diemHK1.diemDaoDuc + diemHK2.diemDaoDuc * 2) / 3,
            diemTNXH: (diemHK1.diemTNXH + diemHK2.diemTNXH * 2) / 3,
            diemKhoaHoc: (diemHK1.diemKhoaHoc + diemHK2.diemKhoaHoc * 2) / 3,
            diemLSDL: (diemHK1.diemLSDL + diemHK2.diemLSDL * 2) / 3,
            diemTheDuc: diemHK2.diemTheDuc,
            diemAmNhac: diemHK2.diemAmNhac,
            diemRenLuyen: diemHK2.diemRenLuyen,
            nhanXet: diemHK2.nhanXet
        }
    }
    else {
        diemCN = {
            diemToan: 'chưa có',
            diemTiengViet: 'chưa có',
            diemDaoDuc: 'chưa có',
            diemTNXH: 'chưa có',
            diemKhoaHoc: 'chưa có',
            diemLSDL: 'chưa có',
            diemTheDuc: 'chưa có',
            diemAmNhac: 'chưa có',
            diemRenLuyen: 'chưa có',
            nhanXet: 'chưa có'
        }
    }
    // console.log(diemCN)
    // console.log(diemHK1, diemHK2)
    return res.render('pHXemDiemHS.ejs', { idPH, idHS, hoTenHS, hoTenPH, tenLop, hoTenGV, diemHK1, diemHK2, soDienThoaiPH, soDienThoaiGV, diemCN })
}

let phuHuynhXemSucKhoeHocSinh = async (req, res) => {
    // console.log(req.params)
    let { idPH, idHS } = req.params

    let [hocsinh] = await pool.execute('select * from hocsinh where id = ?', [idHS])
    // console.log(hocsinh[0])
    let hoTenHS = hocsinh[0].hoTen

    let [phuhuynh] = await pool.execute('select * from phuhuynh where id = ?', [idPH])
    // console.log(phuhuynh[0].hoTenPH)
    let hoTenPH = phuhuynh[0].hoTenPH
    let soDienThoaiPH = phuhuynh[0].soDienThoai

    let idLop = hocsinh[0].idLop
    let [lop] = await pool.execute('select * from lophoc where id = ?', [idLop])
    // console.log(lop)
    let tenLop = lop[0].tenLop

    let [giaovien] = await pool.execute('select * from giaovien where id = ?', [lop[0].idGV])
    // console.log(giaovien[0])
    let hoTenGV = giaovien[0].hoTenGV
    let soDienThoaiGV = giaovien[0].soDienThoaiGV

    let [suckhoe] = await pool.execute('select * from suckhoe where idHS = ? ', [idHS])
    // console.log(suckhoe[0].lichKham) //2023-06-01T17:00:00.000Z

    // chuyển định dạng ngày từ 2023-06-01T17:00:00.000Z sang 2/6/2023
    // console.log(suckhoe[0].lichKham.getDate())
    let day = suckhoe[0].lichKham.getDate()
    // console.log(suckhoe[0].lichKham.getMonth())
    let month = suckhoe[0].lichKham.getMonth() + 1
    // console.log(suckhoe[0].lichKham.getFullYear())
    let year = suckhoe[0].lichKham.getFullYear()
    let date = day + '/' + month + '/' + year
    // console.log(date)
    suckhoe[0].lichKham = date

    let sucKhoeHS = suckhoe[0]
    let a = JSON.stringify(suckhoe)
    if (a == '[]') { // nếu tình trạng SK của hs đó chưa có (chưa nhập), thì truyền vào chuỗi rỗng.
        sucKhoeHS = {
            chieuCao: '',
            canNang: '',
            tinhTrangSK: '',
            soMuiCovid: '',
            lichKham: ''
        }
    }
    // console.log(sucKhoeHS)
    return res.render('phXemSucKhoeHS.ejs', { idHS, hoTenHS, hoTenPH, tenLop, hoTenGV, sucKhoeHS, soDienThoaiPH, soDienThoaiGV })
}


let PHXemThongBaoLop = async (req, res) => {
    let { idPH, idHS } = req.params
    // console.log(idPH, idHS)
    let [lop] = await pool.execute('select idLop from hocsinh where id = ?', [idHS])
    // console.log(lop[0].idLop)
    let idLop = lop[0].idLop

    let [tb] = await pool.execute('select * from thongbao where idLop = ?', [idLop])
    // console.log(tb)
    for (let i = 0; i < tb.length; i++) {// chuyển đổi ngày tháng để in ra file view
        let day = tb[i].ngayViet.getDate()
        let month = tb[i].ngayViet.getMonth() + 1
        let year = tb[i].ngayViet.getFullYear()
        let date = day + '/' + month + '/' + year
        tb[i].ngayViet = date
    }
    let [dsHocSinh] = await pool.execute('select id, hoTen from hocsinh where idPH = ?', [idPH])

    // họ tên phụ huynh (truyền vào file ejs)
    let [phuhuynh] = await pool.execute('select * from phuhuynh where id = ?', [idPH])
    // console.log(phuhuynh[0])
    let hoTenPH = phuhuynh[0].hoTenPH

    //lấy họ tên giáo viên
    let [lophoc] = await pool.execute('select * from lophoc where id = ?', [idLop])
    let [giaovien] = await pool.execute('select hoTenGV from giaovien where id = ?', [lophoc[0].idGV])
    // console.log(giaovien[0].hoTenGV)
    let hoTenGV = giaovien[0].hoTenGV

    //lấy tên học sinh
    let [tenHS] = await pool.execute('select hoTen from hocsinh where id = ?', [idHS])
    // console.log(tenHS[0].hoTen)
    let hoTenHS = tenHS[0].hoTen

    //tên lớp
    let [tenlop] = await pool.execute('select tenLop from lophoc where id = ?', [idLop])
    let tenLop = tenlop[0].tenLop

    // render file ejs, truyền các tham số vào
    return res.render('phXemTBLop.ejs', { idPH, thongBao: tb, dsHocSinh, hoTenPH, hoTenGV, hoTenHS, tenLop })
}

let xuatDiemRaPDF = async (req, res) => {
    console.log(req.query)
    return res.send('ok')
}

module.exports = {
    phuHuynhXemThongTinHocSinh,
    phuHuynhXemSucKhoeHocSinh, PHXemThongBaoLop, xuatDiemRaPDF
}