const axios = require("axios");
const cheerio = require("cheerio");
const https = require("https");
var moment = require("moment");
const { createConnection } = require("mysql");
const { v4: uuidv4 } = require("uuid");
const pool = createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "xskt",
    connectionLimit: 10,
});
var fs = require("fs");

const CONTACT_NAME = "Ngô Tấn Trọng";
async function scraperXsmt(ngayXo) {
    if (ngayXo == "homnay") {
        ngayXo = moment().format("DD-MM-YYYY");
    }
    let region = "Miền trung";
    url = `https://xskt.com.vn/xsmt/ngay-${ngayXo}`;

    const data = await axios
        .get(url)
        .then(function (response) {
            const resultsTemp = [];

            // console.log(response.data);
            const $ = cheerio.load(response.data);
            let data = $(".box-table .tbl-xsmn").eq(0);
            if (!data.find("tr:first-child th a").html()) {
                // console.log(region + ngayXo);
                return [];
            }
            let dayOfWeek = data.find("tr:first-child th a").html().trim();
            let listDai = data.find("tr:first-child > th:not(:first-child)");
            listDai.each(function (i, element) {
                // console.log($(element).text());
                data.find("tr:not(:first-child)").each(function (j) {
                    let name = $(this).find("td").eq(0).text();
                    let code = $(this)
                        .find("td")
                        .eq(i + 1)
                        .html();
                    code = code.replace(/<[^>]*>?/gm, " ").trim();
                    code.split(" ").forEach((str) => {
                        resultsTemp.push(
                            region +
                                "," +
                                dayOfWeek +
                                "," +
                                ngayXo +
                                "," +
                                $(element).text() +
                                "," +
                                name +
                                "," +
                                str
                        );
                    });
                });
            });
            return resultsTemp;
        })
        .catch(function (err) {
            console.log(err);
        });
    return { region: "mientrung", data: data };
}
async function scraperXsmn(ngayXo) {
    if (ngayXo == "homnay") {
        ngayXo = moment().format("DD-MM-YYYY");
    }
    // console.log(ngayXo);
    let region = "Miền nam";
    url = `https://xskt.com.vn/xsmn/ngay-${ngayXo}`;

    const data = await axios
        .get(url)
        .then(function (response) {
            const resultsTemp = [];

            // console.log(response.data);
            const $ = cheerio.load(response.data);
            let data = $(".box-table .tbl-xsmn").eq(0);
            if (!data.find("tr:first-child th a").html()) {
                // console.log(region + ngayXo);

                return [];
            }
            let dayOfWeek = data.find("tr:first-child th a").html();
            let listDai = data.find("tr:first-child > th:not(:first-child)");
            listDai.each(function (i, element) {
                // console.log($(element).text());
                data.find("tr:not(:first-child)").each(function (j) {
                    let name = $(this).find("td").eq(0).text();
                    let code = $(this)
                        .find("td")
                        .eq(i + 1)
                        .html();
                    code = code.replace(/<[^>]*>?/gm, " ").trim();
                    code.split(" ").forEach((str) => {
                        resultsTemp.push(
                            region +
                                "," +
                                dayOfWeek +
                                "," +
                                ngayXo +
                                "," +
                                $(element).text() +
                                "," +
                                name +
                                "," +
                                str
                        );
                    });
                });
            });
            return resultsTemp;
        })
        .catch(function (err) {
            console.log(err);
        });
    return { region: "miennam", data: data };
}
async function scraperXsmb(ngayXo) {
    if (ngayXo == "homnay") {
        ngayXo = moment().format("DD-MM-YYYY");
    }
    let region = "Miền bắc";
    url = `https://xskt.com.vn/xsmb/ngay-${ngayXo}`;

    const data = await axios
        .get(url)
        .then(function (response) {
            const resultsTemp = [];

            // console.log(response.data);
            const $ = cheerio.load(response.data);
            let data = $(".box-table #MB0").eq(0);
            let dayOfWeek = data.find("tr:first-child th b a").eq(1).text();
            let dai = data.find("tr:first-child th b").html();
            if (!data.find("tr:first-child th b").html()) {
                // console.log(region + ngayXo);
                return [];
            }
            dai = dai.replace(/.*\(/gm, "").replace(/\).*/gm, "");
            data.find("tr:not(:first-child):not(:last-child)").each(function (
                j
            ) {
                let name = $(this).find("td").eq(0);
                if (name.find("i").html()) {
                    return;
                } else {
                    name = name.text();
                }
                let code = $(this).find("td").eq(1).html();
                code = code.replace(/<[^>]*>?/gm, " ").trim();
                // console.log(name + code);

                code.split(" ").forEach((str) => {
                    resultsTemp.push(
                        region +
                            "," +
                            dayOfWeek +
                            "," +
                            ngayXo +
                            "," +
                            dai +
                            "," +
                            name +
                            "," +
                            str
                    );
                });
            });

            return resultsTemp;
        })
        .catch(function (err) {
            console.log(err);
        });
    return { region: "mienbac", data: data };
}

async function writeData(data, path, file_name) {
    if (data.length == 0) {
        insertLogFile(file_name, "1", "ERROR", CONTACT_NAME);
        return;
    }
    var logger = fs.createWriteStream(path, {
        encoding: "utf8",
        flags: "a", // 'a' means appending (old data will be preserved)
    });
    headingArr = ["Miền", "Thứ", "Ngày", "Tỉnh", "Tên giải", "Mã giải"];
    let row = headingArr.join(",");
    await logger.write("\ufeff" + row + "\n");

    data.forEach((row) => {
        logger.write(row + "\n");
    });
    logger.end(); // close string
    insertLogFile(file_name, "1", "EXTRACT", CONTACT_NAME);
}

async function scraper() {
    for (
        var d = new Date("1/1/2020");
        d <= new Date("5/31/2020");
        d.setDate(d.getDate() + 1)
    ) {
        let date = moment(d).format("DD-MM-YYYY");
        await Promise.all([
            scraperXsmn(date),
            scraperXsmt(date),
            scraperXsmb(date),
        ]).then((result) => {
            // const combined1 = result[0].concat(result[1]).concat(result[2]);
            // console.log(combined1.length);
            // writeData(
            //     combined1,
            //     "data/xskt_" + date + ".csv",
            //     "xskt_" + date + ".csv"
            // );
            result.forEach((item) => {
                if (item?.data?.length > 0) {
                    console.log(item.data.length);

                    writeData(
                        item.data,
                        `./data/xskt_${item.region}_${date}.csv`,
                        `xskt_${item.region}_${date}.csv`
                    );
                }
            });
        });
    }
    pool.end();
    console.log("ok");
}
// writeHeading();
scraper();
// pool.connect(function (err) {
//     if (err) throw err;
//     console.log("Connected!");
//     pool.query("SELECT * FROM region", function (err, result, fields) {
//         if (err) throw err;
//         console.log(result);
//     });
// });
function insertLogFile(filename, configId, status, contact) {
    let sql =
        "insert into log_file(id,file_name,time,contact,status,config_id) values (?,?,?,?,?,?)";
    let dateTime = moment().format("YYYY-MM-DD HH:mm:ss");
    let values = [uuidv4(), filename, dateTime, contact, status, configId];
    pool.query(sql, values, function (err, result, fields) {
        if (err) throw err;
        console.log("insert done");
    });
}
