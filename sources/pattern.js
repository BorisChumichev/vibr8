'use strict';

var u = require('./utilities.js')

/**
 * Pattern constructor, creates pattern instance
 * @param pattern       {[Number]} squence of values from 0 to 100
 *                      which represents intervals of
 *                      active and passive states of a
 *                      cyclic process
 * @constructor
 */
function Pattern(patternArray) {
  patternArray = patternArray ? patternArray : [50, 50]

  if (!this._checkSumOfPattern(patternArray) || !this._percentCheck(patternArray)) 
    console.error('Pattern should be a squence of values from 0 to 100, and sum of them must equal to 100')
  
  this.sequence = patternArray
}

module.exports = Pattern;

/**
 * Scales pattern to time duration of a given time arg (ms)
 * @return {[Number]} (ms)
 */
Pattern.prototype.getTimeSequence = function (time) {
  var percentDuration = time/100
  return this.sequence.map(function (el) {
    return el*percentDuration
  })
}

/**
 * Scales pattern element according to time duration
 * @param  {[type]} time
 * @param  {[type]} elNum
 * @return {[type]}
 */
Pattern.prototype.getTimeSequenceForEl = function (time, elNum) {
  var percentDuration = time/100
  return this.sequence[elNum]*percentDuration
}


/**
 * Validate pattern elements sum
 * @private
 * @param  {[Number]} pattern
 * @return {Boolean}
 */
Pattern.prototype._checkSumOfPattern = function (pattern) {
  return pattern.reduce(function(previousEl, currentEl) {
    return previousEl + currentEl
  }) === 100
}

/**
 * Validate pattern elements 
 * @private
 * @param  {[Number]} pattern
 * @return {Boolean}
 */
Pattern.prototype._percentCheck = function (pattern) {
  return pattern.every(function (el) {
    return u.isInRange(el, 0, 100)
  })
}
