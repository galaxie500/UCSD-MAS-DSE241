function wrap(text, width) {
        text.each(function() {
            var text = d3.select(this),
                    words = text.text().split(/\s+/).reverse(),
                    word,
                    line = [],
                    lineNumber = 0,
                    lineHeight = 1.1,
                    y = text.attr("y"),
                    dy = parseFloat(text.attr("dy")),
                    tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                }
            }
        });
    }
    dataset = [
        {label:"Biathlon", "Canada":3, "Finland":16, "Germany": 80, "Norway":62, "Sweden":16, "Switzerland":5, "United States":0},
        {label:"Bobsleigh", "Canada":22, "Finland":0, "Germany": 66, "Norway":0, "Sweden":0, "Switzerland":101, "United States":93},
        {label:"Curling", "Canada":50, "Finland":5, "Germany": 0, "Norway":15, "Sweden":33, "Switzerland":25, "United States":5},
        {label:"Ice Hockey", "Canada":351, "Finland":181, "Germany": 10, "Norway":0, "Sweden":218, "Switzerland":50, "United States":269},
        {label:"Luge", "Canada":0, "Finland":0, "Germany": 42, "Norway":0, "Sweden":0, "Switzerland":0, "United States":9},
        {label:"Skating", "Canada":159, "Finland":26, "Germany": 54, "Norway":83, "Sweden":20, "Switzerland":3, "United States":179},
        {label:"Skiing", "Canada":40, "Finland":206, "Germany": 108, "Norway":297, "Sweden":146, "Switzerland":101, "United States":98},       
    ];
    var margin = {top: (parseInt(d3.select('body').style('height'), 10)/20), right: (parseInt(d3.select('body').style('width'), 10)/20), bottom: (parseInt(d3.select('body').style('height'), 10)/6), left: (parseInt(d3.select('body').style('width'), 10)/20)},
            width = parseInt(d3.select('body').style('width'), 10) - margin.left - margin.right,
            height = parseInt(d3.select('body').style('height'), 10) - margin.top - margin.bottom;
    var x = d3.scale.ordinal()
            .rangeRoundBands([0, width], .1,.3);
    var y = d3.scale.linear()
            .rangeRound([height, 0]);
    var colorRange = d3.scale.category20();
    var color = d3.scale.ordinal()
            .range(colorRange.range());
    var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");
    var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .tickFormat(d3.format(".2s"));
    var svg = d3.select("body").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    var divTooltip = d3.select("body").append("div").attr("class", "toolTip");
    color.domain(d3.keys(dataset[0]).filter(function(key) { return key !== "label"; }));
    dataset.forEach(function(d) {
        var y0 = 0;
        d.values = color.domain().map(function(name) { return {name: name, y0: y0, y1: y0 += +d[name]}; });
        d.total = d.values[d.values.length - 1].y1;
    });
    x.domain(dataset.map(function(d) { return d.label; }));
    y.domain([0, d3.max(dataset, function(d) { return d.total; })]);
    svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);
    svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 9)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Medal count");
    var bar = svg.selectAll(".label")
            .data(dataset)
            .enter().append("g")
            .attr("class", "g")
            .attr("transform", function(d) { return "translate(" + x(d.label) + ",0)"; });
    svg.selectAll(".x.axis .tick text")
            .call(wrap, x.rangeBand());
            
    var bar_enter = bar.selectAll("rect")
    .data(function(d) { return d.values; })
    .enter();

bar_enter.append("rect")
    .attr("width", x.rangeBand())
    .attr("y", function(d) { return y(d.y1); })
    .attr("height", function(d) { return y(d.y0) - y(d.y1); })
    .style("fill", function(d) { return color(d.name); });

bar_enter.append("text")
    .text(function(d) { return d3.format(".2s")(d.y1-d.y0); })
    .attr("y", function(d) { return y(d.y1)+(y(d.y0) - y(d.y1))/2; })
    .attr("x", x.rangeBand()/3)
    .style("fill", '#ffffff');
    
    bar
            .on("mousemove", function(d){
                divTooltip.style("left", d3.event.pageX+10+"px");
                divTooltip.style("top", d3.event.pageY-25+"px");
                divTooltip.style("display", "inline-block");
                var elements = document.querySelectorAll(':hover');
                l = elements.length
                l = l - 1
                element = elements[l].__data__
                value = element.y1 - element.y0 + 1
                divTooltip.html((d.label)+"<br>"+element.name+"<br>"+value);
            });
    bar
            .on("mouseout", function(d){
                divTooltip.style("display", "none");
            });
    svg.append("g")
            .attr("class", "legendLinear")
            .attr("transform", "translate(0,"+(height+30)+")");
    var legend = d3.legend.color()
            .shapeWidth(height/4)
            .shapePadding(10)
            .orient('horizontal')
            .scale(color);
    svg.select(".legendLinear")
            .call(legend);