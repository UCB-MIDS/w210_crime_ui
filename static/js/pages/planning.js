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
            url: "http://localhost:60000/predict",
            data: params,
            type: "POST",
            success: function (data) {

              $('#status-message').html("Plotting predictions on map...");
              $('#status-pct').html("50%");
              $('#status-bar').width("50%");

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

              $('#status-message').html("Calculating KPIs...");
              $('#status-pct').html("80%");
              $('#status-bar').width("80%");

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
  update_graphs(undefined, [weekDay], [weekYear], [hourDay])

});
