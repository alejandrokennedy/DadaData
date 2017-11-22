// TODO
// Remove double Daewoo
// Fix .TTHEREEDSCORDISH2016CHILDRENSTRUST#2
// Fix .TTHEREEDSCORDISH2016CHILDRENSTRUST#1
// Fix Ajit Pai select connect hover text no-show
// Fix: click Betsy DeVos, hover "The Stow Company - Holland, Inc."
// Word wrap connection (test - select: Rex Tillerson, hover: Igor Sechin)

// REFACTOR CHECKLIST
// function to clear styles?
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

			// scroll to top of LI div
			// do this only if a node is selected

			// d3.select(".d2").style("color", "red");

			// var d2Select = document.getElementById("listDiv");
			var d2Select = document.getElementsByClassName("d2");

			function styleThis() {
			var scrollTopPlease = d2Select.style.color = "red";
			}
			styleThis.call;
			// var scrollTopPlease = d2Select.innerHTML;

			// console.log(d2Select);
			
			// console.log(scrollTopPlease);

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

var hoveredEntityID;
// rename hoveredEntityNodeClass?
var hoveredEntityNodeClass;
var hoveredEntityNode;

/// --- /// Move variables below this label when categorizing them

// onClick global variables
var clickedEntitySlugID;
var clickedEntityMultiElementSelection
var getNode;
var getLi;
var clickedEntityNode;
var clickedEntityLi;

// onMousoverFunction global variables
// rename entityConnection to be more clear
var entityConnection;

////////// GENERIC ON("MOUSEOVER") FUNCTIONS //////////

function onMouseoverFunction (d) {

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

	// declare entityConnection
	if (d3.select(".selectConnect")["_groups"][0][0] !== null) {
		// rename entityConnection to be more clear
		entityConnection = d3.select(".selectConnect").data()[0].connection;
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
		.style("text-shadow", "#ffffff 0 0 6px, #ffffff 0 0 4px, #ffffff 0 0 2px");
	d3.select(hoveredEntityNode).select(".labelShadow")
		.style("display", "inline")
		.style("stroke", "white");

	// console.log(hoveredEntityID);

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
		// 		.text(function(d) { return d.id + " [ connection with " + selectedNodeID + ": ] " + entityConnection; } );
		// 	d3.select(this.parentNode).select(".labelShadow")
		// 		.text(function(d) { return d.id + " [ connection with " + selectedNodeID + ": ] " + entityConnection; } );
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
			.text(function(d) { return entityConnection; } );

		getLabelShadow.text(function(d) { return d.id; } )
			.append("tspan")
			.attr("dy", "1.5em")
			.attr("x", parseFloat(d3.select(hoveredEntityNode).select(".label").attr("x")) + 40)
			.text(function(d) { return "connection with " + selectedNodeID + ":" } )
			.append("tspan")
			.attr("dy", "1.25em")
			.attr("x", parseFloat(d3.select(hoveredEntityNode).select(".label").attr("x")) + 40)
			.text(function(d) { return entityConnection; } );
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

// what's up testing this now

////////// GENERIC ON("CLICK") FUNCTIONS //////////

function onClickFunction (d) {

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

} // onClickFunction callback

// does this need to be its own function?
// Style and lower (sort) LIs that represent neighbouring node
function styleAndLowerConnectedLIs (isNeighbourObj) {

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

} // styleAndLowerConnectedLIs callback



////////// LI SECTION //////////

li
	.on("mouseover", function(d) {

		hoveredEntityID = d3.select(this).attr("class").split(" ")[0];
		hoveredEntityNodeClass = d3.selectAll("." + hoveredEntityID);

		var nodeNumIWant = hoveredEntityNodeClass.nodes().length - 2;
		var correspondingNode = hoveredEntityNodeClass.nodes()[nodeNumIWant];
		hoveredEntityNode = hoveredEntityNodeClass.nodes()[nodeNumIWant];

		onMouseoverFunction(d);

		if (d3.select(correspondingNode).attr("class").split(" ").includes("selectedNode")) {

			d3.select(correspondingNode).select(".nodeCircle")
					.style("stroke", clickHilightColor)
					// .style("fill", function(d) { return color(d.type) });
			d3.select(correspondingNode).select(".label")
				.text(function(d) { return d.id } );
			d3.select(correspondingNode).select(".labelShadow")
				.text(function(d) { return d.id } );

		} else if (d3.select(".selectConnect")["_groups"][0][0] === null) {
			// console.log(true);
			d3.select(correspondingNode).select(".nodeCircle")
				.style("stroke", function(d) { return color(d.type) })
				.style("fill", "white");
		} else if (d3.select(".selectConnect").attr("class").split(" ").includes(hoveredEntityID)) {
			d3.selectAll("." + hoveredEntityID).select(".label")
					.style("display", "inline")
					.style("text-shadow", "#ffffff 0 0 6px, #ffffff 0 0 4px, #ffffff 0 0 2px");
			d3.selectAll("." + hoveredEntityID).select(".labelShadow")
					.style("display", "inline")
					.style("stroke", "white");
		}
	}) // LI on mouseover callback

	.on("mouseleave", function () {

		onMouseleaveFunction();

	}) // on mouseleave callback


	// LI onClick
	.on("click", function(d) {

		// update global variable
		clickedEntitySlugID = d3.select(this).attr("class").split(" ")[0];

		// call function to class, style, and lower LIs representing connected nodes
		onClickFunction(d);

		// call function to class, style, and lower LIs representing connected nodes
		styleAndLowerConnectedLIs(isNeighbourObj);

	}); // on click callback



////////// CIRCLECATCHER SECTION //////////

circleCatcher
	.on("mouseover", function (d) {

		hoveredEntityID = "T" + slug(d.id);
		hoveredEntityNode = this.parentNode;
		
		onMouseoverFunction(d);

	}) // on mouseover callback

	.on("mouseleave", function () {

		onMouseleaveFunction();

	})

	// Circlecatcher onClick
	.on("click", function(d) {

		// update global variable
		clickedEntitySlugID = d3.select(this.parentNode).attr("class").split(" ")[1];
		
		// pass onClickFunction the data from clicked node
		onClickFunction(d);

		// call function to class, style, and lower LIs representing connected nodes
		// does this function need to be separate? Pros? Cons?
		styleAndLowerConnectedLIs(isNeighbourObj);

		// // sort LIs: neighbours on top
		// d3.selectAll("li").sort( function(a, b) {
		// 		if (!isNeighbourObj[a.id] && !isNeighbourObj[b.id]) {
		// 			return 0;
		// 		} else if (isNeighbourObj[a.id] && !isNeighbourObj[b.id]) {
		// 			return -1;
		// 		} else if (isNeighbourObj[a.id] && isNeighbourObj[b.id]) {
		// 			return 0;
		// 		} else {
		// 			return 1;
		// 		}
		// });

	}); // on click callback

// // Verify that these two blocks are actually needed
// setTimeout(function() {
// svg.call(zoomEvent);
// }, .001);

// setTimeout(function() {
// zoomEvent.scaleTo(svg, .185);
// }, .002);

} // end of Ready function