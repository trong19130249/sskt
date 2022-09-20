const axios = require("axios");
const cheerio = require("cheerio");
const https = require("https");
const express = require("express");
var moment = require("moment");
var fs = require("fs");
const PORT = 1234;
const app = express();
axios.defaults.httpsAgent = new https.Agent({
    rejectUnauthorized: false,
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
app.get("/", function (req, res) {
    return res.send("Hello World!");
});
app.get("/xoso/:ngay", function (req, res) {
    let ngayXo = req.params.ngay;
    if (ngayXo == "homnay") {
        ngayXo = moment().format("DD-MM-YYYY");
    }
    url = `https://xskt.com.vn/xsmn/ngay-${ngayXo}`;
    axios
        .get(url)
        .then(function (response) {
            // console.log(response.data);
            const $ = cheerio.load(response.data);
            const results = [];
            $("#MN0 > tbody > tr").each(function (i, element) {
                if (i == 0) {
                    $(this)
                        .find("th")
                        .each(function (i) {
                            if (i != 0) {
                                results[i - 1] = { tinh: $(this).text() };
                            }
                        });
                } else {
                    let atr;
                    $(this)
                        .find("td")
                        .each(function (i) {
                            if (i == 0) {
                                atr = $(this).html();
                            }
                            if (i != 0) {
                                results[i - 1][i - 1] = $(this).html();
                            }
                            // console.log($(this).html());
                        });
                }
            });
            // console.log(results);
            return results;
        })
        .catch(function (err) {
            console.log(err);
        });
    return res.send(url);
});
async function scraperXsmt(ngayXo) {
    if (ngayXo == "homnay") {
        ngayXo = moment().format("DD-MM-YYYY");
    }
    let mien = "Miền trung";
    url = `https://xskt.com.vn/xsmt/ngay-${ngayXo}`;

    const demo = await axios
        .get(url)
        .then(function (response) {
            const resultsTemp = [];

            // console.log(response.data);
            const $ = cheerio.load(response.data);
            let data = $(".box-table .tbl-xsmn").eq(0);
            if (!data.find("tr:first-child th a").html()) {
                // console.log(mien + ngayXo);
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
                            mien +
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
    return demo;
}
async function scraperXsmn(ngayXo) {
    if (ngayXo == "homnay") {
        ngayXo = moment().format("DD-MM-YYYY");
    }
    // console.log(ngayXo);
    let mien = "Miền nam";
    url = `https://xskt.com.vn/xsmn/ngay-${ngayXo}`;

    const demo = await axios
        .get(url)
        .then(function (response) {
            const resultsTemp = [];

            // console.log(response.data);
            const $ = cheerio.load(response.data);
            let data = $(".box-table .tbl-xsmn").eq(0);
            if (!data.find("tr:first-child th a").html()) {
                // console.log(mien + ngayXo);

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
                            mien +
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
    return demo;
}
async function scraperXsmb(ngayXo) {
    if (ngayXo == "homnay") {
        ngayXo = moment().format("DD-MM-YYYY");
    }
    let mien = "Miền bắc";
    url = `https://xskt.com.vn/xsmb/ngay-${ngayXo}`;

    const demo = await axios
        .get(url)
        .then(function (response) {
            const resultsTemp = [];

            // console.log(response.data);
            const $ = cheerio.load(response.data);
            let data = $(".box-table #MB0").eq(0);
            let dayOfWeek = data.find("tr:first-child th b a").eq(1).text();
            let dai = data.find("tr:first-child th b").html();
            if (!data.find("tr:first-child th b").html()) {
                // console.log(mien + ngayXo);
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
                        mien +
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
    return demo;
}

async function writeData(data, path) {
    if (data.length == 0) {
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
    // console.log(data);
}

async function scraperFiveYear() {
    for (
        var d = new Date("1/1/2020");
        d <= new Date("12/31/2020");
        d.setDate(d.getDate() + 1)
    ) {
        let date = moment(d).format("DD-MM-YYYY");
        await Promise.all([
            scraperXsmn(date),
            scraperXsmt(date),
            scraperXsmb(date),
        ]).then((result) => {
            const combined1 = result[0].concat(result[1]).concat(result[2]);
            console.log(combined1.length);
            writeData(combined1, "data/xskt_" + date + ".csv");
        });
    }

    console.log("done");
}

function writeHeading(path) {
    var logger = fs.createWriteStream(path, {
        encoding: "utf8",
        flags: "a", // 'a' means appending (old data will be preserved)
    });
    headingArr = ["Miền", "Thứ", "Ngày", "Tỉnh", "Tên giải", "Mã giải"];
    let row = headingArr.join(",");
    logger.write("\ufeff" + row + "\n");
    logger.end(); // close string
}
// writeHeading();
scraperFiveYear();
