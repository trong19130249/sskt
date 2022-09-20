const { createConnection } = require("mysql");
const pool = createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "xskt",
    connectionLimit: 10,
});
pool.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});
