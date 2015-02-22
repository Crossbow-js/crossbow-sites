#Crossbow [![Build Status](https://travis-ci.org/shakyShane/crossbow.js.svg?branch=master)](https://travis-ci.org/shakyShane/crossbow.js)

> Static Site Generator + Blog engine

I wanted a node-only, jekyll-type thingy - but as simple as this to use:

```js
/**
 * 
 */
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

So that's exactly what Crossbow will be - a static-site & blog generator. No Ruby, no slow. Just awesome.

**Note**: Not ready for public use just yet... will be soon though.  

### Todo 

[ ] - Allow options for https://github.com/chjj/marked#overriding-renderer-methods
[ ] - Categories and tags for posts