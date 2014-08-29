var assert = require("chai").assert;
var url    = require("../../lib/url");
var utils  = require("../../lib/utils");

describe("Creating base names", function(){
    it("", function(){
        console.log(url.getBaseName("_posts/post1.md"));
        console.log(url.getBaseName("_postserfwe/wergwerg//post1.md"));
//        console.log(utils.makePartialKey("_postserfwe/wergwerg//post1.md"));
    });
});