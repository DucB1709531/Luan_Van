import { render } from "ejs";
import pool from "../config/connectDB";
import { json } from "body-parser";
import nodemailer from 'nodemailer';
import smtpTransport from 'nodemailer-smtp-transport';
// var XLSX = require('xlsx');
// const multer = require("multer");
const Lead = require("../../node_modules/lead");
const path = require('path');



// home page
let getHomepage = async (req, res) => {
    // await pool.execute(`update phuhuynh SET email = 'huynhduc22031999st@gmail.com'`)

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

// view admin
let getViewAdmin = (req, res) => {
    return res.render('viewAdmin.ejs')
}

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
    let { hoTenGV, soDienThoaiGV, diaChiGV, taiKhoan, matKhau } = req.body;
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
    await pool.execute('insert into giaovien(hoTenGV, soDienThoaiGV, diaChiGV, coTK, tinhTrang) values (?, ?, ?, ?, ?)',
        [hoTenGV, soDienThoaiGV, diaChiGV, coTK, 1])
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

// view Giao Vien
let getViewGiaoVien = async (req, res) => {
    // console.log('params truyen len: ', req.params.id)
    let idGV = req.params.id
    let [giaovien] = await pool.execute('select * from giaovien where id = ?', [idGV])
    // console.log(giaovien[0].hoTenGV)
    let hoTenGV = giaovien[0].hoTenGV
    return res.render('viewGiaoVien.ejs', { detailsGiaoVien: giaovien[0], idGV, hoTenGV })
}

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
                diemTiengViet: '',
                diemDaoDuc: '',
                diemTNXH: '',
                diemKhoaHoc: '',
                diemLSDL: '',
                diemTheDuc: '',
                diemAmNhac: '',
                diemRenLuyen: '',
                nhanXet: ''
            }

        }
    }

    let [siso] = await pool.execute('select COUNT(*) from hocsinh where idLop = ?', [idLop])
    let a = Object.values(JSON.parse(JSON.stringify(siso[0])))
    // console.log(a[0])
    let siSo = a[0]
    // render ra view xem điểm, truyền các tham số vào.
    return res.render('giaoVienXemDiemHK1.ejs', { danhSachHocSinh: dsHS, danhSachDiem: dsDiem, tenLopHoc, idGV, hoTenGV, siSo })
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
                diemTiengViet: '',
                diemDaoDuc: '',
                diemTNXH: '',
                diemKhoaHoc: '',
                diemLSDL: '',
                diemTheDuc: '',
                diemAmNhac: '',
                diemRenLuyen: '',
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
    return res.render('giaoVienXemDiemHK2.ejs', { danhSachHocSinh: dsHS, danhSachDiem: dsDiem, tenLopHoc, idGV, hoTenGV, siSo })
}

let giaoVienNhapDiemLopHK1 = async (req, res) => {
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
        let diemToan = eval('req.body.diemToan' + hocsinh[i].id)
        let diemTiengViet = eval('req.body.diemTiengViet' + hocsinh[i].id)
        let diemDaoDuc = eval('req.body.diemDaoDuc' + hocsinh[i].id)
        let diemTNXH = eval('req.body.diemTNXH' + hocsinh[i].id)
        let diemKhoaHoc = eval('req.body.diemKhoaHoc' + hocsinh[i].id)
        let diemLSDL = eval('req.body.diemLSDL' + hocsinh[i].id)
        let diemTheDuc = eval('req.body.diemTheDuc' + hocsinh[i].id)
        let diemAmNhac = eval('req.body.diemAmNhac' + hocsinh[i].id)
        let diemRenLuyen = eval('req.body.diemRenLuyen' + hocsinh[i].id)
        let nhanXet = eval('req.body.nhanXet' + hocsinh[i].id)
        // console.log(idNamHoc)
        // console.log(diemToan, diemTiengViet, diemDaoDuc, diemTNXH, diemKhoaHoc, diemLSDL, diemTheDuc, diemAmNhac)
        await pool.execute('insert into diem(idHS, idHK, idNamHoc, diemToan, diemTiengViet, diemDaoDuc, diemTNXH, diemKhoaHoc, diemLSDL, diemTheDuc, diemAmNhac, diemRenLuyen, nhanXet) values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [hocsinh[i].id, idHK, idNamHoc, diemToan, diemTiengViet, diemDaoDuc, diemTNXH, diemKhoaHoc, diemLSDL, diemTheDuc, diemAmNhac, diemRenLuyen, nhanXet])
    }
    let a = '/giao-vien/' + idGV + '/xem-lop-hoc'
    // console.log(a)
    return res.redirect(a)
}

let giaoVienNhapDiemLopHK2 = async (req, res) => {
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
        let diemToan = eval('req.body.diemToan' + hocsinh[i].id)
        let diemTiengViet = eval('req.body.diemTiengViet' + hocsinh[i].id)
        let diemDaoDuc = eval('req.body.diemDaoDuc' + hocsinh[i].id)
        let diemTNXH = eval('req.body.diemTNXH' + hocsinh[i].id)
        let diemKhoaHoc = eval('req.body.diemKhoaHoc' + hocsinh[i].id)
        let diemLSDL = eval('req.body.diemLSDL' + hocsinh[i].id)
        let diemTheDuc = eval('req.body.diemTheDuc' + hocsinh[i].id)
        let diemAmNhac = eval('req.body.diemAmNhac' + hocsinh[i].id)
        let diemRenLuyen = eval('req.body.diemRenLuyen' + hocsinh[i].id)
        let nhanXet = eval('req.body.nhanXet' + hocsinh[i].id)
        // console.log(idNamHoc)
        // console.log(diemToan, diemTiengViet, diemDaoDuc, diemTNXH, diemKhoaHoc, diemLSDL, diemTheDuc, diemAmNhac)
        await pool.execute('insert into diem(idHS, idHK, idNamHoc, diemToan, diemTiengViet, diemDaoDuc, diemTNXH, diemKhoaHoc, diemLSDL, diemTheDuc, diemAmNhac, diemRenLuyen, nhanXet) values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [hocsinh[i].id, idHK, idNamHoc, diemToan, diemTiengViet, diemDaoDuc, diemTNXH, diemKhoaHoc, diemLSDL, diemTheDuc, diemAmNhac, diemRenLuyen, nhanXet])
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

let phuHuynhXemThongTinHocSinh = async (req, res) => {
    // console.log(req.params)
    let { idPH, idHS } = req.params

    let [hocsinh] = await pool.execute('select * from hocsinh where id = ?', [idHS])
    // console.log(hocsinh[0])
    let hoTenHS = hocsinh[0].hoTen

    let [phuhuynh] = await pool.execute('select hoTenPH from phuhuynh where id = ?', [idPH])
    // console.log(phuhuynh[0].hoTenPH)
    let hoTenPH = phuhuynh[0].hoTenPH

    let idLop = hocsinh[0].idLop
    let [lop] = await pool.execute('select * from lophoc where id = ?', [idLop])
    // console.log(lop)
    let tenLop = lop[0].tenLop

    let [giaovien] = await pool.execute('select hoTenGV from giaovien where id = ?', [lop[0].idGV])
    // console.log(giaovien[0])
    let hoTenGV = giaovien[0].hoTenGV

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
    // console.log(diemHK1, diemHK2)
    return res.render('pHXemDiemHS.ejs', { hoTenHS, hoTenPH, tenLop, hoTenGV, diemHK1, diemHK2 })
}

let phuHuynhXemSucKhoeHocSinh = async (req, res) => {
    // console.log(req.params)
    let { idPH, idHS } = req.params

    let [hocsinh] = await pool.execute('select * from hocsinh where id = ?', [idHS])
    // console.log(hocsinh[0])
    let hoTenHS = hocsinh[0].hoTen

    let [phuhuynh] = await pool.execute('select hoTenPH from phuhuynh where id = ?', [idPH])
    // console.log(phuhuynh[0].hoTenPH)
    let hoTenPH = phuhuynh[0].hoTenPH

    let idLop = hocsinh[0].idLop
    let [lop] = await pool.execute('select * from lophoc where id = ?', [idLop])
    // console.log(lop)
    let tenLop = lop[0].tenLop

    let [giaovien] = await pool.execute('select hoTenGV from giaovien where id = ?', [lop[0].idGV])
    // console.log(giaovien[0])
    let hoTenGV = giaovien[0].hoTenGV

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
    return res.render('phXemSucKhoeHS.ejs', { idHS, hoTenHS, hoTenPH, tenLop, hoTenGV, sucKhoeHS })
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

    await pool.execute('insert into thongbao(idLop, tieuDe, noiDung, ngayViet, nguoiViet) values(?, ?, ?, ?, ?)',
        [idLop, tieuDe, noiDung, date, hoTenGV])

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
    for (let i = 0; i < xlData.length; i++) { // duyệt qua từng dòng của sheet
        let hocsinh = Object.values(JSON.parse(JSON.stringify(xlData[i]))) // chuyển từng đứa học sinh về mảng để đọc
        // console.log(hocsinh)
        let idHS = hocsinh[1]
        // let hoTen = hocsinh[2]
        let diemToan = hocsinh[3]
        let diemTiengViet = hocsinh[4]
        let diemDaoDuc = hocsinh[5]
        let diemTNXH = hocsinh[6]
        let diemKhoaHoc = hocsinh[7]
        let diemLSDL = hocsinh[8]
        let diemTheDuc = hocsinh[9]
        let diemAmNhac = hocsinh[10]
        let diemRenLuyen = hocsinh[11]
        let nhanXet = hocsinh[12]
        // console.log(idHS, diemToan, diemTiengViet, diemDaoDuc, diemTNXH, diemKhoaHoc, diemLSDL, diemTheDuc, diemAmNhac, nhanXet)
        await pool.execute('insert into diem(idHS, idHK, idNamHoc, diemToan, diemTiengViet, diemDaoDuc, diemTNXH, diemKhoaHoc, diemLSDL, diemTheDuc, diemAmNhac, diemRenLuyen, nhanXet) values(?,?,?,?,?,?,?,?,?,?,?,?,?)',
            [idHS, idHK, idNamHoc, diemToan, diemTiengViet, diemDaoDuc, diemTNXH, diemKhoaHoc, diemLSDL, diemTheDuc, diemAmNhac, diemRenLuyen, nhanXet])
    }
    // return về view của giáo viên
    return res.redirect('/giao-vien/' + idGV + '/xem-lop-hoc')
}

let gvGuiMail = async (req, res) => {
    const transporter = nodemailer.createTransport(
        smtpTransport({
            service: 'gmail',
            auth: {
                user: 'huynhduc22031999st@gmail.com',
                pass: 'ylgrlwtegwebxssj',
            },
        })
    );

    const mailOptions = {
        from: 'huynhduc22031999st@gmail.com',
        to: 'ducb1709531@student.ctu.edu.vn',
        subject: 'Email Subject',
        text: 'Email Content',
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
    return res.send('da gui email thanh cong!')

}



module.exports = {
    getHomepage, getViewAdmin, dangNhap, getDanhSachHocSinh, getThongTinHocSinh, getThemHocSinhPage,
    themHocSinh, getUpdateHocSinhPage, updateHocSinh, deleteHocSinh, getDanhSachPhuHuynh, getThongTinPhuHuynh,
    getThemPhuHuynhPage, themPhuHuynh, deletePhuHuynh, getThongTinTaiKhoan, deleteHetLuon, getDanhSachGiaoVien,
    getThongTinGiaoVien, deleteGiaoVien, getThemGiaoVienPage, themGiaoVien, getUpdatePhuHuynhPage, updatePhuHuynh,
    getUpdateGiaoVienPage, updateGiaoVien, getDanhSachLopHoc, getThongTinLopHoc, deleteLopHoc, getThemLopHocPage,
    themLopHoc, getUpdateLopHocPage, updateLopHoc, getDangNhapPage, getViewGiaoVien, giaoVienGetUpdateGiaoVienPage,
    giaoVienUpdateGiaoVien, giaoVienXemLopHoc, giaoVienGetThongTinHocSinh, giaoVienGetUpdateHocSinhPage,
    giaoVienPostUpdateHocSinh, giaoVienXemDiemLopHK1, giaoVienNhapDiemLopHK1, postgiaoVienNhapDiemLopHK1,
    giaoVienXemDiemLopHK2, giaoVienNhapDiemLopHK2, postgiaoVienNhapDiemLopHK2, giaoVienXemDSHS, giaoVienXemSucKhoeLop,
    giaoVienCapNhatSucKhoeLop, postGiaoVienCapNhatSucKhoeLop, getViewPhuHuynh, phuHuynhXemThongTinHocSinh,
    phuHuynhXemSucKhoeHocSinh, giaoVienXemDSThongBaoLop, giaoVienVietThongBaoLop, postgiaoVienVietThongBaoLop,
    giaoVienXoaThongBaoLop, PHXemThongBaoLop, getPageExportDSHS, getPageExportDSPH, getPageExportDSGV,
    gvNhapDiemTuFile, postgvNhapDiemTuFile, gvXuatMauFileNhapDiem, gvGuiMail
}