Crossbow makes it incredibly easy to write your content
in the popular [Markdown]({{site.links.markdown}}) format. In fact, we make it so quick and easy 
to author content in this way, we think it's a better writing experience 
that any paid app can provide.

### How it works

By default, any files with the `.md` file format will be proccesed
as markdown. So you don't need to configure anything. If you 
have a folder full of files such as `docs.md`, `about.md` etc - they
will be converted into the appropriate HTML files, after first being
processed with Markdown.

So this...

```markdown
## A title

Any content in this file will be processed as markdown.

Because this file is named *docs.md*, all content will automatically be processed
```

... becomes:

```markdown
<h2>A title</h2>

<p>Any content in this file will be processed as markdown.</p>

<p>Because this file is named <em>docs.md</em>, all content will automatically be processed</p>
```

### Auto highlighting

If you've ever used [Jekyll]({{site.links.jekyll}}) before to write
blogs, or to provide syntax highlighting - you've probably seen something
along these lines: 

```hbs
# How highlighting is done in jekyll

{% highlight js %}
var someJavascriptCode = "here";
{% highlightend %}
```

Code inside the special `{% tags %}` is plucked out and auto 
highlighted. This is pretty cool, however, you end up with those `{% tags %}`
littered throughout your markdown file.

In Crossbow, we offer the same highlighting functionality, except we do it 
automatically using the three back ticks technique made popular by github and 
other platforms. This means if you start a block with <code>```js</code>, then 
then contents inside it will be auto-highlighted. 
 
### Crossbow example

Now for an example - to auto highlight a block of code in Crossbow, simply provide
 the following...

    ```js
    if (!opts.key) {
        opts.key = "crossbow-item-" + noKey;
        noKey += 1;
    }
    ```
... which ends up being this in the output, pretty nice right?

```js
if (!opts.key) {
    opts.key = "crossbow-item-" + noKey;
    noKey += 1;
}
```

The real goal behind this automation, is to allow full, 100% portability
 of your markdown documents. You can literally use the exact same Markdown
 document to output to your blog, and will also read correctly if viewed
 by a platform such as github.

```js
var shane = "kittie";

```



