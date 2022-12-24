const express = require("express");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const cors = require("cors");
const connection = require("./config/Database");
const app = express();
const session = require("express-session");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

app.use(cookieParser());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.listen(5000, () => console.log("Server running at port 5000"));

function getDateTimeNow() {
  let date_ob = new Date();
  let date = ("0" + date_ob.getDate()).slice(-2);
  let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
  let year = date_ob.getFullYear();
  let hours = date_ob.getHours();
  let minutes = date_ob.getMinutes();
  let seconds = date_ob.getSeconds();
  return (
    year +
    "-" +
    month +
    "-" +
    date +
    " " +
    hours +
    ":" +
    minutes +
    ":" +
    seconds
  );
}

app.get("/", (req, res) => {
  res.json({ message: "Backend J2F Express" });
});

app.get("/api/users", (req, res) => {
  connection.query(
    "SELECT id,nama,email,roleUser,createdAt FROM users",
    (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }
      return res.status(200).json(result);
    }
  );
});

app.post("/api/register", async (req, res) => {
  let { nama, email, password, confPassword, roleUser } = req.body;
  if (password !== confPassword)
    return res
      .status(400)
      .json({ msg: "Password and Confirm Password do not match" });
  if (roleUser === undefined) roleUser = 3;
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);
  connection.query(
    "INSERT INTO users (nama,email,password,roleUser,createdAt) VALUES(?,?,?,?,?)",
    [nama, email, hashPassword, roleUser, getDateTimeNow()],
    (err, result) => {
      if (err) {
        return res.status(500).json(err.message);
      }
      return res.status(200).json({ msg: "Registrasi Berhasil" });
    }
  );
});

app.post("/api/login", (req, res) => {
  let { email, password } = req.body;
  connection.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }
      if (result.length > 0) {
        const match = await bcrypt.compare(password, result[0].password);
        if (!match) return res.status(400).json({ msg: "Wrong Password" });
        const jwtToken = jwt.sign(
          {
            nama: result[0].nama,
            email: result[0].email,
            roleUser: result[0].roleUser,
          },
          process.env.ACCESS_TOKEN_SECRET
        );
        return res.status(200).json({
          msg: "Login Berhasil",
          token: jwtToken,
          nama: result[0].nama,
          roleUser: result[0].roleUser,
        });
      }
      return res.status(400).json({ msg: "Account Not Found !" });
    }
  );
});
