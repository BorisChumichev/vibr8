'use strict';

var angular = require('angular')

angular.module('vibrate', [])
  .directive('scrollStatus', ['$window', function($window) {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        var windowEl = angular.element($window)
        windowEl.on('scroll', scope.$apply.bind(scope, function () {
          scope.$root.scrolled = document.body.scrollTop > 0
            ? true 
            : false
        }))
      }
    }
  }]) 