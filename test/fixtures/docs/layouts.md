Crossbow has been built from the ground to support powerful layout features.
By default, Layouts live in the `_layouts` directory (although you configure this)
and are just regular `.html` or `.hbs` files that contain the special `\{{ content }}` tag.

Here's a tiny example of a layout file...

**_layouts/default.html**

```html
<!DOCTYPE html>
<html>
    <head>
        <title>\{{page.title}}</title>
    </head>
    <body>
        \{{content}}
    </body>
</html>
```

... and to use that, you might have an `index.html` file that looks like this:

```html
<main>
    <h1>My awesome website</h1>
    <h2>It was built with Crossbow</h2>
</main>
```

Now, after Crossbow has worked it's magic and flattened everything out,
 you should end up with the following:

```html
<!DOCTYPE html>
<html>
    <head>
        <title>My cool title</title>
    </head>
    <body>
        <main>
            <h1>My awesome website</h1>
            <h2>It was built with Crossbow</h2>
        </main>
    </body>
</html>
```

#Nested layouts
As you can see, the concept of **layouts** is *really* powerful. But we can go 1 step further - 
with Nested Layouts. 

The idea is simple - Layouts, can also have Layouts. This means you can have a single "master" or 
"parent" layout that others can inherit from.

<br/>

**_layouts/parent.html**
```html
<html>
    <head></head>
    \{{content}}
</html>
```

**_layouts/posts.html**

```html
---
layout: parent
---
<main class="post">
    \{{content}}
</main>
```
**Pro tip:** See those three lines `---`, this is called *front matter* and it's how you
can set configuration for each page. Running Crossbow with those two files from above would
result now would result in the content from index being placed into `posts.html` which in 
turn is placed into `parent.html`


You can do some pretty amazing things with this concept - give it a try!