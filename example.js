var Readable  = require('stream').Readable;
var rs        = Readable({objectMode: true});
var Writable  = require('stream').Writable;
var concat    = require('concat-stream');
var Transform = require('stream').Transform;
var fs        = require("fs");
var content   = fs.readFileSync("./_bench/1-file.html");

rs._read = function () {
    rs.push(content);
    rs.push(null);
};

rs.pipe(modifier1())
    .pipe((function () {
        return s(function (chunk, enc, next) {
            console.log(chunk.length);
            this.push(chunk);
            next();
        })
    }()))
    .pipe(concat(function (body) {
        console.log(body.toString());
    }));

var rs2 = Readable({objectMode: true});

rs2._read = function () {
    this.push({name: "shane"});
    this.push(null);
};

rs2.pipe((function () {
    return s(function (item, enc, next) {
        console.log(item);
        next();
    });
})())
.pipe(concat(function (body) {
    console.log(body);
}));


/**
 * @returns {*}
 */
function modifier1 () {

    return s(function (chunk, enc, next) {
        var modded = chunk.toString() + chunk.toString();
        this.push(modded);
        next();
    });
}

/**
 * @returns {*}
 */
function lastStep () {
    return concat(function (chunk, enc, next) {
        console.log(chunk.toString());
    });
}

function s (fn, fnend) {

    var ws = new Transform();

    ws._write = fn;

    if (fnend) {
        ws._flush = fnend;
    }

    return ws;
}

function c () {

}