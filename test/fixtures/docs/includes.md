Crossbow is built on a fork of Handlebars, so anything you can dream of
doing with Handlebars, you can also achieve with Crossbow.
  
We were not happy with that alone, however. The author of Crossbow wanted
to create the type of `include` or `partial` system that he'd always 
wanted from other programming languages.

### Introducing the <code>\{{inc}}</code> helper.

Inc, short for **include**, is the Crossbow Authors take on how partials 
should actually be done. Having worked with a number of programming languages
in the past, the Crossbow author has developed what he believes to be a 
 near-perfect include/partial system.
 
A simple example would be to break small chunks of code into re-usable components


```hbs
\{{inc src="hero-section.html"}}
\{{inc src="button.html"}}
```

### Sub directories

Given that Crossbow first resolves all files from a **base**. You can 
easily traverse the file system in both ways to include the file you want.
 
```hbs
\{{inc src="sub/directory/hero-section.html"}}
\{{inc src="../../some/button.html"}}
``` 