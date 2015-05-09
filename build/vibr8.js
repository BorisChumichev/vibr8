!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Vibr8=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"./utilities.js":2}],2:[function(require,module,exports){
/**
 * scripts/utilities.js
 */

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

},{}],3:[function(require,module,exports){
'use strict';

/**
 * Dependencies
 */

var Pattern = require('./pattern.js')
  , navigatior = window.navigator

/**
 * @constructor
 * @param {[Number]} pattern 
 */
var Vibr8 = function (pattern, period) {

  if ( Vibr8.prototype._singletonInstance )
    return Vibr8.prototype._singletonInstance
  Vibr8.prototype._singletonInstance = this

  this.iterNum = 0
  this.period = period ? period : 1700
  this.isVibrating = false
  this.bindings = {}
  this.pattern = new Pattern(pattern)
  this._counter = {status: false, val: 0}
}

/**
 * Starts vibration
 */
Vibr8.prototype.start = function () {
  if (!this.isVibrating) {
    this.isVibrating = true
    this._initNewSubPeriod()
  }
}

/**
 * Stops vibration
 */
Vibr8.prototype.stop = function () {
  this._vibrate(0)
  this.isVibrating = false
  if (this._counter.status) {
    this._counter.status = false
    this._counter.val = 0
  }
}

/**
 * Plays pattern once
 * @param  {[Number]} pattern optional pattern
 */
Vibr8.prototype.repeat = function (times, pattern) {
  if (!this.isVibrating) {
    if (pattern) this.setPattern(pattern)
    this._counter.val = times
    this._counter.status = true
    this.start()
  }
}

/**
 * Sets vibration cycle time duration
 * @param {Number} period            vibration period duration
 */
Vibr8.prototype.setPeriod = function (period) {
  this.period = period < 10
    ? 10
    : period
}

/**
 * Returns vibration cycle time duration
 * @return {Number} period            vibration period duration
 */
Vibr8.prototype.getPeriod = function () {
  return this.period
}

/**
 * Applies pattern (disables previous pattern)
 * @param {[Number]} pattern        new pattern array
 */
Vibr8.prototype.setPattern = function (pattern) {
  this.pattern = new Pattern(pattern)
}

/**
 * Binds event handlers for events 'ended', 'started'
 * @param  {String} eventName       event name
 * @param  {function} func          handler
 */
Vibr8.prototype.bind = function (eventName, func) {
  return this.bindings[eventName]
    ? this.bindings[eventName].push(func)
    : this.bindings[eventName] = [func]
}

module.exports = Vibr8

/**
 * Navigator's vibrate method wrapper
 * @private
 */
Vibr8.prototype._vibrate = function (duration) {
  if (navigatior.vibrate)
    navigatior.vibrate(duration)
  else
    console.error('Vibration API is not supported')
}

/**
 * Sets timer till new vibration subperiod
 * @private
 * @param  {[type]} delay         time to wait
 */
Vibr8.prototype._scheduleNewSubPeriod = function (delay) {
  var that = this
  setTimeout(function () {
    that._initNewSubPeriod()
  }, delay)
}

/**
 * Emits 'ended' event if vibration stopped
 * otherwise computes vibration/waiting time and
 * inits vibration/waiting
 * @private
 */
Vibr8.prototype._initNewSubPeriod = function () {
  if (this.isVibrating) {
    this.iterNum++
    return this.iterNum >= this.pattern.sequence.length
      ? this._vibrateOrBeIdle(this.pattern.getTimeSequenceForEl(this.period, this._restartIterations())) 
      : this._vibrateOrBeIdle(this.pattern.getTimeSequenceForEl(this.period, this.iterNum))
  } else {
    this._emit('ended', {target: this})
  }
}

/**
 * Vibrates duration if iterNum is odd
 * @private
 * @param  {[type]} duration [description]
 * @return {[type]}          [description]
 */
Vibr8.prototype._vibrateOrBeIdle = function (duration) {
  if (this.counterEnabledAndHaveReachedZero()) {
    this.stop()
  } else {
    if (this.iterNum%2) {
      this._emit('ended', {target: this})
    } else {
      this._emit('started', {target: this})
      this._vibrate(duration)
    }
    this._scheduleNewSubPeriod(duration)
  }
}

/**
 * Sets iterNum to zero and returns zero
 * @private
 * @return {Number} returns zero
 */
Vibr8.prototype._restartIterations = function () {
  if (this._counter.status) {
    this._counter.val--
  }
  this.iterNum = 0
  return 0
}

/**
 * Invokes registered handlers for eventName
 * @private
 * @param  {String} eventName       event name
 * @param  {Object} eventObject     event object
 */
Vibr8.prototype._emit = function (eventName, eventObject) {
  if (this.bindings[eventName])
    this.bindings[eventName].forEach(function (func) {
      func(eventObject)
    })
}

Vibr8.prototype.counterEnabledAndHaveReachedZero = function () {
  return this._counter.status 
    && (this._counter.val === 0) 
    && (this.iterNum === 0)
}

},{"./pattern.js":1}]},{},[3])(3)
});