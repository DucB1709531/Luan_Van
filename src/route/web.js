import express from "express";
import homeController from '../controller/homeController';
import adminController from '../controller/adminController';
import gVController from '../controller/gVController';
import pHController from '../controller/pHController';
import apiController from '../controller/apiController';
import pool from "../config/connectDB";



let router = express.Router();

const initWebRoute = (app) => {

    //home page:
    router.get('/', homeController.getHomepage);

    //page dang nhap
    router.get('/dang-nhap', homeController.getDangNhapPage);

    //dang nhap
    router.post('/post-dang-nhap', homeController.dangNhap);

    //view admin:
    router.get('/admin', homeController.getViewAdmin);

    //danh sach hoc sinh:
    router.get('/danh-sach-hoc-sinh', adminController.getDanhSachHocSinh);

    //page Export xlsx danh sách học sinh
    router.get('/danh-sach-hoc-sinh/export', adminController.getPageExportDSHS)

    //thong tin hoc sinh:
    router.get('/thong-tin-hoc-sinh/:id', adminController.getThongTinHocSinh);

    //get page dien thong tin hoc sinh moi:
    router.get('/them-hoc-sinh-page', adminController.getThemHocSinhPage);

    //route tao hoc sinh, su dung du lieu thu page dien thong tin hoc sinh moi:
    router.post('/tao-hoc-sinh-moi', adminController.themHocSinh);

    //get page dien thong tin can sua cua 1 hoc sinh:
    router.get('/sua-thong-tin-hoc-sinh/:id', adminController.getUpdateHocSinhPage);

    //route post thong tin can sua len CSDL:
    router.post('/post-update-hoc-sinh', adminController.updateHocSinh);

    //delete hoc sinh
    router.post('/delete-hoc-sinh', adminController.deleteHocSinh);

    //get danh sach phu huynh
    router.get('/danh-sach-phu-huynh', adminController.getDanhSachPhuHuynh);

    //export danh sach phu huynh page
    router.get('/danh-sach-phu-huynh/export', adminController.getPageExportDSPH)

    //get thong tin phu huynh
    router.get('/thong-tin-phu-huynh/:id', adminController.getThongTinPhuHuynh);

    //get page them phu huynh moi
    router.get('/them-phu-huynh-page', adminController.getThemPhuHuynhPage);

    //post thong tin phu huynh moi tu getThemPhuHuynhPage len CSDL
    router.post('/tao-phu-huynh-moi', adminController.themPhuHuynh);

    //xoa phu huynh
    router.post('/delete-phu-huynh', adminController.deletePhuHuynh);

    //get thong tin tai khoan
    router.get('/thong-tin-tai-khoan/:idTK', adminController.getThongTinTaiKhoan);

    //delete thong tin phu huynh va ca hoc sinh kem theo phu huynh do
    router.post('/delete-het-luon', adminController.deleteHetLuon);

    //danh sach giao vien page
    router.get('/danh-sach-giao-vien', adminController.getDanhSachGiaoVien);

    //export danh sach giao vien page
    router.get('/danh-sach-giao-vien/export', adminController.getPageExportDSGV);

    //thong tin chi tiet cua giao vien
    router.get('/thong-tin-giao-vien/:id', adminController.getThongTinGiaoVien);

    //xoa giao vien
    router.post('/delete-giao-vien', adminController.deleteGiaoVien);

    //get them giao vien page
    router.get('/them-giao-vien-page', adminController.getThemGiaoVienPage);

    //tao giao vien moi
    router.post('/tao-giao-vien-moi', adminController.themGiaoVien);

    //getUpdatePhuHuynhPage
    router.get('/sua-thong-tin-phu-huynh/:id', adminController.getUpdatePhuHuynhPage);

    //post update Phu Huynh
    router.post('/post-update-phu-huynh', adminController.updatePhuHuynh);

    //getUpdateGiaoVienPage
    router.get('/sua-thong-tin-giao-vien/:id', adminController.getUpdateGiaoVienPage);

    //post updateGiaoVien
    router.post('/post-update-giao-vien', adminController.updateGiaoVien);

    //danh sach lop hoc
    router.get('/danh-sach-lop-hoc', adminController.getDanhSachLopHoc);

    //thong tin lop hoc
    router.get('/thong-tin-lop-hoc/:id', adminController.getThongTinLopHoc);

    //delete Lop Hoc
    router.post('/delete-lop-hoc', adminController.deleteLopHoc);

    //get page tao lop hoc
    router.get('/them-lop-hoc-page', adminController.getThemLopHocPage);

    //tao lop hoc moi
    router.post('/tao-lop-hoc-moi', adminController.themLopHoc);

    //getUpdateLopHocPage: chuyen den trang update lop hoc
    router.get('/sua-thong-tin-lop-hoc/:id', adminController.getUpdateLopHocPage);

    //post updateLopHoc
    router.post('/post-update-lop-hoc', adminController.updateLopHoc);

    //get view giao vien
    router.get('/giao-vien/:id', homeController.getViewGiaoVien);

    //giaoVienGetUpdateGiaoVienPage: Giáo viên tự cập nhật thông tin của mình
    router.get('/gv-sua-thong-tin-giao-vien/:id', gVController.giaoVienGetUpdateGiaoVienPage);

    //giaoVien post updateGiaoVien: Giáo viên tự cập nhật thông tin của mình
    router.post('/gv-post-update-giao-vien', gVController.giaoVienUpdateGiaoVien);

    //giao vien xem lop hoc cua minh
    router.get('/giao-vien/:idGV/xem-lop-hoc', gVController.giaoVienXemLopHoc);

    //giáo viên xem thông tin học sinh của lớp mình chủ nhiệm
    router.get('/gv-thong-tin-hoc-sinh/:id', gVController.giaoVienGetThongTinHocSinh);

    //giáo viên get page sửa thông tin học sinh của lớp mình chủ nhiệm
    router.get('/gv-sua-thong-tin-hoc-sinh/:id', gVController.giaoVienGetUpdateHocSinhPage);

    //giáo viên post update học sinh
    router.post('/gv-post-update-hoc-sinh', gVController.giaoVienPostUpdateHocSinh);

    //giáo viên xem điểm học sinh lớp mình (học kỳ 1)
    router.get('/giao-vien/:idGV/xem-diem/hoc-ky-1/:idLop', gVController.giaoVienXemDiemLopHK1);

    //giáo viên xem điểm học sinh lớp mình (học kỳ 2)
    router.get('/giao-vien/:idGV/xem-diem/hoc-ky-2/:idLop', gVController.giaoVienXemDiemLopHK2);

    //get trang giáo viên nhập điểm cho học sinh lớp mình (học kỳ 1)
    router.get('/giao-vien/:idGV/nhap-diem/hoc-ky-1/:idLop', gVController.giaoVienNhapDiemLopHK1);

    //post điểm lớp giáo viên vừa nhập lên CSDL
    router.post('/giao-vien/:idGV/nhap-diem/hoc-ky-1/:idLop/post', gVController.postgiaoVienNhapDiemLopHK1);

    //get trang giáo viên nhập điểm cho học sinh lớp mình (học kỳ 2)
    router.get('/giao-vien/:idGV/nhap-diem/hoc-ky-2/:idLop', gVController.giaoVienNhapDiemLopHK2);

    //post điểm lớp giáo viên vừa nhập lên CSDL
    router.post('/giao-vien/:idGV/nhap-diem/hoc-ky-2/:idLop/post', gVController.postgiaoVienNhapDiemLopHK2);

    //giáo viên xem danh sách học sinh lớp mình
    router.get('/danh-sach-hoc-sinh-lop/:idLop', gVController.giaoVienXemDSHS);

    //giáo viên xem thống kê sức khỏe học sinh lớp mình
    router.get('/giao-vien/:idGV/xem-lop-hoc/:idLop/xem-suc-khoe/', gVController.giaoVienXemSucKhoeLop);

    //giáo viên cập nhật tình hình sức khỏe học sinh lớp mình
    router.get('/giao-vien/:idGV/xem-lop-hoc/:idLop/cap-nhat-suc-khoe/', gVController.giaoVienCapNhatSucKhoeLop);

    //post thông tin cập nhật sức khỏe học sinh của lớp
    router.post('/giao-vien/:idGV/xem-lop-hoc/:idLop/cap-nhat-suc-khoe/post', gVController.postGiaoVienCapNhatSucKhoeLop);

    //view phụ huynh
    router.get('/phu-huynh/:idPH', homeController.getViewPhuHuynh);

    //phụ huynh xem thông tin học sinh (là con em của mình)
    router.get('/phu-huynh/:idPH/xem-thong-tin-hoc-sinh/:idHS', pHController.phuHuynhXemThongTinHocSinh);

    //phụ huynh xem báo cáo sức khỏe con em mình
    router.get('/phu-huynh/:idPH/xem-suc-khoe-hoc-sinh/:idHS', pHController.phuHuynhXemSucKhoeHocSinh);

    //giáo viên xem danh sách thông báo của lớp
    router.get('/giao-vien/:idGV/xem-lop-hoc/:idLop/xem-thong-bao-lop', gVController.giaoVienXemDSThongBaoLop);

    //giáo viên viết thông báo cho lớp học
    router.get('/giao-vien/:idGV/xem-lop-hoc/:idLop/viet-thong-bao-lop', gVController.giaoVienVietThongBaoLop);

    //post thông báo giáo viên viết lên CSDL
    router.post('/giao-vien/:idGV/xem-lop-hoc/:idLop/viet-thong-bao-lop/post', gVController.postgiaoVienVietThongBaoLop);

    //giáo viên xóa thông báo lớp
    router.post('/giao-vien/:idGV/xem-lop-hoc/:idLop/xoa-thong-bao-lop', gVController.giaoVienXoaThongBaoLop);

    //phụ huynh xem thông báo lớp của con em mình
    router.get('/phu-huynh/:idPH/xem-thong-bao-lop-cua-hoc-sinh/:idHS', pHController.PHXemThongBaoLop);

    //giáo viên xuất mẫu file nhập điểm:
    router.get('/giao-vien/:idGV/xuat-mau-file-nhap-diem/:idLop', gVController.gvXuatMauFileNhapDiem);

    //get page giáo viên nhập điểm bằng file:
    router.get('/giao-vien/:idGV/nhap-diem-tu-file/hoc-ky-:idHK/:idLop', gVController.gvNhapDiemTuFile);

    // module multer dùng để upload file
    var multer = require('multer')
    var storage = multer.diskStorage({
        destination: function (req, fiile, cb) {
            cb(null, './src/upload')
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname)
        }
    })
    var upload = multer({ storage: storage })

    // upload file từ client lên server (trong trường hợp này thì client: 'desktop/excel', server: 'src/upload')
    app.post('/giao-vien/:idGV/nhap-diem-tu-file/hoc-ky-:idHK/:idLop/upload', upload.single("file"), function async(req, res) {
        // console.log(req.params)
        // console.log(req.file.path)
        let { idGV, idHK, idLop } = req.params
        let a = '/giao-vien/' + idGV + '/nhap-diem-tu-file/hoc-ky-' + idHK + '/' + idLop + '/post'
        // console.log(a)
        res.redirect(a)
    })

    router.get('/giao-vien/:idGV/nhap-diem-tu-file/hoc-ky-:idHK/:idLop/post', gVController.postgvNhapDiemTuFile);

    //page giáo viên gửi mail điểm tự động cho phụ huynh
    router.get('/giao-vien/:idGV/gui-email-diem/lop/:idLop', gVController.gvGuiMailDiem);

    //page giáo viên gửi mail báo cáo sức khỏe tự động cho phụ huynh
    router.get('/giao-vien/:idGV/gui-email-suc-khoe/lop/:idLop', gVController.gvGuiMailSK);

    router.get('/generate-pdf', pHController.xuatDiemRaPDF);

    router.get('/about', (req, res) => {
        res.send(`Nguyen Huynh Duc - B1709531`)
    })

    return app.use('/', router)
}

export default initWebRoute;