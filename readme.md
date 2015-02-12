#Crossbow [![Build Status](https://travis-ci.org/shakyShane/crossbow.js.svg?branch=master)](https://travis-ci.org/shakyShane/crossbow.js)

> Static Site Generator + Blog engine

I wanted a node-only, jekyll-type thingy - but as simple as this to use:

```js
/**
 * What it might end up being...
 */
gulp.task("crossbow", function () {
    return gulp.src(["app/*.html"])
        .pipe(crossbow.stream())
        .pipe(gulp.dest("_site"));
});
```

So that's exactly what Crossbow will be - a static-site & blog generator. No Ruby, no slow. Just awesome.

**Note**: Not ready for public use just yet... will be soon though.  
