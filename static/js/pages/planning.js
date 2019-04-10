/*
 * Author: Abdullah A Almsaeed
 * Date: 4 Jan 2014
 * Description:
 *      This is a demo file used only for the main dashboard (index.html)
 **/

$(function () {

  "use strict";

  function update_dashboard(communities, districts, mapCoverage, mapCrimes, mapDeploys, distanceCost, fairness, totalCoverage)
  {
    $('#status-message').html("Updating map...");
    $('#status-pct').html("20%");
    $('#status-bar').width("20%");

    draw_map(mapCoverage,mapCrimes,mapDeploys)

    $('#status-message').html("Updating KPIs...");
    $('#status-pct').html("60%");
    $('#status-bar').width("60%");

    $('#kpi-coverage').html(Math.round(totalCoverage*100)/100+"<sup style=\"font-size: 20px\">%</sup>");
    $('#kpi-fairness').html(Math.round(fairness*1000)/1000+"<sup style=\"font-size: 20px\">%</sup>");
    $('#kpi-distance').html(Math.round(distanceCost*10)/10);

    $('#status-message').html("Updating dropdowns...");
    $('#status-pct').html("80%");
    $('#status-bar').width("80%");

    $("#selector-district").empty();
    $("#selector-community").empty();

    var option = undefined;
    var district = undefined;
    var community = undefined;

    Object.keys(districts).forEach(function(item) {
      district = districts[item];
      option = $('<option></option>').attr("value", district.id).text(district.name + ' ('+district.available_patrols+' available units of '+district.total_patrols+' total units)');
      $("#selector-district").append(option);
    });
    Object.keys(communities).forEach(function(item) {
      community = communities[item];
      option = $('<option></option>').attr("value", community.id).text(community.name + ' ('+mapDeploys[community.code]+' units deployed, '+mapCrimes[community.code]+' crimes predicted and '+Math.round(mapCoverage[community.code]*100)/100+'% of crimes currently covered)');
      $("#selector-community").append(option);
    });

    $('#status-message').html("All done.");
    $('#status-pct').html("100%");
    $('#status-bar').width("100%");
  }

  function select_plan(change_plan,date,period)
  {
    var loaded = false;
    var communities = undefined;
    var districts = undefined;
    var mapCoverage = undefined;
    var mapCrimes = undefined;
    var mapDeploys = undefined;
    var distanceCost = undefined;
    var fairness = undefined;
    var totalCoverage = undefined;
    $('#status-message').html("Getting current deployment plan...");
    $('#status-pct').html("0%");
    $('#status-bar').width("0%");
    var new_date = date;
    var new_period = period;
    $.ajax({
            url: "http://w210-crime-optimization.us-east-1.elasticbeanstalk.com/getLoadedDeploymentPlan",
            type: "GET",
            success: function (data) {

              if (data.result == "failed") {
                loaded = false;
              }
              else {
                loaded = true;
                communities = data.communities;
                districts = data.districts;
                mapCoverage = data.mapCoverage;
                mapCrimes = data.mapCrimes;
                mapDeploys = data.mapDeploys;
                distanceCost = data.distanceCost;
                fairness = data.fairness;
                totalCoverage = data.totalCoverage;
              }

              if ((loaded == false) || (change_plan == true)) {
                if (change_plan == false) {
                  $('#status-message').html("No loaded deployment plan. Loading for current period...");
                  var date = moment().format("MM-DD-YYYY");
                  var period = undefined;
                  if (moment().hour() >= 0 && moment().hour() <= 6) {
                    period = 'DAWN';
                  } else if (moment().hour() > 6 && moment().hour() <= 11) {
                    period = 'MORNING';
                  } else if (moment().hour() > 11 && moment().hour() <= 17) {
                    period = 'AFTERNOON';
                  } else {
                    period = 'EVENING';
                  }
                } else {
                  $('#status-message').html("Loading deployment plan for selected period...");
                  var date = new_date;
                  var period = new_period;
                }
                var params={date: JSON.stringify(date), period: JSON.stringify(period)};
                $('#status-pct').html("10%");
                $('#status-bar').width("10%");
                $.ajax({
                        url: "http://w210-crime-optimization.us-east-1.elasticbeanstalk.com/loadDeploymentPlan",
                        data: params,
                        type: "GET",
                        success: function (data) {

                          loaded = true;
                          communities = data.communities;
                          districts = data.districts;
                          mapCoverage = data.mapCoverage;
                          mapCrimes = data.mapCrimes;
                          mapDeploys = data.mapDeploys;
                          distanceCost = data.distanceCost;
                          fairness = data.fairness;
                          totalCoverage = data.totalCoverage;

                          $('#status-message').html("Deployment plan loaded!");
                          $('#status-pct').html("20%");
                          $('#status-bar').width("20%");

                          update_dashboard(communities, districts, mapCoverage, mapCrimes, mapDeploys, distanceCost, fairness, totalCoverage);

                        },
                        error: function (x, y, z) {
                            $('#status-message').html("Failed to contact Planning service");
                            $('#status-pct').html("0%");
                            $('#status-bar').width("0%");
                            console.log(x);
                        }
                    });
              } else {
                $('#status-message').html("Deployment plan loaded!");
                $('#status-pct').html("20%");
                $('#status-bar').width("20%");

                update_dashboard(communities, districts, mapCoverage, mapCrimes, mapDeploys, distanceCost, fairness, totalCoverage);
              }

            },
            error: function (x, y, z) {
                $('#status-message').html("Failed to contact Planning service");
                $('#status-pct').html("0%");
                $('#status-bar').width("0%");
                console.log(x);
            }
        });

  }

  function change_units(operation,district,community,units)
  {
    var communities = undefined;
    var districts = undefined;
    var mapCoverage = undefined;
    var mapCrimes = undefined;
    var mapDeploys = undefined;
    var distanceCost = undefined;
    var fairness = undefined;
    var totalCoverage = undefined;
    var url = undefined;

    if (operation == 'deploy') {
      $('#status-message').html("Deploying units from selected district to selected community...");
      $('#status-pct').html("0%");
      $('#status-bar').width("0%");
      url = "http://w210-crime-optimization.us-east-1.elasticbeanstalk.com/deployPatrols"
    } else {
      $('#status-message').html("Un-deploying units from selected community back to selected district...");
      $('#status-pct').html("0%");
      $('#status-bar').width("0%");
      url = "http://w210-crime-optimization.us-east-1.elasticbeanstalk.com/undeployPatrols"
    }
    var params={district: JSON.stringify(district), community: JSON.stringify(community), patrols: JSON.stringify(units)};
    $.ajax({
            url: url,
            data: params,
            type: "GET",
            success: function (data) {

              if (data.result == "failed") {
                $('#status-message').html("Error: "+data.message);
                $('#status-pct').html("100%");
                $('#status-bar').width("100%");
                return;
              }

              communities = data.communities;
              districts = data.districts;
              mapCoverage = data.mapCoverage;
              mapCrimes = data.mapCrimes;
              mapDeploys = data.mapDeploys;
              distanceCost = data.distanceCost;
              fairness = data.fairness;
              totalCoverage = data.totalCoverage;

              update_dashboard(communities, districts, mapCoverage, mapCrimes, mapDeploys, distanceCost, fairness, totalCoverage);

            },
            error: function (x, y, z) {
                $('#status-message').html("Failed to contact Planning service");
                $('#status-pct').html("0%");
                $('#status-bar').width("0%");
                console.log(x);
            }
        });
  }

  function run_optimization(useFairness,minOnePatrolPerComm)
  {
    var communities = undefined;
    var districts = undefined;
    var mapCoverage = undefined;
    var mapCrimes = undefined;
    var mapDeploys = undefined;
    var distanceCost = undefined;
    var fairness = undefined;
    var totalCoverage = undefined;
    var solveStatus = undefined;

    $('#status-message').html("Executing optimization model... Please wait.");
    $('#status-pct').html("10%");
    $('#status-bar').width("10%");

    var fairness = undefined;
    var minpatrols = undefined;
    if (useFairness) {
      fairness = 'yes';
    } else {
      fairness = 'no';
    }
    if (minOnePatrolPerComm) {
      minpatrols = 'yes';
    } else {
      minpatrols = 'no';
    }
    var params={useFairness: JSON.stringify(fairness), minOnePatrolPerComm: JSON.stringify(minpatrols)};
    $.ajax({
            url: "http://w210-crime-optimization.us-east-1.elasticbeanstalk.com/runOptimization",
            data: params,
            type: "GET",
            success: function (data) {

              if (data.result == "failed") {
                $('#status-message').html("Error: "+data.message);
                $('#status-pct').html("100%");
                $('#status-bar').width("100%");
                return;
              }

              communities = data.communities;
              districts = data.districts;
              mapCoverage = data.mapCoverage;
              mapCrimes = data.mapCrimes;
              mapDeploys = data.mapDeploys;
              distanceCost = data.distanceCost;
              fairness = data.fairness;
              totalCoverage = data.totalCoverage;
              solveStatus = data.solve_status;

              $('#status-message').html("Optimization finished. Type of solution found: "+solveStatus+". Updating dashboard...");
              $('#status-pct').html("20%");
              $('#status-bar').width("20%");

              update_dashboard(communities, districts, mapCoverage, mapCrimes, mapDeploys, distanceCost, fairness, totalCoverage);

              $('#status-message').html("Optimization finished. Type of solution found: "+solveStatus);
              $('#status-pct').html("100%");
              $('#status-bar').width("100%");

            },
            error: function (x, y, z) {
                $('#status-message').html("Failed to contact Planning service");
                $('#status-pct').html("0%");
                $('#status-bar').width("0%");
                console.log(x);
            }
        });
  }

  function save_deployment()
  {
    $('#status-message').html("Persisting current deployment plan to database...");
    $('#status-pct').html("50%");
    $('#status-bar').width("50%");
    $.ajax({
            url: "http://w210-crime-optimization.us-east-1.elasticbeanstalk.com/saveDeploymentPlan",
            type: "GET",
            success: function (data) {

              if (data.result == "failed") {
                $('#status-message').html("Error: "+data.message);
                $('#status-pct').html("100%");
                $('#status-bar').width("100%");
                return;
              }

              $('#status-message').html(data.message);
              $('#status-pct').html("100%");
              $('#status-bar').width("100%");

            },
            error: function (x, y, z) {
                $('#status-message').html("Failed to contact Planning service");
                $('#status-pct').html("0%");
                $('#status-bar').width("0%");
                console.log(x);
            }
        });
  }

  //Make the dashboard widgets sortable Using jquery UI
  $(".connectedSortable").sortable({
    placeholder: "sort-highlight",
    connectWith: ".connectedSortable",
    handle: ".box-header, .nav-tabs",
    forcePlaceholderSize: true,
    zIndex: 999999
  });
  $(".connectedSortable .box-header, .connectedSortable .nav-tabs-custom").css("cursor", "move");

  //bootstrap WYSIHTML5 - text editor
  $(".textarea").wysihtml5();

  $('.daterange').daterangepicker({
    ranges: {
      'Now': [moment(),moment()],
      'In 6 hours': [moment().add(6, 'hours'),moment().add(6, 'hours')],
      'In 12 hours': [moment().add(12, 'hours'),moment().add(12, 'hours')],
      'In 18 hours': [moment().add(18, 'hours'),moment().add(18, 'hours')],
      'Tomorrow': [moment().add(1, 'days'),moment().add(1, 'days')]
    },
    locale: {
        format: 'MM/DD/YYYY HH:mm:ss',
        separator: ' - ',
        applyLabel: 'Apply',
        cancelLabel: 'Cancel',
        weekLabel: 'W',
        customRangeLabel: 'Custom Range',
        daysOfWeek: moment.weekdaysMin(),
        monthNames: moment.monthsShort(),
        firstDay: moment.localeData().firstDayOfWeek()
    },
    startDate: moment(),
    endDate: moment(),
    timePicker: true,
    singleDatePicker: true,
    timePicker24Hour: true
  }, function (start,end) {
    /* console.log("You chose: " + start.format('MMMM Do YYYY, HH:mm:ss') + " - " + end.format('MMMM Do YYYY, HH:mm:ss')); */
    var date = start.format("MM-DD-YYYY");
    var period = undefined;
    if (start.hour() >= 0 && start.hour() <= 6) {
      period = 'DAWN';
    } else if (start.hour() > 6 && start.hour() <= 11) {
      period = 'MORNING';
    } else if (start.hour() > 11 && start.hour() <= 17) {
      period = 'AFTERNOON';
    } else {
      period = 'EVENING';
    }
    /*
    console.log("Day of the Week: " + weekDay);
    console.log("Week of Year: " + weekYear);
    console.log("Time of the Day: " + hourDay);
    */
    select_plan(true, date, period);
  });

  /* jQueryKnob */
  $(".knob").knob();

  function draw_map(coverageData,crimeData,deployData) {
    //jvectormap data
    var mapData = coverageData;
    //World map by jvectormap
    $('#world-map').empty();
    $('#world-map').vectorMap({
      map: 'us-il-chicago_mill',
      backgroundColor: "transparent",
      regionStyle: {
        initial: {
          fill: '#e4e4e4',
          "fill-opacity": 1,
          stroke: 'none',
          "stroke-width": 0,
          "stroke-opacity": 1
        }
      },
      series: {
        regions: [{
          values: mapData,
          scale: ["#FF0441", "#FF867A", "#FFD04D", "#CCFF65", "#7CFF6C"],
          normalizeFunction: 'polynomial'
        }]
      },
      onRegionLabelShow: function (e, el, code) {
        if (typeof crimeData[code] != "undefined")
          el.html(el.html() + ': <br>' + crimeData[code] + ' total crimes<br>' + deployData[code] + ' units deployed<br>' + Math.round(coverageData[code]*10)/10 + '% of crimes covered');
      }
    });
  }
  draw_map({},{},{});

  //The Calender
  $("#calendar").datepicker();

  var weekDay = moment().day();
  var weekYear = moment().week();
  var hourDay = undefined;
  if (moment().hour() >= 0 && moment().hour() <= 6) {
    hourDay = 'DAWN';
  } else if (moment().hour() > 6 && moment().hour() <= 11) {
    hourDay = 'MORNING';
  } else if (moment().hour() > 11 && moment().hour() <= 17) {
    hourDay = 'AFTERNOON';
  } else {
    hourDay = 'EVENING';
  }

  $(document).ready(function() {
    $("#btn-deployPatrols").click(function(){
        var district = $("#selector-district").children(":selected").attr("value");
        var community = $("#selector-community").children(":selected").attr("value");
        var patrols = $("#input-units").val();
        if (!isNaN(parseFloat(patrols)) && isFinite(patrols)) {
          change_units('deploy',district,community,parseInt(patrols,10));
        } else {
          alert("Invalid value for number of units to be deployed.")
        }
    });
    $("#btn-undeployPatrols").click(function(){
        var district = $("#selector-district").children(":selected").attr("value");
        var community = $("#selector-community").children(":selected").attr("value");
        var patrols = $("#input-units").val();
        if (!isNaN(parseFloat(patrols)) && isFinite(patrols)) {
          change_units('undeploy',district,community,parseInt(patrols,10));
        } else {
          alert("Invalid value for number of units to be un-deployed.")
        }
    });
    $("#btn-save").click(function(){
        save_deployment();
    });
    $("#btn-optimize").click(function(){
        var useFairness = $("#cb-opt-fairness")[0].checked;
        var minOnePatrolPerComm = $("#cb-opt-minpatrols")[0].checked;
        run_optimization(useFairness,minOnePatrolPerComm);
    });
  });

  //update_graphs(undefined, [weekDay], [weekYear], [hourDay])
  select_plan(false,undefined,undefined);

});
