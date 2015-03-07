var assert = require("chai").assert;

describe("Lodash string functions", function(){

    it("should use the lodash helper to work on strings", function(done) {

        var site = require("../../index").builder({
            config: {
                errorHandler: function (err) {
                    console.log(err);
                }
            }
        });

        site.compile({
            key: "index.html",
            content: "{{$_ 'camelCase' 'Foo Bar'}}",
            cb: function (err, out) {
                if (err) {
                    return done(err);
                }
                assert.equal(out.get("compiled"), "fooBar");
                done();
            }
        });
    });
    it("should give great errors when using lodash helper", function(done) {

        var site = require("../../index").builder({
            config: {
                errorHandler: function (err) {
                    var msg = "$_ (lodash) helper requires at least 2 params (method and value)";
                    assert.equal(err._type,   "lodash:string:params");
                    assert.equal(err.message, msg);
                    assert.equal(err._crossbow.file,   "index.html");
                    assert.equal(err._crossbow.message, "$_ (lodash) helper requires at least 2 params (method and value)");
                    done();
                }
            }
        });

        site.compile({
            key: "index.html",
            content: "{{$_ 'camelCase'}}",
            cb: function () {

            }
        });
    });

    it("should give great errors when using lodash helper and fn does not exist", function(done) {

        var site = require("../../index").builder({
            config: {
                errorHandler: function (err) {
                    var msg = "$_ (lodash) helper requires at least 2 params (method and value)";
                    console.log(err);
                    assert.equal(err._type,   "lodash:string:params");
                    assert.include(err.message, "Check the docs here https://lodash.com/docs#camelCase");
                    assert.equal(err._crossbow.file,   "index.html");
                    assert.include(err._crossbow.message, "Check the docs here https://lodash.com/docs#camelCase");
                    done();
                }
            }
        });

        site.compile({
            key: "index.html",
            content: "{{$_ 'startw' 'node js'}}",
            cb: function () {

            }
        });
    });
});