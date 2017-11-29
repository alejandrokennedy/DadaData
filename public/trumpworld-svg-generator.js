var d3 = require('d3');
var jsdom = require('jsdom');
var fs = require('fs');

var htmlStub = '<html><head> \
	<title>Trump World</title> \
	<link rel="stylesheet" type="text/css" href="trumpworld-style.css"> \
	<script src="https://d3js.org/d3.v4.min.js" charset="utf-8"></script> \
	<script src="https://cdnjs.cloudflare.com/ajax/libs/queue-async/1.0.7/queue.min.js"></script> \
	<body> \
	\
		<div id="loader-wrapper" class="loadClass"> \
			<div id="loader" class="loadClass"></div> \
			<div id="loaderBefore" class="loadClass"></div> \
			<div id="loaderAfter" class="loadClass"></div> \
		</div> \
	\
	<h1>Trump World</h1> \
	<div id="dataviz-container"> \
		<div id="legend"></div> \
	</div> \
	<div class=d1> \
		<div class=d2> \
			<div id=selectorDiv> \
				<p id=selectText>Sort: </p> \
				<select id=listSelect> \
				  <option value="by Connectivity">by Connectivity</option> \
		  		<option value="Alphabetically">Alphabetically</option> \
				</select> \
			</div> \
			<div id=listDiv></div> \
		</div> \
	</div> \
	</body> \
	<script src="trumpworld-interaction.js" charset="utf-8"></script> \
	</html>'
	

jsdom.env({
	features : { QuerySelector : true }
	, html : htmlStub
	, done : function(errors, window) {
 
	  var body = window.document.querySelector('body')
		  , listDiv = window.document.querySelector('#listDiv')
		  , el = window.document.querySelector('#dataviz-container')

		//////////////// Original Trump World code:

		var margin = {top: 0, right: 0, bottom: 0, left: 0},
			width = window.innerWidth - margin.left - margin.right,
			height = window.innerHeight - margin.top - margin.bottom;

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

		var gContainer = svg.append("g")
			.attr("id", "gContainer")
			.attr("transform", "translate(" + 300 + "," + margin.top + ")");

		var simulation = d3.forceSimulation()
			.force("charge", d3.forceManyBody().strength(-200))
			// .force("link", d3.forceLink(links).distance(20).strength(1).iterations(10))
			.force("link", d3.forceLink().id(function(d) { return d.id; }))
			.force("x", d3.forceX(width / 2))
			.force("y", d3.forceY(height / 2));

		var color = d3.scaleOrdinal(d3.schemeCategory10).domain(["organization", "person", "federal agency"]);

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
						 	 .replace(/ /g,"")
						 	 .replace(/#/g,"")
						 	 .replace(/—/g,"");
	  };

	  function ready (error, trumpworld) {
	  	if (error) throw error;
		// console.log("Entity Count: " + trumpworld.length);

		// list of entity types for use in legend
	  	var entityTypeList = d3.set(
	  		trumpworld.map(function(d) {return d["Entity A Type"] })
	  		.concat(trumpworld.map(function(d) {return d["Entity B Type"] })));
	  		// .values();
	  	console.log("entityTypeList: " + entityTypeList)

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

	  	// // some console logs for reference
	  	// var entitiesList = allOrgs.concat(allPeeps).concat(allFeds).sort();
	  	// console.log(entitiesList);
	  	// var nodeCount = (allPeeps.length + allOrgs.length + allFeds.length)
	  	// console.log("nodeCount: " + nodeCount);

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

			// NODES
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

			/////

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

			/////

			// GRAPH
			var graph = {
				"nodes": nodes,
				"links": links
			}

			// create json for use in trumpworld-interaction.js
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

// UNCOMMENT to troubleshoot
	 		// zoomEvent.scaleTo(svg, .185);

		 	simulation
		 		.nodes(graph.nodes);

	 		simulation.force("link")
	 			.links(graph.links);

	 		var clipPath = node.append("clipPath")
	 			.attr("class", "clip")
	 			.attr("id", function(d) { return "clip-" + slug(d.id); })
	 			.append("path")
	 			.attr("class", "clip-path-circle");

	 		var clickHilightColor = "rgb(52, 255, 38)";

	 		var ul = d3.select(listDiv).append("ul")
	 			.selectAll("li")
	 			.data(nodes)
	 			.enter().append("li")
	 			.attr("class", function(d) { return "T" + slug(d.id) })
	 			.attr("id", function(d) { return "T" + slug(d.id) })
	 			.html(function(d) { return d.id } )
	 			.style("color", function(d) { return color(d.type) })

	 		var circleCatcher = node.append("circle")
	 			.attr("r", 30)
	 			// .style("fill", function(d, i) { return colorScale(i); })
	 			// .style("fill", "green")
	 			.attr("class", "circleCatcher")
	 			.style("fill-opacity", 0)
	 			.style("stroke", "none")
	 			.attr("clip-path", function(d) { return "url(#clip-" + slug(d.id) + ")"; })

	 		// generate static simulation
			d3.timeout(function() {

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

		// Save result to an html file
		setTimeout(function() {
			fs.writeFile('../views/trumpworld.html', window.document.documentElement.innerHTML, function(err) {
				if(err) {
					console.log('error saving document', err)
				} else {
					console.log('trumpworld.html was saved!')
				}
			})
		}, 2000);
	} // end jsDom done callback
}) // end jsdom.env callback