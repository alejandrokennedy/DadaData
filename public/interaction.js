// add your interations here
var selection = d3.selectAll("circle");
selection
	.on("mouseenter", function() { 
  		d3.select(this)
		  .remove()
	});

console.log(selection);
// console.log(selection.data());
console.log(selection.node());
console.log(selection.size());

var svgsus = d3.selectAll(".theCanvas");
console.log(svgsus);