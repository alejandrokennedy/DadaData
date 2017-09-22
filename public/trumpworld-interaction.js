// get size of sidebar
var sidebarSize = d3.select(".d1").style("width");

// margin convention
var margin = {top: 0, right: parseInt(sidebarSize), bottom: 0, left: 0},
	width = window.innerWidth - margin.left - margin.right,
	height = window.innerHeight - margin.top - margin.bottom;

// resize the SVG
function resizeSVG() {
	d3.select("svg")
	.attr("width", width)
	.attr("height", height);
}
resizeSVG.call();

// queue up the data
d3.queue()
	.defer(d3.json, "trumpworld-graph.json")
	.await(ready);

// load data
function ready (error, trumpJSON) {
	if (error) throw error;
	// console.log(trumpJSON);
	// console.log(trumpJSON.nodes[0].id);

// re-define variables and functions from generator file
var nominal_text_size = 60;
var max_text_size = 14;

var nominal_stroke = 1.25;
var max_stroke = 3.5;

var nominal_labelStroke = 1
var max_labelStroke = 20

function slug (id) {
	return id.replace(/,/g,"")
					 .replace(/\./g,"")
					 .replace(/'/g,"")
					 .replace(/"/g,"")
					 .replace(/&/g,"")
					 .replace(/\(/g,"")
					 .replace(/\)/g,"")
					 .replace(/\//g,"")
				 	 .replace(/ /g,"");
};

var svg = d3.select("svg")
	.on("click", function(){
					if (d3.event.target === this) {
						// clear any "onClick" styles for nodes
		 				d3.selectAll(".nodes").classed("selectedNode", false)
		 					.select(".nodeCircle")
		 					.style("stroke", "white")
		 					.style("fill-opacity", 1);
		 				// clear any "onClick" styles for links
		 				d3.selectAll(".lines")
		 					.style("stroke", "grey")
		 					.style("stroke-opacity", 1);
					};
				});

var gContainer = d3.select("#gContainer");
var clickHilightColor = "rgb(52, 255, 38)";
var color = d3.scaleOrdinal(d3.schemeCategory10).domain(["organization", "person", "federal agency"]);
var links = trumpJSON.links;
var label = d3.selectAll(".label");
var labelShadow = d3.selectAll(".labelShadow");

// nodes re-bind
var nodes = d3.selectAll(".nodes");
nodes.data(trumpJSON.nodes)
.on("mouseover", function() {
						this.parentNode.appendChild(this);
					});
var circle = nodes.selectAll(".nodeCircle");

// clipPath re-bind
var clipPath = d3.selectAll(".clip");
clipPath.data(trumpJSON.nodes);

// circleCatcher re-bind
var circleCatcher = d3.selectAll(".circleCatcher")
.data(trumpJSON.nodes);

// links re-bind
var lines = d3.selectAll(".lines");
lines.data(trumpJSON.links);

// li re-bind
var li = d3.selectAll("li");
// .data(data, function(d) { return d ? d.name : this.id; })
li.data(trumpJSON.nodes, function(d) { return d ? "T" + slug(d.id) : this.id; });
// li.data(trumpJSON.nodes);

// console.log(li);
// console.log(li.data())

// zoom function
var zoomEvent = d3.zoom().scaleExtent([0.1, 9]).on("zoom", function () {
	gContainer.attr("transform", d3.event.transform);

	var stroke = nominal_stroke;
    if (nominal_stroke * d3.event.transform.k > max_stroke) stroke = max_stroke / d3.event.transform.k;
    lines.style("stroke-width",stroke);
    circle.style("stroke-width",stroke * 1.5);

	var text_size = nominal_text_size ;
		if (nominal_text_size * d3.event.transform.k > max_text_size) text_size = max_text_size / d3.event.transform.k;
		label.style("font-size",text_size + "px");
		labelShadow.style("font-size",text_size + "px");

	var labelStroke = text_size / 7.5;
    if (text_size / 7.5 > max_labelStroke) labelStroke = max_labelStroke / d3.event.transform.k;
    labelShadow.style("stroke-width", labelStroke);
}); // zoom function callback

// call zoom
svg.call(zoomEvent);
zoomEvent.scaleTo(svg, .185);

// li SECTION

li
	.on("mouseover", function(d) {
		// console.log(d.id);
	// 	var mouseClass = d3.select(this).attr("class");
	// 	var correspondingNodeSelection = d3.selectAll("." + mouseClass);
	// 	var correspondingNode = correspondingNodeSelection.nodes()[1];
	// correspondingNode.parentNode.appendChild(correspondingNode);
	// if (d3.select(correspondingNode).attr("class").split(" ").includes("selectedNode")) {
	// 	d3.select(correspondingNode).select(".nodeCircle")
	// 		.style("stroke", clickHilightColor)
	// 		.style("fill", "white");
	// } else {
	// 	d3.select(correspondingNode).select(".nodeCircle")
	// 		.style("stroke", function(d) { return color(d.type) })
	// 		.style("fill", "white");
	// }
	// d3.selectAll("." + mouseClass).select(".label")
	// 		.style("display", "inline")
	// 		.style("text-shadow", "#ffffff 0 0 6px, #ffffff 0 0 4px, #ffffff 0 0 2px");
	// d3.selectAll("." + mouseClass).select(".labelShadow")
	// 		.style("display", "inline")
	// 		.style("stroke", "white");
	});



// 	.on("mouseleave", function () {
// 		var mouseClass = d3.select(this).attr("class");
// 		var correspondingNodeSelection = d3.selectAll("." + mouseClass);
// 		var correspondingNode = correspondingNodeSelection.nodes()[1];
// 	correspondingNode.parentNode.appendChild(correspondingNode);
	
// 	if (d3.select(correspondingNode).attr("class").split(" ").includes("selectedNode")) {
// 		d3.select(correspondingNode).select(".nodeCircle")
// 			.style("stroke", clickHilightColor)
// 			.style("fill", function(d) { return color(d.type) })
// 	} else {
// 		d3.select(correspondingNode).select(".nodeCircle")
// 			.style("fill", function(d) { return color(d.type) })
// 			.style("stroke", "white");
// 	}
// 	d3.selectAll("." + mouseClass).select(".label")
// 			.style("display", "none")
// 			.style("text-shadow", "none");
// 	d3.selectAll("." + mouseClass).select(".labelShadow")
// 			.style("display", "none")
// 			.style("stroke", "white");
// 	})

// 	.on("click", function(d) {
// 		// variables for use in if statements below
// 		var clickClass = d3.select(this).attr("class");
// 		var correspondingNodeSelection = d3.selectAll("." + clickClass);
// 		var correspondingNode = correspondingNodeSelection.nodes()[1];
// 		// clear any "onClick" styles for nodes
// 		d3.selectAll(".nodes").classed("selectedNode", false)
// 			.select(".nodeCircle")
// 			.style("stroke", "white")
// 			.style("fill-opacity", .15);
// 		// clear any "onClick" styles for links
// 		d3.selectAll(".lines")
// 			.style("stroke", "grey")
// 			.style("stroke-opacity", .15);
// 		var isNeighbour = links.reduce(function (neighbours, link) {
// 			if (link.target.id === d.id) {
// 				neighbours.push(link.source.id);
// 			} else if (link.source.id === d.id) {
// 				neighbours.push(link.target.id);
// 			} return neighbours;
// 		}, [d.id]);

// 		d3.selectAll(".nodes")
// 			.classed("neighbouringNodeCircles", function(e) {
// 				if (isNeighbour.includes(e.id)) {
// 					return true;
// 				}
// 			});
// 		d3.select(correspondingNode).classed("selectedNode", true)
// 			.select(".nodeCircle")
// 			.style("stroke", clickHilightColor);
// 		d3.selectAll(".neighbouringNodeCircles")
// 			.select(".nodeCircle")
// 			.style("fill-opacity", 1);
// 		d3.selectAll(".lines")
// 			.classed("neighbouringLines", function(e) {
// 				if (e.source.id === d.id) {
// 					return true;
// 				} else if (e.target.id === d.id) {
// 					return true;
// 				};
// 			});
// 			d3.selectAll(".neighbouringLines")
// 			.style("stroke-opacity", 1);
// 	}); // on click callback

// CIRCLECATCHER SECTION
circleCatcher
	.on("mouseover", function (d) {
		var hoveredNode = d;
		var hoveredNodeID = "T" + slug(hoveredNode.id);

		// declare selectedNodeSlugID
		if (d3.select(".selectedNode")["_groups"][0][0] !== null) {
			var selectedNodeSlugID = d3.selectAll(".selectedNode").attr("class").split(" ")[1];
			var selectedNodeID = d3.selectAll(".selectedNode").data()[0].id;
		}

		// add selectConnect class to links connecting hovered node with slected node
		if (d3.select(".selectedNode")["_groups"][0][0] !== null) {
			d3.selectAll(".neighbouringLines")
				.classed("selectConnect", function(d) {
					var linkSource = "T" + slug(d.source)
					var linkTarget = "T" + slug(d.target)
					if (selectedNodeSlugID === linkSource && hoveredNodeID === linkTarget) {
						return true;
					} else if (selectedNodeSlugID === linkTarget && hoveredNodeID === linkSource) {
						return true;
					}	 						
			});
		}

		// declare entityConnection
		if (d3.select(".selectConnect")["_groups"][0][0] !== null) {
			var entityConnection = d3.select(".selectConnect").data()[0].connection;
		}

		// style selectConnect link
		d3.select(".selectConnect")
			.style("stroke", clickHilightColor)
			.each(
				function(d) {
					var slugSource = "T" + slug(d.source);
					var slugTarget = "T" + slug(d.target);

					var reference = d.reference;
					console.log("reference: ", reference);

					var selCon = d3.select(".selectConnect");
					selCon.classed(slugSource, true);
					selCon.classed(slugTarget, true);
				}
			);

		// style labels on hover
		d3.select(this.parentNode).select(".label")
			.style("display", "inline")
			.style("text-shadow", "#ffffff 0 0 6px, #ffffff 0 0 4px, #ffffff 0 0 2px");
		d3.select(this.parentNode).select(".labelShadow")
			.style("display", "inline")
			.style("stroke", "white");

		// conditionally style hovered nodes and add connection text
		if (d3.select(this.parentNode).attr("class").split(" ").includes("selectedNode")) {
			d3.select(this.parentNode).select(".nodeCircle")
				.style("stroke", clickHilightColor)
				.style("fill", function(d) { return color(d.type) });
			d3.select(this.parentNode).select(".label")
				.text(function(d) { return d.id } );
			d3.select(this.parentNode).select(".labelShadow")
				.text(function(d) { return d.id } );
		} else if (d3.select(".selectConnect")["_groups"][0][0] === null) {
			d3.select(this.parentNode).select(".nodeCircle")
				.style("stroke", function(d) { return color(d.type) })
				.style("fill", "white");
			d3.select(this.parentNode).select(".label")
				.text(function(d) { return d.id } );
			d3.select(this.parentNode).select(".labelShadow")
				.text(function(d) { return d.id } );
		} else if (d3.select(".selectConnect").attr("class").split(" ").includes(hoveredNodeID)) {
			d3.select(this.parentNode).select(".nodeCircle")
				.style("stroke", clickHilightColor)
				.style("fill", function(d) { return color(d.type) });

			// update connection info label on click
		// 	d3.select(this.parentNode).select(".label")
		// 		.text(function(d) { return d.id + " [ connection with " + selectedNodeID + ": ] " + entityConnection; } );
		// 	d3.select(this.parentNode).select(".labelShadow")
		// 		.text(function(d) { return d.id + " [ connection with " + selectedNodeID + ": ] " + entityConnection; } );
		// }

			var getLabel = d3.select(this.parentNode).select(".label");
			var getLabelShadow = d3.select(this.parentNode).select(".labelShadow");
			
			getLabel.text(function(d) { return d.id; } )
				.append("tspan")
				.attr("dy", "1.5em")
				.attr("x", parseFloat(d3.select(this.parentNode).select(".label").attr("x")) + 40)
				.style("fill", "#585858")
				.text(function(d) { return "connection with " + selectedNodeID + ":" } )
				.append("tspan")
				.attr("dy", "1.25em")
				.attr("x", parseFloat(d3.select(this.parentNode).select(".label").attr("x")) + 40)
				.text(function(d) { return entityConnection; } );

			getLabelShadow.text(function(d) { return d.id; } )
				.append("tspan")
				.attr("dy", "1.5em")
				.attr("x", parseFloat(d3.select(this.parentNode).select(".label").attr("x")) + 40)
				.text(function(d) { return "connection with " + selectedNodeID + ":" } )
				.append("tspan")
				.attr("dy", "1.25em")
				.attr("x", parseFloat(d3.select(this.parentNode).select(".label").attr("x")) + 40)
				.text(function(d) { return entityConnection; } );
		}

	}) // on mouseover callback

	.on("mouseleave", function () {
		d3.selectAll(".neighbouringLines")
			.classed("selectConnect", false)
			.style("stroke", "grey");
		d3.select(this.parentNode).select(".label")
			.style("display", "none")
			.style("text-shadow", "none");
		d3.select(this.parentNode).select(".labelShadow")
			.style("display", "none")
			.style("stroke", "white");
		if (d3.select(this.parentNode).attr("class").split(" ").includes("selectedNode")) {
				d3.select(this.parentNode).select(".nodeCircle")
				.style("stroke", "clickHilightColor")
				.style("fill", function(d) { return color(d.type) });
		} else {
			d3.select(this.parentNode).select(".nodeCircle")
			.style("stroke", "white")
			.style("fill", function(d) { return color(d.type) });
		}
	})

	.on("click", function(d) {
		// clear any "onClick" styles for nodes
		d3.selectAll(".nodes").classed("selectedNode", false)
			.select(".nodeCircle")
			.style("stroke", "white")
			.style("fill-opacity", .15);
		// clear any "onClick" styles for links
		d3.selectAll(".lines")
			.style("stroke", "grey")
			.style("stroke-opacity", .15);

		var isNeighbour = links.reduce(function (neighbours, link) {
			if (link.target === d.id) {
				neighbours.push(link.source);
			} else if (link.source === d.id) {
				neighbours.push(link.target)
			} return neighbours;
		}, [d.id])

		d3.selectAll(".nodes")
			.classed("neighbouringNodeCircles", function(e) {
				if (isNeighbour.includes(e.id)) { 
					return true;
				}
			});

		d3.select(this.parentNode)
			.classed("selectedNode", true)
			.select(".nodeCircle")
			.style("stroke", clickHilightColor)
			.style("fill", function(d) { return color(d.type) });

		d3.selectAll(".neighbouringNodeCircles")
			.select(".nodeCircle")
			.style("fill-opacity", 1);

		d3.selectAll(".lines")
			.classed("neighbouringLines", function(e) {
				if (e.source === d.id) {
					return true;
				} else if (e.target === d.id) {
					return true;
				};
			});

			d3.selectAll(".neighbouringLines")
			.style("stroke-opacity", 1);
	}); // on click callback


// // Verify that these two blocks are actually needed
// setTimeout(function() {
// svg.call(zoomEvent);
// }, .001);

// setTimeout(function() {
// zoomEvent.scaleTo(svg, .185);
// }, .002);

}