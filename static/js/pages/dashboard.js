/*
 * Author: Abdullah A Almsaeed
 * Date: 4 Jan 2014
 * Description:
 *      This is a demo file used only for the main dashboard (index.html)
 **/

$(function () {

  "use strict";

  function update_graphs(communityArea,weekDay,weekYear,hourDay)
  {
    var params=undefined;
    if (typeof communityArea !== 'undefined') {
      params={communityarea: JSON.stringify(communityArea), weekday: JSON.stringify(weekDay), weekyear: JSON.stringify(weekYear), hourday: JSON.stringify(hourDay)};
    }
    else {
      params={weekday: JSON.stringify(weekDay), weekyear: JSON.stringify(weekYear), hourday: JSON.stringify(hourDay)};
    }
    var results=undefined;
    $('#status-message').html("Predicting crimes...");
    $('#status-pct').html("15%");
    $('#status-bar').width("15%");
    $.ajax({
            url: "http://w210-crime-machine-learning.us-east-1.elasticbeanstalk.com/predictionAndKPIs",
            data: params,
            type: "POST",
            success: function (data) {

              if (data.result == 'failed') {
                $('#status-message').html("Error running crime predictions.");
                $('#status-pct').html("0%");
                $('#status-bar').width("0%");
              }

              $('#status-message').html("Plotting predictions on map...");
              $('#status-pct').html("30%");
              $('#status-bar').width("30%");

              var mapObject = $('#world-map').vectorMap('get', 'mapObject');
              if (typeof mapObject != 'undefined') {
                mapObject.remove();
              }
              //mapObject.series.regions[0].setValues(mapData);
              draw_map(data.crimeByCommunity);

              $('#status-message').html("Plotting charts...");
              $('#status-pct').html("60%");
              $('#status-bar').width("60%");

              var chartData = []
              Object.keys(data.crimeByType).forEach(function(key) {
                chartData.push({'label': key, 'value': data.crimeByType[key]});
              });
              area.setData(chartData);
              donut.setData(chartData);
              area.redraw();
              donut.redraw();

              $('#status-message').html("Calculating KPIs...");
              $('#status-pct').html("80%");
              $('#status-bar').width("80%");

              var kpi_pred_crimes = 0;
              Object.keys(data.crimeByCommunity).forEach(function(key) {
                kpi_pred_crimes = kpi_pred_crimes + data.crimeByCommunity[key];
              });

              $('#kpi-pred-crimes').html(kpi_pred_crimes);
              $('#kpi-pred-fairness').html(Math.round(data.fairness*100)/100+"<sup style=\"font-size: 20px\">%</sup>");

              $('#status-message').html("Done!");
              $('#status-pct').html("100%");
              $('#status-bar').width("100%");

            },
            error: function (x, y, z) {
               $('#status-message').html("Failed to run crime prediction!");
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

  //jQuery UI sortable for the todo list
  $(".todo-list").sortable({
    placeholder: "sort-highlight",
    handle: ".handle",
    forcePlaceholderSize: true,
    zIndex: 999999
  });

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
    var weekDay = start.day();
    var weekYear = start.week();
    var hourDay = undefined;
    if (start.hour() >= 0 && start.hour() <= 6) {
      hourDay = 'DAWN';
    } else if (start.hour() > 6 && start.hour() <= 11) {
      hourDay = 'MORNING';
    } else if (start.hour() > 11 && start.hour() <= 17) {
      hourDay = 'AFTERNOON';
    } else {
      hourDay = 'EVENING';
    }
    /*
    console.log("Day of the Week: " + weekDay);
    console.log("Week of Year: " + weekYear);
    console.log("Time of the Day: " + hourDay);
    */
    update_graphs(undefined, [weekDay], [weekYear], [hourDay]);
  });

  /* jQueryKnob */
  $(".knob").knob();

  function draw_map(data) {
    //jvectormap data
    var crimeData = data;
    //World map by jvectormap
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
          values: crimeData,
          scale: ["#FFCCCC", "#FF0000"],
          normalizeFunction: 'polynomial'
        }]
      },
      onRegionLabelShow: function (e, el, code) {
        if (typeof crimeData[code] != "undefined")
          el.html(el.html() + ': ' + crimeData[code] + ' total crimes');
      }
    });
  }
  draw_map({})

  //Sparkline charts
  var myvalues = [1000, 1200, 920, 927, 931, 1027, 819, 930, 1021];
  $('#sparkline-1').sparkline(myvalues, {
    type: 'line',
    lineColor: '#92c1dc',
    fillColor: "#ebf4f9",
    height: '50',
    width: '80'
  });
  myvalues = [515, 519, 520, 522, 652, 810, 370, 627, 319, 630, 921];
  $('#sparkline-2').sparkline(myvalues, {
    type: 'line',
    lineColor: '#92c1dc',
    fillColor: "#ebf4f9",
    height: '50',
    width: '80'
  });
  myvalues = [15, 19, 20, 22, 33, 27, 31, 27, 19, 30, 21];
  $('#sparkline-3').sparkline(myvalues, {
    type: 'line',
    lineColor: '#92c1dc',
    fillColor: "#ebf4f9",
    height: '50',
    width: '80'
  });

  //The Calender
  $("#calendar").datepicker();

  /* Morris.js Charts */
  // Sales chart
  var area = new Morris.Bar({
    element: 'revenue-chart',
    resize: true,
    data: [
    ],
    xkey: 'label',
    ykeys: ['value'],
    labels: ['Predicted'],
    lineColors: ['#a0d0e0'],
    hideHover: 'auto'
  });


  //Donut Chart
  var donut = new Morris.Donut({
    element: 'sales-chart',
    resize: true,
    colors: ["#3c8dbc", "#f56954", "#00a65a"],
    data: [
      {label: "Download Sales", value: 12},
      {label: "In-Store Sales", value: 30},
      {label: "Mail-Order Sales", value: 20}
    ],
    hideHover: 'auto'
  });

  //Fix for charts under tabs
  $('.box ul.nav a').on('shown.bs.tab', function () {
    area.redraw();
    donut.redraw();
  });

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
  update_graphs(undefined, [weekDay], [weekYear], [hourDay])

});
