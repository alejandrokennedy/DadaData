var d3 = require('d3');
var jsdom = require('jsdom');
var fs = require('fs');

var htmlStub = '<html><head> \
	<title>Trump World</title> \
	<link rel="stylesheet" type="text/css" href="trumpworld-style.css"> \
	<script src="https://d3js.org/d3.v4.min.js" charset="utf-8"></script> \
	<script src="https://cdnjs.cloudflare.com/ajax/libs/queue-async/1.0.7/queue.min.js"></script> \
	<body> \
	<h1>Trump World</h1> \
	<div id="dataviz-container"></div> \
	<div class=d1> \
		<div class =d2> \
			<div id=listDiv></div> \
		</div> \
	</div> \
	</body> \
	<script src="trumpworld-interaction.js" charset="utf-8"></script> \
	</html>'


// here we combine our htmlStub with D3
jsdom.env({
	features : { QuerySelector : true }
	, html : htmlStub
	, done : function(errors, window) {
	// this callback function pre-renders the dataviz inside the html document, then export result into a static html file
		// var el = window.document.querySelector('#dataviz-container');
 
	  var body = window.document.querySelector('body')
		  , listDiv = window.document.querySelector('#listDiv')
		  , el = window.document.querySelector('#dataviz-container')

		//////////////// Original Trump World code:

		var margin = {top: 0, right: 0, bottom: 0, left: 0},
			width = window.innerWidth - margin.left - margin.right,
			height = window.innerHeight - margin.top - margin.bottom;

		// var margin = {top: 0, right: 0, bottom: 0, left: 0},
		// 	width = 900 - margin.left - margin.right,
		// 	height = 900 - margin.top - margin.bottom;

	  var voronoi = d3.voronoi()
	    .x(function(d) { return d.x; })
	    .y(function(d) { return d.y; })
	    .extent([[-(width * 2), -(height * 3)], [width * 3 , height * 4]]);

	  var nominal_text_size = 60;
	  var max_text_size = 14;

	  var nominal_stroke = 1.25;
		var max_stroke = 3.5;

	  var nominal_labelStroke = 1
	  var max_labelStroke = 20

		var svg = d3.select(el).attr("id", "dataviz-container").append("svg")
			.attr("width", width)
			.attr("height", height + margin.top + margin.bottom)
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

		// var divExperiment = d3.select("body").attr("id", "divExperiment").append("div");
		// console.log(divExperiment);

// delete this once solved
			// console.log(svg["_groups"]);

		var gContainer = svg.append("g")
			.attr("id", "gContainer")
			.attr("transform", "translate(" + 300 + "," + margin.top + ")");

 		var loading = svg.append("text")
 			.attr("class", "loading")
	    .attr("dy", "0.35em")
	    .attr("text-anchor", "middle")
	    .attr("transform", "translate(" + 1/2 * width + "," + 1/2 * height + ")")
	    .attr("font-family", "sans-serif")
	    .attr("font-size", 20)
	    .text("Loading. One moment, please…");

		var simulation = d3.forceSimulation()
			.force("charge", d3.forceManyBody().strength(-200))
			// .force("link", d3.forceLink(links).distance(20).strength(1).iterations(10))
			.force("link", d3.forceLink().id(function(d) { return d.id; }))
			.force("x", d3.forceX(width / 2))
			.force("y", d3.forceY(height / 2));

		var color = d3.scaleOrdinal(d3.schemeCategory10).domain(["organization", "person", "federal agency"]);
	  // console.log(d3.schemeCategory10);

	  d3.queue()
	  	.defer(d3.csv, "https://raw.githubusercontent.com/BuzzFeedNews/trumpworld/master/data/trumpworld.csv")
	  	// .defer(d3.csv, "trumpworld.csv")
	  	.await(ready);

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

	  function ready (error, trumpworld) {
	  	if (error) throw error;
	  	// console.log("Entity Count: " + trumpworld.length);

			// // if additional categories of entity are added, uncomment the code below and see what they are
	  // 	var entityTypeList = d3.set(
	  // 		trumpworld.map(function(d) {return d["Entity A Type"] })
	  // 		.concat(trumpworld.map(function(d) {return d["Entity B Type"] })))
	  // 		.values();
	  // 	console.log("entityTypeList: " + entityTypeList)

	  // 	// If time: try writing a function to filter/map/set for each unique entry in either Entity A or Entity B columns 
	  // 	entityTypeList.forEach(function(mungeType) {})

	  	var orgAs = trumpworld
	  		.filter( function(d) { return d["Entity A Type"] === "Organization"})
	  		.map(function(d) { return d["Entity A"]});

	  	var peepAs = trumpworld
	  		.filter( function(d) { return d["Entity A Type"] === "Person"})
	  		.map(function(d) { return d["Entity A"]});

	  	var fedAs = trumpworld
	  		.filter( function(d) { return d["Entity A Type"] === "Federal Agency"})
	  		.map(function(d) { return d["Entity A"]});

	  	var orgBs = trumpworld
	  		.filter( function(d) { return d["Entity B Type"] === "Organization"})
	  		.map(function(d) { return d["Entity B"]});

	  	var peepBs = trumpworld
	  		.filter( function(d) { return d["Entity B Type"] === "Person"})
	  		.map(function(d) { return d["Entity B"]});

	  	var fedBs = trumpworld
	  		.filter( function(d) { return d["Entity B Type"] === "Federal Agency"})
	  		.map(function(d) { return d["Entity B"]});

	  	var orgs = orgAs.concat(orgBs);
	  	var peeps = peepAs.concat(peepBs);
	  	var feds = fedAs.concat(fedBs);

	  	var allOrgs = d3.set(orgs).values();
	  	var allPeeps = d3.set(peeps).values();
	  	var allFeds = d3.set(feds).values();
	  	var entitiesList = allOrgs.concat(allPeeps).concat(allFeds).sort();
	  	// console.log(entitiesList);

	  	// var nodeCount = (allPeeps.length + allOrgs.length + allFeds.length)
	  	// console.log("nodeCount: " + nodeCount);

	  	// // NODES REFERENCE - uncomment to troubleshoot nodes disappearing
	  	// var entityAs = trumpworld.map(function(d) { return d["Entity A"]; });
	  	// var entityBs = trumpworld.map(function(d) { return d["Entity B"]; });
	  	// var allEntities = entityAs.concat(entityBs);
	  	// var allEntitiesSet = d3.set(allEntities).values();
	  	// console.log("allEntitiesSet length: " + allEntitiesSet.length);
	  	// console.log("allEntitiesSet: " + allEntitiesSet);

			var nodes = [],
					links = [],
					listItems = [];

			// LINKS
			trumpworld.forEach(function(d) {
				links.push({
					"source" : d["Entity A"],
					"target" : d["Entity B"],
					"connection" : d["Connection"],
					"reference" : d["Source(s)"]
				})
			});
			// console.log("linkCount: " + links.length)

			// NODES (NEW)
			allOrgs.forEach(function(orgs) {
				nodes.push({
					"id" : orgs,
					"type" : "organization"
				})
			});
			allPeeps.forEach(function(peeps) {
				nodes.push({
					"id" : peeps,
					"type" : "person"
				})
			});
			allFeds.forEach(function(feds) {
				nodes.push({
					"id" : feds,
					"type" : "federal agency"
				})
			});

			var connectionCountList = {};

			// get nodes' connection count
			links.forEach(function(d) {
				if (!connectionCountList[d.source]) {
					connectionCountList[d.source] = 1
				} else {
					connectionCountList[d.source] += 1
				};

				if (!connectionCountList[d.target]) {
					connectionCountList[d.target] = 1
				} else {
					connectionCountList[d.target] += 1
				};
			});

			// add count value to nodes
			nodes.forEach(function(d) {
				d.count = connectionCountList[d.id];
			});

			// // NODES REFERENCE
			// allEntitiesSet.forEach(function(orgs) {
			// 	nodes.push({
			// 		"id" : orgs,
			// 		"type" : "organization"
			// 	})
			// });


			// GRAPH
			var graph = {
				"nodes": nodes,
				"links": links
			}

			fs.writeFile('../public/trumpworld-graph.json', JSON.stringify(graph), function(err) {
				if(err) {
					console.log('error saving document', err)
				} else {
					console.log('trumpworld-graph.json was saved!')
				}
			} );

			var link = gContainer.append("g")
				.attr("class", "links")
				.selectAll("line")
				.data(graph.links)
			 .enter().append("line")
			 	.attr("class", "lines");

			var node = gContainer.selectAll(".nodes")
				.data(graph.nodes)
			 .enter().append("g")
				.attr("class", function(d) { return "nodes T" + slug(d.id); })
				.on("mouseover", function() {
						this.parentNode.appendChild(this);
					});

			var circle = node.append("circle")
			 	.attr("r", 7)
			 	.attr("class", "nodeCircle")
			 	.style("fill", function(d) { return color(d.type); });

			var labelShadow = node.append("text")
		 		.attr("dy", ".35em")
		 		.attr("class", "labelShadow")
		 		.style("font-size", nominal_text_size + "px")
		 		.text(function(d) { return d.id; });

		 	var label = node.append("text")
		 		.attr("dy", ".35em")
		 		.attr("class", "label")
		 		.style("font-size", nominal_text_size + "px")
		 		.text(function(d) { return d.id; });

			var zoomEvent = d3.zoom().scaleExtent([0.1, 9]).on("zoom", function () {
				gContainer.attr("transform", d3.event.transform);
				// console.log(d3.event.transform);
				// console.log(max_text_size);

				var stroke = nominal_stroke;
			    if (nominal_stroke * d3.event.transform.k > max_stroke) stroke = max_stroke / d3.event.transform.k;
			    link.style("stroke-width",stroke);
			    circle.style("stroke-width",stroke * 1.5);

				var text_size = nominal_text_size ;
					if (nominal_text_size * d3.event.transform.k > max_text_size) text_size = max_text_size / d3.event.transform.k;
					label.style("font-size",text_size + "px");
					labelShadow.style("font-size",text_size + "px");

				var labelStroke = text_size / 7.5;
			    if (text_size / 7.5 > max_labelStroke) labelStroke = max_labelStroke / d3.event.transform.k;
			    labelShadow.style("stroke-width", labelStroke);
			    // console.log("labelStroke: " + labelStroke);
					// console.log(text_size);
					// console.log(text_size / 10);

			}); // zoom function callback

			svg.call(zoomEvent);

			// console.log("This should log svg['_groups']: ", svg["_groups"]);

// UNCOMMENT to troubleshoot
	 		// zoomEvent.scaleTo(svg, .185);

		 	simulation
		 		.nodes(graph.nodes);
		 		// do I need the following '"tick", ticked' for the visualization to run?
		 		// .on("tick", ticked);

	 		simulation.force("link")
	 			.links(graph.links);

	 		var clipPath = node.append("clipPath")
	 			.attr("class", "clip")
	 			.attr("id", function(d) { return "clip-" + slug(d.id); })
	 			.append("path")
	 			.attr("class", "clip-path-circle");

	 		var clickHilightColor = "rgb(52, 255, 38)";

// UNCOMMENT to troubleshoot
	 		var buttonDiv = d3.select(listDiv).append("div").attr("class", "buttonDiv");
	 		// var buttonAlpha = d3.select(".buttonDiv").append("button").text("Sort Alphabetically");
	 		// var buttonCount = d3.select(".buttonDiv").append("button").text("Sort by Connectivity");

	 		var ul = d3.select(listDiv).append("ul")
	 			.selectAll("li")
	 			.data(nodes)
	 			.enter().append("li")
	 			.sort( function(a, b) {
	 					if (a.count > b.count) {
	 						return -1;
	 					} else if (a.count < b.count) {
	 						return 1;
	 					} else { return 0; }
	 				})
	 			.attr("class", function(d) { return "T" + slug(d.id) })
	 			.attr("id", function(d) { return "T" + slug(d.id) })
	 			.html(function(d) { return d.id } )
	 			.style("color", function(d) { return color(d.type) })

	 			.on("mouseover", function() {
	 				var mouseClass = d3.select(this).attr("class");
	 				var correspondingNodeSelection = d3.selectAll("." + mouseClass);
	 				var correspondingNode = correspondingNodeSelection.nodes()[1];
					correspondingNode.parentNode.appendChild(correspondingNode);
					if (d3.select(correspondingNode).attr("class").split(" ").includes("selectedNode")) {
						d3.select(correspondingNode).select(".nodeCircle")
							.style("stroke", clickHilightColor)
							.style("fill", "white");
					} else {
						d3.select(correspondingNode).select(".nodeCircle")
							.style("stroke", function(d) { return color(d.type) })
							.style("fill", "white");
					}
					d3.selectAll("." + mouseClass).select(".label")
 						.style("display", "inline")
 						.style("text-shadow", "#ffffff 0 0 6px, #ffffff 0 0 4px, #ffffff 0 0 2px");
					d3.selectAll("." + mouseClass).select(".labelShadow")
 						.style("display", "inline")
 						.style("stroke", "white");
	 			})

	 			.on("mouseleave", function () {
	 				var mouseClass = d3.select(this).attr("class");
	 				var correspondingNodeSelection = d3.selectAll("." + mouseClass);
	 				var correspondingNode = correspondingNodeSelection.nodes()[1];
					correspondingNode.parentNode.appendChild(correspondingNode);
					
					if (d3.select(correspondingNode).attr("class").split(" ").includes("selectedNode")) {
						d3.select(correspondingNode).select(".nodeCircle")
							.style("stroke", clickHilightColor)
							.style("fill", function(d) { return color(d.type) })
					} else {
						d3.select(correspondingNode).select(".nodeCircle")
							.style("fill", function(d) { return color(d.type) })
							.style("stroke", "white");
					}
					d3.selectAll("." + mouseClass).select(".label")
 						.style("display", "none")
 						.style("text-shadow", "none");
					d3.selectAll("." + mouseClass).select(".labelShadow")
 						.style("display", "none")
 						.style("stroke", "white");
	 			})

	 			.on("click", function(d) {
 					// variables for use in if statements below
	 				var clickClass = d3.select(this).attr("class");
	 				var correspondingNodeSelection = d3.selectAll("." + clickClass);
	 				var correspondingNode = correspondingNodeSelection.nodes()[1];
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
	 					if (link.target.id === d.id) {
	 						neighbours.push(link.source.id);
	 					} else if (link.source.id === d.id) {
	 						neighbours.push(link.target.id);
	 					} return neighbours;
	 				}, [d.id]);

	 				d3.selectAll(".nodes")
	 					.classed("neighbouringNodeCircles", function(e) {
	 						if (isNeighbour.includes(e.id)) {
	 							return true;
	 						}
	 					});
	 				d3.select(correspondingNode).classed("selectedNode", true)
	 					.select(".nodeCircle")
	 					.style("stroke", clickHilightColor);
 					d3.selectAll(".neighbouringNodeCircles")
 						.select(".nodeCircle")
 						.style("fill-opacity", 1);
	 				d3.selectAll(".lines")
	 					.classed("neighbouringLines", function(e) {
	 						if (e.source.id === d.id) {
	 							return true;
	 						} else if (e.target.id === d.id) {
	 							return true;
	 						};
	 					});
	 					d3.selectAll(".neighbouringLines")
	 					.style("stroke-opacity", 1);
	 			}); // on click callback

	 			// // sort button 1
	 			// buttonAlpha.on("click", function() {
	 			// 	d3.selectAll("li").sort( function(a, b) {
	 			// 		if (a.id > b.id) {
	 			// 			return 1;
	 			// 		} else if (a.id < b.id) {
	 			// 			return -1;
	 			// 		} else { return 0; }
	 			// 	});
	 			// })

	 	// 		buttonCount.on("click", function() {
	 	// 			d3.selectAll("li").sort( function(a, b) {
	 	// 				if (a.count > b.count) {
	 	// 					return -1;
	 	// 				} else if (a.count < b.count) {
	 	// 					return 1;
	 	// 				} else { 
	 	// 						if (a.id > b.id) {
		 // 						return 1;
		 // 					} else if (a.id < b.id) {
		 // 						return -1;
		 // 					} else { return 0; }; 
 		// 				}
	 	// 			});
	 	// 		})

	 		var circleCatcher = node.append("circle")
	 			.attr("r", 30)
	 			// .style("fill", function(d, i) { return colorScale(i); })
	 			// .style("fill", "green")
	 			.attr("class", "circleCatcher")
	 			.style("fill-opacity", 0)
	 			.style("stroke", "none")
	 			.attr("clip-path", function(d) { return "url(#clip-" + slug(d.id) + ")"; })

	 			.on("mouseover", function (d) {
	 				var hoveredNode = d
	 				var hoveredNodeID = "T" + slug(hoveredNode.id)

	 				// declare selectedNodeSlugID
	 				if (d3.select(".selectedNode")["_groups"][0][0] !== null) {
		 				var selectedNodeSlugID = d3.selectAll(".selectedNode").attr("class").split(" ")[1];
		 				var selectedNodeID = d3.selectAll(".selectedNode").data()[0].id;
		 			}

	 				// add selectConnect class to links connecting hovered node with slected node
	 				if (d3.select(".selectedNode")["_groups"][0][0] !== null) {
		 				d3.selectAll(".neighbouringLines")
		 					.classed("selectConnect", function(d) {
		 						var linkSource = "T" + slug(d.source.id)
		 						var linkTarget = "T" + slug(d.target.id)
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
	 							var slugSource = "T" + slug(d.source.id);
	 							var slugTarget = "T" + slug(d.target.id);

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
	 					if (link.target.id === d.id) {
	 						neighbours.push(link.source.id);
	 					} else if (link.source.id === d.id) {
	 						neighbours.push(link.target.id)
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
	 						if (e.source.id === d.id) {
	 							return true;
	 						} else if (e.target.id === d.id) {
	 							return true;
	 						};
	 					});

	 					d3.selectAll(".neighbouringLines")
	 					.style("stroke-opacity", 1);
	 			}); // on click callback

			d3.timeout(function() {
			  loading.remove();
			  for (var i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
			    simulation.tick();
			  }

			  clipPath
	        .data(voronoi.polygons(graph.nodes))
	        .attr("d", function(d) { 
	        	return d ? "M" + d.join("L") : null; 
	        });

	      circleCatcher
	      	.attr("cx", function(d) { return d.x; })
	        .attr("cy", function(d) { return d.y; });

	 			link
	        .attr("x1", function(d) { return d.source.x; })
	        .attr("y1", function(d) { return d.source.y; })
	        .attr("x2", function(d) { return d.target.x; })
	        .attr("y2", function(d) { return d.target.y; });

    		node
	        .attr("cx", function(d) { return d.x; })
	        .attr("cy", function(d) { return d.y; });
				
				circle
	        .attr("cx", function(d) { return d.x; })
	        .attr("cy", function(d) { return d.y; });

				label
	        .attr("x", function(d) { return d.x + 11; })
	        .attr("y", function(d) { return d.y; });
				
				labelShadow
	        .attr("x", function(d) { return d.x + 11; })
	        .attr("y", function(d) { return d.y; });
			});
		}; // ready function callback

	/////////////////

		setTimeout(function() {
			// Save result to an html file
			fs.writeFile('../views/trumpworld-generated.html', window.document.documentElement.innerHTML, function(err) {
				if(err) {
					console.log('error saving document', err)
				} else {
					console.log('trumpworld-generated.html was saved!')
				}
			})
		}, 1000);
	} // end jsDom done callback
})