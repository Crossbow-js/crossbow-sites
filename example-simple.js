var crossbow = require("./");
var fs = require("fs");
var path = require("path");
var rimraf = require("rimraf").sync;
var outpath = "./simple-out";

rimraf(outpath);

var index = fs.readFileSync("./test/fixtures/index.html", "utf-8");
var about = fs.readFileSync("./test/fixtures/about.html", "utf-8");

fs.mkdirSync(outpath);

var site = crossbow.builder({
    config: {
        base: "test/fixtures"
    }
});

var out1 = site.add({key: "test/fixtures/index.html", content: index});
var out2 = site.add({key: "test/fixtures/about.html", content: about});

site.freeze();

site.compile({
    item: out1,
    cb: function (err, out) {
        if (err) {
            return console.log(err.stack);
        }
        fs.writeFileSync(path.join(outpath, out.get("filepath")), out.get("compiled"));
    }
});

site.compile({
    item: out2,
    cb: function (err, out) {
        if (err) {
            return console.log(err.stack);
        }
        fs.writeFileSync(path.join(outpath, out.get("filepath")), out.get("compiled"));
    }
});