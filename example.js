var Handbars  = require("handlebars");
var multiline = require("multiline");
var dust      = require("dustjs-linkedin");

var string = multiline(function () {/*
<ul>
     {{#links}}
     <li>{{.}}</li>
     {{/links}}
</ul>
*/});

//Handbars.registerPartial('link_to', function() {
//    return "<li><a href='/posts'>Just a link</a></li>";
//});

var hb = Handbars.compile(string)({links:["shane", "kittie"]});

require("d-logger")(hb);

var string = multiline(function () {/*
<ul>
    {#links}
    <li>{.}</li>
    {/links}
</ul>
 */});
dust.config.whitespace = true;
dust.renderSource(string, {links: ["shane", "kittie"]}, function (err, out) {
    require("d-logger")(out);
});

