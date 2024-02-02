/* Copyright start
    MIT License
    Copyright (c) 2024 Fortinet Inc
Copyright end */
'use strict';
(function () {
    angular
        .module('cybersponse')
        .controller('editChartBuilder100Ctrl', editChartBuilder100Ctrl);

    editChartBuilder100Ctrl.$inject = ['$scope', '$uibModalInstance', 'config', 'appModulesService', 'Entity', 'SORT_ORDER', 'CommonUtils', '$state', 'highchartBuilderService'];

    function editChartBuilder100Ctrl($scope, $uibModalInstance, config, appModulesService, Entity, SORT_ORDER, CommonUtils, $state, highchartBuilderService) {
        $scope.cancel = cancel;
        $scope.save = save;
        $scope.config = config;
        $scope.page = $state.params.page;
        $scope.highchartBuilderService = highchartBuilderService;
        $scope.header = $scope.config.title ? 'Edit Chart Builder' : 'Add Chart Builder';
        $scope.config.customFilters = $scope.config.customFilters || { 'limit': 1, 'sort': [] };
        $scope.customResourceReset = customResourceReset;
        $scope.SORT_ORDER = SORT_ORDER;
        getChartTypes();
        $scope.setSourceJson = setSourceJson;
        $scope.config.sourceJson = !angular.isArray($scope.config.sourceJson) ? $scope.config.sourceJson : {};
        $scope.jsoneditorOptions = {
            name: 'Fields',
            mode: 'code',
            onEditable: function () {
                return {
                    field: true,
                    value: true
                };
            }
        };
        $scope.config.selectedColors = $scope.config.selectedColors || [];
        if ($scope.config.customFilters.sort.length > 0) {
            $scope.customSort = { field: $scope.config.customFilters.sort[0].field, direction: $scope.config.customFilters.sort[0].direction };
        }
        else {
            $scope.customSort = {};
        }
        appModulesService.load().then(function (modules) {
            $scope.modules = modules;
            $scope.moduleFields = {};
            $scope.moduleFieldsArrays = {};
            if ($scope.config.customResource && !$scope.moduleFields[$scope.config.customResource]) {
                populateFieldLists($scope.config.customResource);
            }
        });

        //to get the chart list supported
        function getChartTypes(){
            $scope.highchartBuilderService.getChartTypes().then(function(response) {
                let fileType = angular.extend(response.data, $scope.config);
                $scope.chartList = fileType.chartTypes;
            });
        }

        function customResourceReset() {
            let newResource = $scope.config.customResource;
            if (!$scope.moduleFields[newResource]) {
                populateFieldLists(newResource);
            }
            $scope.customSort = {};
        }

        function populateFieldLists(resource) {
            let crEntity = new Entity(resource);
            crEntity.loadFields().then(function () {
                for (var key in crEntity.fields) {
                    if (crEntity.fields[key].type === 'datetime') {
                        crEntity.fields[key].type = 'datetime.quick';
                    }
                }
                $scope.moduleFields[resource] = crEntity.fields;
                $scope.moduleFieldsArrays[resource] = crEntity.getFormFieldsArray()
            })
        }

        function setSourceJson(json) {
            if (angular.isString(json)) {
                try {
                    $scope.config.sourceJson = JSON.parse(json);
                } catch (e) {
                    // invalid JSON. skip the rest
                    return;
                }
            }
        }

        function cancel() {
            $uibModalInstance.dismiss('cancel');
        }

        function save() {
            if ($scope.editWidgetForm.$invalid) {
                $scope.editWidgetForm.$setTouched();
                $scope.editWidgetForm.$focusOnFirstError();
                return;
            }
            $scope.processing = true;

            // Before saving we need to generate a pseudo-uuid value. There's not a good way to get a true uuid in angularjs
            if (!$scope.config.correlationValue) {
                var uniqueValue = CommonUtils.generateUUID();
                $scope.config['correlationValue'] = uniqueValue;
            }
            $scope.config.customFilters.sort = [$scope.customSort];
            $uibModalInstance.close($scope.config);
        }

    }
})();