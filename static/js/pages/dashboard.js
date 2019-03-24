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
    console.log(params)
    $.ajax({
            url: "http://localhost:60000/predict",
            data: params,
            type: "POST",
            success: function (data) {
              var mapData = {};
              var crimeTypeData = {};
              var preds = data.result;

              preds.forEach(function(item) {
                  if (typeof mapData[item["communityArea"]] == 'undefined') {
                    mapData[item["communityArea"]] = 0
                  }
                  if (typeof crimeTypeData[item["primaryType"]] == 'undefined') {
                    crimeTypeData[item["primaryType"]] = 0
                  }
                  mapData[item["communityArea"]] = mapData[item["communityArea"]] + item["pred"]
                  crimeTypeData[item["primaryType"]] = crimeTypeData[item["primaryType"]] + item["pred"]
              })

              var mapObject = $('#world-map').vectorMap('get', 'mapObject');
              if (typeof mapObject != 'undefined') {
                mapObject.remove();
              }
              //mapObject.series.regions[0].setValues(mapData);
              draw_map(mapData);

              var chartData = []
              Object.keys(crimeTypeData).forEach(function(key) {
                chartData.push({'label': key, 'value': crimeTypeData[key]});
              })
              area.setData(chartData);
              donut.setData(chartData);
              area.redraw();
              donut.redraw();

            },
            error: function (x, y, z) {
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

  //SLIMSCROLL FOR CHAT WIDGET
  $('#chat-box').slimScroll({
    height: '250px'
  });

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
  var line = new Morris.Line({
    element: 'line-chart',
    resize: true,
    data: [
      {y: '2011 Q1', item1: 2666},
      {y: '2011 Q2', item1: 2778},
      {y: '2011 Q3', item1: 4912},
      {y: '2011 Q4', item1: 3767},
      {y: '2012 Q1', item1: 6810},
      {y: '2012 Q2', item1: 5670},
      {y: '2012 Q3', item1: 4820},
      {y: '2012 Q4', item1: 15073},
      {y: '2013 Q1', item1: 10687},
      {y: '2013 Q2', item1: 8432}
    ],
    xkey: 'y',
    ykeys: ['item1'],
    labels: ['Item 1'],
    lineColors: ['#efefef'],
    lineWidth: 2,
    hideHover: 'auto',
    gridTextColor: "#fff",
    gridStrokeWidth: 0.4,
    pointSize: 4,
    pointStrokeColors: ["#efefef"],
    gridLineColor: "#efefef",
    gridTextFamily: "Open Sans",
    gridTextSize: 10
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
    line.redraw();
  });

  /* The todo list plugin */
  $(".todo-list").todolist({
    onCheck: function (ele) {
      window.console.log("The element has been checked");
      return ele;
    },
    onUncheck: function (ele) {
      window.console.log("The element has been unchecked");
      return ele;
    }
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
