Building static sites becomes all the more powerful when you introduce
the concept of working with external data.

Let's say you just want a `yaml` or `json` file in your project
root that contains some information that you don't want to repeat everywhere
on your site, something like: 

```
title: "Crossbow.io"
cssFile: "/css/main.css"
```

To use this data like this in your app, you have a couple of ways to achieve it.
First, in your main configuration, you can specify a `data` property like so:

```js
var site = crossbow.builder({
    data: {
        site: {
            title:   "Crossbow.io",
            cssFile: "/css/main.css"
        }
    }
})
```

Now, across every page in your website you'll have access to the `site` variable - 
this means you can easily use any of the values like so: 

```hbs
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>{{site.title}}</title>
    <meta name="viewport" content="width=device-width">
    <meta name="description" content="Building things with Javascript.">
    <link rel="stylesheet" href="{{site.cssFile}}"/>
</head>
```

## Auto data-file include

Of course, the previous approach is fine for a couple of pieces of data, 
but if you prefer to keep your data in a separate file, you can use the 
auto-include features of Crossbow with some special syntax. So assuming 
you have a `_config.yaml` file in the root of your project, you can 
automatically pull that in by using the following:

```js
var site = crossbow.builder({
    data: {
        site: "file:_config.yaml"
    }
})
```

... now you have access to the `site` variable just as before.

## Data blocks

You can also load data on the fly from within your templates. You use the 
block-helper style syntax and provide at least two parameters `src` and `as`.

- `src` is the path to the file containing data.
- `as` is the name of the variable you use to access the data within the block.
 
```hbs
{{#data src="config.yaml" as="config"}}
<link href="{{config.cssFile}}" rel="stylesheet" />
{{/data}}
```
