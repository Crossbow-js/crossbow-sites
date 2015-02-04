var crossbow = require("./");
var fs = require("fs");
var path = require("path");
var rimraf = require("rimraf").sync;
var outpath = "./simple-out";

rimraf(outpath);

var file = fs.readFileSync("test/fixtures/index.html", "utf-8");

fs.mkdirSync(outpath);

var config = {
    cwd: "test/fixtures",
    siteConfig: {
        css: "/core.css"
    }
};

crossbow.addPage("index.html", file);

crossbow.compileOne("index.html", config, function (err, out) {
    fs.writeFileSync(path.join(outpath, out.paths.filePath), out.compiled);
});



