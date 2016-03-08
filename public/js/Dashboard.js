queue()
    .defer(d3.json, "/api/data")
    .await(makeGraphs);

function makeGraphs(error, apiData) {
	
	//Start Transformations
	var dataSet = apiData;
	var dateFormat = d3.time.format("%m/%d/%Y");
	dataSet.forEach(function(d) {
		//d.date_save = dateFormat.parse(d.date_save);
		//d.date_save.setDate(1);
		//d.total_donations = +d.total_donations;
	});

	//Create a Crossfilter instance
	var ndx = crossfilter(dataSet);

	//Define Dimensions
	var datePosted = ndx.dimension(function(d) { return d.date_save; });
	var versionCode = ndx.dimension(function(d) { return d.version_code; });
	var frontend = ndx.dimension(function(d) { return d.frontend; });


	//Calculate metrics
	var projectsByDate = datePosted.group(); 
	var projectsByVersionCode = versionCode.group();
	var groupByFrontend = frontend.group();
	var all = ndx.groupAll();

	//Calculate Groups
	var totalVersionCode = versionCode.group().reduceSum(function(d) {
		return d.versionCode;
	});
	//var totalDonationsState = state.group().reduceSum(function(d) {
	//	return d.total_donations;
	//});
	//
	//var totalFrontend = frontend.group().reduceSum(function(d) {
	//	return d.frontend;
	//});


	//var netTotalDonations = ndx.groupAll().reduceSum(function(d) {return d.total_donations;});

	//Define threshold values for data
	var minDate = datePosted.bottom(1)[0].date_save;
	var maxDate = datePosted.top(1)[0].date_save;

	console.log(minDate);
	console.log(maxDate);


  	selectField = dc.selectMenu('#menuselect')
        .dimension(frontend)
        .group(groupByFrontend);

       dc.dataCount("#row-selection")
        .dimension(ndx)
        .group(all);

	var pieChartVersionCode = dc.pieChart("#funding-chart");
	pieChartVersionCode
		.height(220)
		.radius(90)
		.innerRadius(40)
		.transitionDuration(1000)
		.dimension(versionCode)
		.group(projectsByVersionCode);

    dc.renderAll();
};