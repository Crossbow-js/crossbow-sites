var _             = require("lodash");
var assert        = require("chai").assert;
var multiline     = require("multiline");

var Cache         = require("../../lib/cache");

var ymlArray = multiline.stripIndent(function(){/*
- name: Parker Moore
  github: parkr

- name: Liu Fengyun
  github: liufengyun
 */});
var ymlProps = multiline.stripIndent(function(){/*
name: Shane Osbourne
github: shakyshane
 */});

describe("Adding data to the cache", function(){
    var _cache;
    beforeEach(function () {
        _cache    = new Cache();
    });
    it("Should add YML data", function(){
        var data = _cache.addData("_data/members.yml", ymlArray, {}).data();
        assert.equal(data["data/members.yml"].length, 2);
    });
    it("Should add YML data & convert to keys", function(){
        var data = _cache
            .addData("_data/members.yml", ymlArray, {})
            .convertKeys("data", {});

        assert.equal(data.members.length, 2);
    });
    it("Should add YML data & convert to keys", function(){
        var data = _cache
            .addData("_data/members.yml", ymlProps, {})
            .convertKeys("data", {});

        assert.equal(data.members.name, "Shane Osbourne");
    });
    it("Should add YML data to existing obj", function(){

        var existing = {
            author: [
                "Shane", "Osbourne"
            ],
            site: {
                name: "shakyshane.com"
            }
        };

        var data = _cache
            .addData("_data/members.yml", ymlProps, {})
            .convertKeys("data", existing);

        assert.equal(data.members.name, "Shane Osbourne");
        assert.equal(data.author.length, 2);
        assert.equal(data.site.name, "shakyshane.com");

        data = _cache
            .addData("_data/members2.yml", ymlProps, {})
            .convertKeys("data", data);

        assert.equal(data.members2.github, "shakyshane");
    });
    it("Should add JSON data", function(){
        var data = _cache.addData("_data/animals.json", {name: "kittie"}, {}).data();
        assert.equal(data["data/animals.json"].name, "kittie");
    });
    it("Should convert keys to usage paths (obj)", function(){
        var obj = {};
        var data = _cache
            .addData("_data/animals.json", {
                name: "kittie",
                age: 6
            }, {})
            .convertKeys("data", obj);

        assert.equal(obj.animals.name, "kittie");
    });
    it("Should convert keys to usage paths (array)", function(){
        var obj = {};
        var data = _cache
            .addData("_data/animals.json", [{
                name: "White Catz"
            }], {})
            .convertKeys("data", obj);

        assert.equal(obj.animals[0].name, "White Catz");
    });
});