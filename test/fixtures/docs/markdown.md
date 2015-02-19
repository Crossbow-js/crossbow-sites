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

```
{% highlight js %}
{% highlightend %}
```







