import { render } from "ejs";
import pool from "../config/connectDB";
import { json } from "body-parser";
import nodemailer from 'nodemailer';
import smtpTransport from 'nodemailer-smtp-transport';
// var XLSX = require('xlsx');
// const multer = require("multer");
const Lead = require("../../node_modules/lead");
const path = require('path');



let getDanhSachHocSinh = async (req, res) => {
    // in ra màn hình những học sinh có tinhTrang = 1 (còn đi học)
    const [rows, fields] = await pool.execute('SELECT * FROM hocsinh where tinhTrang = 1'); // tinhTang = 1 : còn đi học
    return res.render('danhSachHocSinh.ejs', { dataHocSinh: rows })
}

// page export danh sách học sinh
let getPageExportDSHS = async (req, res) => {
    const [rows, fields] = await pool.execute('SELECT * FROM hocsinh where tinhTrang = 1'); // tinhTang = 1 : còn đi học
    return res.render('exportDSHS.ejs', { dataHocSinh: rows })
}

let getThongTinHocSinh = async (req, res) => {
    // lay id hoc sinh tu req.params
    let idHocSinh = req.params.id;
    // select thong tin hoc sinh
    let [hocSinh] = await pool.execute('select * from `hocsinh` where `id` = ?', [idHocSinh]);
    // console.log(hocSinh[0])
    // dung idLop cua hoc sinh de select ten lop hoc cua hoc sinh trong bang `lophoc`
    let idLop = hocSinh[0].idLop
    let [lop] = await pool.execute('select `tenLop` from `lophoc` where `id` = ?', [idLop]);
    let a = JSON.stringify(lop)
    if (a != '[]') { // neu a != rong~, tuc la hoc sinh da co lop:
        let tenLop = lop[0].tenLop
        // truyen vao thong tin hoc sinh va ten lop hoc, render file thongTinHocSinh.ejs
        return res.render('thongTinHocSinh.ejs', { detailsHocSinh: hocSinh, tenLop })
    }
    // neu a la chuoi~ rong~, tuc la hoc sinh chua co lop, tenLop = "Chua Co"
    let tenLop = 'Chua Co'
    return res.render('thongTinHocSinh.ejs', { detailsHocSinh: hocSinh, tenLop })
}

let getThemHocSinhPage = async (req, res) => {
    return res.render('themHocSinh.ejs');
}
let themHocSinh = async (req, res) => {
    let { hoTen, ngaySinh, gioiTinh, idPH } = req.body;
    // tim xem idPH vua nhap co trong bang `phuhuynh` khong
    let [idPhuHuynh] = await pool.execute('select `id` from `phuhuynh` where id = ?', [idPH])
    //chuyen thanh dang chuoi de so sanh
    let a = JSON.stringify(idPhuHuynh)
    if (a != '[]') { // neu a khac chuoi rong -> idPH vua nhap co trong bang `phuhuynh`
        let [b] = await pool.execute('insert into hocsinh(hoTen, ngaySinh, gioiTinh,idPH,tinhTrang ) values (?, ?, ?, ?, 1)',
            [hoTen, ngaySinh, gioiTinh, idPH])
        // console.log(b.insertId)
        // lấy id học sinh vừa tạo để tạo bảng sức khỏe 
        let idHS = b.insertId // id của học sinh vừa tạo
        await pool.execute('insert into suckhoe(idHS) values(?)', [idHS]) // tạo 1 dòng bên bảng sức khỏe, idHS = id học sinh vừa tạo
        return res.redirect('/danh-sach-hoc-sinh'); // quay về view danh sách học sinh
    }
    // nguoc lai: hien thi trang loiThemHocSinh.ejs
    return res.render('loiThemHocSinh.ejs')

}
let getUpdateHocSinhPage = async (req, res) => {
    let idHocSinh = req.params.id //id duoc truyen khi nhap vao nut "Sua"
    let [hocsinh] = await pool.execute('select * from hocsinh where id = ?', [idHocSinh])
    return res.render('chinhSuaHocSinh.ejs', { dataHS: hocsinh[0] })
}
let updateHocSinh = async (req, res) => {
    // thong tin dau vao cua hoc sinh (da duoc nhap tugetUpdateHocSinhPage )
    // console.log(req.body)
    let { hoTen, ngaySinh, gioiTinh, idLop, id } = req.body;
    let [lophoc] = await pool.execute('select * from lophoc where id = ?', [idLop])
    let a = JSON.stringify(lophoc)
    if (a != '[]') {
        await pool.execute('update hocsinh set hoTen = ?, ngaySinh = ?, gioiTinh = ?, idLop =? where id = ?',
            [hoTen, ngaySinh, gioiTinh, idLop, id]);
        // quay ve view danh sach hoc sinh
        return res.redirect('/danh-sach-hoc-sinh');
    }
    return res.render('loiIDLop.ejs')
}
let deleteHocSinh = async (req, res) => { // đưa học sinh nào vào danh sách đã nghỉ học (tinhTrang = 2)
    let id = req.body.idHocSinh;
    await pool.execute('update hocsinh set tinhTrang = ? where id = ?', [2, id])
    return res.redirect('/danh-sach-hoc-sinh')
}


let getDanhSachPhuHuynh = async (req, res) => {
    const [rows, fields] = await pool.execute('SELECT * FROM phuhuynh where tinhTrang = 1');
    return res.render('danhSachPhuHuynh.ejs', { dataPhuHuynh: rows })
}

// page export danh sách phụ huynh
let getPageExportDSPH = async (req, res) => {
    const [rows, fields] = await pool.execute('SELECT * FROM phuhuynh where tinhTrang = 1'); // tinhTang = 1 : còn đi học
    return res.render('exportDSPH.ejs', { dataPhuHuynh: rows })
}

let getThongTinPhuHuynh = async (req, res) => {
    // id phu huynh duoc truyen vao req.params khi nhap vao nut `chi tiet` tren danh sach phu huynh 
    let idPhuHuynh = req.params.id;
    // dua vao id do chay cau lenh select thong tin phu huynh
    let [phuhuynh] = await pool.execute('select * from `phuhuynh` where `id` = ?', [idPhuHuynh]);
    return res.render('thongTinPhuHuynh.ejs', { detailsPhuHuynh: phuhuynh })
}

let getThemPhuHuynhPage = (req, res) => {
    return res.render('themPhuHuynh.ejs')
}

let themPhuHuynh = async (req, res) => {
    let { hoTenPH, soDienThoai, diaChi, email, taiKhoan, matKhau } = req.body;
    //kiem tra xem tai khoan vua nhap da co trong bang `taikhoan` tren CSDL chua:
    let [tkcu] = await pool.execute('select taiKhoan from `taikhoan` where `taiKhoan` = ?', [taiKhoan])
    // gan chuoi a = tai khoan tim duoc trong cau select tren
    let a = JSON.stringify(tkcu)
    // neu a != rong thi` bao tai khoan da ton tai
    if (a != '[]') {
        return res.render('loiTaoTaiKhoan.ejs')
    }
    // neu a la` chuoi~ rong~ thi` tuc la chua co tai khoan trung ten trong bang `taikhoan` trong CSDL,
    //thuc hien tiep viec tao tai khoan:

    // tao tai khoan cua phu huynh truoc
    await pool.execute('insert into taikhoan(taiKhoan, matKhau, loaiTK) values (?, ?, 3)', [taiKhoan, matKhau])
    // lay id cua tai khoan vua tao de tao phu huynh (cot `coTK`)
    let [tk] = await pool.execute('select idTK from `taikhoan` where `taiKhoan` = ?', [taiKhoan])
    let coTK = tk[0].idTK
    //tao phu huynh moi
    await pool.execute('insert into phuhuynh(hoTenPH, soDienThoai, diaChi, email, coTK, tinhTrang) values (?, ?, ?, ?, ?, 1)',
        [hoTenPH, soDienThoai, diaChi, email, coTK])
    return res.redirect('/danh-sach-phu-huynh');
}

let deletePhuHuynh = async (req, res) => {
    let idPH = req.body.idPhuHuynh;
    // kiem tra xem con` hoc sinh nao trong bang `hoc sinh` la con cua phu huynh hien tai khong con hoc khong
    let [con] = await pool.execute('select hoTen from `hocsinh` where `idPH` = ? and tinhTrang = 1', [idPH])
    let a = JSON.stringify(con)
    //neu co: thong bao loi xoa phu huynh, render loiXoaPH.ejs
    if (a != '[]') { // neu a khac chuoi rong~, tuc la phu huynh do van con con dang theo hoc (tinhTrang = 2)
        return res.render('loiXoaPH.ejs', { inputPH: idPH }); // idPH la req.body cua deleteHetLuon ben duoi
    }
    //xoa phu huynh
    await pool.execute('update `phuhuynh` set tinhTrang = 2 where id = ?', [idPH])
    return res.redirect('/danh-sach-phu-huynh')
}

let deleteHetLuon = async (req, res) => {
    // thuc hien nhu deletePhuHuynh:
    // lay idPhuHuynh tu req.body
    let idPhuHuynh = req.body.idPH
    // xoa hoc sinh (đưa vào danh sách đã nghỉ học)
    await pool.execute('update `hocsinh` set `tinhTrang` = 2 where `idPH` = ?', [idPhuHuynh])
    // xoa phu huynh (đưa vào danh sách đã nghỉ học)
    await pool.execute('update `phuhuynh` set tinhTrang = 2 where id = ?', [idPhuHuynh])
    return res.redirect('/danh-sach-phu-huynh')
}

let getThongTinTaiKhoan = async (req, res) => {
    // idTK: truyen vao tu req.params
    let idTK = req.params.idTK;
    // dung idTK chay cau truy van select trong csdl
    let [tk] = await pool.execute('select * from `taiKhoan` where `idTK` = ?', [idTK]);
    // lay ra so id cua loai tai khoan
    let loaiTK = tk[0].loaiTK;
    //truy van trong bang `userstype`, lay ten cua loai tai khoan
    let [loai] = await pool.execute('select type from `userstype` where `idType` = ?', [loaiTK])
    let usertype = loai[0].type
    return res.render('thongTinTaiKhoan.ejs', { detailsTaiKhoan: tk, usertype })
}


let getDanhSachGiaoVien = async (req, res) => {
    // chay cau lenh lay danh sach giao vien
    const [rows, fields] = await pool.execute('SELECT * FROM giaovien where tinhTrang = 1');
    // render file danhSachGiaoVien, truyen vao rows (req.body)
    return res.render('danhSachGiaoVien.ejs', { dataGiaoVien: rows })
}

// page export danh sách giáo viên
let getPageExportDSGV = async (req, res) => {
    const [rows, fields] = await pool.execute('SELECT * FROM giaovien where tinhTrang = 1'); // tinhTang = 1 : còn đi học
    return res.render('exportDSGV.ejs', { dataGiaoVien: rows })
}

let getThongTinGiaoVien = async (req, res) => {
    let idGiaoVien = req.params.id;
    let [giaovien] = await pool.execute('select * from `giaovien` where `id` = ?', [idGiaoVien]);
    return res.render('thongTinGiaoVien.ejs', { detailsGiaoVien: giaovien })
}

let deleteGiaoVien = async (req, res) => {
    let idGV = req.body.idGiaoVien
    //xoa giao vien (tình trạng = 2: không còn công tác)
    await pool.execute('update `giaovien` set `tinhTrang` = 2 where id = ?', [idGV])
    return res.redirect('/danh-sach-giao-vien')
}

let getThemGiaoVienPage = (req, res) => {
    return res.render('themGiaoVien.ejs');
}

let themGiaoVien = async (req, res) => {
    let { hoTenGV, soDienThoaiGV, email, diaChiGV, taiKhoan, matKhau } = req.body;
    console.log(email)
    //kiem tra xem tai khoan vua nhap da co trong bang `taikhoan` tren CSDL chua:
    let [tkcu] = await pool.execute('select taiKhoan from `taikhoan` where `taiKhoan` = ?', [taiKhoan])
    // gan chuoi a = tai khoan tim duoc trong cau select tren
    let a = JSON.stringify(tkcu)
    // neu a != rong thi` bao tai khoan da ton tai
    if (a != '[]') {
        return res.render('loiTaoTaiKhoan.ejs')
    }
    // neu a la` chuoi~ rong~ thi` tuc la chua co tai khoan trung ten trong bang `taikhoan` trong CSDL,
    // thuc hien tiep viec tao tai khoan:

    // tao tai khoan cua giao vien truoc
    await pool.execute('insert into taikhoan(taiKhoan, matKhau, loaiTK) values (?, ?, 2)', [taiKhoan, matKhau])
    // lay id cua tai khoan vua tao de tao giao vien (cot `coTK`)
    let [tk] = await pool.execute('select idTK from `taikhoan` where `taiKhoan` = ?', [taiKhoan])
    let coTK = tk[0].idTK
    //tao giao vien moi
    await pool.execute('insert into giaovien(hoTenGV, soDienThoaiGV, email, diaChiGV, coTK, tinhTrang) values (?, ?, ?, ?, ?, ?)',
        [hoTenGV, soDienThoaiGV, email, diaChiGV, coTK, 1])
    return res.redirect('/danh-sach-giao-vien');
}

let getUpdatePhuHuynhPage = async (req, res) => {
    let idPhuHuynh = req.params.id
    let [phuhuynh] = await pool.execute('select * from `phuhuynh` where `id` = ?', [idPhuHuynh])
    // console.log(phuhuynh[0])
    return res.render('chinhSuaPhuHuynh.ejs', { dataPhuHuynh: phuhuynh[0] })
}

let updatePhuHuynh = async (req, res) => {
    // lay so lieu da nhap tu trang chinhSuaPhuHuynh.ejs
    let { hoTenPH, soDienThoai, diaChi, id } = req.body
    await pool.execute('update phuhuynh set hoTenPH = ?, soDienThoai = ?, diaChi = ? where id = ?',
        [hoTenPH, soDienThoai, diaChi, id])
    // quay ve view danh sach phu huynh
    return res.redirect('/danh-sach-phu-huynh');
}

let getUpdateGiaoVienPage = async (req, res) => {
    // lay id giao vien tu req.params
    let idGiaoVien = req.params.id
    let [giaovien] = await pool.execute('select * from `giaovien` where `id` = ?', [idGiaoVien])
    return res.render('chinhSuaGiaoVien.ejs', { dataGiaoVien: giaovien[0] })
}

let updateGiaoVien = async (req, res) => {
    // lay so lieu da nhap tu trang chinhSuaGiaoVien.ejs
    let { hoTenGV, soDienThoaiGV, diaChiGV, id } = req.body
    await pool.execute('update giaovien set hoTenGV = ?, soDienThoaiGV = ?, diaChiGV = ? where id = ?',
        [hoTenGV, soDienThoaiGV, diaChiGV, id])
    // quay ve view danh sach giao vien
    return res.redirect('/danh-sach-giao-vien');
}

let getDanhSachLopHoc = async (req, res) => {
    const [rows, fields] = await pool.execute('SELECT * FROM `lophoc`');
    return res.render('danhSachLopHoc.ejs', { dataLopHoc: rows });
}

let getThongTinLopHoc = async (req, res) => {
    // lay id lop hoc tu req.params
    let idLopHoc = req.params.id
    // lay thong tin lop hoc 
    let [lophoc] = await pool.execute('select * from `lophoc` where `id` = ?', [idLopHoc])
    // lay ten khoi lop
    let [khoilop] = await pool.execute('select `tenKhoi` from `khoilop` where `id` = ?', [lophoc[0].idKhoi])
    let tenKhoiLop = khoilop[0].tenKhoi
    // lay ten loai lop
    let [loailop] = await pool.execute('select `tenLoaiLop` from `loailop` where `id` = ?', [lophoc[0].idLoaiLop])
    let tenLoaiLop = loailop[0].tenLoaiLop
    // lay ho ten Giao Vien
    let [giaovien] = await pool.execute('select `hoTenGV` from `giaovien` where `id` = ?', [lophoc[0].idGV])
    let idGV = lophoc[0].idGV
    // kiem tra xem lop do da co giao vien chua
    let a = JSON.stringify(giaovien)
    // console.log(tenKhoiLop)
    if (a != '[]') { // neu a != rong~ -> lop da co giao vien
        let tenGiaoVien = giaovien[0].hoTenGV
        return res.render('thongTinLopHoc.ejs', { detailsLopHoc: lophoc, tenGiaoVien, tenKhoiLop, tenLoaiLop, idGV })
    }
    // nguoc lai: tenGiaoVien = 'Chua Co Giao Vien'
    let tenGiaoVien = 'Chua Co Giao Vien'
    return res.render('thongTinLopHoc.ejs', { detailsLopHoc: lophoc, tenGiaoVien, tenKhoiLop, tenLoaiLop })
}

let deleteLopHoc = async (req, res) => {
    let idLopHoc = req.body.idLopHoc
    await pool.execute('delete from `lophoc` where `id` = ?', [idLopHoc]);
    return res.redirect('/danh-sach-lop-hoc');
}

let getThemLopHocPage = async (req, res) => {
    return res.render('themLopHoc.ejs')
}

let themLopHoc = async (req, res) => {
    let { tenLop, idGV, idKhoi, idLoaiLop } = req.body
    // tim xem id giao vien vua nhap co trong bang `giaovien` hay khong
    let [giaoVien] = await pool.execute('select hoTenGV from giaovien where id = ?', [idGV])
    let a = JSON.stringify(giaoVien)
    // console.log(a)
    if (a != '[]') { // neu a!= rong~, tuc' la` idGV vua nhap la dung, co giao vien trung` id voi id vua nhap
        await pool.execute('insert into lophoc(tenLop, idGV, idKhoi, idLoaiLop) values(?, ?, ?, ?)',
            [tenLop, idGV, idKhoi, idLoaiLop])
        return res.redirect('/danh-sach-lop-hoc')
    }
    // neu sai, hien thi loi~:
    return res.render('loiThemLopHoc.ejs');

}

let getUpdateLopHocPage = async (req, res) => {
    // lay id lop hoc tu req.params
    let idLopHoc = req.params.id
    // truy van thong tin lop hoc tren CSDL
    let [lopHoc] = await pool.execute('select * from `lophoc` where `id` = ?', [idLopHoc])
    // dung idKhoi tu bang `lophoc` de tim ten khoi lop
    let idKhoi = lopHoc[0].idKhoi
    let [tenKhoiLop] = await pool.execute('select tenKhoi from khoilop where id = ?', [idKhoi])
    // console.log(tenKhoiLop[0])
    // gan ten khoi lop vao bien `tenKhoi` de truyen vao file chinhSuaLopHoc.ejs trong luc render
    let tenKhoi = tenKhoiLop[0].tenKhoi
    // console.log(tenKhoi)
    //
    // tuong tu, dung idLoaiLop de tim ten loai lop trong bang `loailop`
    let idLoaiLop = lopHoc[0].idLoaiLop
    let [tenLoaiLopHoc] = await pool.execute('select tenLoaiLop from loailop where id = ?', [idLoaiLop])
    let tenLoaiLop = tenLoaiLopHoc[0].tenLoaiLop
    // console.log(tenLoaiLop)
    // truyen cac tham so da tim duoc khi render file chinhSuaLopHoc.ejs:
    return res.render('chinhSuaLopHoc.ejs', { detailsLopHoc: lopHoc[0], idKhoi, tenKhoi, idLoaiLop, tenLoaiLop });
}

let updateLopHoc = async (req, res) => {
    // console.log(req.body)
    let { tenLop, idGV, idKhoi, idLoaiLop, id } = req.body
    // tuong tu nhu themLopHoc, kiem tra xem ID giao vien vua nhap co dung khong
    let [giaoVien] = await pool.execute('select hoTenGV from giaovien where id = ?', [idGV])
    // gan a cho ket qua chay cau lenh SQL
    let a = JSON.stringify(giaoVien)
    if (a != '[]') { // neu a != rong~, tuc la ID giao vien vua nhap la dung
        await pool.execute('update `lophoc` set `tenLop` = ?, `idGV` = ?, `idKhoi` = ?, `idLoaiLop` = ? where `id` = ?',
            [tenLop, idGV, idKhoi, idLoaiLop, id])
        return res.redirect('/danh-sach-lop-hoc')
    }
    return res.render('loiThemLopHoc.ejs');
}


module.exports = {
    getDanhSachHocSinh, getPageExportDSHS, getThongTinHocSinh, getThemHocSinhPage, themHocSinh, getUpdateHocSinhPage,
    updateHocSinh, deleteHocSinh, getDanhSachPhuHuynh, getPageExportDSPH, getThongTinPhuHuynh, getThemPhuHuynhPage,
    themPhuHuynh, deletePhuHuynh, deleteHetLuon, getThongTinTaiKhoan, getDanhSachGiaoVien, getPageExportDSGV,
    getThongTinGiaoVien, deleteGiaoVien, getThemGiaoVienPage, themGiaoVien, getUpdatePhuHuynhPage, updatePhuHuynh,
    getUpdateGiaoVienPage, updateGiaoVien, getDanhSachLopHoc, getThongTinLopHoc, deleteLopHoc, getThemLopHocPage,
    themLopHoc, getUpdateLopHocPage, updateLopHoc
}