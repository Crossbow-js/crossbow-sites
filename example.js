var Handbars  = require("handlebars");
var multiline = require("multiline");

var string = multiline(function () {/*
<ul>
    <li>Link</li>
    {{> link_to}}
</ul>
*/});

Handbars.registerPartial('link_to', function() {
    return "<li><a href='/posts'>Just a link</a></li>";
});

console.log(Handbars.compile(string)({}));