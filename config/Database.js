import { Sequelize } from "sequelize";

const db = new Sequelize("j2fexpress_db", "j2fexpress", "An0thrS3crt", {
  host: "localhost",
  dialect: "mysql",
  port: "3306",
});

export default db;
