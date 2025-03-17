let MongoClient = require('mongodb-legacy').MongoClient;
let client = new MongoClient('mongodb://127.0.0.1:27017');
let csdl = client.db('quanlynhanvien');
const bcrypt = require('bcryptjs');

async function main() {
  await csdl.collection('nhanvien').deleteMany({});
  await csdl.collection('nhanvien').insertMany([
    {
      hoten: 'Nguyễn Văn A',
      tuoi: 20,
      email: 'nguyena@gmail.com',
      password: await bcrypt.hash('1234', 12),
      role: 'admin',
    },
    {
      hoten: 'Nguyễn Thị Bong Bóng',
      tuoi: 21,
      email: 'nguyenbongbong@gmail.com',
      password: await bcrypt.hash('1234', 12),
      role: 'staff',
    },
  ]);
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
   process.exit(1);
  });
