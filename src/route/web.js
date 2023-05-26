import express from "express";
import homeController from '../controller/homeController';
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
    router.get('/danh-sach-hoc-sinh', homeController.getDanhSachHocSinh);

    //page Export xlsx danh sách học sinh
    router.get('/danh-sach-hoc-sinh/export', homeController.getPageExportDSHS)

    //thong tin hoc sinh:
    router.get('/thong-tin-hoc-sinh/:id', homeController.getThongTinHocSinh);

    //get page dien thong tin hoc sinh moi:
    router.get('/them-hoc-sinh-page', homeController.getThemHocSinhPage);

    //route tao hoc sinh, su dung du lieu thu page dien thong tin hoc sinh moi:
    router.post('/tao-hoc-sinh-moi', homeController.themHocSinh);

    //get page dien thong tin can sua cua 1 hoc sinh:
    router.get('/sua-thong-tin-hoc-sinh/:id', homeController.getUpdateHocSinhPage);

    //route post thong tin can sua len CSDL:
    router.post('/post-update-hoc-sinh', homeController.updateHocSinh);

    //delete hoc sinh
    router.post('/delete-hoc-sinh', homeController.deleteHocSinh);

    //get danh sach phu huynh
    router.get('/danh-sach-phu-huynh', homeController.getDanhSachPhuHuynh);

    //export danh sach phu huynh page
    router.get('/danh-sach-phu-huynh/export', homeController.getPageExportDSPH)

    //get thong tin phu huynh
    router.get('/thong-tin-phu-huynh/:id', homeController.getThongTinPhuHuynh);

    //get page them phu huynh moi
    router.get('/them-phu-huynh-page', homeController.getThemPhuHuynhPage);

    //post thong tin phu huynh moi tu getThemPhuHuynhPage len CSDL
    router.post('/tao-phu-huynh-moi', homeController.themPhuHuynh);

    //xoa phu huynh
    router.post('/delete-phu-huynh', homeController.deletePhuHuynh);

    //get thong tin tai khoan
    router.get('/thong-tin-tai-khoan/:idTK', homeController.getThongTinTaiKhoan);

    //delete thong tin phu huynh va ca hoc sinh kem theo phu huynh do
    router.post('/delete-het-luon', homeController.deleteHetLuon);

    //danh sach giao vien page
    router.get('/danh-sach-giao-vien', homeController.getDanhSachGiaoVien);

    //export danh sach giao vien page
    router.get('/danh-sach-giao-vien/export', homeController.getPageExportDSGV);

    //thong tin chi tiet cua giao vien
    router.get('/thong-tin-giao-vien/:id', homeController.getThongTinGiaoVien);

    //xoa giao vien
    router.post('/delete-giao-vien', homeController.deleteGiaoVien);

    //get them giao vien page
    router.get('/them-giao-vien-page', homeController.getThemGiaoVienPage);

    //tao giao vien moi
    router.post('/tao-giao-vien-moi', homeController.themGiaoVien);

    //getUpdatePhuHuynhPage
    router.get('/sua-thong-tin-phu-huynh/:id', homeController.getUpdatePhuHuynhPage);

    //post update Phu Huynh
    router.post('/post-update-phu-huynh', homeController.updatePhuHuynh);

    //getUpdateGiaoVienPage
    router.get('/sua-thong-tin-giao-vien/:id', homeController.getUpdateGiaoVienPage);

    //post updateGiaoVien
    router.post('/post-update-giao-vien', homeController.updateGiaoVien);

    //danh sach lop hoc
    router.get('/danh-sach-lop-hoc', homeController.getDanhSachLopHoc);

    //thong tin lop hoc
    router.get('/thong-tin-lop-hoc/:id', homeController.getThongTinLopHoc);

    //delete Lop Hoc
    router.post('/delete-lop-hoc', homeController.deleteLopHoc);

    //get page tao lop hoc
    router.get('/them-lop-hoc-page', homeController.getThemLopHocPage);

    //tao lop hoc moi
    router.post('/tao-lop-hoc-moi', homeController.themLopHoc);

    //getUpdateLopHocPage: chuyen den trang update lop hoc
    router.get('/sua-thong-tin-lop-hoc/:id', homeController.getUpdateLopHocPage);

    //post updateLopHoc
    router.post('/post-update-lop-hoc', homeController.updateLopHoc);

    //get view giao vien
    router.get('/giao-vien/:id', homeController.getViewGiaoVien);

    //giaoVienGetUpdateGiaoVienPage: Giáo viên tự cập nhật thông tin của mình
    router.get('/gv-sua-thong-tin-giao-vien/:id', homeController.giaoVienGetUpdateGiaoVienPage);

    //giaoVien post updateGiaoVien: Giáo viên tự cập nhật thông tin của mình
    router.post('/gv-post-update-giao-vien', homeController.giaoVienUpdateGiaoVien);

    //giao vien xem lop hoc cua minh
    router.get('/giao-vien/:idGV/xem-lop-hoc', homeController.giaoVienXemLopHoc);

    //giáo viên xem thông tin học sinh của lớp mình chủ nhiệm
    router.get('/gv-thong-tin-hoc-sinh/:id', homeController.giaoVienGetThongTinHocSinh);

    //giáo viên get page sửa thông tin học sinh của lớp mình chủ nhiệm
    router.get('/gv-sua-thong-tin-hoc-sinh/:id', homeController.giaoVienGetUpdateHocSinhPage);

    //giáo viên post update học sinh
    router.post('/gv-post-update-hoc-sinh', homeController.giaoVienPostUpdateHocSinh);

    //giáo viên xem điểm học sinh lớp mình (học kỳ 1)
    router.get('/giao-vien/:idGV/xem-diem/hoc-ky-1/:idLop', homeController.giaoVienXemDiemLopHK1);

    //giáo viên xem điểm học sinh lớp mình (học kỳ 2)
    router.get('/giao-vien/:idGV/xem-diem/hoc-ky-2/:idLop', homeController.giaoVienXemDiemLopHK2);

    //get trang giáo viên nhập điểm cho học sinh lớp mình (học kỳ 1)
    router.get('/giao-vien/:idGV/nhap-diem/hoc-ky-1/:idLop', homeController.giaoVienNhapDiemLopHK1);

    //post điểm lớp giáo viên vừa nhập lên CSDL
    router.post('/giao-vien/:idGV/nhap-diem/hoc-ky-1/:idLop/post', homeController.postgiaoVienNhapDiemLopHK1);

    //get trang giáo viên nhập điểm cho học sinh lớp mình (học kỳ 2)
    router.get('/giao-vien/:idGV/nhap-diem/hoc-ky-2/:idLop', homeController.giaoVienNhapDiemLopHK2);

    //post điểm lớp giáo viên vừa nhập lên CSDL
    router.post('/giao-vien/:idGV/nhap-diem/hoc-ky-2/:idLop/post', homeController.postgiaoVienNhapDiemLopHK2);

    //giáo viên xem danh sách học sinh lớp mình
    router.get('/danh-sach-hoc-sinh-lop/:idLop', homeController.giaoVienXemDSHS);

    //giáo viên xem thống kê sức khỏe học sinh lớp mình
    router.get('/giao-vien/:idGV/xem-lop-hoc/:idLop/xem-suc-khoe/', homeController.giaoVienXemSucKhoeLop);

    //giáo viên cập nhật tình hình sức khỏe học sinh lớp mình
    router.get('/giao-vien/:idGV/xem-lop-hoc/:idLop/cap-nhat-suc-khoe/', homeController.giaoVienCapNhatSucKhoeLop);

    //post thông tin cập nhật sức khỏe học sinh của lớp
    router.post('/giao-vien/:idGV/xem-lop-hoc/:idLop/cap-nhat-suc-khoe/post', homeController.postGiaoVienCapNhatSucKhoeLop);

    //view phụ huynh
    router.get('/phu-huynh/:idPH', homeController.getViewPhuHuynh);

    //phụ huynh xem thông tin học sinh (là con em của mình)
    router.get('/phu-huynh/:idPH/xem-thong-tin-hoc-sinh/:idHS', homeController.phuHuynhXemThongTinHocSinh);

    //phụ huynh xem báo cáo sức khỏe con em mình
    router.get('/phu-huynh/:idPH/xem-suc-khoe-hoc-sinh/:idHS', homeController.phuHuynhXemSucKhoeHocSinh);

    //giáo viên xem danh sách thông báo của lớp
    router.get('/giao-vien/:idGV/xem-lop-hoc/:idLop/xem-thong-bao-lop', homeController.giaoVienXemDSThongBaoLop);

    //giáo viên viết thông báo cho lớp học
    router.get('/giao-vien/:idGV/xem-lop-hoc/:idLop/viet-thong-bao-lop', homeController.giaoVienVietThongBaoLop);

    //post thông báo giáo viên viết lên CSDL
    router.post('/giao-vien/:idGV/xem-lop-hoc/:idLop/viet-thong-bao-lop/post', homeController.postgiaoVienVietThongBaoLop);

    //giáo viên xóa thông báo lớp
    router.post('/giao-vien/:idGV/xem-lop-hoc/:idLop/xoa-thong-bao-lop', homeController.giaoVienXoaThongBaoLop);

    //phụ huynh xem thông báo lớp của con em mình
    router.get('/phu-huynh/:idPH/xem-thong-bao-lop-cua-hoc-sinh/:idHS', homeController.PHXemThongBaoLop);

    //giáo viên xuất mẫu file nhập điểm:
    router.get('/giao-vien/:idGV/xuat-mau-file-nhap-diem/:idLop', homeController.gvXuatMauFileNhapDiem);

    //get page giáo viên nhập điểm bằng file:
    router.get('/giao-vien/:idGV/nhap-diem-tu-file/hoc-ky-:idHK/:idLop', homeController.gvNhapDiemTuFile);

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

    router.get('/giao-vien/:idGV/nhap-diem-tu-file/hoc-ky-:idHK/:idLop/post', homeController.postgvNhapDiemTuFile);

    //giáo viên gửi mail tự động cho phụ huynh
    router.get('/giao-vien/:idGV/gui-mail/lop/:idLop', homeController.gvGuiMail);





    router.get('/about', (req, res) => {
        res.send(`Nguyen Huynh Duc - B1709531`)
    })

    return app.use('/', router)
}

export default initWebRoute;