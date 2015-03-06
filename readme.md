<p align="center">
    <img alt="babel" src="https://avatars3.githubusercontent.com/u/11148006?v=3&s=200" width="164">
</p>

<p align="center">
  <strong>Crossbow</strong> is a <em>lightning fast</em> Static Site Generator & Blog Engine
</p>

<p align="center">
  It gives you insane speed, unique features and the best development workflow on the planet! 
</p>

<p align="center">
So, if you want Jekyll-style thing, minus the all the Ruby and the <em>slowness</em>, then you've come to correct place! 
<a href="http://quick.as/mvrsaqz">Checkout this 2 min screencast</a> for a preview. Also, there's a gif below.
</p>

#Crossbow [![Build Status](https://travis-ci.org/shakyShane/crossbow.js.svg?branch=master)](https://travis-ci.org/shakyShane/crossbow.js)

![Crossbow-js](http://cl.ly/image/2W0V2J2G390v/md.gif)

# Killer Features

- **Speed** - In comparison to Jekyll, the most popular static site generator, our benchmark
tests of `1000` markdown files with syntax highlighting, partials & layouts show Crossbow
to be approx **8 - 13 times faster**. Seriously.
 
- **Development Workflow First** - Crossbow has incredible HTML injecting technology that 
allows you write in markdown, compile into html (with highlighting) and inject into 
all connected browsers - all this in **less** than 20ms. This has to be seen to be believed.

- **Incremental builds** - When in 'writing mode' only the file you are editing 
will be recompiled making the already blazing-fast process even quicker. It's really smart too,
if you change a partial (that could affect many files) or change the front-matter (that could affect
lists of post/pages etc) then the entire site will be rebuilt. This could take a upto a whopping 100ms... :p 

- **Pretty Markup** - We forked Handlebars to create a incredible feature where we perfectly preserve your indentation
even when using partials. This is especially helpful when debuggin markup.

We'll have more info and more docs coming soon, but just to keep you interested, why not try out the beta?

## Quick start
Crossbow is a brand new project, as such we're light on documentation right now as we're 
still in beta. It's completely stable though and if you want to see what it's like
to run a Crossbow static site/blog you can check out the [Crossbow Starter Blog](https://github.com/Crossbow-js/starter-blog)

## Install (beta)

```bash
npm install crossbow --save-dev
```

## Usage with Gulp
```js
var gulp     = require("gulp");
var crossbow = require("crossbow");

gulp.task("crossbow", function () {
    return gulp.src(["app/*.html"])
        .pipe(crossbow.stream({
            config: {
                base: "app"
            }
        }))
        .pipe(gulp.dest("_site"));
});
```
## API usage

```js
var site = crossbow.builder();
var page = site.add({type: "page", key: "index.html", content: "<p>Hey I'm an index file</p>"});
site.compile({
    item: page,
    cb: function (err, out) {
        if (err) {
            throw err
        }
        console.log(out.get("compiled"));
    }
});
```

### Credits

- Logo design by [@chrisbailey](https://dribbble.com/chris3ailey)

### Todo 

- [ ] Allow options for https://github.com/chjj/marked#overriding-renderer-methods
- [ ] Categories and tags for posts
- [ ] Permalinks in front-matter
- [ ] Pagination
