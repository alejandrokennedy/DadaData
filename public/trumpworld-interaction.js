// MANDATORY FINAL TOUCHES

// Disambiguate selectConnect phrasing
// Add search to sidebar list (consider https://select2.org )
// [may not make sense]: have hover-over text float over sidebar


// EXTRA EMBELlISHMENTS

// Pin selected li to top of list
// Tweak overlay
// Change color of government Agencies
// Legend hover?
// Node circle size based on:
	// number of connections
	// net worth / annual revenue


// BUGS TO GET RID OF

// On node click, keep label visible
// Sort differently while a node is selected: sorts as though no selection has been made
// On sort change (alphabetically to connectivity or vice-versa), should list scroll to top? It currently doesn't
// why are the circles in github desktop not small anymore?
// Fix stacktrace error (logs in stacktrace-error.js)
// Fix: click Betsy DeVos, hover "The Stow Company - Holland, Inc."
// Word wrap connection (test - select: Rex Tillerson, hover: Igor Sechin)
// Remove double Daewoo?
// Click Donald Trump to sort, click again... sorts reverse alphabetically?
// Capitalize "a" in "Federal agency" in legend


// REFACTOR CHECKLIST

// How to select from an array based on values (so as to not need [0]th, or length - 2)?
// what code is duplicated between this and SVG-generator? The slug??? Be sure to remove duplification.
// categorize global variables

// ^(?!\/\/)([^\/\n]*)console.log

////////// GLOBAL VARIABLES //////////

var isNeighbour;
var isNeighbourObj;

var selectedNodeID;
var selectedNodeSlugID;

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

// does selectedCircleD3Selection make sense as a global variable?
// re-factor variables below this line
var selectedCircleD3Selection;
var hoveredCircleD3Selection;
var selectConnectD3Selection;
var neighbouringNodeLIsSelection;
var selectedLi;

////////// SETUP SECTION //////////

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

	// slug
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

	function hilightNodeCircle(selectedCircle) {
		selectedCircle.style("fill", function(d) { return color(d.type) })
		.style("stroke", clickHilightColor)
		.style("stroke-width", selectedCircleStroke)
		.style("paint-order", "stroke");
	}

	// re-define variables from svg generator
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

	////////// ZOOM SECTION //////////

	var nominal_text_size = 60;
	var max_text_size = 14;

	var nominal_stroke = 1.25;
	var max_stroke = 3.5;

	// is nominal_labelStroke used anywhere? Or is this just a pointless variable?
	var nominal_labelStroke = 1
	var max_labelStroke = 20

	// extra strokes
	// re-factor, if necessary
	var adjusted_nominal_stroke = 1.25;
	var selectedCircleStroke = adjusted_nominal_stroke * 8;
	var selectConnectStroke = adjusted_nominal_stroke * 3;

	var zoomEvent = d3.zoom()
	    .scaleExtent([0.1, 9])
	    .on("zoom", zoomed);

	function zoomed() {
		gContainer.attr("transform", d3.event.transform);

		var stroke = nominal_stroke;

			// if zoomed in close, do these things
	    if (nominal_stroke * d3.event.transform.k > max_stroke) {

	    	// why do I need stroke AND adjusted_nominal_stroke?
	    	// make zoom function "stroke" a global variable?
	    	stroke = max_stroke / d3.event.transform.k;
		    adjusted_nominal_stroke = max_stroke / d3.event.transform.k;

		    lines.style("stroke-width", stroke);
		    circle.style("stroke-width", stroke * 1.5);
		    
		    // for when a node is selected
		    selectedCircleStroke = stroke * 8;
	    	selectConnectStroke = stroke * 3
	    }

	    // if a node is selected, do these things
	    if (d3.select(".selectedNode").node() !== null) {
	    	selectedCircleD3Selection.style("stroke-width", selectedCircleStroke);

	    	// if a connected node is hovered, do these things
	    	if (selectConnectD3Selection !== null) {

	    		selectConnectD3Selection.style("stroke-width", selectConnectStroke)
		    	hoveredCircleD3Selection.style("stroke-width", selectedCircleStroke);
	    	}
	    }

		var text_size = nominal_text_size ;
			if (nominal_text_size * d3.event.transform.k > max_text_size) text_size = max_text_size / d3.event.transform.k;
			label.style("font-size",text_size + "px");
			labelShadow.style("font-size",text_size + "px");

	// this doesn't seem to actually work (get activated)
		var labelStroke = text_size / 7.5;
	    // if (text_size / 7.5 > max_labelStroke) labelStroke = max_labelStroke / d3.event.transform.k;
	    if (text_size / 7.5 > max_labelStroke) console.log(text_size);
	    labelShadow.style("stroke-width", labelStroke);
	}

	////////// SORT SECTION //////////

	var listSelector = d3.select("#listSelect");

	listSelector.on("change", listSortOnChange);

	function listSortOnChange() {
		scrollToTopOfSidebar();
		if (d3.select(".selectedNode").node() !== null) {
			listSort(neighbouringNodeLIsSelection);
			selectedLi.lower();
		} else {
			listSort(li);
		}
	}

	function scrollToTopOfSidebar() {

		d3.select(".d2")
			.transition().duration(800).ease(d3.easeCubicOut)
			.tween("tweenName", scrollTopTween(0));

		function scrollTopTween(scrollTop) {

		  return function() {
		    var i = d3.interpolateNumber(this.scrollTop, scrollTop);
		    var scrollElement = this;
		    return function(t) {
		    	scrollElement.scrollTop = i(t); };
		 };

		} // scrollTopTween callback
	} // scrollToTopOfSidebar callback

	function listSort(liSelection) {
		var listSelectorValue = listSelector.property("value");
		if (listSelectorValue === "Alphabetically") {

			liSelection.sort( function(a, b) {
				if (a.id > b.id) {
					return 1;
				} else if (a.id < b.id) {
					return -1;
				} else { return 0; }
			});

		} else if (listSelectorValue === "by Connectivity") {

			liSelection.sort( function(a, b) {
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
	} // listSort callback

	// on load, sort by connection
	listSort(li);

	////////// CLEAR STYLES SECTION //////////

	function clearStylesForClick(selectedCircle) {
		// clear any "onClick" styles for nodes
		// d3.selectAll(".nodes").selectAll("*:not(.selectedNode)")
		d3.selectAll(".nodes")
			.classed("selectedNode", false)
			.classed("neighbouringNodeCircles", false)
			.select(".nodeCircle")
			.style("stroke", "white")
			.style("fill-opacity", .15)
			.style("stroke-width", adjusted_nominal_stroke)
			.style("paint-order", "fill");
		// clear any "onClick" styles for links
		d3.selectAll(".lines")
			.style("stroke", "grey")
			.style("stroke-opacity", .15)
			// is the below line needed?
			// .style("stroke-width", adjusted_nominal_stroke);
		// clear any "onClick" styles for LIs
		li.classed("selectedLi", false)
			.style("border", "none")
			.style("background-color", "#f7f7f7");
	}

	var svg = d3.select("svg")
		.on("click", function() {
			if (d3.event.target === this) {
				// clear any "onClick" styles for nodes
				d3.selectAll(".nodes")
					.classed("selectedNode", false)
					.classed("neighbouringNodeCircles", false)
					.select(".nodeCircle")
					.style("stroke", "white")
					.style("stroke-width", adjusted_nominal_stroke)
					.style("fill-opacity", 1)
					.style("paint-order", "fill");
				// clear any "onClick" styles for links
				d3.selectAll(".lines")
					.style("stroke", "grey")
					.style("stroke-opacity", 1);
				// clear any "onClick" styles for LIs
				li
					.style("opacity", 1)
					.style("border", "none")
					.style("background-color", "#f7f7f7")
					.classed("selectedLi", false);
				// sort LIs
				listSort(li);
			};
		});

	// calculate effective dimensions of viz, using node array (for use with zoom-to-selection functionality)
	var allNodesCxArray = []
	var allNodesCyArray = []

	nodes.each(function(d, i) {
			allNodesCxArray.push(parseFloat(d3.select(this).attr("cx")));
			allNodesCyArray.push(parseFloat(d3.select(this).attr("cy")));
		})

	var allNodesXExtent = d3.extent(allNodesCxArray);
	var allNodesYExtent = d3.extent(allNodesCyArray);

	// call zoom
	svg.call(zoomEvent);

	// set initial zoom level
	var allNodesSelection = d3.selectAll(".nodes");
	zoomOnSelection(allNodesSelection);

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

	////////// GENERIC ON("MOUSEOVER") FUNCTIONS //////////

	function onMouseoverFunction (d) {

		// get hovered node
		hoveredEntityMultiElementSelection = d3.selectAll("." + hoveredEntityID);
		getNodeOnHover = hoveredEntityMultiElementSelection.nodes().length - 2;
		hoveredEntityNode = hoveredEntityMultiElementSelection.nodes()[getNodeOnHover];

		// raise hovered node above other elements
		d3.select(hoveredEntityNode).raise();

		hoveredCircleD3Selection = d3.select(hoveredEntityNode).select(".nodeCircle");
		// console.log(hoveredCircleD3Selection.node().parentNode);

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
		} // if (selectedNode) statement callback

		// update selectConnect variable
		selectConnectD3Selection = d3.select(".selectConnect")

		// declare ConnectionDescriptionText
		if (selectConnectD3Selection["_groups"][0][0] !== null) {
			ConnectionDescriptionText = selectConnectD3Selection.data()[0].connection;
		}

		// style selectConnect link
		selectConnectD3Selection
			.style("stroke", clickHilightColor)
			.style("stroke-width", selectConnectStroke);

		selectConnectD3Selection
			.each(
				function(d) {
					var slugSource = "T" + slug(d.source);
					var slugTarget = "T" + slug(d.target);
					// is this line needed?
					var reference = d.reference;

	// IS THIS ADDING UNECESSARY CLASSES TO LINES (screwing up other things)?
	// If it is, be sure to remove these classes on mouseout
					selectConnectD3Selection.classed(slugSource, true);
					selectConnectD3Selection.classed(slugTarget, true);
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
			// pretty sure I don't need to alter the selected node
			// d3.select(hoveredEntityNode).select(".nodeCircle")

			d3.select(hoveredEntityNode).select(".label")
				.text(function(d) { return d.id } );
			d3.select(hoveredEntityNode).select(".labelShadow")
				.text(function(d) { return d.id } );
		} else if (selectConnectD3Selection["_groups"][0][0] === null) {
			d3.select(hoveredEntityNode).select(".nodeCircle")
				.style("stroke", function(d) { return color(d.type) })
				.style("fill", "white");
			d3.select(hoveredEntityNode).select(".label")
				.text(function(d) { return d.id } );
			d3.select(hoveredEntityNode).select(".labelShadow")
				.text(function(d) { return d.id } );
		} else if (selectConnectD3Selection.attr("class").split(" ").includes(hoveredEntityID)) {

			// style hovered and connected node
			hilightNodeCircle(d3.select(hoveredEntityNode).select(".nodeCircle"));

			// style label and labelShadow
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



		// define hovered node
		var hovered = d3.select(hoveredEntityNode);
		// console.log(hovered);

		d3.selectAll(".neighbouringLines")
			.classed("selectConnect", false)
			.style("stroke", "grey")
			// make sure this is actually the stroke it was before the hover
			.style("stroke-width", adjusted_nominal_stroke);
		hovered.select(".label")
			.style("display", "none")
			.style("text-shadow", "none");
		hovered.select(".labelShadow")
			.style("display", "none")
			.style("stroke", "white");

		// if (hovered)

		if (hovered.attr("class").split(" ").includes("selectedNode")) {
				hovered.select(".nodeCircle")
				.style("stroke", "clickHilightColor")
				.style("fill", function(d) { return color(d.type) });
		} else {
			hovered.select(".nodeCircle")
			.style("stroke-width", adjusted_nominal_stroke)
			.style("stroke", "white")
			.style("paint-order", "fill")
			.style("fill", function(d) { return color(d.type) });
		}

		selectConnectD3Selection = null;

	} // onMouseleaveFunction callback


	////////// GENERIC ON("CLICK") FUNCTIONS //////////
	function zoomOnSelection(currentlySelectedNodes) {
		var cxArray = [];
		var cyArray = [];
		// reset nodeOutsideViewport variable. If a node from the next selection is outside the viewport, it will be changed to true
		var nodeOutsideViewport = false;

		currentlySelectedNodes.each(function(d, i) {
			cxArray.push(parseFloat(d3.select(this).attr("cx")));
			cyArray.push(parseFloat(d3.select(this).attr("cy")));

			// Change this to a for loop (take out of ".each")
			var isInViewport = function(el) {
				var bounding = el.getBoundingClientRect()
				return (
					bounding.top >= 0 &&
					bounding.left >= 0 &&
					bounding.right <= width &&
					bounding.bottom <= height
				);
			}

			// check whether any of the selected nodes is outside the viewport
			if(isInViewport(this) === false) {
				nodeOutsideViewport = true
			}
		});

		if (nodeOutsideViewport === true) {
				executeZoomOnSelection();
		}

		function executeZoomOnSelection() {

			var xExtent = d3.extent(cxArray);
			var yExtent = d3.extent(cyArray);

			var xCenter = (xExtent[1] + xExtent[0]) / 2;
			var yCenter = (yExtent[1] + yExtent[0]) / 2;

			var selectionXWidth = xExtent[1] - xExtent[0];
			var selectionYWidth = yExtent[1] - yExtent[0];

			var visXWidth = allNodesXExtent[1] - allNodesXExtent[0];
			var visYWidth = allNodesYExtent[1] - allNodesYExtent[0];

			var selectionToVisWidthRatio = visXWidth / selectionXWidth;
			var selectionToVisHeightRatio = visYWidth / selectionYWidth;

			function findTheSmallerDimension(width, height) {
				if (width < height) {
					return width;
				} else {
					return height;
				}
			}

			var meaningfulWindowSize = findTheSmallerDimension(width, height);

			function findTheSmallerRatio(selectionToVisWidthRatio, selectionToVisHeightRatio) {
				if (selectionToVisWidthRatio < selectionToVisHeightRatio) {
					return selectionToVisWidthRatio;
				} else {
					return selectionToVisHeightRatio;
				}
			}

			var selectionToVisRatio = findTheSmallerRatio(selectionToVisWidthRatio, selectionToVisHeightRatio);

			var upperZoomOnSelectionLimitScale = d3.scaleLinear()
				.domain([600, 1500])
				.range([.13, 0.34]);

			var upperZoomOnSelectionLimit = upperZoomOnSelectionLimitScale(meaningfulWindowSize)

			var lowerZoomOnSelectionLimitScale = d3.scaleLinear()
				.domain([600, 1500])
				.range([.4, .8]);

			var lowerZoomOnSelectionLimit = lowerZoomOnSelectionLimitScale(meaningfulWindowSize)

			var zoomToSelectionScale = d3.scaleLinear()
				.domain([4, 1])
				.range([lowerZoomOnSelectionLimit, upperZoomOnSelectionLimit])
				.clamp(true);

			var zoomBy = zoomToSelectionScale(selectionToVisRatio)

			var translateBy = [width / 2 - zoomBy * xCenter, height / 2 - zoomBy * yCenter]

			var t1 = d3.zoomIdentity
			.translate(translateBy[0], translateBy[1])
			.scale(zoomBy);

			svg.transition()
				.duration(transitionDuration)
				.call(zoomEvent.transform, t1);
		} // executeZoomOnSelection callback
	} // zoomOnSelection callback

	function onClickFunction (d, isNeighbourObj) {

		clickedEntityMultiElementSelection = d3.selectAll("." + clickedEntitySlugID);

		getNode = clickedEntityMultiElementSelection.nodes().length - 2;
		getLi = clickedEntityMultiElementSelection.nodes().length - 1;

		clickedEntityNode = clickedEntityMultiElementSelection.nodes()[getNode];
		clickedEntityLi = clickedEntityMultiElementSelection.nodes()[getLi];

		selectedCircleD3Selection = d3.select(clickedEntityNode).select(".nodeCircle");

		// clear styles
		clearStylesForClick.call();

		// class selected node
		d3.select(clickedEntityNode).classed("selectedNode", true)
		// selectedCircleD3Selection.classed("selectedNode", true)

		// add styles to selected node
		hilightNodeCircle(selectedCircleD3Selection);

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
		li.classed("neighbouringNodeLIs", false)
			.style("opacity", .25);

		// class neighbouring LIs on click
		li.classed("neighbouringNodeLIs", function(e) {
				// if (isNeighbour.includes(e.id)) {
				if (isNeighbourObj[e.id]) {
					return true;
				}
			});

		// style neighbouring Lis on click
		neighbouringNodeLIsSelection = d3.selectAll(".neighbouringNodeLIs");
		neighbouringNodeLIsSelection.style("opacity", 1).lower();
		listSort(neighbouringNodeLIsSelection);

		// style selected Li on click
		selectedLi = d3.selectAll(".selectedLi")
		selectedLi
			.style("border", "2px solid")
			.style("border-color", clickHilightColor)
			.style("background-color", "white")
			.lower();

		// Scroll to top of D2 (entity list)
		scrollToTopOfSidebar();

		// zoom on selection
		var currentlySelectedNodes = d3.selectAll(".neighbouringNodeCircles");

		zoomOnSelection(currentlySelectedNodes);

	} // onClickFunction callback


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
		}) // on mouseleave callback

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
	var theLegend = d3.select("#legend").append("div").attr("class", "theLegend").node();

	var legendMargin = {top: 30, right: 15, bottom: 0, left: 15},
		legendWidth = theLegend.clientWidth - legendMargin.left - legendMargin.right,
		legendHeight = theLegend.clientHeight - legendMargin.top - legendMargin.bottom;

	var legendSVG = d3.select(".theLegend").append("svg")
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
	 	.attr("class", function(d) { return "legend " + d })
	 	.attr("transform", function(d) { return "translate(" + 15 + "," + legendYScale(d) + ")" });

	legendCircleGs.append("circle")
		.attr("r", 8)
		.style("stroke", "none")
		.style("fill", function(d) { return color(d) });

	legendCircleGs.append("text")
		.text(function(d) { return d })
		.attr("class", "legendText")
		.attr("transform", "translate(" + 12 + "," + 4 + ")" );


	////////// OVERLAY SECTION //////////

	var aboutDiv = d3.select("#legend").append("div").attr("id", "aboutDiv");
	var aboutTextDiv = d3.select("#aboutDiv").append("div").attr("id", "aboutTextDiv");
	var aboutTextP = d3.select("#aboutTextDiv").append("p").attr("class", "aboutText aboutP").text("About");
	var aboutTexth3 = d3.select("#aboutTextDiv").append("h3").attr("class", "aboutText abouth3").text("Trump World");

	// var overlayDiv = d3.select("body").append("div").attr("id", "overlay");
	// var overlayTextDiv = d3.select("#overlay").append("div").attr("id", "overlayTextDiv");

	var overlayDiv = d3.select("#overlay");
	var overlayTextDiv = d3.select("#overlayTextDiv");

	// var overlayTextH1 = d3.select("#overlayTextDiv").append("h2").attr("class", "overlayText overlayH2").text("Trump World");
	// var overlayTextH1 = d3.select("#overlayTextDiv").append("p").attr("class", "overlayText overlayP").text("Trump World uses a dataset created by BuzzFeed and crowdsourced to the general public.");

	aboutTextDiv.on("click", function () {
		overlayDiv.style("display", "block");
	});

	overlayDiv.on("click", function() {
		overlayDiv.style("display", "none");
	})

} // end of Ready function