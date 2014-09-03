var _             = require("lodash");
var multiline     = require("multiline");
var assert        = require("chai").assert;

var crossbow = require("../../index");

describe("Processing Inline params with includes", function(){

    beforeEach(function () {
        crossbow.clearCache();
        crossbow.populateCache("_layouts/test.html", "{#content /}");
    });
    it("Allows access to include params", function(done) {

        var post2 = multiline.stripIndent(function(){/*
         ---
         layout: test
         title: "Blogging is coolio"
         date: 2013-11-13 20:51:39
         ---

         {#inc src="button.tmpl.html" text="Sign Up" /}

         */});

        // NO POSTS ADDED
        crossbow.populateCache("_includes/button.tmpl.html", "<button>{text}</button>", "partials");
        crossbow.addPage("_posts/post2.md", post2, {});
        crossbow.compileOne("posts/post2.md", {siteConfig: {title: "Blog Name"}}, function (err, out) {
            var compiled = out.compiled;
            assert.include(compiled, "<button>Sign Up</button>");
            done();
        });
    });
    it("Allows access to include params via 'params' namespace to deal with any conflicts", function(done) {

        var post2 = multiline.stripIndent(function(){/*
         ---
         layout: test
         title: "Blogging is coolio"
         date: 2013-11-13 20:51:39
         ---

         {#inc src="button.tmpl.html" text="Sign Up" /}

         */});

        // NO POSTS ADDED
        crossbow.populateCache("_includes/button.tmpl.html", "<button>{params.text}</button>", "partials");
        crossbow.addPage("_posts/post2.md", post2, {});
        crossbow.compileOne("posts/post2.md", {siteConfig: {title: "Blog Name"}}, function (err, out) {
            var compiled = out.compiled;
            assert.include(compiled, "<button>Sign Up</button>");
            done();
        });
    });
    it("Allows access to Page vars in include", function(done) {

        var post2 = multiline.stripIndent(function(){/*
         ---
         layout: test
         title: "Blogging is coolio"
         date: 2013-11-13
         button: "cats"
         ---

         {#inc src="button.tmpl.html" text=page.button /}

         */});

        // NO POSTS ADDED
        crossbow.populateCache("_includes/button.tmpl.html", "<button>{text}</button>", "partials");
        crossbow.addPage("_posts/post2.md", post2, {});
        crossbow.compileOne("posts/post2.md", {siteConfig: {title: "Blog Name"}}, function (err, out) {
            var compiled = out.compiled;
            assert.include(compiled, "<button>cats</button>");
            done();
        });
    });
    it("Allows access to Page vars in loop", function(done) {

        var post2 = multiline.stripIndent(function(){/*
         ---
         layout: test
         title: "Blogging is coolio"
         date: 2013-11-13
         buttons:
             - name: Primary
               class: primary
             - name: Secondary
               class: secondary
         ---


         {#page.buttons}
         {#inc src="button.tmpl.html" text=name class=class /}
         {/page.buttons}

         */});

        // NO POSTS ADDED
        crossbow.populateCache("_includes/button.tmpl.html", "<button class=\"button button--{class}\">{text}</button>", "partials");
        crossbow.addPage("_posts/post2.md", post2, {});
        crossbow.compileOne("posts/post2.md", {siteConfig: {title: "Blog Name"}}, function (err, out) {
            var compiled = out.compiled;
            assert.include(compiled, "<button class=\"button button--primary\">Primary</button>");
            assert.include(compiled, "<button class=\"button button--secondary\">Secondary</button>");
            done();
        });
    });
    it("Can access the $idx helper in loops & includes", function(done) {

        var post2 = multiline.stripIndent(function(){/*
         ---
         layout: test
         title: "Blogging is coolio"
         date: 2013-11-13
         buttons:
             - name: Primary
               class: primary
             - name: Secondary
               class: secondary
         ---


         {#page.buttons}
         {#inc src="button.tmpl.html" text=name type=class /}
         {/page.buttons}

         */});

        // NO POSTS ADDED
        crossbow.populateCache("_includes/button.tmpl.html", "<button class=\"button button--{type}\">{text} - {$idx}</button>", "partials");
        crossbow.addPage("_posts/post2.md", post2, {});
        crossbow.compileOne("posts/post2.md", {siteConfig: {title: "Blog Name"}}, function (err, out) {
            var compiled = out.compiled;
            assert.include(compiled, "<button class=\"button button--primary\">Primary - 0</button>");
            assert.include(compiled, "<button class=\"button button--secondary\">Secondary - 1</button>");
            done();
        });
    });
    it("Can access pass a root object to include", function(done) {

        var post2 = multiline.stripIndent(function(){/*
         ---
         layout: test
         title: "Blogging is coolio"
         date: 2013-11-13
         buttons:
             - name: Primary
               class: primary
             - name: Secondary
               class: secondary
         ---


         {#page.buttons}
         {#inc src="button.tmpl.html" item=. /}
         {/page.buttons}

         */});

        // NO POSTS ADDED
        crossbow.populateCache("_includes/button.tmpl.html",
            "<button class=\"button button--{item.class}\">{item.name} - {$idx}</button>",
            "partials");
        crossbow.addPage("_posts/post2.md", post2, {});
        crossbow.compileOne("posts/post2.md", {siteConfig: {title: "Blog Name"}}, function (err, out) {
            var compiled = out.compiled;
            assert.include(compiled, "<button class=\"button button--primary\">Primary - 0</button>");
            assert.include(compiled, "<button class=\"button button--secondary\">Secondary - 1</button>");
            done();
        });
    });
});