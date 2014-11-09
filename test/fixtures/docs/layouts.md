---
layout: docs
title: "Layouts"
---

##Layouts

Crossbow has been built from the ground to support really powerful layout features.
Layouts live in the `_layouts` directory and are just regular `html` files that 
contain the *special* `{{ content }}` tag.

Here's a tiny example of a layout file...

**_layouts/default.html**

```html
<!DOCTYPE html>
<html>
    <head>
        <title>{{page.title}}</title>
    </head>
    <body>
        {{content}}
    </body>
</html>
```

... and to use that, you might have an `index.html` file that looks like this:

```html
---
layout: "default.html"
title: "My cool title"
---

<p>My awesome website</p>
```

**Pro tip:** See those three lines `---`, this is called *front matter* and it's how you
can set configuration for each page. Running Crossbow with those two files from above would
result in everything from `index.html` that *is not* inside the three lines being wedged into
the layout file. It would look something like this:

```html
<!DOCTYPE html>
<html>
    <head>
        <title>My cool title</title>
    </head>
    <body>
        <p>My awesome website</p>
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
    {{content}}
</html>
```

**_layouts/posts.html**

```html
---
layout: parent
---
<main class="post">
    {{content}}
</main>
```
