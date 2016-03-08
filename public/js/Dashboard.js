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
	var dateSaved = ndx.dimension(function(d) { return d.date_save; });
	var versionCode = ndx.dimension(function(d) { return d.version_code; });
	var frontend = ndx.dimension(function(d) { return d.frontend; });
	var androidSdk = ndx.dimension(function(d) { return d.android_sdk; });
	var manufacturer = ndx.dimension(function(d) { return d.manufacturer; });
	var model = ndx.dimension(function(d) { return d.model; });


	//Calculate metrics
	var groupSavedDate = dateSaved.group();
	var projectsByVersionCode = versionCode.group();
	var groupByFrontend = frontend.group();
	var groupAndroidSdk =  androidSdk.group();
	var groupManufacturer = manufacturer.group();
	var groupModel = model.group();

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
	var minDate = dateSaved.bottom(1)[0].date_save;
	var maxDate = dateSaved.top(1)[0].date_save;

	console.log(minDate);
	console.log(maxDate);


  	selectField = dc.selectMenu('#menuselect')
        .dimension(frontend)
        .group(groupByFrontend);

       dc.dataCount("#row-selection")
        .dimension(ndx)
        .group(all);

	var dateChart = dc.lineChart("#date-chart");
	dateChart
	//.width(600)
		.height(220)
		.margins({top: 10, right: 50, bottom: 30, left: 50})
		.dimension(dateSaved)
		.group(groupSavedDate)
		.renderArea(true)
		.transitionDuration(500)
		.x(d3.time.scale().domain([minDate, maxDate]))
		.elasticY(true)
		.renderHorizontalGridLines(true)
		.renderVerticalGridLines(true)
		.xAxisLabel("Year")
		.yAxis().ticks(6);


	var totalRegisters = dc.numberDisplay("#total-registers");
	totalRegisters
		.formatNumber(d3.format("d"))
		.valueAccessor(function(d){return d; })
		.group(all);

	var pieChartVersionCode = dc.pieChart("#funding-chart");
	pieChartVersionCode
		.height(220)
		.radius(90)
		.innerRadius(40)
		.transitionDuration(1000)
		.dimension(versionCode)
		.group(projectsByVersionCode);

	var pieChartAndroidSdk = dc.pieChart("#piechart-android-sdk");
	pieChartAndroidSdk
		.height(220)
		.radius(90)
		.innerRadius(40)
		.transitionDuration(1000)
		.dimension(androidSdk)
		.group(groupAndroidSdk);

	var rowChartManufacturer = dc.rowChart("#row-chart-manufacturer");
	rowChartManufacturer
		.height(220)
		.dimension(manufacturer)
		.group(groupManufacturer)
		.xAxis().ticks(4);

	var rowChartModel = dc.rowChart("#row-chart-model");
	rowChartModel
		.height(220)
		.dimension(model)
		.group(groupModel)
		.xAxis().ticks(4);

    dc.renderAll();
};