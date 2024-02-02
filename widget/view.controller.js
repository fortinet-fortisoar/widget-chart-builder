/* Copyright start
    MIT License
    Copyright (c) 2024 Fortinet Inc
Copyright end */
'use strict';
(function () {
  angular
    .module('cybersponse')
    .controller('chartBuilder100Ctrl', chartBuilder100Ctrl);

  chartBuilder100Ctrl.$inject = ['$scope', '$timeout', '$resource', 'API', 'config', '$q', '$rootScope', 'highchartBuilderService'];

  function chartBuilder100Ctrl($scope, $timeout, $resource, API, config, $q, $rootScope, highchartBuilderService) {
    $scope.processing = true;
    $scope.config = config;
    $scope.init = init;
    $scope.chartData = {};
    $scope.errMsg = 'No records matching the specified query exist.';
    $scope.currentTheme = $rootScope.theme.id;
    $scope.highchartBuilderService = highchartBuilderService;
    var fileCount = 0;
    var fileLoadDefer = $q.defer();
    // Load External JS Files
    function loadJs(fileList) {
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = fileList[fileCount];
      document.getElementsByTagName('head')[0].appendChild(script);
      script.onload = function () {
        // console.log('script loaded', fileList[fileCount]);
        if (fileCount === fileList.length - 1) {
          fileLoadDefer.resolve();
        } else {
          fileCount++;
          loadJs(fileList).then(function () {
          });
        }
      }
      return fileLoadDefer.promise;
    }

    function init() {
      $scope.highchartBuilderService.getLibraries().then(function(response) {
        let files = response.data;
        loadJs(files.libraries).then(function () {
          //console.log('file promise resolved: ')
          createChartData();
        });
      });
    }

    function createChartData() {
      $scope.chartData = $scope.config.sourceJson;
      if($scope.chartData['chart']){
        $scope.chartData['chart']['backgroundColor'] = $scope.currentTheme === 'light' ? '#FFFFFF' : '#000000';
      }
      else{
        $scope.chartData['chart'] = { 'backgroundColor' : $scope.currentTheme === 'light' ? '#FFFFFF' : '#000000'};
      }
      
      $scope.chartData['title']['style'] = {'color' : $scope.currentTheme === 'light' ? '#000000' : '#FFFFFF'};
      //console.log(chartType);
      // switch (chartType) {
      //   case 'arcdiagram':
      //     $scope.chartData = $scope.config.sourceJson;
      //     break;
      //   case 'treemap':
      //     $scope.chartData = $scope.config.sourceJson;
      //     break;
      //   default:
      //     $scope.chartData = $scope.config.sourceJson;
      //     break;
      // }
      fetchData();
    }

    function fetchData() {
      $resource(API.QUERY + $scope.config.customResource + '?$limit=1').save($scope.config.customFilters).$promise.then(function (data) {
        if (data['hydra:member'].length == 0) {
          $scope.noData = true;
          $scope.processing = false;
        }
        else {
          let moduleChartData = data['hydra:member'][0][$scope.config.customDataField];
          // moduleChartData.bindto = '#highChartpoc-'+config.correlationValue;
          setChartData(moduleChartData);
          $timeout(function () {
            if ($scope.chart) {
              $scope.chart.destroy();
            }
            $scope.chart = Highcharts.chart('chartBuilder-' + config.correlationValue, $scope.chartData);
            $scope.noData = false;
            $scope.processing = false;
          },
            0,
            false)
        }
      });
    }

    function setChartData(moduleChartData) {
      switch ($scope.config.chartType) {
        case 'bar':
          $scope.chartData['series'] = moduleChartData.data;
          break;
        default:
          $scope.chartData.series[0].data = moduleChartData.data;
          break;
      }
    }

    $scope.$on('$destroy', function () {
      if ($scope.chart) {
        $scope.chart.destroy();
      }
    })

    init();
  }
})();