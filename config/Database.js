let mysql = require("mysql2");

let connection = mysql.createConnection({
  host: "localhost",
  user: "j2fexpress",
  password: "An0thrS3crt",
  database: "j2fexpress_db",
});

connection.connect(function (error) {
  if (!!error) {
    console.log(error);
  } else {
    console.log("Koneksi Berhasil!");
  }
});

module.exports = connection;
