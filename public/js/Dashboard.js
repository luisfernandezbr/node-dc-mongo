queue()
    .defer(d3.json, "/api/data")
    .await(makeGraphs);

function makeGraphs(error, apiData) {
	
	//Start Transformations
	var dataSet = apiData;
	var dateFormat = d3.time.format("%m/%d/%Y");
	dataSet.forEach(function(d) {
		d.date_posted = dateFormat.parse(d.date_posted);
				d.date_posted.setDate(1);
		d.total_donations = +d.total_donations;
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
	var projectsByFrontend = frontend.group();

	var all = ndx.groupAll();

	//Calculate Groups
	var totalDonationsState = state.group().reduceSum(function(d) {
		return d.total_donations;
	});

	var totalVersionCode = versionCode.group().reduceSum(function(d) {
		return d.versionCode;
	});

	var totalFrontend = frontend.group().reduceSum(function(d) {
		return d.frontend;
	});



	//var netTotalDonations = ndx.groupAll().reduceSum(function(d) {return d.total_donations;});

	//Define threshold values for data
	var minDate = datePosted.bottom(1)[0].date_save;
	var maxDate = datePosted.top(1)[0].date_save;

	console.log(minDate);
	console.log(maxDate);

    //Charts
	var dateChart = dc.lineChart("#date-chart");
	var gradeLevelChart = dc.rowChart("#grade-chart");
	var fundingStatusChart = dc.pieChart("#funding-chart");

  	selectField = dc.selectMenu('#menuselect')
        .dimension(androidSdk)
        .group(byAndroidSdk);

       dc.dataCount("#row-selection")
        .dimension(ndx)
        .group(all);


	totalProjects
		.formatNumber(d3.format("d"))
		.valueAccessor(function(d){return d; })
		.group(all);


	dateChart
		//.width(600)
		.height(220)
		.margins({top: 10, right: 50, bottom: 30, left: 50})
		.dimension(datePosted)
		.group(versionCode)
		.renderArea(true)
		.transitionDuration(500)
		.x(d3.time.scale().domain([minDate, maxDate]))
		.elasticY(true)
		.renderHorizontalGridLines(true)
    	.renderVerticalGridLines(true)
		.xAxisLabel("Year")
		.yAxis().ticks(6);

	gradeLevelChart
		//.width(300)
		.height(220)
        .dimension(frontend)
        .group(projectsByFrontend)
        .xAxis().ticks(4);

  
          fundingStatusChart
            .height(220)
            //.width(350)
            .radius(90)
            .innerRadius(40)
            .transitionDuration(1000)
            .dimension(versionCode)
            .group(projectsByVersionCode);

    dc.renderAll();
};