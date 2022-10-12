var fs = require("fs");
const { parse } = require("csv-parse");
const { createConnection } = require("mysql");
const pool = createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "xskt",
    connectionLimit: 10,
});
const STATUS = "EXTRACT";
// var results = [];
// fs.createReadStream("data/xskt_01-01-2020.csv")
//     .pipe(parse({ delimiter: ",", from_line: 2 }))
//     .on("data", (data) => {
//         results.push(data);
//         console.log(data);
//     })
//     .on("end", function () {
//         // console.log(results);
//     })
//     .on("error", function (error) {
//         console.log(error.message);
//     });
function transform() {
    let sql = "SELECT * FROM log_file where status= ?";
    pool.query(sql, [STATUS], function (err, result) {
        if (err) throw err;
        result.forEach((element) => {
            var pathFile =
                __dirname.replace(/\\/g, "/") + "/data/" + element.file_name;
            let sqlLoadData =
                "LOAD DATA INFILE ? INTO TABLE staging FIELDS TERMINATED BY ','" +
                " ENCLOSED BY '\"' LINES TERMINATED BY '\n' " +
                "IGNORE 1 ROWS(mien,thu,@ngay,tinh,ten_giai,ma_giai) SET ngay = STR_TO_DATE(@ngay,  '%d-%m-%Y')";
            pool.query(sqlLoadData, [pathFile], function (err, result) {
                if (err) throw err;
                // console.log(result);
            });
            let sqlUpdate = "UPDATE log_file SET status = ? WHERE id = ?";
            pool.query(
                sqlUpdate,
                ["TRANSFORM", element.id],
                function (err, result) {
                    if (err) throw err;
                }
            );
        });
    });
}
transform();
