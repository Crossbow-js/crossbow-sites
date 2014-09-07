var dust = require("dustjs-helpers");

var fs   = require("fs");

var count = 0;

dust.optimizers.format = function (ctx, node) {

    count = count += 1;

};

dust.loadSource(dust.compile(fs.readFileSync("./_fixtures/syntax-2.md", "utf-8"), "test"));

dust.render("test", {}, function (err, out) {
    console.log(count);
    if (err) {
        console.log(err);
    } else {
        fs.writeFileSync("./_fixtures/syntax-2.html", out);
//        console.log(out);
//        cb(null, out);
    }
});