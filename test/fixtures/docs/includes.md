Crossbow is built on a fork of Handlebars, so anything you can dream of
doing with Handlebars, you can also achieve with Crossbow.
  
We were not happy with that alone, however. The author of Crossbow wanted
to create the type of `include` or `partial` system that he'd always 
wanted from other programming languages.

### Introducing the <code>\{{inc}}</code> helper.

Inc, short for **include**, is the way in which you `include`
other pieces of content. Having worked with a number of programming languages
in the past, the Crossbow author has developed what he believes to be a 
 superior include/partial system.
 
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

**Note**: In Crossbow, files are *always* resolved from the 
 base, no matter which file you are currently editing. This is one of our 
 strong opinions regarding file system access in Crossbow and it 
 makes for a much simpler workflow as you always know exactly how to get 
 to a file.
  
### Include params

Say you have the following in a partial... 

```hbs
<p>
    <button>Click me!</button>
</p>
```

... if you wanted to make the "Click me" text dynamic, the easiest way 
would be to to replace the text with a variable...

```hbs
<p>
    <button>\{{text}}</button>
</p>
```

... now, when you include this partial, you can pass the value of `\{{text}}`
 as a parameter.

```hbs
\{{inc src="button.html" text="Click me!"}}
```

### Includes + Filters
Image how cool it would be if you could include the content of another
file, but also process the contents using a filter? No problem with Crossbow, 
this is a built-in feature. This example uses the built-in `hl` or `highlight`
filter to provide syntax highlighting on the file contents.

```hbs
\{{inc src="button.html" filter="hl" name="Highlighted"}}
```

results in...

{{inc src="button.html" filter="hl" name="Highlighted"}}

### Inline errors

We think there's nothing more frustrating that silent errors. That's 
why we provide error messages to the console as you work, but also in the
html content - making it super easy to see where you've mis-spelled a file
path.

Here, I've deliberately tried to use a file that doesn't exist with the 
following: 

```hbs
{{inc src="does/not/exist.html"}}
```

... which results in the following output in the html (don't worry, you 
can disable this feature, if you *really* want to.

{{inc src="does/not/exist.html"}}


### Pretty markup

Includes benefit from the pretty markup feature that's unique to Crossbow.
This means you can format your html perfectly and the resulting markup will
be exactly what you expect.