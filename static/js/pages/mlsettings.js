/*
 * Author: Abdullah A Almsaeed
 * Date: 4 Jan 2014
 * Description:
 *      This is a demo file used only for the main dashboard (index.html)
 **/

$(function () {

  "use strict";

  var models = [];

  function getAvailableModels()
  {
    $('#load-message').html("Getting available models from Machine Learning Service...");
    $('#load-pct').html("50%");
    $('#load-status-bar').width("50%");
    $.ajax({
            url: "http://w210-crime-machine-learning.us-east-1.elasticbeanstalk.com/getAvailableModels",
            //url: "http://localhost:60000/getAvailableModels",
            type: "GET",
            success: function (data) {

              if (data.result == 'failed') {
                $('#load-message').html(data.message);
                $('#load-pct').html("0%");
                $('#load-status-bar').width("0%");
                return;
              }

              $('#load-message').html("Models gathered, updating list...");
              $('#load-pct').html("75%");
              $('#load-status-bar').width("75%");

              models=[];

              var option = undefined;
              $("#selector-model").empty();
              data.models.forEach(function(model) {
                models.push(model);
                var modeltype = undefined;
                if (model.type == 'keras') {
                  modeltype = 'Keras Deep Learning Model';
                } else {
                  modeltype = 'XGBoost Regressor Model';
                }
                option = $('<option></option>').attr("value", model.modelname).text(model.modelname + ' ('+modeltype+')');
                $("#selector-model").append(option);
              });

              $('#load-message').html("Model list refreshed.");
              $('#load-pct').html("100%");
              $('#load-status-bar').width("100%");

              var modelname = $("#selector-model").children(":selected").attr("value");
              displayModelInfo(models,modelname);

            },
            error: function (x, y, z) {
                $('#load-message').html("Failed to contact Machine Learning Service");
                $('#load-pct').html("0%");
                $('#load-status-bar').width("0%");
                console.log(x);
            }
        });
  }

  function getAvailableFeatures()
  {
    $('#trainer-message').html("Getting available features from Machine Learning Service...");
    $('#trainer-pct').html("50%");
    $('#trainer-status-bar').width("50%");
    $.ajax({
            url: "http://w210-crime-machine-learning.us-east-1.elasticbeanstalk.com/getAvailableFeatures",
            //url: "http://localhost:60000/getAvailableFeatures",
            type: "GET",
            success: function (data) {

              if (data.result == 'failed') {
                $('#trainer-message').html(data.message);
                $('#trainer-pct').html("0%");
                $('#trainer-status-bar').width("0%");
                return;
              }

              $('#trainer-message').html("Features gathered, updating list...");
              $('#trainer-pct').html("75%");
              $('#trainer-status-bar').width("75%");

              $('#cb-features-group').empty();

              var html = undefined;
              data.features.forEach(function(feature) {
                html = "<div class=\"form-check\">";
                html += "<input class=\"form-check-input\" type=\"checkbox\" value=\"" + feature.feature + "\" id=\"cb-"+ feature.column +"\" ";
                if (!feature.optional) {
                  html += "checked disabled";
                }
                html += "><label class=\"form-check-label\" for=\"cb-" + feature.column + "\">";
                html += feature.feature + " (";
                if (feature.ethnically_biased) {
                  html += "Ethnically Biased";
                } else {
                  html += "Ethnically Un-biased";
                }
                html += ")</label></div>";
                $('#cb-features-group').append(html);
              });

              $('#trainer-message').html("Feature list refreshed.");
              $('#trainer-pct').html("100%");
              $('#trainer-status-bar').width("100%");

            },
            error: function (x, y, z) {
                $('#trainer-message').html("Failed to contact Machine Learning Service");
                $('#trainer-pct').html("0%");
                $('#trainer-status-bar').width("0%");
                console.log(x);
            }
        });
  }

  function getTrainingStatus()
  {
    $('#trainer-message').html("Getting training status from Machine Learning Service...");
    $('#trainer-pct').html("50%");
    $('#trainer-status-bar').width("50%");
    $.ajax({
            url: "http://w210-crime-machine-learning.us-east-1.elasticbeanstalk.com/getTrainingStatus",
            //url: "http://localhost:60000/getTrainingStatus",
            type: "GET",
            success: function (data) {

              $('#trainer-message').html(data.status);
              $('#trainer-pct').html("100%");
              $('#trainer-status-bar').width("100%");

              $('#ta-stdout').html(data.stdout);

            },
            error: function (x, y, z) {
                $('#trainer-message').html("Failed to contact Machine Learning Service");
                $('#trainer-pct').html("0%");
                $('#trainer-status-bar').width("0%");
                console.log(x);
            }
        });
  }

  function killTrainer()
  {
    $('#trainer-message').html("Sending kill trainer signal to Machine Learning Service...");
    $('#trainer-pct').html("50%");
    $('#trainer-status-bar').width("50%");
    $.ajax({
            url: "http://w210-crime-machine-learning.us-east-1.elasticbeanstalk.com/killTrainer",
            //url: "http://localhost:60000/killTrainer",
            type: "GET",
            success: function (data) {

              $('#trainer-message').html(data.message);
              $('#trainer-pct').html("100%");
              $('#trainer-status-bar').width("100%");

            },
            error: function (x, y, z) {
                $('#trainer-message').html("Failed to contact Machine Learning Service");
                $('#trainer-pct').html("0%");
                $('#trainer-status-bar').width("0%");
                console.log(x);
            }
        });
  }

  function trainModel(modelname,modeltype,features)
  {
    $('#trainer-message').html("Sending model training request to Machine Learning Service...");
    $('#trainer-pct').html("50%");
    $('#trainer-status-bar').width("50%");
    var params = {modelname: JSON.stringify(modelname), modeltype: JSON.stringify(modeltype), features: JSON.stringify(features)};
    $.ajax({
            url: "http://w210-crime-machine-learning.us-east-1.elasticbeanstalk.com/getAvailableFeatures",
            //url: "http://localhost:60000/trainModel",
            data: params,
            type: "GET",
            success: function (data) {

              if (data.result == 'failed') {
                $('#trainer-message').html(data.message);
                $('#trainer-pct').html("0%");
                $('#trainer-status-bar').width("0%");
                return;
              }

              $('#trainer-message').html(data.message);
              $('#trainer-pct').html("100%");
              $('#trainer-status-bar').width("100%");

            },
            error: function (x, y, z) {
                $('#trainer-message').html("Failed to contact Machine Learning Service");
                $('#trainer-pct').html("0%");
                $('#trainer-status-bar').width("0%");
                console.log(x);
            }
        });
  }

  function loadModel(modelname)
  {
    $('#load-message').html("Sending model load request to Machine Learning Service...");
    $('#load-pct').html("50%");
    $('#load-status-bar').width("50%");
    var params = {modelname: JSON.stringify(modelname)};
    $.ajax({
            url: "http://w210-crime-machine-learning.us-east-1.elasticbeanstalk.com/reloadModel",
            //url: "http://localhost:60000/reloadModel",
            data: params,
            type: "GET",
            success: function (data) {

              if (data.result == 'failed') {
                $('#load-message').html(data.message);
                $('#load-pct').html("0%");
                $('#load-status-bar').width("0%");
                return;
              }

              $('#load-message').html(data.message);
              $('#load-pct').html("100%");
              $('#load-status-bar').width("100%");

            },
            error: function (x, y, z) {
                $('#load-message').html("Failed to contact Machine Learning Service");
                $('#load-pct').html("0%");
                $('#load-status-bar').width("0%");
                console.log(x);
            }
        });
  }

  function displayModelInfo(models,modelname)
  {
    var option = undefined;
    var bias = undefined;
    $('#model-features').empty();
    models.forEach(function(model){
      if (model.modelname == modelname) {
        model.features.forEach(function (feature) {
          if (feature.ethnically_biased) {
            bias = 'Ethnically Biased';
          } else {
            bias = 'Ethnically Un-biased';
          }
          option = $('<option></option>').text(feature.feature + ' ('+bias+')');
          $("#model-features").append(option);
        });
        $('#model-MAE').val(model.statistics.MAE);
        $('#model-MSE').val(model.statistics.MSE);
        $('#model-RMSE').val(model.statistics.RMSE);
        return;
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

  getAvailableModels();
  getAvailableFeatures();

  $(document).ready(function() {
    $("#btn-train").click(function(){
        var modelname = $("#input-modelname").val();
        var modeltype = $("#selector-modeltype").children(":selected").attr("value");
        var features = [];
        var cbs = $('.form-check-input');
        Object.keys(cbs).forEach(function (cbkey) {
          if (cbs[cbkey].checked) {
            features.push(cbs[cbkey].value);
          }
        });
        if (modelname == "") {
          $('#trainer-message').html("Missing model name.");
        } else {
          trainModel(modelname,modeltype,features);
        }
    });
    $("#btn-kill").click(function(){
        killTrainer();
    });
    $("#btn-check").click(function(){
        getTrainingStatus();
    });
    $("#btn-refresh").click(function(){
        getAvailableModels();
    });
    $("#btn-load").click(function(){
      var modelname = $("#selector-model").children(":selected").attr("value");
      loadModel(modelname);
    });
    $("#selector-model").change(function(){
      var modelname = $("#selector-model").children(":selected").attr("value");
      displayModelInfo(models,modelname);
    });
  });

});
