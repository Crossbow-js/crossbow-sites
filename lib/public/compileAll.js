//function compileMany (compiler, items, cb) {
//
//    var compiled = [];
//    var count    = 0;
//
//    items.forEach(function (item) {
//
//        compiler.compile({
//            item: item,
//            cb: function (err, out) {
//                if (err) {
//                    cb(err);
//                }
//                count += 1;
//                if (Array.isArray(out)) {
//                    compiled.concat(out);
//                } else {
//                    compiled.push(out);
//                }
//                if (count === items.length) {
//                    cb(null, compiled);
//                }
//            }
//        });
//    });
//}
