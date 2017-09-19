// add your interations here
var selection = d3.selectAll("circle");
selection
	.on("mouseenter", function() { 
  		d3.select(this)
		  .remove()
	});

var data = d3.selectAll("circle");
console.log(data.data());
