var _             = require("lodash");
var assert        = require("chai").assert;
var multiline     = require("multiline");

var Page = require("../../lib/page");

var page1 = multiline.stripIndent(function(){/*
---
layout: default
title: "Homepage"
---

Page 1
 */});

describe("Creating a PAGE with maximum info", function(){

    it("return an instance", function() {
        var page = new Page("projects/about-us.html", page1);
        assert.isTrue(page instanceof Page);
    });
    it("Has access to front matter", function() {

        var page = new Page("projects/about-us.html", page1);

        assert.deepEqual(page.front.title,  "Homepage",                      "Adds title from front");
        assert.deepEqual(page.front.layout, "default",                       "Adds layout from front");
        assert.deepEqual(page.content,      "\nPage 1",                      "Page 1");
        assert.deepEqual(page.key,          "projects/about-us.html",        "Adds Key");
        assert.deepEqual(page.url,          "/projects/about-us",            "Adds URL");
        assert.deepEqual(page.filePath,     "projects/about-us/index.html",  "Adds filename");
        assert.deepEqual(page.type,         "page",                          "Adds Adds type");
    });
    it("Can transform a post.", function(){
        var page = new Page("projects/about-us.html", page1, {
            transform: function (item) {
                item.front.title = item.front.title + " - Page 2";
            }
        });

        assert.deepEqual(page.front.title,  "Homepage - Page 2", "Adds transformed title");
    });
});