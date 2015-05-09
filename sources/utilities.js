'use strict';

/**
 * Check wether given value belongs to the interval
 * @return {Boolean} 
 */
module.exports.isInRange = function (value, begin, end) {
  return value < begin
    ? false
    : value > end
      ? false
      : true
}
