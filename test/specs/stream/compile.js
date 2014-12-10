var crossbow  = require("../../../plugins/blog");
var through   = require("through2");
var fs        = require("vinyl-fs");

describe("using streams", function(){

    it.only("should accept a single file", function(done) {

        fs.src("index.html")
            .pipe(through.obj(function () {
                console.log("WA");
            }))
    });
});