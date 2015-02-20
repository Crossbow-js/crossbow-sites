var stream = require("readable-stream");

var rs = stream.Transform();

rs._transform = function (data, enc, next) {
    //console.log(data.toString());
    //console.log(next);
    this.push(data);
    next();
};

rs._flush = function (out) {
    console.log("DONE");
    //console.log(out);
};

rs.write("huge amount of data");

rs.end();