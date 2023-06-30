import { render } from "ejs";
import pool from "../config/connectDB";
import { json } from "body-parser";
import nodemailer from 'nodemailer';
import smtpTransport from 'nodemailer-smtp-transport';
// var XLSX = require('xlsx');
// const multer = require("multer");
const Lead = require("../../node_modules/lead");
const path = require('path');

// ngày cho phép nhập điểm
// học kỳ 1
var ngayBD = 30 // từ ngày 30 tháng 6 năm trước
var thangBD = 5
var ngayKT = 15 // cho đến ngày 15 tháng 1 năm sau
var thangKT = 0

// học kỳ 2
var ngayBD2 = 15 // từ ngày 30 tháng 6 năm trước
var thangBD2 = 1
var ngayKT2 = 25 // cho đến ngày 15 tháng 1 năm sau
var thangKT2 = 5

let giaoVienGetUpdateGiaoVienPage = async (req, res) => {
    // lay id giao vien tu req.params
    let idGiaoVien = req.params.id
    let [giaovien] = await pool.execute('select * from `giaovien` where `id` = ?', [idGiaoVien])
    return res.render('giaoVienTuChinhSua.ejs', { dataGiaoVien: giaovien[0] })
}

let giaoVienUpdateGiaoVien = async (req, res) => {
    // lay so lieu da nhap tu trang chinhSuaGiaoVien.ejs
    let { hoTenGV, soDienThoaiGV, diaChiGV, id } = req.body
    await pool.execute('update giaovien set hoTenGV = ?, soDienThoaiGV = ?, diaChiGV = ? where id = ?',
        [hoTenGV, soDienThoaiGV, diaChiGV, id])
    // quay ve view danh sach giao vien
    let [giaovien] = await pool.execute('select * from `giaovien` where `id` = ?', [id])
    return res.render('viewGiaoVien.ejs', { detailsGiaoVien: giaovien[0] })
}

let giaoVienXemLopHoc = async (req, res) => {
    // console.log(req.params.idGV)
    let idGV = req.params.idGV
    let [lophoc] = await pool.execute('select * from lophoc where idGV = ?', [idGV])
    // console.log(lophoc[0])
    let a = JSON.stringify(lophoc)
    // console.log(a)
    if (a != '[]') { // neu a != chuỗi rỗng tức là giáo viên đó đã làm chủ nhiệm lớp
        // lấy ra tên khối lớp của lớp đó:

        let idKhoi = lophoc[0].idKhoi
        let [khoilop] = await pool.execute('select tenKhoi from khoilop where id = ?', [idKhoi])
        // console.log(khoilop[0])
        let tenKhoiLop = khoilop[0].tenKhoi

        // lấy ra tên loại lớp của lớp đó
        let idLoaiLop = lophoc[0].idLoaiLop
        let [loailop] = await pool.execute('select tenLoaiLop from loailop where id = ?', [idLoaiLop])
        let tenLoaiLop = loailop[0].tenLoaiLop
        // console.log(tenLoaiLop)

        // lấy danh sách học sinh của lớp:
        let hocsinh = await pool.execute('select * from hocsinh where idLop = ?', [lophoc[0].id])
        // console.log(hocsinh[0])
        // console.log(lophoc[0].id)
        let [siso] = await pool.execute('select COUNT(*) from hocsinh where idLop = ?', [lophoc[0].id])
        let a = Object.values(JSON.parse(JSON.stringify(siso[0])))
        // console.log(a[0])
        let siSo = a[0]
        // render view xem thông tin lớp học của giáo viên, truyền theo các tham số
        return res.render('giaoVienXemLop.ejs', { detailsLopHoc: lophoc[0], dataHocSinh: hocsinh[0], tenKhoiLop, tenLoaiLop, siSo, idGV })
    }
    return res.render('loiChuaCoLop.ejs')
}

// giáo viên xem thông tin học sinh lớp mình (sau khi nhấp vào 'chi tiết' trong danh sách lớp)
let giaoVienGetThongTinHocSinh = async (req, res) => {
    let idHS = req.params.id
    // console.log(idHS)
    let [hocsinh] = await pool.execute('select * from hocsinh where id = ?', [idHS])
    // console.log(hocsinh[0])
    res.render('giaoVienXemTTHocSinh.ejs', { detailsHocSinh: hocsinh[0] })
}

let giaoVienXemDSHS = async (req, res) => {
    // console.log(req.params.idLop)
    let idLop = req.params.idLop
    let [lop] = await pool.execute('select tenLop from lophoc where id = ?', [idLop])
    // console.log(lop[0].tenLop)
    let tenLop = lop[0].tenLop
    let [giaovien] = await pool.execute('select idGV from lophoc where id = ?', [idLop])
    // console.log(giaovien[0].idGV)
    let idGV = giaovien[0].idGV
    let [tenGV] = await pool.execute('select hoTenGV from giaovien where id = ?', [idGV])
    // console.log(tenGV[0].hoTenGV)
    let hoTenGV = tenGV[0].hoTenGV
    let hocsinh = await pool.execute('select * from hocsinh where idLop = ?', [idLop])
    // console.log(hocsinh[0])
    return res.render('gvXemDSHS.ejs', { dataHocSinh: hocsinh[0], hoTenGV, tenLop });
}

let giaoVienGetUpdateHocSinhPage = async (req, res) => {
    // lấy id học sinh từ req.params
    let idHS = req.params.id
    // console.log(idHS)
    // chạy câu truy vấn lấy thông tin học sinh từ CSDL
    let [hocsinh] = await pool.execute('select * from `hocsinh` where `id` = ?', [idHS]);
    // console.log(hocsinh[0])
    // render view chỉnh sửa học sinh, truyền data học sinh vào
    return res.render('giaoVienChinhSuaHocSinh.ejs', { dataHS: hocsinh[0] })
}

let giaoVienPostUpdateHocSinh = async (req, res) => {
    // console.log(req.body)
    let { hoTen, ngaySinh, gioiTinh, id } = req.body
    await pool.execute('update hocsinh set hoTen = ?, ngaySinh = ?, gioiTinh = ? where id = ?',
        [hoTen, ngaySinh, gioiTinh, id])
    // từ học sinh tìm id Lớp
    let [idlop] = await pool.execute('select `idLop` from `hocsinh` where `id` = ?', [id])
    // console.log(idlop[0].idLop)
    let idLop = idlop[0].idLop
    // xong từ id lớp lấy thông tin giáo viên để trả về view
    let [idgiaovien] = await pool.execute('select idGV from lophoc where id = ?', [idLop])
    // console.log(idgiaovien[0].idGV)
    let idGV = idgiaovien[0].idGV
    // lấy thông tin giáo viên để trả về view
    let [giaovien] = await pool.execute('select * from giaovien where id = ?', [idGV])
    // console.log(giaovien[0])
    // view của giáo viên
    return res.render('viewGiaoVien.ejs', { detailsGiaoVien: giaovien[0], idGV })
}

let giaoVienXemDiemLopHK1 = async (req, res) => {
    // lấy id giáo viên để truyền vào file ejs để dùng cho nút 'Quay Về Thông Tin Lớp'
    let idGV = req.params.idGV
    let [tenGV] = await pool.execute('select hoTenGV from giaovien where id = ?', [idGV])
    // console.log(tenGV[0].hoTenGV)
    let hoTenGV = tenGV[0].hoTenGV

    // khi giáo viên click vào 'xem điểm', id lớp được truyền vào params
    let idLop = req.params.idLop
    // console.log(req.params)
    // từ id lớp, select tenLop để truyền và title của trang xem điểm
    let [tenLop] = await pool.execute('select tenLop from lophoc where id = ?', [idLop])
    // console.log(tenLop[0].tenLop)
    let tenLopHoc = tenLop[0].tenLop // tenLop
    // select id, Tên của tất cả học sinh của lớp
    let [dsHS] = await pool.execute('select id, hoTen from hocsinh where idLop = ?', [idLop])
    // console.log(dsHS)
    let dsDiem = {} // tạo danh sách lưu điểm của học sinh để truyền vào khi render file ejs
    for (let i = 0; i < dsHS.length; i++) { // theo danh sách học sinh, select diểm của học sinh đó...
        let [diem] = await pool.execute('select * from diem where idHS = ? and idHK = 1', [dsHS[i].id])
        dsDiem[i] = diem[0] // ... và lưu vào mảng dsDem
        let a = JSON.stringify(diem)
        if (a == '[]') { // nếu học sinh đó chưa có (chưa nhập) điểm, thì truyền vào chuỗi rỗng.
            dsDiem[i] = {
                diemToan: '',
                NXToan: '',
                diemTiengViet: '',
                NXTiengViet: '',
                diemDaoDuc: '',
                NXDaoDuc: '',
                diemTNXH: '',
                NXTNXH: '',
                diemKhoaHoc: '',
                NXKhoaHoc: '',
                diemLSDL: '',
                NXLSDL: '',
                diemTheDuc: '',
                NXTheDuc: '',
                diemAmNhac: '',
                NXAmNhac: '',
                diemRenLuyen: '',
                NXRenLuyen: '',
                nhanXet: ''
            }

        }
    }

    let [siso] = await pool.execute('select COUNT(*) from hocsinh where idLop = ?', [idLop])
    let a = Object.values(JSON.parse(JSON.stringify(siso[0])))
    // console.log(a[0])
    let siSo = a[0]
    // render ra view xem điểm, truyền các tham số vào.
    return res.render('giaoVienXemDiemHK1.ejs', { danhSachHocSinh: dsHS, danhSachDiem: dsDiem, tenLopHoc, idGV, hoTenGV, siSo, idLop })
}

let giaoVienXemDiemLopHK2 = async (req, res) => {
    // lấy id giáo viên để truyền vào file ejs để dùng cho nút 'Quay Về Thông Tin Lớp'
    let idGV = req.params.idGV
    let [tenGV] = await pool.execute('select hoTenGV from giaovien where id = ?', [idGV])
    // console.log(tenGV[0].hoTenGV)
    let hoTenGV = tenGV[0].hoTenGV

    // khi giáo viên click vào 'xem điểm', id lớp được truyền vào params
    let idLop = req.params.idLop
    // từ id lớp, select tenLop để truyền và title của trang xem điểm
    let [tenLop] = await pool.execute('select tenLop from lophoc where id = ?', [idLop])
    // console.log(tenLop[0].tenLop)
    let tenLopHoc = tenLop[0].tenLop // tenLop
    // select id, Tên của tất cả học sinh của lớp
    let [dsHS] = await pool.execute('select id, hoTen from hocsinh where idLop = ?', [idLop])
    // console.log(dsHS)
    let dsDiem = {} // tạo danh sách lưu điểm của học sinh để truyền vào khi render file ejs
    for (let i = 0; i < dsHS.length; i++) { // theo danh sách học sinh, select diểm của học sinh đó...
        let [diem] = await pool.execute('select * from diem where idHS = ? and idHK = 2', [dsHS[i].id])
        dsDiem[i] = diem[0] // ... và lưu vào mảng dsDem
        let a = JSON.stringify(diem)
        if (a == '[]') { // nếu học sinh đó chưa có (chưa nhập) điểm, thì truyền vào chuỗi rỗng.
            dsDiem[i] = {
                diemToan: '',
                NXToan: '',
                diemTiengViet: '',
                NXTiengViet: '',
                diemDaoDuc: '',
                NXDaoDuc: '',
                diemTNXH: '',
                NXTNXH: '',
                diemKhoaHoc: '',
                NXKhoaHoc: '',
                diemLSDL: '',
                NXLSDL: '',
                diemTheDuc: '',
                NXTheDuc: '',
                diemAmNhac: '',
                NXAmNhac: '',
                diemRenLuyen: '',
                NXRenLuyen: '',
                nhanXet: ''
            }
        }
    }
    // giống như phần xem điểm HK1:

    let [siso] = await pool.execute('select COUNT(*) from hocsinh where idLop = ?', [idLop])
    let a = Object.values(JSON.parse(JSON.stringify(siso[0])))
    // console.log(a[0])
    let siSo = a[0]
    // render ra view xem điểm, truyền các tham số vào.
    return res.render('giaoVienXemDiemHK2.ejs', { danhSachHocSinh: dsHS, danhSachDiem: dsDiem, tenLopHoc, idGV, hoTenGV, siSo, idLop })
}

let giaoVienNhapDiemLopHK1 = async (req, res) => {
    // phần code kiểm tra thời gian nhập điểm, uncomment để sử dụng 
    // 
    // trước tiên, kiểm tra xem thời gian nhập điểm có trong thời gian cho phép nhập điểm hay không
    // Lấy thời gian hiện tại
    let currentDate = new Date();
    // Đặt thời gian bắt đầu và kết thúc
    let startDate = new Date(currentDate.getFullYear(), thangBD, ngayBD); // Ngày 30 tháng 6
    // console.log(startDate)
    let endDate = new Date(currentDate.getFullYear() + 1, thangKT, ngayKT); // Ngày 15 tháng 1 năm sau
    // Kiểm tra nếu thời gian hiện tại nằm ngoài thời hạn
    if (currentDate < startDate || currentDate > endDate) {
        // nếu thời gian nhập điểm nằm ngoài hạn nhập điểm: báo lỗi, không cho nhập điểm:
        console.log("Lỗi, hết thời gian nhập điểm");
        return res.render("hetThoiGianNhapDiem.ejs");
    }

    // console.log(req.params)
    let { idGV, idLop } = req.params
    // console.log(idGV, idLop)
    // lấy tên lớp, họ tên giáo viên của lớp
    let [tenLop] = await pool.execute('select tenLop from lophoc where id = ?', [idLop])
    let tenLopHoc = tenLop[0].tenLop
    let [tenGV] = await pool.execute('select hoTenGV from giaovien where id = ?', [idGV])
    // console.log(tenGV[0].hoTenGV)
    let hoTenGV = tenGV[0].hoTenGV

    let [hocsinh] = await pool.execute('select id, hoTen from hocsinh where idLop = ?', [idLop])
    // console.log(hocsinh)
    let [siso] = await pool.execute('select COUNT(*) from hocsinh where idLop = ?', [idLop])
    // console.log(siso)
    let a = Object.values(JSON.parse(JSON.stringify(siso[0])))
    // console.log(a[0])
    let siSo = a[0]
    return res.render('giaoVienNhapDiemHK1.ejs', { dataHocSinh: hocsinh, idGV, idLop, siSo, tenLopHoc, hoTenGV })
}

let postgiaoVienNhapDiemLopHK1 = async (req, res) => {
    // console.log(req.body)
    let idLop = req.body.idLop
    let idGV = req.body.idGV

    // console.log(idLop, idGV)
    let [hocsinh] = await pool.execute('select id from hocsinh where idLop = ?', [idLop])
    // console.log(hocsinh)
    let [namhoc] = await pool.execute('select id from namhoc where tinhTrang = 1')
    // console.log(namhoc[0].id)
    let idNamHoc = namhoc[0].id
    let idHK = 1
    for (let i = 0; i < hocsinh.length; i++) {
        // xem học sinh hiện tại đã có điểm trong học kỳ và năm hiện tại đang nhập không, nếu đã có rồi thì không nhập nữa
        let [diemcu] = await pool.execute('select * from diem where idHS = ? AND idHK = ? AND idNamHoc = ?',
            [hocsinh[i].id, idHK, idNamHoc]) // tìm idHS, idNamHoc, idHK hiện tại trong bảng "diem"
        // console.log(diemcu[0])
        let stringa = JSON.stringify(diemcu)
        if (stringa != '[]') { // nếu có rồi thì bỏ qua học sinh này
            console.log('học sinh có id: ' + diemcu[0].idHS + ' đã có điểm trong CSDL!')
            continue
        }

        let diemToan = eval('req.body.diemToan' + hocsinh[i].id)
        let NXToan = eval('req.body.NXToan' + hocsinh[i].id)
        let diemTiengViet = eval('req.body.diemTiengViet' + hocsinh[i].id)
        let NXTiengViet = eval('req.body.NXToan' + hocsinh[i].id)
        let diemDaoDuc = eval('req.body.diemDaoDuc' + hocsinh[i].id)
        let NXDaoDuc = eval('req.body.NXToan' + hocsinh[i].id)
        let diemTNXH = eval('req.body.diemTNXH' + hocsinh[i].id)
        let NXTNXH = eval('req.body.NXToan' + hocsinh[i].id)
        let diemKhoaHoc = eval('req.body.diemKhoaHoc' + hocsinh[i].id)
        let NXKhoaHoc = eval('req.body.NXToan' + hocsinh[i].id)
        let diemLSDL = eval('req.body.diemLSDL' + hocsinh[i].id)
        let NXLSDL = eval('req.body.NXToan' + hocsinh[i].id)
        let diemTheDuc = eval('req.body.diemTheDuc' + hocsinh[i].id)
        let NXTheDuc = eval('req.body.NXToan' + hocsinh[i].id)
        let diemAmNhac = eval('req.body.diemAmNhac' + hocsinh[i].id)
        let NXAmNhac = eval('req.body.NXToan' + hocsinh[i].id)
        let diemRenLuyen = eval('req.body.diemRenLuyen' + hocsinh[i].id)
        let NXRenLuyen = eval('req.body.NXToan' + hocsinh[i].id)
        let nhanXet = eval('req.body.nhanXet' + hocsinh[i].id)
        // console.log(NXToan, NXTiengViet, NXDaoDuc, NXTNXH, NXKhoaHoc, NXLSDL, NXTheDuc, NXAmNhac, NXRenLuyen)
        // console.log(diemToan, diemTiengViet, diemDaoDuc, diemTNXH, diemKhoaHoc, diemLSDL, diemTheDuc, diemAmNhac)
        await pool.execute('insert into diem(idHS, idHK, idNamHoc, diemToan,NXToan, diemTiengViet,NXTiengViet, diemDaoDuc,NXDaoDuc, diemTNXH,NXTNXH, diemKhoaHoc,NXKhoaHoc, diemLSDL,NXLSDL, diemTheDuc,NXTheDuc, diemAmNhac,NXAmNhac, diemRenLuyen,NXRenLuyen, nhanXet) values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [hocsinh[i].id, idHK, idNamHoc, diemToan, NXToan, diemTiengViet, NXTiengViet, diemDaoDuc, NXDaoDuc, diemTNXH, NXTNXH, diemKhoaHoc, NXKhoaHoc, diemLSDL, NXLSDL, diemTheDuc, NXTheDuc, diemAmNhac, NXAmNhac, diemRenLuyen, NXRenLuyen, nhanXet])
    }
    let a = '/giao-vien/' + idGV + '/xem-lop-hoc'
    // console.log(a)
    return res.redirect(a)
}

let giaoVienNhapDiemLopHK2 = async (req, res) => {
    // phần code kiểm tra thời gian nhập điểm, uncomment để sử dụng 
    // 
    // trước tiên, kiểm tra xem thời gian nhập điểm có trong thời gian cho phép nhập điểm hay không
    // Lấy thời gian hiện tại
    let currentDate = new Date();
    // Đặt thời gian bắt đầu và kết thúc
    let startDate = new Date(currentDate.getFullYear(), thangBD2, ngayBD2); // Ngày 29 tháng 6
    // console.log(startDate)
    let endDate = new Date(currentDate.getFullYear() + 1, thangKT2, ngayKT2); // Ngày 15 tháng 1 năm sau
    // Kiểm tra nếu thời gian hiện tại nằm ngoài thời hạn
    if (currentDate < startDate || currentDate > endDate) {
        // nếu thời gian nhập điểm nằm ngoài hạn nhập điểm: báo lỗi, không cho nhập điểm:
        console.log("Lỗi, hết thời gian nhập điểm");
        return res.render("hetThoiGianNhapDiem.ejs");
    }

    // console.log(req.params)
    let { idGV, idLop } = req.params
    // console.log(idGV, idLop)
    // lấy tên lớp, họ tên giáo viên của lớp
    let [tenLop] = await pool.execute('select tenLop from lophoc where id = ?', [idLop])
    let tenLopHoc = tenLop[0].tenLop
    let [tenGV] = await pool.execute('select hoTenGV from giaovien where id = ?', [idGV])
    // console.log(tenGV[0].hoTenGV)
    let hoTenGV = tenGV[0].hoTenGV

    let [hocsinh] = await pool.execute('select id, hoTen from hocsinh where idLop = ?', [idLop])
    // console.log(hocsinh)
    let [siso] = await pool.execute('select COUNT(*) from hocsinh where idLop = ?', [idLop])
    // console.log(siso)
    let a = Object.values(JSON.parse(JSON.stringify(siso[0])))
    // console.log(a[0])
    let siSo = a[0]
    return res.render('giaoVienNhapDiemHK2.ejs', { dataHocSinh: hocsinh, idGV, idLop, siSo, tenLopHoc, hoTenGV })
}

let postgiaoVienNhapDiemLopHK2 = async (req, res) => {
    // console.log(req.body)
    let idLop = req.body.idLop
    let idGV = req.body.idGV

    let [hocsinh] = await pool.execute('select id from hocsinh where idLop = ?', [idLop])
    // console.log(hocsinh)
    let [namhoc] = await pool.execute('select id from namhoc where tinhTrang = 1')
    // console.log(namhoc[0].id)
    let idNamHoc = namhoc[0].id
    let idHK = 2
    for (let i = 0; i < hocsinh.length; i++) {
        // xem học sinh hiện tại đã có điểm trong học kỳ và năm hiện tại đang nhập không, nếu đã có rồi thì không nhập nữa
        let [diemcu] = await pool.execute('select * from diem where idHS = ? AND idHK = ? AND idNamHoc = ?',
            [hocsinh[i].id, idHK, idNamHoc]) // tìm idHS, idNamHoc, idHK hiện tại trong bảng "diem"
        // console.log(diemcu[0])
        let stringa = JSON.stringify(diemcu)
        if (stringa != '[]') { // nếu có rồi thì bỏ qua học sinh này
            console.log('học sinh có id: ' + diemcu[0].idHS + ' đã có điểm trong CSDL!')
            continue
        }
        let diemToan = eval('req.body.diemToan' + hocsinh[i].id)
        let NXToan = eval('req.body.NXToan' + hocsinh[i].id)
        let diemTiengViet = eval('req.body.diemTiengViet' + hocsinh[i].id)
        let NXTiengViet = eval('req.body.NXToan' + hocsinh[i].id)
        let diemDaoDuc = eval('req.body.diemDaoDuc' + hocsinh[i].id)
        let NXDaoDuc = eval('req.body.NXToan' + hocsinh[i].id)
        let diemTNXH = eval('req.body.diemTNXH' + hocsinh[i].id)
        let NXTNXH = eval('req.body.NXToan' + hocsinh[i].id)
        let diemKhoaHoc = eval('req.body.diemKhoaHoc' + hocsinh[i].id)
        let NXKhoaHoc = eval('req.body.NXToan' + hocsinh[i].id)
        let diemLSDL = eval('req.body.diemLSDL' + hocsinh[i].id)
        let NXLSDL = eval('req.body.NXToan' + hocsinh[i].id)
        let diemTheDuc = eval('req.body.diemTheDuc' + hocsinh[i].id)
        let NXTheDuc = eval('req.body.NXToan' + hocsinh[i].id)
        let diemAmNhac = eval('req.body.diemAmNhac' + hocsinh[i].id)
        let NXAmNhac = eval('req.body.NXToan' + hocsinh[i].id)
        let diemRenLuyen = eval('req.body.diemRenLuyen' + hocsinh[i].id)
        let NXRenLuyen = eval('req.body.NXToan' + hocsinh[i].id)
        let nhanXet = eval('req.body.nhanXet' + hocsinh[i].id)
        // console.log(idNamHoc)
        // console.log(diemToan, diemTiengViet, diemDaoDuc, diemTNXH, diemKhoaHoc, diemLSDL, diemTheDuc, diemAmNhac)
        await pool.execute('insert into diem(idHS, idHK, idNamHoc, diemToan,NXToan, diemTiengViet,NXTiengViet, diemDaoDuc,NXDaoDuc, diemTNXH,NXTNXH, diemKhoaHoc,NXKhoaHoc, diemLSDL,NXLSDL, diemTheDuc,NXTheDuc, diemAmNhac,NXAmNhac, diemRenLuyen,NXRenLuyen, nhanXet) values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [hocsinh[i].id, idHK, idNamHoc, diemToan, NXToan, diemTiengViet, NXTiengViet, diemDaoDuc, NXDaoDuc, diemTNXH, NXTNXH, diemKhoaHoc, NXKhoaHoc, diemLSDL, NXLSDL, diemTheDuc, NXTheDuc, diemAmNhac, NXAmNhac, diemRenLuyen, NXRenLuyen, nhanXet])
    }
    let a = '/giao-vien/' + idGV + '/xem-lop-hoc'
    // console.log(a)
    return res.redirect(a)
}

let giaoVienXemSucKhoeLop = async (req, res) => {
    // console.log(req.params)
    let { idGV, idLop } = req.params

    let [giaovien] = await pool.execute('select hoTenGV from giaovien where id = ?', [idGV])
    // console.log(giaovien[0].hoTenGV)
    let hoTenGV = giaovien[0].hoTenGV

    let [tenLop] = await pool.execute('select tenLop from lophoc where id = ?', [idLop])
    // console.log(tenLop[0].tenLop)
    let tenLopHoc = tenLop[0].tenLop // tenLop

    let [siso] = await pool.execute('select COUNT(*) from hocsinh where idLop = ?', [idLop])
    let a = Object.values(JSON.parse(JSON.stringify(siso[0])))
    // console.log(a[0])
    let siSo = a[0]

    let [hocsinh] = await pool.execute('select id, hoTen from hocsinh where idLop = ?', [idLop])
    // console.log(hocsinh.length)
    let dsSucKhoe = {} // tạo danh sách lưu sức khỏe của học sinh để truyền vào khi render file ejs
    for (let i = 0; i < hocsinh.length; i++) { // theo danh sách học sinh, select tình trạng sức khỏe của học sinh đó...
        let [suckhoe] = await pool.execute('select * from suckhoe where idHS = ? ', [hocsinh[i].id])
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

        dsSucKhoe[i] = suckhoe[0] // ... và lưu vào mảng dsSucKhoe
        let a = JSON.stringify(suckhoe)
        if (a == '[]') { // nếu tình trạng SK của hs đó chưa có (chưa nhập), thì truyền vào chuỗi rỗng.
            dsSucKhoe[i] = {
                chieuCao: '',
                canNang: '',
                tinhTrangSK: '',
                soMuiCovid: '',
                lichKham: ''
            }

        }
    }

    return res.render('gvXemSucKhoeLop.ejs', { dsHocSinh: hocsinh, dsSucKhoe, hoTenGV, tenLopHoc, siSo })
}

let giaoVienCapNhatSucKhoeLop = async (req, res) => {
    // console.log(req.params)
    let { idGV, idLop } = req.params

    let [giaovien] = await pool.execute('select hoTenGV from giaovien where id = ?', [idGV])
    // console.log(giaovien[0].hoTenGV)
    let hoTenGV = giaovien[0].hoTenGV

    let [tenLop] = await pool.execute('select tenLop from lophoc where id = ?', [idLop])
    // console.log(tenLop[0].tenLop)
    let tenLopHoc = tenLop[0].tenLop // tenLop

    let [siso] = await pool.execute('select COUNT(*) from hocsinh where idLop = ?', [idLop])
    let a = Object.values(JSON.parse(JSON.stringify(siso[0])))
    // console.log(a[0])
    let siSo = a[0]

    let [hocsinh] = await pool.execute('select id, hoTen from hocsinh where idLop = ?', [idLop])
    // console.log(hocsinh.length)
    let dsSucKhoe = {} // tạo danh sách lưu sức khỏe của học sinh để truyền vào khi render file ejs
    for (let i = 0; i < hocsinh.length; i++) { // theo danh sách học sinh, select tình trạng sức khỏe của học sinh đó...
        let [suckhoe] = await pool.execute('select * from suckhoe where idHS = ? ', [hocsinh[i].id])

        dsSucKhoe[i] = suckhoe[0] // ... và lưu vào mảng dsDem
        let a = JSON.stringify(suckhoe)
        if (a == '[]') { // nếu tình trạng SK của hs đó chưa có (chưa nhập), thì truyền vào chuỗi rỗng.
            dsSucKhoe[i] = {
                chieuCao: '',
                canNang: '',
                tinhTrangSK: '',
                soMuiCovid: '',
                lichKham: ''
            }

        }
    }

    return res.render('gvCapNhatSKLop.ejs', { dsHocSinh: hocsinh, dsSucKhoe, hoTenGV, idGV, idLop, tenLopHoc, siSo })
}

let postGiaoVienCapNhatSucKhoeLop = async (req, res) => {
    // console.log(req.body)
    let idLop = req.body.idLop
    let idGV = req.body.idGV
    let [hocsinh] = await pool.execute('select id from hocsinh where idLop = ?', [idLop])

    for (let i = 0; i < hocsinh.length; i++) {
        let chieuCao = eval('req.body.chieuCao' + hocsinh[i].id)
        let canNang = eval('req.body.canNang' + hocsinh[i].id)
        let tinhTrangSK = eval('req.body.tinhTrangSK' + hocsinh[i].id)
        let soMuiCovid = eval('req.body.soMuiCovid' + hocsinh[i].id)
        let lichKham = eval('req.body.lichKham' + hocsinh[i].id)
        // console.log(lichKham)
        await pool.execute('update suckhoe set chieuCao = ?, canNang = ?, tinhTrangSK = ?, soMuiCovid = ?, lichKham = ? where idHS = ?',
            [chieuCao, canNang, tinhTrangSK, soMuiCovid, lichKham, hocsinh[i].id])
    }
    let a = '/giao-vien/' + idGV + '/xem-lop-hoc'
    // console.log(a)
    return res.redirect(a)
}


let giaoVienXemDSThongBaoLop = async (req, res) => {
    // console.log(req.params)
    let { idGV, idLop } = req.params
    let [tb] = await pool.execute('select * from thongbao where idLop = ?', [idLop])
    // console.log(tb)
    for (let i = 0; i < tb.length; i++) {
        let day = tb[i].ngayViet.getDate()
        let month = tb[i].ngayViet.getMonth() + 1
        let year = tb[i].ngayViet.getFullYear()
        let date = day + '/' + month + '/' + year
        tb[i].ngayViet = date
    }
    // console.log(tb)
    return res.render('gVXemTBLop.ejs', { idGV, idLop, thongBao: tb })
}

let giaoVienVietThongBaoLop = async (req, res) => {
    // console.log(req.params)
    let { idGV, idLop } = req.params
    return res.render('gvVietThongBao.ejs', { idGV, idLop })
}

let postgiaoVienVietThongBaoLop = async (req, res) => {
    // console.log(req.params)
    let { idGV, idLop } = req.params
    // console.log(req.body)
    let { tieuDe, noiDung } = req.body

    let [giaovien] = await pool.execute('select hoTenGV from giaovien where id = ?', [idGV])
    let hoTenGV = giaovien[0].hoTenGV

    let a = new Date()
    let day = a.getDate()

    let month = a.getMonth() + 1

    let year = a.getFullYear()
    let date = year + '-' + month + '-' + day
    // console.log(date)

    let [hocsinh] = await pool.execute('select * from hocsinh where idLop = ?', [idLop])
    // console.log(hocsinh)
    for (let i = 0; i < hocsinh.length; i++) { // lấy email và họ tên phụ huynh để gửi email cho phụ huynh
        let [phuhuynh] = await pool.execute('select email, hoTenPH from phuhuynh where id = ?', [hocsinh[i].idPH])
        // console.log(phuhuynh[0])
        let { email, hoTenPH } = phuhuynh[0] // email, họ tên phụ huynh
        // console.log(email, hoTenPH)

        let transporter = nodemailer.createTransport(
            smtpTransport({
                service: 'gmail',
                auth: {
                    user: 'huynhduc22031999st@gmail.com',
                    pass: 'ylgrlwtegwebxssj',
                },
            })
        );
        let loiChaoMail = 'Kính chào phụ huynh: ' + hoTenPH + '.\nLớp học của em ' + hocsinh[i].hoTen + ' vừa có thông báo mới.\nMời quý phụ huynh xem qua.\n\n'
        let noiDungMail = 'Tiêu đề: ' + tieuDe + '\nNội dung thông báo: ' + noiDung
        let loiKetMail = '\n\nTrân Trọng.\n\n' + hoTenGV + ' - Trường Tiểu Học Nguyễn Du'
        let mailOptions = {
            from: 'huynhduc22031999st@gmail.com',
            to: email,
            subject: 'Thông Báo Mới Từ Lớp Học Của Em ' + hocsinh[i].hoTen,
            text: loiChaoMail + noiDungMail + loiKetMail,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Lỗi Gửi Email:', error);
            } else {
                console.log('Email đã gửi đến <' + email + '> thành công!');
            }
        });
    }

    // thêm thông báo vào CSDL
    await pool.execute('insert into thongbao(idLop, tieuDe, noiDung, ngayViet, nguoiViet) values(?, ?, ?, ?, ?)',
        [idLop, tieuDe, noiDung, date, hoTenGV])

    // quay về view xem lớp học
    let b = '/giao-vien/' + idGV + '/xem-lop-hoc/' + idLop + '/xem-thong-bao-lop'
    return res.redirect(b)
}

let giaoVienXoaThongBaoLop = async (req, res) => {
    let { idGV, idLop } = req.params
    // console.log(idGV, idLop)
    // console.log(req.body.idThongBao)
    let idThongBao = req.body.idThongBao
    await pool.execute('delete from thongbao where id = ?', [idThongBao])

    let b = '/giao-vien/' + idGV + '/xem-lop-hoc/' + idLop + '/xem-thong-bao-lop'
    return res.redirect(b)
}


let gvXuatMauFileNhapDiem = async (req, res) => {
    // console.log(req.params)
    let { idGV, idLop } = req.params
    let [tenlop] = await pool.execute('select tenLop from lophoc where id = ?', [idLop])
    // console.log(tenlop[0].tenLop)
    let tenLop = tenlop[0].tenLop
    let [hocsinh] = await pool.execute('select * from hocsinh where idLop = ?', [idLop])
    // console.log(hocsinh.length)

    return res.render('mauFileDiemLop.ejs', { idGV, tenLop, danhSachHocSinh: hocsinh, idLop })
}

let gvNhapDiemTuFile = (req, res) => {
    // console.log(req.params)
    let { idGV, idHK, idLop } = req.params
    return res.render('gvNhapDiemFile.ejs', { idGV, idLop, idHK })
}


let postgvNhapDiemTuFile = async (req, res) => {
    // console.log(req.params)
    let { idGV, idHK, idLop } = req.params // lay cac tham so tu req.params
    // console.log(idHK)

    //lấy họ tên giáo viên từ id giáo viên
    let [giaovien] = await pool.execute('select hoTenGV from giaovien where id = ?', [idGV])
    let hoTenGV = giaovien[0].hoTenGV
    // console.log(hoTenGV)

    //lấy id nam9 học hiện tại
    let [namhoc] = await pool.execute('select id from namhoc where tinhTrang = 1')
    // console.log(namhoc[0].id)
    let idNamHoc = namhoc[0].id

    // console.log(__dirname)
    //dùng packages xlsx của npm để đọc file excel (.xlsx)
    var XLSX = require('xlsx')
    var workbook = XLSX.readFile('src/upload/Mau_Nhap_Diem_Lop_' + idLop + '.xlsx');//file đã tải lên lúc submit
    var sheet_name_list = workbook.SheetNames; //gán cái gì đó cho cái gì đó, nghe đâu là lấy danh sách sheet của dile excecl mình đang load, nói chung đọc tài liệu kêu làm vậy :v
    var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);// chuyển Data của cái sheet đầu tiên thành định dạng json để đọc
    // console.log(xlData[0]); //dòng thứ nhất
    // let hs = Object.values(JSON.parse(JSON.stringify(xlData[0])))
    // console.log(hs)
    for (let i = 1; i < xlData.length; i++) { // duyệt qua từng dòng của sheet
        let hocsinh = Object.values(JSON.parse(JSON.stringify(xlData[i]))) // chuyển từng đứa học sinh về mảng để đọc
        // console.log(hocsinh)
        let idHS = hocsinh[1]
        // let hoTen = hocsinh[2]
        let diemToan = hocsinh[3]
        let NXToan = hocsinh[4]
        let diemTiengViet = hocsinh[5]
        let NXTiengViet = hocsinh[6]
        let diemDaoDuc = hocsinh[7]
        let NXDaoDuc = hocsinh[8]
        let diemTNXH = hocsinh[9]
        let NXTNXH = hocsinh[10]
        let diemKhoaHoc = hocsinh[11]
        let NXKhoaHoc = hocsinh[12]
        let diemLSDL = hocsinh[13]
        let NXLSDL = hocsinh[14]
        let diemTheDuc = hocsinh[15]
        let NXTheDuc = hocsinh[16]
        let diemAmNhac = hocsinh[17]
        let NXAmNhac = hocsinh[18]
        let diemRenLuyen = hocsinh[19]
        let NXRenLuyen = hocsinh[20]
        let nhanXet = hocsinh[21]

        // xem học sinh hiện tại đã có điểm trong học kỳ và năm hiện tại đang nhập không, nếu đã có rồi thì không nhập nữa
        let [diemcu] = await pool.execute('select * from diem where idHS = ? AND idHK = ? AND idNamHoc = ?',
            [idHS, idHK, idNamHoc]) // tìm idHS, idNamHoc, idHK hiện tại trong bảng "diem"
        // console.log(diemcu[0])
        let stringa = JSON.stringify(diemcu)
        if (stringa != '[]') { // nếu có rồi thì bỏ qua học sinh này
            console.log('học sinh có id: ' + diemcu[0].idHS + ' đã có điểm trong CSDL!')
            continue
        }

        // console.log(idHS, diemToan, diemTiengViet, diemDaoDuc, diemTNXH, diemKhoaHoc, diemLSDL, diemTheDuc, diemAmNhac, nhanXet)
        // console.log(NXToan, NXTiengViet, NXDaoDuc, NXTNXH, NXKhoaHoc, NXLSDL, NXTheDuc, NXAmNhac, NXRenLuyen)

        // nếu chưa có thì nhập điểm của học sisnh vào CSDL
        await pool.execute('insert into diem(idHS, idHK, idNamHoc, diemToan, diemTiengViet, diemDaoDuc, diemTNXH, diemKhoaHoc, diemLSDL, diemTheDuc, diemAmNhac, diemRenLuyen, nhanXet, NXToan, NXTiengViet, NXDaoDuc, NXTNXH, NXKhoaHoc, NXLSDL, NXTheDuc, NXAmNhac, NXRenLuyen) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
            [idHS, idHK, idNamHoc, diemToan, diemTiengViet, diemDaoDuc, diemTNXH, diemKhoaHoc, diemLSDL, diemTheDuc, diemAmNhac, diemRenLuyen, nhanXet, NXToan, NXTiengViet, NXDaoDuc, NXTNXH, NXKhoaHoc, NXLSDL, NXTheDuc, NXAmNhac, NXRenLuyen])
    }
    // return về view của giáo viên
    return res.redirect('/giao-vien/' + idGV + '/xem-lop-hoc')
}

let gvGuiMailDiem = async (req, res) => {
    // console.log(req.params)
    let { idGV, idLop } = req.params
    // lấy id, họ tên và id phụ huynh của lớp
    let [dsHS] = await pool.execute('select id, hoTen, idPH from hocsinh where idLop = ?', [idLop])
    // console.log(dsHS)
    for (let i = 0; i < dsHS.length; i++) {
        // console.log(dsHS[i].hoTen)
        // console.log(dsHS[i].id)
        // lấy email của phụ huynh để gửi
        let [phuhuynh] = await pool.execute('select email from phuhuynh where id = ?', [dsHS[i].idPH])
        let email = phuhuynh[0].email // email phụ huynh
        // console.log(email)
        let [namhoc] = await pool.execute('select MAX(id) from namhoc')
        let a = Object.values(JSON.parse(JSON.stringify(namhoc[0]))) //lấy năm học
        // console.log(a[0])
        let namHoc = a[0]; // năm học
        // lấy điểm học kỳ 1
        let [diemHK1] = await pool.execute('select * from diem where idHS = ? and idHK = ? and idNamHoc = ?', [dsHS[i].id, 1, namHoc])
        // console.log(diemHK1[0])
        let stringA = JSON.stringify(diemHK1)
        // console.log(stringA)
        let diem1 = {}
        if (stringA == '[]') {
            diem1 = {
                idNamHoc: namHoc,
                idHK: 1,
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
        else { diem1 = diemHK1[0] }
        // console.log(diem1)
        // lấy điểm học kỳ 2
        let [diemHK2] = await pool.execute('select * from diem where idHS = ? and idHK = ? and idNamHoc = ?', [dsHS[i].id, 2, namHoc])
        let stringB = JSON.stringify(diemHK2)
        let diem2 = {}
        if (stringB == '[]') {
            diem2 = {
                idNamHoc: namHoc,
                idHK: 2,
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
        else { diem2 = diemHK2[0] }
        // console.log(diem2)
        //tạo transporter gmail
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
        // lời chào đầu email
        let loiChao = 'Chào quý phụ huynh, tôi là giáo viên chủ nhiệm của em ' + dsHS[i].hoTen + '.\nĐây là kết quả học tập của em trong năm học này.\nKính mời quý phụ huynh xem qua.'
        // điểm học kỳ 1
        let mailTextHK1 = '\n\nHọc Kỳ 1:\nĐiểm toán: ' + diem1.diemToan + '\nĐiểm Tiếng Việt: ' + diem1.diemTiengViet + '\nĐiểm Đạo Đức: ' + diem1.diemDaoDuc + '\nĐiểm Tự Nhiên & Xã Hội: ' + diem1.diemTNXH + '\nĐiểm Khoa Học: ' + diem1.diemKhoaHoc + '\nĐiểm Lịch Sử & Địa Lý: ' + diem1.diemLSDL + '\nĐiểm Thể Dục: ' + diem1.diemTheDuc + '\nĐiểm Âm Nhạc: ' + diem1.diemAmNhac + '\nĐiểm Rèn Luyện: ' + diem1.diemRenLuyen + '\nNhận Xét Của Giáo Viên: ' + diem1.nhanXet
        // điểm học kỳ 2
        let mailTextHK2 = '\n\nHọc Kỳ 2:\nĐiểm toán: ' + diem2.diemToan + '\nĐiểm Tiếng Việt: ' + diem2.diemTiengViet + '\nĐiểm Đạo Đức: ' + diem2.diemDaoDuc + '\nĐiểm Tự Nhiên & Xã Hội: ' + diem2.diemTNXH + '\nĐiểm Khoa Học: ' + diem2.diemKhoaHoc + '\nĐiểm Lịch Sử & Địa Lý: ' + diem2.diemLSDL + '\nĐiểm Thể Dục: ' + diem2.diemTheDuc + '\nĐiểm Âm Nhạc: ' + diem2.diemAmNhac + '\nĐiểm Rèn Luyện: ' + diem2.diemRenLuyen + '\nNhận Xét Của Giáo Viên: ' + diem2.nhanXet
        // lấy họ tên giáo viên gắn vào lời kết
        let [tenGV] = await pool.execute('select hotenGV from giaovien where id = ?', [idGV])
        let hoTenGV = tenGV[0].hotenGV //họ tên giáo viên
        // console.log(hoTenGV)
        // lời kết Email
        let loiKet = '\n\nTrân Trọng.\n' + hoTenGV + ' - Trường Tiểu Học Nguyễn Du'
        let mailText = loiChao + mailTextHK1 + mailTextHK2 + loiKet// nội dung mail
        let mailOptions = {
            from: 'huynhduc22031999st@gmail.com', // người gửi (ở đây làm ví dụ nên lấy email riêng của em)
            to: email, //người nhận (email của phụ huy), ở đây làm ví dụ nên lấy email của em (email trường cấp)
            subject: 'Kết Quả Học Tập Của Học Sinh ' + dsHS[i].hoTen + ', Năm Học ' + diem1.idNamHoc, //tiêu đề email
            text: mailText, // nội dung e mail
        };

        // gửi mail cho phụ huynh học sinh(dsHS[i])
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) { // nếu lỗi: console.log lỗi
                console.log('Lỗi Gửi Email:', error);
            } else {// nếu đã gửi được: thông báo đã gửi xong
                console.log('Email đã gửi đến <' + email + '> thành công!');
            }
        });

    }
    return res.render('guiXongEmailDiem.ejs') // render ra thông báo đã gửi xong
}

let gvGuiMailSK = async (req, res) => {
    let { idGV, idLop } = req.params
    // console.log(idGV, idLop)
    // lấy id, họ tên và id phụ huynh của lớp
    let [dsHS] = await pool.execute('select id, hoTen, idPH from hocsinh where idLop = ?', [idLop])
    for (let i = 0; i < dsHS.length; i++) {
        // lấy email của phụ huynh để gửi
        let [phuhuynh] = await pool.execute('select email from phuhuynh where id = ?', [dsHS[i].idPH])
        let email = phuhuynh[0].email // email phụ huynh
        let [suckhoe] = await pool.execute('select * from suckhoe where idHS = ?', [dsHS[i].id])
        // console.log(suckhoe[0])
        let sucKhoe = suckhoe[0]
        let transporter = nodemailer.createTransport(
            smtpTransport({
                service: 'gmail',
                auth: {
                    user: 'huynhduc22031999st@gmail.com',
                    pass: 'ylgrlwtegwebxssj',
                },
            })
        );
        // console.log(sucKhoe)
        let d = sucKhoe.lichKham
        // console.log(d.toLocaleDateString())
        let date = d.toLocaleDateString()
        let loiChao = 'Chào quý phụ huynh, tôi là giáo viên chủ nhiệm của em ' + dsHS[i].hoTen + '\nĐây là báo cáo tình hình sức khỏe của em\nMời quý phụ huynh xe qua.'
        let [tenGV] = await pool.execute('select hotenGV from giaovien where id = ?', [idGV])
        let hoTenGV = tenGV[0].hotenGV //họ tên giáo viên
        // console.log(hoTenGV)
        // lời kết Email
        let loiKet = '\n\nTrân Trọng.\n' + hoTenGV + ' - Trường Tiểu Học Nguyễn Du'
        let baoCao = '\n\nHọ Tên: ' + dsHS[i].hoTen + '\nMã số học sinh: ' + sucKhoe.idHS + '\nChiều Cao: ' + sucKhoe.chieuCao + ' (Cm)\nCân Nặng: ' + sucKhoe.canNang + ' (Kg)\nTình Trạng Sức Khỏe: ' + sucKhoe.tinhTrangSK + '\nSố Mũi Covid Đã Tiêm: ' + sucKhoe.soMuiCovid + '\nLịch Khám Sức Khỏe: ' + date
        let mailOptions = {
            from: 'huynhduc22031999st@gmail.com',
            to: email,
            subject: 'Báo Cáo Tình Hình Sức Khỏe Hoc Sinh' + dsHS[i].hoTen,
            text: loiChao + baoCao + loiKet,
        };
        // gửi mail cho phụ huynh học sinh(dsHS[i])
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) { // nếu lỗi: console.log lỗi
                console.log('Lỗi Gửi Email:', error);
            } else {// nếu đã gửi được: thông báo đã gửi xong
                console.log('Email đã gửi đến <' + email + '> thành công!');
            }
        });

    }
    return res.render('guiXongMailSK.ejs')
}

let gvGuiMail = async (req, res) => {
    // console.log(req.params)
    let { idGV, idLop } = req.params
    let [dsHS] = await pool.execute('select * from hocsinh where idLop = ?', [idLop]);
    // console.log(dsHS[0])
    let transporter = nodemailer.createTransport(
        smtpTransport({
            service: 'gmail',
            auth: {
                user: 'huynhduc22031999st@gmail.com',
                pass: 'ylgrlwtegwebxssj',
            },
        })
    );


    let mailOptions = {
        from: 'huynhduc22031999st@gmail.com',
        to: 'ducb1709531@student.ctu.edu.vn',
        subject: 'Email Subject',
        text: 'Email Content',
    };

    // transporter.sendMail(mailOptions, (error, info) => {
    //     if (error) {
    //         console.log('Error sending email:', error);
    //     } else {
    //         console.log('Email sent:', info.response);
    //     }
    // });
    return res.send('da gui email thanh cong!')

}

let gvSuaDiemHK1 = async (req, res) => {
    // phần code kiểm tra thời gian nhập điểm, uncomment để sử dụng 
    // 
    // trước tiên, kiểm tra xem thời gian nhập điểm có trong thời gian cho phép nhập điểm hay không
    // Lấy thời gian hiện tại
    let currentDate = new Date();
    // Đặt thời gian bắt đầu và kết thúc
    let startDate = new Date(currentDate.getFullYear(), thangBD, ngayBD); // Ngày 29 tháng 6
    // console.log(startDate)
    let endDate = new Date(currentDate.getFullYear() + 1, thangKT, ngayKT); // Ngày 15 tháng 1 năm sau
    // Kiểm tra nếu thời gian hiện tại nằm ngoài thời hạn
    if (currentDate < startDate || currentDate > endDate) {
        // nếu thời gian nhập điểm nằm ngoài hạn nhập điểm: báo lỗi, không cho nhập điểm:
        console.log("Lỗi, hết thời gian nhập điểm");
        return res.render("hetThoiGianNhapDiem.ejs");
    }
    let [namhoc] = await pool.execute('select id from namhoc where tinhTrang = 1')
    // console.log(namhoc[0].id)
    let idNamHoc = namhoc[0].id
    let idHK = 1

    // console.log(req.params)
    let { idGV, idLop } = req.params
    // console.log(idGV, idLop)
    // lấy tên lớp, họ tên giáo viên của lớp
    let [tenLop] = await pool.execute('select tenLop from lophoc where id = ?', [idLop])
    let tenLopHoc = tenLop[0].tenLop
    let [tenGV] = await pool.execute('select hoTenGV from giaovien where id = ?', [idGV])
    // console.log(tenGV[0].hoTenGV)
    let hoTenGV = tenGV[0].hoTenGV

    let [dsHS] = await pool.execute('select id, hoTen from hocsinh where idLop = ?', [idLop])
    // console.log(hocsinh)
    let [siso] = await pool.execute('select COUNT(*) from hocsinh where idLop = ?', [idLop])
    // console.log(siso)
    let a = Object.values(JSON.parse(JSON.stringify(siso[0])))
    // console.log(a[0])
    let siSo = a[0]


    let dsDiem = {} // tạo danh sách lưu điểm của học sinh để truyền vào khi render file ejs
    for (let i = 0; i < dsHS.length; i++) { // theo danh sách học sinh, select diểm của học sinh đó...
        let [diem] = await pool.execute('select * from diem where idHS = ? and idHK = ? and idNamHoc = ?', [dsHS[i].id, idHK, idNamHoc])
        dsDiem[i] = diem[0] // ... và lưu vào mảng dsDem
        let a = JSON.stringify(diem)
        if (a == '[]') { // nếu học sinh đó chưa có (chưa nhập) điểm, thì truyền vào chuỗi rỗng.
            dsDiem[i] = {
                diemToan: '',
                NXToan: '',
                diemTiengViet: '',
                NXTiengViet: '',
                diemDaoDuc: '',
                NXDaoDuc: '',
                diemTNXH: '',
                NXTNXH: '',
                diemKhoaHoc: '',
                NXKhoaHoc: '',
                diemLSDL: '',
                NXLSDL: '',
                diemTheDuc: '',
                NXTheDuc: '',
                diemAmNhac: '',
                NXAmNhac: '',
                diemRenLuyen: '',
                NXRenLuyen: '',
                nhanXet: ''
            }
        }
    }
    // console.log(dsHS)
    // console.log(dsDiem)
    return res.render('gvSuaDiemHK1.ejs', { dataHocSinh: dsHS, idGV, idLop, siSo, tenLopHoc, hoTenGV, dsDiem })
}

let gvSuaDiemHK2 = async (req, res) => {
    // phần code kiểm tra thời gian nhập điểm, uncomment để sử dụng 
    // 
    // trước tiên, kiểm tra xem thời gian nhập điểm có trong thời gian cho phép nhập điểm hay không
    // Lấy thời gian hiện tại
    let currentDate = new Date();
    // Đặt thời gian bắt đầu và kết thúc
    let startDate = new Date(currentDate.getFullYear(), thangBD2, ngayBD2); // Ngày 29 tháng 6
    // console.log(startDate)
    let endDate = new Date(currentDate.getFullYear() + 1, thangKT2, ngayKT2); // Ngày 15 tháng 1 năm sau
    // Kiểm tra nếu thời gian hiện tại nằm ngoài thời hạn
    if (currentDate < startDate || currentDate > endDate) {
        // nếu thời gian nhập điểm nằm ngoài hạn nhập điểm: báo lỗi, không cho nhập điểm:
        console.log("Lỗi, hết thời gian nhập điểm");
        return res.render("hetThoiGianNhapDiem.ejs");
    }

    let [namhoc] = await pool.execute('select id from namhoc where tinhTrang = 1')
    // console.log(namhoc[0].id)
    let idNamHoc = namhoc[0].id
    let idHK = 2

    // console.log(req.params)
    let { idGV, idLop } = req.params
    // console.log(idGV, idLop)
    // lấy tên lớp, họ tên giáo viên của lớp
    let [tenLop] = await pool.execute('select tenLop from lophoc where id = ?', [idLop])
    let tenLopHoc = tenLop[0].tenLop
    let [tenGV] = await pool.execute('select hoTenGV from giaovien where id = ?', [idGV])
    // console.log(tenGV[0].hoTenGV)
    let hoTenGV = tenGV[0].hoTenGV

    let [dsHS] = await pool.execute('select id, hoTen from hocsinh where idLop = ?', [idLop])
    // console.log(hocsinh)
    let [siso] = await pool.execute('select COUNT(*) from hocsinh where idLop = ?', [idLop])
    // console.log(siso)
    let a = Object.values(JSON.parse(JSON.stringify(siso[0])))
    // console.log(a[0])
    let siSo = a[0]


    let dsDiem = {} // tạo danh sách lưu điểm của học sinh để truyền vào khi render file ejs
    for (let i = 0; i < dsHS.length; i++) { // theo danh sách học sinh, select diểm của học sinh đó...
        let [diem] = await pool.execute('select * from diem where idHS = ? and idHK = ? and idNamHoc = ?', [dsHS[i].id, idHK, idNamHoc])
        dsDiem[i] = diem[0] // ... và lưu vào mảng dsDem
        let a = JSON.stringify(diem)
        if (a == '[]') { // nếu học sinh đó chưa có (chưa nhập) điểm, thì truyền vào chuỗi rỗng.
            dsDiem[i] = {
                diemToan: '',
                NXToan: '',
                diemTiengViet: '',
                NXTiengViet: '',
                diemDaoDuc: '',
                NXDaoDuc: '',
                diemTNXH: '',
                NXTNXH: '',
                diemKhoaHoc: '',
                NXKhoaHoc: '',
                diemLSDL: '',
                NXLSDL: '',
                diemTheDuc: '',
                NXTheDuc: '',
                diemAmNhac: '',
                NXAmNhac: '',
                diemRenLuyen: '',
                NXRenLuyen: '',
                nhanXet: ''
            }
        }
    }
    // console.log(dsHS)
    // console.log(dsDiem)
    return res.render('gvSuaDiemHK1.ejs', { dataHocSinh: dsHS, idGV, idLop, siSo, tenLopHoc, hoTenGV, dsDiem })
}

let postGvSuaDiemHK1 = async (req, res) => {
    // console.log(req.body)
    let idLop = req.body.idLop
    let idGV = req.body.idGV

    // console.log(idLop, idGV)
    let [hocsinh] = await pool.execute('select id from hocsinh where idLop = ?', [idLop])
    // console.log(hocsinh)
    let [namhoc] = await pool.execute('select id from namhoc where tinhTrang = 1')
    // console.log(namhoc[0].id)
    let idNamHoc = namhoc[0].id
    let idHK = 1
    for (let i = 0; i < hocsinh.length; i++) {
        // xem học sinh hiện tại đã có điểm trong học kỳ và năm hiện tại đang nhập không, nếu CHƯA có thìk hông sửa
        let [diemcu] = await pool.execute('select * from diem where idHS = ? AND idHK = ? AND idNamHoc = ?',
            [hocsinh[i].id, idHK, idNamHoc]) // tìm idHS, idNamHoc, idHK hiện tại trong bảng "diem"
        // console.log(diemcu[0])
        let stringa = JSON.stringify(diemcu)
        if (stringa == '[]') { // nếu chưa có thì bỏ qua học sinh này
            console.log('học sinh có id: ' + diemcu[0].idHS + ' đã có điểm trong CSDL!')
            continue
        }

        let diemToan = eval('req.body.diemToan' + hocsinh[i].id)
        let NXToan = eval('req.body.NXToan' + hocsinh[i].id)
        let diemTiengViet = eval('req.body.diemTiengViet' + hocsinh[i].id)
        let NXTiengViet = eval('req.body.NXToan' + hocsinh[i].id)
        let diemDaoDuc = eval('req.body.diemDaoDuc' + hocsinh[i].id)
        let NXDaoDuc = eval('req.body.NXToan' + hocsinh[i].id)
        let diemTNXH = eval('req.body.diemTNXH' + hocsinh[i].id)
        let NXTNXH = eval('req.body.NXToan' + hocsinh[i].id)
        let diemKhoaHoc = eval('req.body.diemKhoaHoc' + hocsinh[i].id)
        let NXKhoaHoc = eval('req.body.NXToan' + hocsinh[i].id)
        let diemLSDL = eval('req.body.diemLSDL' + hocsinh[i].id)
        let NXLSDL = eval('req.body.NXToan' + hocsinh[i].id)
        let diemTheDuc = eval('req.body.diemTheDuc' + hocsinh[i].id)
        let NXTheDuc = eval('req.body.NXToan' + hocsinh[i].id)
        let diemAmNhac = eval('req.body.diemAmNhac' + hocsinh[i].id)
        let NXAmNhac = eval('req.body.NXToan' + hocsinh[i].id)
        let diemRenLuyen = eval('req.body.diemRenLuyen' + hocsinh[i].id)
        let NXRenLuyen = eval('req.body.NXToan' + hocsinh[i].id)
        let nhanXet = eval('req.body.nhanXet' + hocsinh[i].id)
        // console.log(NXToan, NXTiengViet, NXDaoDuc, NXTNXH, NXKhoaHoc, NXLSDL, NXTheDuc, NXAmNhac, NXRenLuyen)
        // console.log(diemToan, diemTiengViet, diemDaoDuc, diemTNXH, diemKhoaHoc, diemLSDL, diemTheDuc, diemAmNhac)
        await pool.execute('update diem set diemToan = ?,NXToan = ?, diemTiengViet = ?,NXTiengViet = ?, diemDaoDuc = ?,NXDaoDuc = ?, diemTNXH = ?,NXTNXH = ?, diemKhoaHoc = ?,NXKhoaHoc = ?, diemLSDL = ?,NXLSDL = ?, diemTheDuc = ?,NXTheDuc = ?, diemAmNhac = ?,NXAmNhac = ?, diemRenLuyen = ?,NXRenLuyen = ?, nhanXet = ? where(idHS = ? AND idHK = ? AND idNamHoc = ?)',
            [diemToan, NXToan, diemTiengViet, NXTiengViet, diemDaoDuc, NXDaoDuc, diemTNXH, NXTNXH, diemKhoaHoc, NXKhoaHoc, diemLSDL, NXLSDL, diemTheDuc, NXTheDuc, diemAmNhac, NXAmNhac, diemRenLuyen, NXRenLuyen, nhanXet, hocsinh[i].id, idHK, idNamHoc])
    }
    let a = '/giao-vien/' + idGV + '/xem-lop-hoc'
    // console.log(a)
    return res.redirect(a)
}

let postGvSuaDiemHK2 = async (req, res) => {
    // console.log(req.body)
    let idLop = req.body.idLop
    let idGV = req.body.idGV

    // console.log(idLop, idGV)
    let [hocsinh] = await pool.execute('select id from hocsinh where idLop = ?', [idLop])
    // console.log(hocsinh)
    let [namhoc] = await pool.execute('select id from namhoc where tinhTrang = 1')
    // console.log(namhoc[0].id)
    let idNamHoc = namhoc[0].id
    let idHK = 2
    for (let i = 0; i < hocsinh.length; i++) {
        // xem học sinh hiện tại đã có điểm trong học kỳ và năm hiện tại đang nhập không, nếu CHƯA có thìk hông sửa
        let [diemcu] = await pool.execute('select * from diem where idHS = ? AND idHK = ? AND idNamHoc = ?',
            [hocsinh[i].id, idHK, idNamHoc]) // tìm idHS, idNamHoc, idHK hiện tại trong bảng "diem"
        // console.log(diemcu[0])
        let stringa = JSON.stringify(diemcu)
        if (stringa == '[]') { // nếu chưa có thì bỏ qua học sinh này
            console.log('học sinh có id: ' + diemcu[0].idHS + ' đã có điểm trong CSDL!')
            continue
        }

        let diemToan = eval('req.body.diemToan' + hocsinh[i].id)
        let NXToan = eval('req.body.NXToan' + hocsinh[i].id)
        let diemTiengViet = eval('req.body.diemTiengViet' + hocsinh[i].id)
        let NXTiengViet = eval('req.body.NXToan' + hocsinh[i].id)
        let diemDaoDuc = eval('req.body.diemDaoDuc' + hocsinh[i].id)
        let NXDaoDuc = eval('req.body.NXToan' + hocsinh[i].id)
        let diemTNXH = eval('req.body.diemTNXH' + hocsinh[i].id)
        let NXTNXH = eval('req.body.NXToan' + hocsinh[i].id)
        let diemKhoaHoc = eval('req.body.diemKhoaHoc' + hocsinh[i].id)
        let NXKhoaHoc = eval('req.body.NXToan' + hocsinh[i].id)
        let diemLSDL = eval('req.body.diemLSDL' + hocsinh[i].id)
        let NXLSDL = eval('req.body.NXToan' + hocsinh[i].id)
        let diemTheDuc = eval('req.body.diemTheDuc' + hocsinh[i].id)
        let NXTheDuc = eval('req.body.NXToan' + hocsinh[i].id)
        let diemAmNhac = eval('req.body.diemAmNhac' + hocsinh[i].id)
        let NXAmNhac = eval('req.body.NXToan' + hocsinh[i].id)
        let diemRenLuyen = eval('req.body.diemRenLuyen' + hocsinh[i].id)
        let NXRenLuyen = eval('req.body.NXToan' + hocsinh[i].id)
        let nhanXet = eval('req.body.nhanXet' + hocsinh[i].id)
        // console.log(NXToan, NXTiengViet, NXDaoDuc, NXTNXH, NXKhoaHoc, NXLSDL, NXTheDuc, NXAmNhac, NXRenLuyen)
        // console.log(diemToan, diemTiengViet, diemDaoDuc, diemTNXH, diemKhoaHoc, diemLSDL, diemTheDuc, diemAmNhac)
        await pool.execute('update diem set diemToan = ?,NXToan = ?, diemTiengViet = ?,NXTiengViet = ?, diemDaoDuc = ?,NXDaoDuc = ?, diemTNXH = ?,NXTNXH = ?, diemKhoaHoc = ?,NXKhoaHoc = ?, diemLSDL = ?,NXLSDL = ?, diemTheDuc = ?,NXTheDuc = ?, diemAmNhac = ?,NXAmNhac = ?, diemRenLuyen = ?,NXRenLuyen = ?, nhanXet = ? where(idHS = ? AND idHK = ? AND idNamHoc = ?)',
            [diemToan, NXToan, diemTiengViet, NXTiengViet, diemDaoDuc, NXDaoDuc, diemTNXH, NXTNXH, diemKhoaHoc, NXKhoaHoc, diemLSDL, NXLSDL, diemTheDuc, NXTheDuc, diemAmNhac, NXAmNhac, diemRenLuyen, NXRenLuyen, nhanXet, hocsinh[i].id, idHK, idNamHoc])
    }
    let a = '/giao-vien/' + idGV + '/xem-lop-hoc'
    // console.log(a)
    return res.redirect(a)
}


module.exports = {
    giaoVienGetUpdateGiaoVienPage,
    giaoVienUpdateGiaoVien, giaoVienXemLopHoc, giaoVienGetThongTinHocSinh, giaoVienGetUpdateHocSinhPage,
    giaoVienPostUpdateHocSinh, giaoVienXemDiemLopHK1, giaoVienNhapDiemLopHK1, postgiaoVienNhapDiemLopHK1,
    giaoVienXemDiemLopHK2, giaoVienNhapDiemLopHK2, postgiaoVienNhapDiemLopHK2, giaoVienXemDSHS, giaoVienXemSucKhoeLop,
    giaoVienCapNhatSucKhoeLop, postGiaoVienCapNhatSucKhoeLop, giaoVienXemDSThongBaoLop, giaoVienVietThongBaoLop,
    postgiaoVienVietThongBaoLop, giaoVienXoaThongBaoLop, gvNhapDiemTuFile, postgvNhapDiemTuFile, gvXuatMauFileNhapDiem,
    gvGuiMail, gvGuiMailDiem, gvGuiMailSK, gvSuaDiemHK1, gvSuaDiemHK2, postGvSuaDiemHK1, postGvSuaDiemHK2
}