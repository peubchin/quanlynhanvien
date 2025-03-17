var express = require('express');
var router = express.Router();
let MongoClient = require('mongodb-legacy').MongoClient;
let client = new MongoClient('mongodb://127.0.0.1:27017');
let csdl = client.db('quanlynhanvien');
const { ObjectId } = require('mongodb');

// Đăng nhập
router.get('/login', (req, res) => {
  res.render('login.ejs', { title: 'Login' });
});
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.send('Vui lòng nhập đầy đủ thông tin!');
  }
  try {
    const user = await csdl.collection('users').findOne({ username, password });
    if (!user) {
      return res.send('Tên đăng nhập hoặc mật khẩu không đúng!');
    }
    res.redirect('/list');
  } catch (err) {
    console.error('Lỗi khi đăng nhập:', err);
    res.send('Đăng nhập thất bại!');
  }
});

module.exports = router;
