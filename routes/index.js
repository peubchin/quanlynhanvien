var express = require('express');
var router = express.Router();
let MongoClient = require('mongodb-legacy').MongoClient;
let client = new MongoClient('mongodb://127.0.0.1:27017');
let csdl = client.db('quanlynhanvien');
const { ObjectId, AuthMechanism } = require('mongodb');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

/* GET home page */
router.get('/', function (req, res) {
  console.log(res.statusCode);
  res.render('index', {
    title: 'Express',
  });
});

/* Danh sách nhân viên */

router.get('/list', authMiddleware, async function (req, res) {
  try {
    let sortOrder = req.query.sort === 'desc' ? -1 : 1;
    let searchQuery = req.query.search || '';
    let page = parseInt(req.query.page) || 1; // Mặc định trang 1
    let limit = 5; // Giới hạn mỗi trang 5 nhân viên
    let filter = {};

    if (searchQuery) {
      filter.hoten = new RegExp(searchQuery, 'i'); // Tìm kiếm không phân biệt hoa thường
    }

    let totalDocs = await csdl.collection('nhanvien').countDocuments(filter);
    let nhanviens = await csdl
      .collection('nhanvien')
      .find(filter)
      .sort({ tuoi: sortOrder })
      .skip((page - 1) * limit) // Bỏ qua nhân viên của các trang trước
      .limit(limit) // Giới hạn số nhân viên hiển thị trên 1 trang
      .toArray();

    res.render('list.ejs', {
      title: 'List',
      nhanviens,
      sortOrder,
      searchQuery,
      currentPage: page,
      totalPages: Math.ceil(totalDocs / limit),
    });
  } catch (err) {
    console.error('Không lấy được danh sách nhân viên:', err);
  }
});

/* Thêm nhân viên */
router.get('/add', authMiddleware, roleMiddleware(['admin']), function (req, res) {
  res.render('add.ejs', { title: 'Add' });
});

router.post('/add', function (req, res) {
  let image;
  let uploadPath;

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  image = req.files.image;
  uploadPath = __dirname + '/../public/img/' + image.name;

  // Use the mv() method to place the file somewhere on your server
  image.mv(uploadPath, function (err) {
    if (err) return res.status(500).send(err);

    // res.send('File uploaded!');
  });
  csdl
    .collection('nhanvien')
    .insertOne({ hoten: req.body.name, tuoi: req.body.age, hinh: image.name })
    .then(() => res.redirect('/list'))
    .catch((err) => console.log('Không chèn được:', err));
});

/* Cập nhật nhân viên */
router.get('/update/:id', authMiddleware, roleMiddleware(['admin']), async function (req, res) {
  const id = req.params.id;
  const nhanvien = await csdl
    .collection('nhanvien')
    .findOne({ _id: new ObjectId(req.params.id) });
  if (nhanvien == null) {
    return res.send('Không tìm thấy nhân viên');
  }
  res.render('update.ejs', { title: 'Update', nhanvien });
});

router.post('/update/:id', async (req, res) => {
  let image;
  let uploadPath;

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  image = req.files.image;
  uploadPath = __dirname + '/../public/img/' + image.name;

  // Use the mv() method to place the file somewhere on your server
  image.mv(uploadPath, function (err) {
    if (err) return res.status(500).send(err);
  });
  try {
    await csdl
      .collection('nhanvien')
      .updateOne(
        { _id: new ObjectId(req.params.id) },
        {
          $set: {
            hoten: req.body.hoten,
            tuoi: req.body.tuoi,
            hinh: image.name,
          },
        }
      )
      .then(() => {
        res.redirect('/list');
      });
  } catch (err) {
    console.log('Lỗi khi cập nhật nhân viên:', err);
    res.send('Cập nhật thất bại!');
  }
});

/* Xóa nhân viên */
router.get('/delete', authMiddleware, roleMiddleware(['admin']), function (req, res, next) {
  res.render('delete.ejs', { title: 'Delete' });
});
router.post('/delete', function (req, res, next) {
  console.log(req.body);
  csdl
    .collection('nhanvien')
    .deleteOne({ _id: new ObjectId(req.body.id) })
    .then(() => res.redirect('/list'))
    .catch((err) => console.log('Không xóa được:', err));
});
router.get('/delete/:id', function (req, res, next) {
  csdl
    .collection('nhanvien')
    .deleteOne({ _id: new ObjectId(req.params.id) })
    .then(() => res.redirect('/list'))
    .catch((err) => console.log('Không xóa được:', err));
});
// Đăng nhập, đăng ký
router.get('/login', function (req, res, next) {
  res.render('login.ejs', { title: 'User' }); // Dấu , sai -> sửa thành dấu ,
});
router.post('/login', authController.login);


// Logout
router.get('/logout', function (req, res, next) {
  res.render('logout.ejs', { title: 'Logout' });
});
router.post('/logout', function (req, res) {
  res.clearCookie('token'); // Xóa token trong cookie
  res.status(200).json({ message: 'Đã logout' });
});
// find
router.get('/find', function (req, res, next) {
  res.render('find.ejs', { title: 'Tìm NV' });
});
router.post('/find', async function (req, res, next) {

  let sortOrder = req.query.sort === 'desc' ? -1 : 1;
  let searchQuery = req.query.search || '';
  let page = parseInt(req.query.page) || 1; // Mặc định trang 1
  let limit = 5; // Giới hạn mỗi trang 5 nhân viên
  let filter = {};
  let nhanviens = await csdl
    .collection('nhanvien')
    .find({ hoten: { $regex: req.body.name, $options: 'i' } })
    .sort({ tuoi: sortOrder })
    .skip((page - 1) * limit) // Bỏ qua nhân viên của các trang trước
    .limit(limit) // Giới hạn số nhân viên hiển thị trên 1 trang
    .toArray();

  res.render('list.ejs', {
    title: 'List',
    nhanviens,
    sortOrder,
    searchQuery,
    currentPage: page,
    totalPages: Math.ceil(nhanviens.length / limit),
  });
});



module.exports = router;
