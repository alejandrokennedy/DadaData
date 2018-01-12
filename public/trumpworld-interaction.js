// FINAL TOUCHES

// Legend
// Make hilighting more prominent
// Create "About" overlay
// Zoom to selection
// Disambiguate selectConnect phrasing

// TODO

// why are the circles in github desktop not small anymore?
// change color of government Agencies
// Legend hover?
// Node circle size based on:
	// number of connections
	// net worth / annual revenue
/////////

// Fix stacktrace error (logs in stacktrace-error.js)
// Fix: click Betsy DeVos, hover "The Stow Company - Holland, Inc."
// Word wrap connection (test - select: Rex Tillerson, hover: Igor Sechin)

// Remove double Daewoo?

// REFACTOR CHECKLIST
// How to select from an array based on values (so as to not need [0]th, or length - 2)?
// what code is duplicated between this and SVG-generator? The slug??? Be sure to remove duplification.
// categorize global variables

// ^(?!\/\/)([^\/\n]*)console.log

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
				 	 .replace(/ /g,"")
				 	 .replace(/#/g,"")
				 	 .replace(/—/g,"");
};

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
li.data(trumpJSON.nodes);
// li.data(trumpJSON.nodes, function(d) { return d ? "T" + slug(d.id) : this.id; });

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

// sort data on launch
function conn() {
	d3.selectAll("li").sort( function(a, b) {
		if (a.count > b.count) {
			return -1;
		} else if (a.count < b.count) {
			return 1;
		} else { 
				if (a.id > b.id) {
				return 1;
			} else if (a.id < b.id) {
				return -1;
			} else { return 0; }; 
		}
	});
}

// alpha sort
function alpha() {
	d3.selectAll("li").sort( function(a, b) {
		if (a.id > b.id) {
			return 1;
		} else if (a.id < b.id) {
			return -1;
		} else { return 0; }
	});
}

function clearStylesForClick() {
	// clear any "onClick" styles for nodes
	d3.selectAll(".nodes")
		.classed("selectedNode", false)
		.classed("neighbouringNodeCircles", false)
		.select(".nodeCircle")
		.style("stroke", "white")
		.style("fill-opacity", .15);
	// clear any "onClick" styles for links
	d3.selectAll(".lines")
		.style("stroke", "grey")
		.style("stroke-opacity", .15);
	// clear any "onClick" styles for LIs
	d3.selectAll("li").classed("selectedLi", false)
		.style("border", "none")
		.style("background-color", "#f7f7f7");
}

var svg = d3.select("svg")
	.on("click", function(){
		if (d3.event.target === this) {
			// clear any "onClick" styles for nodes
			d3.selectAll(".nodes")
				.classed("selectedNode", false)
				.classed("neighbouringNodeCircles", false)
				.select(".nodeCircle")
				.style("stroke", "white")
				.style("fill-opacity", 1);
			// clear any "onClick" styles for links
			d3.selectAll(".lines")
				.style("stroke", "grey")
				.style("stroke-opacity", 1);
			// clear any "onClick" styles for LIs
			d3.selectAll("li")
				.style("opacity", 1)
				.style("border", "none")
				.style("background-color", "#f7f7f7")
				.classed("selectedLi", false);
			// clear any "onClick" styles for LIs
			if (d3.select("#listSelect").node().value == "by Connectivity") {
				conn.call();
			} else {
				alpha.call()
			}
		};
	});

// call zoom
svg.call(zoomEvent);
zoomEvent.scaleTo(svg, .185);

conn.call();

var transitionDuration = 1000

var loadWrapper = d3.select("#loader-wrapper")
.transition()
.duration(transitionDuration)
.ease(d3.easeQuadOut)
.style("background-color", "transparent");

var loader = d3.select("#loader")
.attr("class", "loadClass")
.transition()
.duration(10000)
.ease(d3.easeQuadOut)
.style("border-color", "transparent");

var loader = d3.select("#loaderBefore")
.transition()
.duration(10000)
.ease(d3.easeQuadOut)
.style("border-color", "transparent");

var loader = d3.select("#loaderAfter")
.transition()
.duration(10000)
.ease(d3.easeQuadOut)
.style("border-color", "transparent");


loadWrapper.remove();

// selection sort logic
var listSelector = d3.select("#listSelect")
	.on("change", onChange);

function onChange() {
	var selectedValue = listSelector.property("value");

	if (selectedValue === "Alphabetically") {

		alpha.call();

	} else if (selectedValue === "by Connectivity") {

		function conn() {
			d3.selectAll("li").sort( function(a, b) {
				if (a.count > b.count) {
					return -1;
				} else if (a.count < b.count) {
					return 1;
				} else { 
						if (a.id > b.id) {
						return 1;
					} else if (a.id < b.id) {
						return -1;
					} else { return 0; }; 
				}
			});
		}

		conn.call();

	}
} // onChange callback

////////// GLOBAL VARIABLES //////////

var isNeighbour;
var isNeighbourObj;

var selectedNodeSlugID;
var selectedNodeID;

var linkSource;
var linkTarget;

/// --- /// Move variables below this line when categorizing them

// onMousoverFunction global variables
var hoveredEntityID;
var hoveredEntityMultiElementSelection;
var hoveredEntityNode;
var getNodeOnHover;
var ConnectionDescriptionText;

// onClick global variables
var clickedEntitySlugID;
var clickedEntityMultiElementSelection
var getNode;
var getLi;
var clickedEntityNode;
var clickedEntityLi;

////////// GENERIC ON("MOUSEOVER") FUNCTIONS //////////

function onMouseoverFunction (d) {

	// get hovered node
	hoveredEntityMultiElementSelection = d3.selectAll("." + hoveredEntityID);
	getNodeOnHover = hoveredEntityMultiElementSelection.nodes().length - 2;
	hoveredEntityNode = hoveredEntityMultiElementSelection.nodes()[getNodeOnHover];

	// raise hovered node above other elements
	d3.select(hoveredEntityNode).raise();

	// if an entity is selected, do the following
	if (d3.select(".selectedNode").node() !== null) {
		// assign selectedNodeSlugID and selectedNodeID to existing global variables
		selectedNodeSlugID = d3.selectAll(".selectedNode").attr("class").split(" ")[1];
		selectedNodeID = d3.selectAll(".selectedNode").data()[0].id;
		// attribute selectConnect class to lines bridging selected and hovered nodes
		d3.selectAll(".neighbouringLines")
			.classed("selectConnect", function(d) {
				linkSource = "T" + slug(d.source)
				linkTarget = "T" + slug(d.target)
				if (selectedNodeSlugID === linkSource && hoveredEntityID === linkTarget) {
					return true;
				} else if (selectedNodeSlugID === linkTarget && hoveredEntityID === linkSource) {
					return true;
				}	 						
		});
	} // if (selectedNode) statement  callback

	// declare ConnectionDescriptionText
	if (d3.select(".selectConnect")["_groups"][0][0] !== null) {
		ConnectionDescriptionText = d3.select(".selectConnect").data()[0].connection;
	}

	// style selectConnect link
	d3.select(".selectConnect")
		.style("stroke", clickHilightColor)
		.each(
			function(d) {
				var slugSource = "T" + slug(d.source);
				var slugTarget = "T" + slug(d.target);
				// is this line needed?
				var reference = d.reference;

// IS THIS ADDING UNECESSARY CLASSES TO LINES (screwing up other things)?
// If it is, be sure to remove these classes on mouseout
				var selCon = d3.select(".selectConnect");
				selCon.classed(slugSource, true);
				selCon.classed(slugTarget, true);
			}
		)
		// how to raise above circles?
		.raise();

	// style labels on hover
	d3.select(hoveredEntityNode).select(".label")
		.style("display", "inline")
		.style("text-shadow", "#ffffff 0 0 15px, #ffffff 0 0 10px, #ffffff 0 0 7px, #ffffff 0 0 5px, #ffffff 0 0 3px");
	d3.select(hoveredEntityNode).select(".labelShadow")
		.style("display", "inline")
		.style("stroke", "white");

	// conditionally style hovered nodes and add connection text
	if (d3.select(hoveredEntityNode).attr("class").split(" ").includes("selectedNode")) {
		d3.select(hoveredEntityNode).select(".nodeCircle")
			.style("stroke", clickHilightColor)
			.style("fill", function(d) { return color(d.type) });
		d3.select(hoveredEntityNode).select(".label")
			.text(function(d) { return d.id } );
		d3.select(hoveredEntityNode).select(".labelShadow")
			.text(function(d) { return d.id } );
	} else if (d3.select(".selectConnect")["_groups"][0][0] === null) {
		d3.select(hoveredEntityNode).select(".nodeCircle")
			.style("stroke", function(d) { return color(d.type) })
			.style("fill", "white");
		d3.select(hoveredEntityNode).select(".label")
			.text(function(d) { return d.id } );
		d3.select(hoveredEntityNode).select(".labelShadow")
			.text(function(d) { return d.id } );
	} else if (d3.select(".selectConnect").attr("class").split(" ").includes(hoveredEntityID)) {
		d3.select(hoveredEntityNode).select(".nodeCircle")
			.style("stroke", clickHilightColor)
			.style("fill", function(d) { return color(d.type) });

			// update connection info label on click
		// 	d3.select(this.parentNode).select(".label")
		// 		.text(function(d) { return d.id + " [ connection with " + selectedNodeID + ": ] " + ConnectionDescriptionText; } );
		// 	d3.select(this.parentNode).select(".labelShadow")
		// 		.text(function(d) { return d.id + " [ connection with " + selectedNodeID + ": ] " + ConnectionDescriptionText; } );
		// }

		var getLabel = d3.select(hoveredEntityNode).select(".label");
		var getLabelShadow = d3.select(hoveredEntityNode).select(".labelShadow");
		
		getLabel.text(function(d) { return d.id; } )
			.append("tspan")
			.attr("dy", "1.5em")
			.attr("x", parseFloat(d3.select(hoveredEntityNode).select(".label").attr("x")) + 40)
			.style("fill", "#585858")
			.text(function(d) { return "connection with " + selectedNodeID + ":" } )
			.append("tspan")
			.attr("dy", "1.25em")
			.attr("x", parseFloat(d3.select(hoveredEntityNode).select(".label").attr("x")) + 40)
			.text(function(d) { return ConnectionDescriptionText; } );

		getLabelShadow.text(function(d) { return d.id; } )
			.append("tspan")
			.attr("dy", "1.5em")
			.attr("x", parseFloat(d3.select(hoveredEntityNode).select(".label").attr("x")) + 40)
			.text(function(d) { return "connection with " + selectedNodeID + ":" } )
			.append("tspan")
			.attr("dy", "1.25em")
			.attr("x", parseFloat(d3.select(hoveredEntityNode).select(".label").attr("x")) + 40)
			.text(function(d) { return ConnectionDescriptionText; } );
		}

} // onMouseoverFunction callback


////////// GENERIC ON("MOUSELEAVE") FUNCTIONS //////////
function onMouseleaveFunction () {

		d3.selectAll(".neighbouringLines")
			.classed("selectConnect", false)
			.style("stroke", "grey");
		d3.select(hoveredEntityNode).select(".label")
			.style("display", "none")
			.style("text-shadow", "none");
		d3.select(hoveredEntityNode).select(".labelShadow")
			.style("display", "none")
			.style("stroke", "white");
		if (d3.select(hoveredEntityNode).attr("class").split(" ").includes("selectedNode")) {
				d3.select(hoveredEntityNode).select(".nodeCircle")
				.style("stroke", "clickHilightColor")
				.style("fill", function(d) { return color(d.type) });
		} else {
			d3.select(hoveredEntityNode).select(".nodeCircle")
			.style("stroke", "white")
			.style("fill", function(d) { return color(d.type) });
		}
} // onMouseleaveFunction callback



////////// GENERIC ON("CLICK") FUNCTIONS //////////

function onClickFunction (d, isNeighbourObj) {

	clickedEntityMultiElementSelection = d3.selectAll("." + clickedEntitySlugID);

	getNode = clickedEntityMultiElementSelection.nodes().length - 2;
	getLi = clickedEntityMultiElementSelection.nodes().length - 1;

	clickedEntityNode = clickedEntityMultiElementSelection.nodes()[getNode];
	clickedEntityLi = clickedEntityMultiElementSelection.nodes()[getLi];

	// clear styles
	clearStylesForClick.call();

	// class and style selected node
	d3.select(clickedEntityNode)
		.classed("selectedNode", true)
		.select(".nodeCircle")
		.style("stroke", clickHilightColor)
		.style("fill", function(d) { return color(d.type) });

	// Create array of links connecting to immediate neighbours
	isNeighbour = links.reduce(function (neighbours, link) {
		if (link.target === d.id) {
			neighbours.push(link.source);
		} else if (link.source === d.id) {
			neighbours.push(link.target)
		} return neighbours;
	}, [d.id])

	// class neighbouring nodes
	d3.selectAll(".nodes")
		.classed("neighbouringNodeCircles", function(e) {
			if (isNeighbour.includes(e.id)) {
				return true;
			}
		});

	// style neighbouring nodes
	d3.selectAll(".neighbouringNodeCircles")
		.select(".nodeCircle")
		.style("fill-opacity", 1);

	// class neighbouring lines
	d3.selectAll(".lines")
		.classed("neighbouringLines", function(e) {
			if (e.source === d.id) {
				return true;
			} else if (e.target === d.id) {
				return true;
			};
		});

	// style neighbouring lines
	d3.selectAll(".neighbouringLines")
		.style("stroke-opacity", 1);

	// turn isNeighbour array into an object
	isNeighbourObj = {};
	isNeighbour.forEach(function(el) {
		isNeighbourObj[el] = el;
	});

	// add class to clickedEntityLi
	d3.select(clickedEntityLi)
		.classed("selectedLi", true);


// Style and lower (sort) LIs that represent neighbouring node

	// clear any "onClick" styles for LIs
	d3.selectAll("li").classed("neighbouringNodeLIs", false)
		.style("opacity", .25);

	// class neighbouring LIs on click
	d3.selectAll("li")
		.classed("neighbouringNodeLIs", function(e) {
			// if (isNeighbour.includes(e.id)) {
			if (isNeighbourObj[e.id]) {
				return true;
			}
		});
	// style neighbouring Lis on click
	d3.selectAll(".neighbouringNodeLIs")
		.style("opacity", 1)
		.lower();

	// style selected Li on click
	d3.selectAll(".selectedLi")
		.style("border", "2px solid")
		.style("border-color", clickHilightColor)
		.style("background-color", "white")
		.lower();


// Scroll to top of D2 (entity list)
	function scrollTopTween(scrollTop) {
	  return function() {
	    var i = d3.interpolateNumber(this.scrollTop, scrollTop);
	    var scrollElement = this;
	    return function(t) {
	    	scrollElement.scrollTop = i(t); };
	 };
	}

	d3.select(".d2")
		.transition().duration(800).ease(d3.easeCubicOut)
		.tween("tweenName", scrollTopTween(0));

	onMouseleaveFunction();

} // styleAndLowerConnectedLIs callback

////////// LI SECTION //////////
li
	.on("mouseover", function(d) {
		hoveredEntityID = d3.select(this).attr("class").split(" ")[0];
		onMouseoverFunction(d);
	}) // LI on mouseover callback

	.on("mouseleave", function () {
		onMouseleaveFunction();
	}) // on mouseleave callback

	.on("click", function(d) {
		// update global variable
		clickedEntitySlugID = d3.select(this).attr("class").split(" ")[0];
		onClickFunction(d, isNeighbourObj);
	}); // on click callback

////////// CIRCLECATCHER SECTION //////////
circleCatcher
	.on("mouseover", function (d) {
		hoveredEntityID = "T" + slug(d.id);		
		onMouseoverFunction(d);
	}) // on mouseover callback

	.on("mouseleave", function () {
		onMouseleaveFunction();
	})

	.on("click", function(d) {
		// update global variable
		clickedEntitySlugID = d3.select(this.parentNode).attr("class").split(" ")[1];		
		onClickFunction(d, isNeighbourObj);
	}); // on click callback

////////// LEGEND SECTION //////////
var entityTypeList = d3.set(
	trumpJSON.nodes.map(function(d) { return d.type})
	).values();

var legendDiv = d3.select("#legend").node();

var legendMargin = {top: 30, right: 15, bottom: 0, left: 15},
	legendWidth = legendDiv.clientWidth - legendMargin.left - legendMargin.right,
	legendHeight = legendDiv.clientHeight - legendMargin.top - legendMargin.bottom;

console.log(legendHeight);

var legendSVG = d3.select("#legend").append("svg")
	.attr("width", legendWidth + legendMargin.left + legendMargin.right)
	.attr("height", legendHeight + legendMargin.top + legendMargin.bottom)
 .append("g")
 	.attr("id", "legendG")
 	.attr("transform", "translate(" + legendMargin.left + "," + legendMargin.top + ")");

var legendYScale = d3.scaleBand()
	.domain(entityTypeList)
	.range([0, legendHeight]);

var legendCircleGs = d3.select("#legendG")
	.selectAll(".legendCircles")
 .data(entityTypeList).enter()
 	.append("g")
 	.attr("class", function(d) { return "legend " + d})
 	.attr("transform", function(d) { return "translate(" + 20 + "," + legendYScale(d) + ")" });

legendCircleGs.append("circle")
	.attr("r", 8)
	.style("stroke", "none")
	.style("fill", function(d) { return color(d) });

legendCircleGs.append("text")
	.text(function(d) { return d})
	.attr("class", "legendText");

} // end of Ready function