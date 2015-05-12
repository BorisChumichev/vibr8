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

  if (Vibr8.prototype._singletonInstance)
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
  this.bindings[eventName]
    ? this.bindings[eventName].push(func)
    : this.bindings[eventName] = [func]
  return this
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
  if (this._counterEnabledAndHaveReachedZero()) {
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
  this._emit('newperiod', {target: this})
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

/**
 * Checks wther counter is set and reached zero
 * @private
 * @return {Boolean}
 */
Vibr8.prototype._counterEnabledAndHaveReachedZero = function () {
  return this._counter.status 
    && (this._counter.val <= 0) 
    && (this.iterNum <= 0)
}
