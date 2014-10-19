---
layout: docs
title: "Layouts"
---

##Layouts

Crossbow has been built from the ground to support really powerful layout features.
Layouts live in the `_layouts` directory and are just regular `html` files that 
contain the *special* {``{#content /}``} tag.

Here's a tiny example of a layout file...

**_layouts/default.html**

```html
<!DOCTYPE html>
<html>
    <head>
        <title>My Website</title>
    </head>
    <body>
        {#content /}
    </body>
</html>
```

... and to use that, you might have an `index.html` file that looks like this:

```html
---
layout: "default.html"
title: "Homepage"
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
        <title>My Website</title>
    </head>
    <body>
        <p>My awesome website</p>
    </body>
</html>
```