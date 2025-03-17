const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

let MongoClient = require('mongodb-legacy').MongoClient;
let client = new MongoClient('mongodb://127.0.0.1:27017');
let csdl = client.db('quanlynhanvien');

const register = async (req, res) => {
    const { email, password, name, dateOfBirth, image, role } = req.body;

    try {
        const existingUser = await csdl.collection('nhanvien').findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        await csdl.collection('nhanvien').insertOne({ email, password: hashedPassword, name, dateOfBirth, image, role });
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await csdl.collection('nhanvien').findOne({ email });
        console.log(user);
        
        if (!user) {
            return res.render('login', { error: 'Không tìm thấy tài khoản8' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('login', { error: 'sai mật khẩu' });
        }

        const token = jwt.sign({ userId: user._id, role: user.role }, 'your_jwt_secret', { expiresIn: '1h' });

        res.cookie('token', token, { httpOnly: true, secure: true, maxAge: 3600000 }); // Set cookie with token

        res.status(200).redirect('/list');
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    register,
    login
};
