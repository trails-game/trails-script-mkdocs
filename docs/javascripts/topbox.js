/*
TouchSwipe - jQuery Plugin, version 1.6.18

Matt Bryson http://www.github.com/mattbryson
https://github.com/mattbryson/TouchSwipe-Jquery-Plugin
http://labs.rampinteractive.co.uk/touchSwipe/
http://plugins.jquery.com/project/touchSwipe

Copyright (c) 2010-2015 Matt Bryson
Dual licensed under the MIT or GPL Version 2 licenses.
*/

! function(factory) {
    "function" == typeof define && define.amd && define.amd.jQuery ? define(["jquery"], factory) : factory("undefined" != typeof module && module.exports ? require("jquery") : jQuery)
  }(function($) {
    "use strict";
  
    function init(options) {
      return !options || void 0 !== options.allowPageScroll || void 0 === options.swipe && void 0 === options.swipeStatus || (options.allowPageScroll = NONE), void 0 !== options.click && void 0 === options.tap && (options.tap = options.click), options || (options = {}), options = $.extend({}, $.fn.swipe.defaults, options), this.each(function() {
        var $this = $(this),
          plugin = $this.data(PLUGIN_NS);
        plugin || (plugin = new TouchSwipe(this, options), $this.data(PLUGIN_NS, plugin))
      })
    }
  
    function TouchSwipe(element, options) {
      function touchStart(jqEvent) {
        if (!(getTouchInProgress() || $(jqEvent.target).closest(options.excludedElements, $element).length > 0)) {
          var event = jqEvent.originalEvent ? jqEvent.originalEvent : jqEvent;
          if (!event.pointerType || "mouse" != event.pointerType || 0 != options.fallbackToMouseEvents) {
            var ret, touches = event.touches,
              evt = touches ? touches[0] : event;
            return phase = PHASE_START, touches ? fingerCount = touches.length : options.preventDefaultEvents !== !1 && jqEvent.preventDefault(), distance = 0, direction = null, currentDirection = null, pinchDirection = null, duration = 0, startTouchesDistance = 0, endTouchesDistance = 0, pinchZoom = 1, pinchDistance = 0, maximumsMap = createMaximumsData(), cancelMultiFingerRelease(), createFingerData(0, evt), !touches || fingerCount === options.fingers || options.fingers === ALL_FINGERS || hasPinches() ? (startTime = getTimeStamp(), 2 == fingerCount && (createFingerData(1, touches[1]), startTouchesDistance = endTouchesDistance = calculateTouchesDistance(fingerData[0].start, fingerData[1].start)), (options.swipeStatus || options.pinchStatus) && (ret = triggerHandler(event, phase))) : ret = !1, ret === !1 ? (phase = PHASE_CANCEL, triggerHandler(event, phase), ret) : (options.hold && (holdTimeout = setTimeout($.proxy(function() {
              $element.trigger("hold", [event.target]), options.hold && (ret = options.hold.call($element, event, event.target))
            }, this), options.longTapThreshold)), setTouchInProgress(!0), null)
          }
        }
      }
  
      function touchMove(jqEvent) {
        var event = jqEvent.originalEvent ? jqEvent.originalEvent : jqEvent;
        if (phase !== PHASE_END && phase !== PHASE_CANCEL && !inMultiFingerRelease()) {
          var ret, touches = event.touches,
            evt = touches ? touches[0] : event,
            currentFinger = updateFingerData(evt);
          if (endTime = getTimeStamp(), touches && (fingerCount = touches.length), options.hold && clearTimeout(holdTimeout), phase = PHASE_MOVE, 2 == fingerCount && (0 == startTouchesDistance ? (createFingerData(1, touches[1]), startTouchesDistance = endTouchesDistance = calculateTouchesDistance(fingerData[0].start, fingerData[1].start)) : (updateFingerData(touches[1]), endTouchesDistance = calculateTouchesDistance(fingerData[0].end, fingerData[1].end), pinchDirection = calculatePinchDirection(fingerData[0].end, fingerData[1].end)), pinchZoom = calculatePinchZoom(startTouchesDistance, endTouchesDistance), pinchDistance = Math.abs(startTouchesDistance - endTouchesDistance)), fingerCount === options.fingers || options.fingers === ALL_FINGERS || !touches || hasPinches()) {
            if (direction = calculateDirection(currentFinger.start, currentFinger.end), currentDirection = calculateDirection(currentFinger.last, currentFinger.end), validateDefaultEvent(jqEvent, currentDirection), distance = calculateDistance(currentFinger.start, currentFinger.end), duration = calculateDuration(), setMaxDistance(direction, distance), ret = triggerHandler(event, phase), !options.triggerOnTouchEnd || options.triggerOnTouchLeave) {
              var inBounds = !0;
              if (options.triggerOnTouchLeave) {
                var bounds = getbounds(this);
                inBounds = isInBounds(currentFinger.end, bounds)
              }!options.triggerOnTouchEnd && inBounds ? phase = getNextPhase(PHASE_MOVE) : options.triggerOnTouchLeave && !inBounds && (phase = getNextPhase(PHASE_END)), phase != PHASE_CANCEL && phase != PHASE_END || triggerHandler(event, phase)
            }
          } else phase = PHASE_CANCEL, triggerHandler(event, phase);
          ret === !1 && (phase = PHASE_CANCEL, triggerHandler(event, phase))
        }
      }
  
      function touchEnd(jqEvent) {
        var event = jqEvent.originalEvent ? jqEvent.originalEvent : jqEvent,
          touches = event.touches;
        if (touches) {
          if (touches.length && !inMultiFingerRelease()) return startMultiFingerRelease(event), !0;
          if (touches.length && inMultiFingerRelease()) return !0
        }
        return inMultiFingerRelease() && (fingerCount = fingerCountAtRelease), endTime = getTimeStamp(), duration = calculateDuration(), didSwipeBackToCancel() || !validateSwipeDistance() ? (phase = PHASE_CANCEL, triggerHandler(event, phase)) : options.triggerOnTouchEnd || options.triggerOnTouchEnd === !1 && phase === PHASE_MOVE ? (options.preventDefaultEvents !== !1 && jqEvent.preventDefault(), phase = PHASE_END, triggerHandler(event, phase)) : !options.triggerOnTouchEnd && hasTap() ? (phase = PHASE_END, triggerHandlerForGesture(event, phase, TAP)) : phase === PHASE_MOVE && (phase = PHASE_CANCEL, triggerHandler(event, phase)), setTouchInProgress(!1), null
      }
  
      function touchCancel() {
        fingerCount = 0, endTime = 0, startTime = 0, startTouchesDistance = 0, endTouchesDistance = 0, pinchZoom = 1, cancelMultiFingerRelease(), setTouchInProgress(!1)
      }
  
      function touchLeave(jqEvent) {
        var event = jqEvent.originalEvent ? jqEvent.originalEvent : jqEvent;
        options.triggerOnTouchLeave && (phase = getNextPhase(PHASE_END), triggerHandler(event, phase))
      }
  
      function removeListeners() {
        $element.unbind(START_EV, touchStart), $element.unbind(CANCEL_EV, touchCancel), $element.unbind(MOVE_EV, touchMove), $element.unbind(END_EV, touchEnd), LEAVE_EV && $element.unbind(LEAVE_EV, touchLeave), setTouchInProgress(!1)
      }
  
      function getNextPhase(currentPhase) {
        var nextPhase = currentPhase,
          validTime = validateSwipeTime(),
          validDistance = validateSwipeDistance(),
          didCancel = didSwipeBackToCancel();
        return !validTime || didCancel ? nextPhase = PHASE_CANCEL : !validDistance || currentPhase != PHASE_MOVE || options.triggerOnTouchEnd && !options.triggerOnTouchLeave ? !validDistance && currentPhase == PHASE_END && options.triggerOnTouchLeave && (nextPhase = PHASE_CANCEL) : nextPhase = PHASE_END, nextPhase
      }
  
      function triggerHandler(event, phase) {
        var ret, touches = event.touches;
        return (didSwipe() || hasSwipes()) && (ret = triggerHandlerForGesture(event, phase, SWIPE)), (didPinch() || hasPinches()) && ret !== !1 && (ret = triggerHandlerForGesture(event, phase, PINCH)), didDoubleTap() && ret !== !1 ? ret = triggerHandlerForGesture(event, phase, DOUBLE_TAP) : didLongTap() && ret !== !1 ? ret = triggerHandlerForGesture(event, phase, LONG_TAP) : didTap() && ret !== !1 && (ret = triggerHandlerForGesture(event, phase, TAP)), phase === PHASE_CANCEL && touchCancel(event), phase === PHASE_END && (touches ? touches.length || touchCancel(event) : touchCancel(event)), ret
      }
  
      function triggerHandlerForGesture(event, phase, gesture) {
        var ret;
        if (gesture == SWIPE) {
          if ($element.trigger("swipeStatus", [phase, direction || null, distance || 0, duration || 0, fingerCount, fingerData, currentDirection]), options.swipeStatus && (ret = options.swipeStatus.call($element, event, phase, direction || null, distance || 0, duration || 0, fingerCount, fingerData, currentDirection), ret === !1)) return !1;
          if (phase == PHASE_END && validateSwipe()) {
            if (clearTimeout(singleTapTimeout), clearTimeout(holdTimeout), $element.trigger("swipe", [direction, distance, duration, fingerCount, fingerData, currentDirection]), options.swipe && (ret = options.swipe.call($element, event, direction, distance, duration, fingerCount, fingerData, currentDirection), ret === !1)) return !1;
            switch (direction) {
              case LEFT:
                $element.trigger("swipeLeft", [direction, distance, duration, fingerCount, fingerData, currentDirection]), options.swipeLeft && (ret = options.swipeLeft.call($element, event, direction, distance, duration, fingerCount, fingerData, currentDirection));
                break;
              case RIGHT:
                $element.trigger("swipeRight", [direction, distance, duration, fingerCount, fingerData, currentDirection]), options.swipeRight && (ret = options.swipeRight.call($element, event, direction, distance, duration, fingerCount, fingerData, currentDirection));
                break;
              case UP:
                $element.trigger("swipeUp", [direction, distance, duration, fingerCount, fingerData, currentDirection]), options.swipeUp && (ret = options.swipeUp.call($element, event, direction, distance, duration, fingerCount, fingerData, currentDirection));
                break;
              case DOWN:
                $element.trigger("swipeDown", [direction, distance, duration, fingerCount, fingerData, currentDirection]), options.swipeDown && (ret = options.swipeDown.call($element, event, direction, distance, duration, fingerCount, fingerData, currentDirection))
            }
          }
        }
        if (gesture == PINCH) {
          if ($element.trigger("pinchStatus", [phase, pinchDirection || null, pinchDistance || 0, duration || 0, fingerCount, pinchZoom, fingerData]), options.pinchStatus && (ret = options.pinchStatus.call($element, event, phase, pinchDirection || null, pinchDistance || 0, duration || 0, fingerCount, pinchZoom, fingerData), ret === !1)) return !1;
          if (phase == PHASE_END && validatePinch()) switch (pinchDirection) {
            case IN:
              $element.trigger("pinchIn", [pinchDirection || null, pinchDistance || 0, duration || 0, fingerCount, pinchZoom, fingerData]), options.pinchIn && (ret = options.pinchIn.call($element, event, pinchDirection || null, pinchDistance || 0, duration || 0, fingerCount, pinchZoom, fingerData));
              break;
            case OUT:
              $element.trigger("pinchOut", [pinchDirection || null, pinchDistance || 0, duration || 0, fingerCount, pinchZoom, fingerData]), options.pinchOut && (ret = options.pinchOut.call($element, event, pinchDirection || null, pinchDistance || 0, duration || 0, fingerCount, pinchZoom, fingerData))
          }
        }
        return gesture == TAP ? phase !== PHASE_CANCEL && phase !== PHASE_END || (clearTimeout(singleTapTimeout), clearTimeout(holdTimeout), hasDoubleTap() && !inDoubleTap() ? (doubleTapStartTime = getTimeStamp(), singleTapTimeout = setTimeout($.proxy(function() {
          doubleTapStartTime = null, $element.trigger("tap", [event.target]), options.tap && (ret = options.tap.call($element, event, event.target))
        }, this), options.doubleTapThreshold)) : (doubleTapStartTime = null, $element.trigger("tap", [event.target]), options.tap && (ret = options.tap.call($element, event, event.target)))) : gesture == DOUBLE_TAP ? phase !== PHASE_CANCEL && phase !== PHASE_END || (clearTimeout(singleTapTimeout), clearTimeout(holdTimeout), doubleTapStartTime = null, $element.trigger("doubletap", [event.target]), options.doubleTap && (ret = options.doubleTap.call($element, event, event.target))) : gesture == LONG_TAP && (phase !== PHASE_CANCEL && phase !== PHASE_END || (clearTimeout(singleTapTimeout), doubleTapStartTime = null, $element.trigger("longtap", [event.target]), options.longTap && (ret = options.longTap.call($element, event, event.target)))), ret
      }
  
      function validateSwipeDistance() {
        var valid = !0;
        return null !== options.threshold && (valid = distance >= options.threshold), valid
      }
  
      function didSwipeBackToCancel() {
        var cancelled = !1;
        return null !== options.cancelThreshold && null !== direction && (cancelled = getMaxDistance(direction) - distance >= options.cancelThreshold), cancelled
      }
  
      function validatePinchDistance() {
        return null === options.pinchThreshold || pinchDistance >= options.pinchThreshold
      }
  
      function validateSwipeTime() {
        var result;
        return result = !options.maxTimeThreshold || !(duration >= options.maxTimeThreshold)
      }
  
      function validateDefaultEvent(jqEvent, direction) {
        if (options.preventDefaultEvents !== !1)
          if (options.allowPageScroll === NONE) jqEvent.preventDefault();
          else {
            var auto = options.allowPageScroll === AUTO;
            switch (direction) {
              case LEFT:
                (options.swipeLeft && auto || !auto && options.allowPageScroll != HORIZONTAL) && jqEvent.preventDefault();
                break;
              case RIGHT:
                (options.swipeRight && auto || !auto && options.allowPageScroll != HORIZONTAL) && jqEvent.preventDefault();
                break;
              case UP:
                (options.swipeUp && auto || !auto && options.allowPageScroll != VERTICAL) && jqEvent.preventDefault();
                break;
              case DOWN:
                (options.swipeDown && auto || !auto && options.allowPageScroll != VERTICAL) && jqEvent.preventDefault();
                break;
              case NONE:
            }
          }
      }
  
      function validatePinch() {
        var hasCorrectFingerCount = validateFingers(),
          hasEndPoint = validateEndPoint(),
          hasCorrectDistance = validatePinchDistance();
        return hasCorrectFingerCount && hasEndPoint && hasCorrectDistance
      }
  
      function hasPinches() {
        return !!(options.pinchStatus || options.pinchIn || options.pinchOut)
      }
  
      function didPinch() {
        return !(!validatePinch() || !hasPinches())
      }
  
      function validateSwipe() {
        var hasValidTime = validateSwipeTime(),
          hasValidDistance = validateSwipeDistance(),
          hasCorrectFingerCount = validateFingers(),
          hasEndPoint = validateEndPoint(),
          didCancel = didSwipeBackToCancel(),
          valid = !didCancel && hasEndPoint && hasCorrectFingerCount && hasValidDistance && hasValidTime;
        return valid
      }
  
      function hasSwipes() {
        return !!(options.swipe || options.swipeStatus || options.swipeLeft || options.swipeRight || options.swipeUp || options.swipeDown)
      }
  
      function didSwipe() {
        return !(!validateSwipe() || !hasSwipes())
      }
  
      function validateFingers() {
        return fingerCount === options.fingers || options.fingers === ALL_FINGERS || !SUPPORTS_TOUCH
      }
  
      function validateEndPoint() {
        return 0 !== fingerData[0].end.x
      }
  
      function hasTap() {
        return !!options.tap
      }
  
      function hasDoubleTap() {
        return !!options.doubleTap
      }
  
      function hasLongTap() {
        return !!options.longTap
      }
  
      function validateDoubleTap() {
        if (null == doubleTapStartTime) return !1;
        var now = getTimeStamp();
        return hasDoubleTap() && now - doubleTapStartTime <= options.doubleTapThreshold
      }
  
      function inDoubleTap() {
        return validateDoubleTap()
      }
  
      function validateTap() {
        return (1 === fingerCount || !SUPPORTS_TOUCH) && (isNaN(distance) || distance < options.threshold)
      }
  
      function validateLongTap() {
        return duration > options.longTapThreshold && distance < DOUBLE_TAP_THRESHOLD
      }
  
      function didTap() {
        return !(!validateTap() || !hasTap())
      }
  
      function didDoubleTap() {
        return !(!validateDoubleTap() || !hasDoubleTap())
      }
  
      function didLongTap() {
        return !(!validateLongTap() || !hasLongTap())
      }
  
      function startMultiFingerRelease(event) {
        previousTouchEndTime = getTimeStamp(), fingerCountAtRelease = event.touches.length + 1
      }
  
      function cancelMultiFingerRelease() {
        previousTouchEndTime = 0, fingerCountAtRelease = 0
      }
  
      function inMultiFingerRelease() {
        var withinThreshold = !1;
        if (previousTouchEndTime) {
          var diff = getTimeStamp() - previousTouchEndTime;
          diff <= options.fingerReleaseThreshold && (withinThreshold = !0)
        }
        return withinThreshold
      }
  
      function getTouchInProgress() {
        return !($element.data(PLUGIN_NS + "_intouch") !== !0)
      }
  
      function setTouchInProgress(val) {
        $element && (val === !0 ? ($element.bind(MOVE_EV, touchMove), $element.bind(END_EV, touchEnd), LEAVE_EV && $element.bind(LEAVE_EV, touchLeave)) : ($element.unbind(MOVE_EV, touchMove, !1), $element.unbind(END_EV, touchEnd, !1), LEAVE_EV && $element.unbind(LEAVE_EV, touchLeave, !1)), $element.data(PLUGIN_NS + "_intouch", val === !0))
      }
  
      function createFingerData(id, evt) {
        var f = {
          start: {
            x: 0,
            y: 0
          },
          last: {
            x: 0,
            y: 0
          },
          end: {
            x: 0,
            y: 0
          }
        };
        return f.start.x = f.last.x = f.end.x = evt.pageX || evt.clientX, f.start.y = f.last.y = f.end.y = evt.pageY || evt.clientY, fingerData[id] = f, f
      }
  
      function updateFingerData(evt) {
        var id = void 0 !== evt.identifier ? evt.identifier : 0,
          f = getFingerData(id);
        return null === f && (f = createFingerData(id, evt)), f.last.x = f.end.x, f.last.y = f.end.y, f.end.x = evt.pageX || evt.clientX, f.end.y = evt.pageY || evt.clientY, f
      }
  
      function getFingerData(id) {
        return fingerData[id] || null
      }
  
      function setMaxDistance(direction, distance) {
        direction != NONE && (distance = Math.max(distance, getMaxDistance(direction)), maximumsMap[direction].distance = distance)
      }
  
      function getMaxDistance(direction) {
        if (maximumsMap[direction]) return maximumsMap[direction].distance
      }
  
      function createMaximumsData() {
        var maxData = {};
        return maxData[LEFT] = createMaximumVO(LEFT), maxData[RIGHT] = createMaximumVO(RIGHT), maxData[UP] = createMaximumVO(UP), maxData[DOWN] = createMaximumVO(DOWN), maxData
      }
  
      function createMaximumVO(dir) {
        return {
          direction: dir,
          distance: 0
        }
      }
  
      function calculateDuration() {
        return endTime - startTime
      }
  
      function calculateTouchesDistance(startPoint, endPoint) {
        var diffX = Math.abs(startPoint.x - endPoint.x),
          diffY = Math.abs(startPoint.y - endPoint.y);
        return Math.round(Math.sqrt(diffX * diffX + diffY * diffY))
      }
  
      function calculatePinchZoom(startDistance, endDistance) {
        var percent = endDistance / startDistance * 1;
        return percent.toFixed(2)
      }
  
      function calculatePinchDirection() {
        return pinchZoom < 1 ? OUT : IN
      }
  
      function calculateDistance(startPoint, endPoint) {
        return Math.round(Math.sqrt(Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2)))
      }
  
      function calculateAngle(startPoint, endPoint) {
        var x = startPoint.x - endPoint.x,
          y = endPoint.y - startPoint.y,
          r = Math.atan2(y, x),
          angle = Math.round(180 * r / Math.PI);
        return angle < 0 && (angle = 360 - Math.abs(angle)), angle
      }
  
      function calculateDirection(startPoint, endPoint) {
        if (comparePoints(startPoint, endPoint)) return NONE;
        var angle = calculateAngle(startPoint, endPoint);
        return angle <= 45 && angle >= 0 ? LEFT : angle <= 360 && angle >= 315 ? LEFT : angle >= 135 && angle <= 225 ? RIGHT : angle > 45 && angle < 135 ? DOWN : UP
      }
  
      function getTimeStamp() {
        var now = new Date;
        return now.getTime()
      }
  
      function getbounds(el) {
        el = $(el);
        var offset = el.offset(),
          bounds = {
            left: offset.left,
            right: offset.left + el.outerWidth(),
            top: offset.top,
            bottom: offset.top + el.outerHeight()
          };
        return bounds
      }
  
      function isInBounds(point, bounds) {
        return point.x > bounds.left && point.x < bounds.right && point.y > bounds.top && point.y < bounds.bottom
      }
  
      function comparePoints(pointA, pointB) {
        return pointA.x == pointB.x && pointA.y == pointB.y
      }
      var options = $.extend({}, options),
        useTouchEvents = SUPPORTS_TOUCH || SUPPORTS_POINTER || !options.fallbackToMouseEvents,
        START_EV = useTouchEvents ? SUPPORTS_POINTER ? SUPPORTS_POINTER_IE10 ? "MSPointerDown" : "pointerdown" : "touchstart" : "mousedown",
        MOVE_EV = useTouchEvents ? SUPPORTS_POINTER ? SUPPORTS_POINTER_IE10 ? "MSPointerMove" : "pointermove" : "touchmove" : "mousemove",
        END_EV = useTouchEvents ? SUPPORTS_POINTER ? SUPPORTS_POINTER_IE10 ? "MSPointerUp" : "pointerup" : "touchend" : "mouseup",
        LEAVE_EV = useTouchEvents ? SUPPORTS_POINTER ? "mouseleave" : null : "mouseleave",
        CANCEL_EV = SUPPORTS_POINTER ? SUPPORTS_POINTER_IE10 ? "MSPointerCancel" : "pointercancel" : "touchcancel",
        distance = 0,
        direction = null,
        currentDirection = null,
        duration = 0,
        startTouchesDistance = 0,
        endTouchesDistance = 0,
        pinchZoom = 1,
        pinchDistance = 0,
        pinchDirection = 0,
        maximumsMap = null,
        $element = $(element),
        phase = "start",
        fingerCount = 0,
        fingerData = {},
        startTime = 0,
        endTime = 0,
        previousTouchEndTime = 0,
        fingerCountAtRelease = 0,
        doubleTapStartTime = 0,
        singleTapTimeout = null,
        holdTimeout = null;
      try {
        $element.bind(START_EV, touchStart), $element.bind(CANCEL_EV, touchCancel)
      } catch (e) {
        $.error("events not supported " + START_EV + "," + CANCEL_EV + " on jQuery.swipe")
      }
      this.enable = function() {
        return this.disable(), $element.bind(START_EV, touchStart), $element.bind(CANCEL_EV, touchCancel), $element
      }, this.disable = function() {
        return removeListeners(), $element
      }, this.destroy = function() {
        removeListeners(), $element.data(PLUGIN_NS, null), $element = null
      }, this.option = function(property, value) {
        if ("object" == typeof property) options = $.extend(options, property);
        else if (void 0 !== options[property]) {
          if (void 0 === value) return options[property];
          options[property] = value
        } else {
          if (!property) return options;
          $.error("Option " + property + " does not exist on jQuery.swipe.options")
        }
        return null
      }
    }
    var VERSION = "1.6.18",
      LEFT = "left",
      RIGHT = "right",
      UP = "up",
      DOWN = "down",
      IN = "in",
      OUT = "out",
      NONE = "none",
      AUTO = "auto",
      SWIPE = "swipe",
      PINCH = "pinch",
      TAP = "tap",
      DOUBLE_TAP = "doubletap",
      LONG_TAP = "longtap",
      HORIZONTAL = "horizontal",
      VERTICAL = "vertical",
      ALL_FINGERS = "all",
      DOUBLE_TAP_THRESHOLD = 10,
      PHASE_START = "start",
      PHASE_MOVE = "move",
      PHASE_END = "end",
      PHASE_CANCEL = "cancel",
      SUPPORTS_TOUCH = "ontouchstart" in window,
      SUPPORTS_POINTER_IE10 = window.navigator.msPointerEnabled && !window.PointerEvent && !SUPPORTS_TOUCH,
      SUPPORTS_POINTER = (window.PointerEvent || window.navigator.msPointerEnabled) && !SUPPORTS_TOUCH,
      PLUGIN_NS = "TouchSwipe",
      defaults = {
        fingers: 1,
        threshold: 75,
        cancelThreshold: null,
        pinchThreshold: 20,
        maxTimeThreshold: null,
        fingerReleaseThreshold: 250,
        longTapThreshold: 500,
        doubleTapThreshold: 200,
        swipe: null,
        swipeLeft: null,
        swipeRight: null,
        swipeUp: null,
        swipeDown: null,
        swipeStatus: null,
        pinchIn: null,
        pinchOut: null,
        pinchStatus: null,
        click: null,
        tap: null,
        doubleTap: null,
        longTap: null,
        hold: null,
        triggerOnTouchEnd: !0,
        triggerOnTouchLeave: !1,
        allowPageScroll: "auto",
        fallbackToMouseEvents: !0,
        excludedElements: ".noSwipe",
        preventDefaultEvents: !0
      };
    $.fn.swipe = function(method) {
      var $this = $(this),
        plugin = $this.data(PLUGIN_NS);
      if (plugin && "string" == typeof method) {
        if (plugin[method]) return plugin[method].apply(plugin, Array.prototype.slice.call(arguments, 1));
        $.error("Method " + method + " does not exist on jQuery.swipe")
      } else if (plugin && "object" == typeof method) plugin.option.apply(plugin, arguments);
      else if (!(plugin || "object" != typeof method && method)) return init.apply(this, arguments);
      return $this
    }, $.fn.swipe.version = VERSION, $.fn.swipe.defaults = defaults, $.fn.swipe.phases = {
      PHASE_START: PHASE_START,
      PHASE_MOVE: PHASE_MOVE,
      PHASE_END: PHASE_END,
      PHASE_CANCEL: PHASE_CANCEL
    }, $.fn.swipe.directions = {
      LEFT: LEFT,
      RIGHT: RIGHT,
      UP: UP,
      DOWN: DOWN,
      IN: IN,
      OUT: OUT
    }, $.fn.swipe.pageScroll = {
      NONE: NONE,
      HORIZONTAL: HORIZONTAL,
      VERTICAL: VERTICAL,
      AUTO: AUTO
    }, $.fn.swipe.fingers = {
      ONE: 1,
      TWO: 2,
      THREE: 3,
      FOUR: 4,
      FIVE: 5,
      ALL: ALL_FINGERS
    }
  });
  
  
  /*
  TopBox is derived from Nivo Lightbox v1.3.1, created by Dev7studios:
  http://dev7studios.com/nivo-lightbox
  
  TopBox is updated for jQuery 3 and has additional features / content support.
  Maintained by William Woodgate
  
  TopBox homepage:
  https://willwoodgate.com/projects/topbox/
  
  Free to use and abuse under the MIT license.
  http://www.opensource.org/licenses/mit-license.php
  */
  
  $(document).ready(function() {
  
    var pluginName = 'topbox',
      defaults = {
        effect: 'fade',
        backgroundBlur: false,
        skin: 'darkroom',
        keyboardNav: true,
        clickImgToClose: false,
        clickOverlayToClose: true,
        closeToolTip: 'Close',
        previousToolTip: 'Previous',
        nextToolTip: 'Next',
        titleSource: 'title',
        onInit: function() {},
        beforeShowLightbox: function() {},
        afterShowLightbox: function(lightbox) {},
        beforeHideLightbox: function() {},
        afterHideLightbox: function() {},
        beforePrev: function(element) {},
        onPrev: function(element) {},
        beforeNext: function(element) {},
        onNext: function(element) {},
        pdfMessage: 'View the PDF in a new window:',
        pdfButton: 'Tap Here',
        errorMessage: 'The requested content cannot be loaded. Please try again later.'
      };
  
    function TopBox(element, options) {
      this.el = element;
      this.$el = $(this.el);
      this.options = $.extend({}, defaults, options);
      this._defaults = defaults;
      this._name = pluginName;
      this.init();
    }
  
    TopBox.prototype = {
  
      init: function() {
        var $this = this;
  
        // If web browser is NOT a touch device (need this so we don't use CSS transitions in mobile)
        if (!(/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent))) {
          $('body').addClass('topbox_notouch');
        }
  
        // Background blur
        if (this.options.backgroundBlur) {
          $('body').wrapInner('<div class="topbox_blur_wrapper" />');
        }
  
        // Setup the click
        this.$el.on('click', function(e) {
          $this.showLightbox(e);
        });
  
        // keyboard navigation
        if (this.options.keyboardNav) {
          $('body').off('keyup').on('keyup', function(e) {
            var code = (e.keyCode ? e.keyCode : e.which);
            // Escape
            if (code == 27) $this.destructLightbox();
            // Left
            if (code == 37) $('.topbox_prev').trigger('click');
            // Right
            if (code == 39) $('.topbox_next').trigger('click');
          });
        }
  
        this.options.onInit.call(this);
  
      },
  
      showLightbox: function(e) {
        var $this = this,
          currentLink = this.$el;
  
        // Check content
        var check = this.checkContent(currentLink);
        if (!check) return;
  
        e.preventDefault();
        this.options.beforeShowLightbox.call(this);
        var lightbox = this.constructLightbox();
        if (!lightbox) return;
        var content = lightbox.find('.topbox_content');
        if (!content) return;
  
        $('body').addClass('topbox_open topbox_body_effect_' + this.options.effect);
  
        this.processContent(content, currentLink);
  
        // Nav
        if (this.$el.attr('data-lightbox-gallery')) {
          var galleryItems = $('[data-lightbox-gallery="' + this.$el.attr('data-lightbox-gallery') + '"]');
  
          $('.topbox_nav').show();
  
          // Prev
          $('.topbox_prev').off('click').on('click', function(e) {
            e.preventDefault();
            // Empty content
            $('.topbox_content').empty();
            var index = galleryItems.index(currentLink);
            currentLink = galleryItems.eq(index - 1);
            if (!$(currentLink).length) currentLink = galleryItems.last();
            $.when($this.options.beforePrev.call(this, [currentLink])).done(function() {
              $this.processContent(content, currentLink);
              $this.options.onPrev.call(this, [currentLink]);
            });
          });
  
          // Next
          $('.topbox_next').off('click').on('click', function(e) {
            e.preventDefault();
            // Empty content
            $('.topbox_content').empty();
            var index = galleryItems.index(currentLink);
            currentLink = galleryItems.eq(index + 1);
            if (!$(currentLink).length) currentLink = galleryItems.first();
            $.when($this.options.beforeNext.call(this, [currentLink])).done(function() {
              $this.processContent(content, currentLink);
              $this.options.onNext.call(this, [currentLink]);
            });
          });
        }
  
        setTimeout(function() {
          lightbox.addClass('topbox_open');
          $this.options.afterShowLightbox.call(this, [lightbox]);
        }, 1); // For CSS transitions
      },
  
      checkContent: function(link) {
        var $this = this,
        href = link.attr('href'),
        video = href.match(/(youtube|youtube-nocookie|youtu|vimeo)\.(com|be|ly|tv)\/((watch\?v=([\w-]+))|(embed\/([\w-]+))|([\w-]+))/);
        videoOther = href.match(/(dai|brighteon|ted)\.(com|be|ly|tv|net)\/((talks\/([\w-]+))|([\w-]+))/);
  
        if (href.match(/\.(jpeg|jpg|gif|png|tiff|svg|webp)$/i) !== null) {
          return true;
        }
  
        // HTML5 Audio
        else if (href.match(/\.(ogg|mp3)$/i) !== null) {
          return true;
        }
  
        // HTML5 Video
        else if (href.match(/\.(ogv|mov|webm|mp4)$/i) !== null) {
          return true;
        }
  
        // PDF
        else if (href.match(/\.(pdf)$/i) !== null) {
          return true;
        }
  
        // Video (Youtube/Vimeo)
        else if (video) {
          return true;
        }
  
        // Video (Dailymotion, Brighteon, TED)
        else if (videoOther) {
          return true;
        }
  
        // AJAX
        else if (link.attr('data-lightbox-type') == 'ajax') {
          return true;
        }
  
        // Inline HTML
        else if (href.substring(0, 1) == '#' && link.attr('data-lightbox-type') == 'inline') {
          return true;
        }
  
        // Video iFrame
        else if (link.attr('data-lightbox-type') == 'video-iframe') {
          return true;
        }
  
        // iFrame (default)
        else if (link.attr('data-lightbox-type') == 'iframe') {
          return true;
        }
  
        return false;
      },
  
      processContent: function(content, link) {
        var $this = this,
        href = link.attr('href'),
        video = href.match(/(youtube|youtube-nocookie|youtu|vimeo)\.(com|be|ly|tv)\/((watch\?v=([\w-]+))|(embed\/([\w-]+))|([\w-]+))/);
        videoOther = href.match(/(dai|brighteon|ted)\.(com|be|net|ly|tv)\/((talks\/([\w-]+))|([\w-]+))/);
  
        // Image
        if (href.match(/\.(jpeg|jpg|gif|png|tiff|svg|webp)$/i) !== null) {
          var imgtag = $('<img>', {
            src: href,
            'class': 'topbox_image'
          });
          imgtag.one('load', function() {
            content.prepend(imgtag);
          }).each(function() {
            if (this.complete) $(this).on("load");
          });
  
          imgtag.on("error", function() {
            var wrap = $('<div class="topbox_error"><p>' + $this.options.errorMessage + '</p></div>');
            content.html(wrap);
          });
        }
  
        // Embedded video (e.g. Youtube, Vimeo)
        else if (video) {
          var src = '',
            classTerm = 'topbox_embedded_web_video';
  
          if (video[1] == 'youtube') {
            src = 'https://www.youtube.com/embed/' + video[3] + '?autoplay=1&amp;rel=0&amp;playsinline=1';
            classTerm = 'topbox_youtube';
          }
  
          if (video[1] == 'youtu') {
            src = 'https://www.youtube.com/embed/' + video[3] + '?autoplay=1&amp;rel=0&amp;playsinline=1';
            classTerm = 'topbox_youtube';
          }
  
          if (video[1] == 'vimeo') {
            src = 'https://player.vimeo.com/video/' + video[3] + '?autoplay=1&amp;rel=0&amp;playsinline=1';
            classTerm = 'topbox_vimeo';
          }
  
          if (src) {
            var iframeVideo = $('<iframe>', {
              src: src,
              'class': classTerm,
              frameborder: 0,
              vspace: 0,
              hspace: 0,
              playsinline: true,
              scrolling: 'auto',
              allowfullscreen: 'true',
              allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
            });
            content.prepend(iframeVideo);
            $('iframe').wrap('<div class="topbox_embedded_web_video" id="player" />');
          }
        }
  
        // Embedded video (e.g. Brighteon, TED, DailyMotion)
        else if (videoOther) {
          var src = '',
            classTerm = 'topbox_embedded_web_video';
  
          if (videoOther[1] == 'dai') {
            src = 'https://www.dailymotion.com/embed/video/' + videoOther[3] + '?autoPlay=1';
            classTerm = 'topbox_dailymotion';
          }
  
          if (videoOther[1] == 'ted') {
            src = 'https://embed.ted.com/' + videoOther[3] + '?autoplay=1';;
            classTerm = 'topbox_ted';
          }
  
          if (videoOther[1] == 'brighteon') {
            src = 'https://www.brighteon.com/embed/' + videoOther[3] + '?autoplay=1';
            classTerm = 'topbox_brighteon';
          }
  
          if (src) {
            var iframeVideo = $('<iframe>', {
              src: src,
              'class': classTerm,
              frameborder: 0,
              vspace: 0,
              hspace: 0,
              scrolling: 'auto',
              allowfullscreen: 'true',
              allowtransparency: 'true',
              allow: 'autoplay; encrypted-media'
            });
            content.prepend(iframeVideo);
            $('iframe').wrap('<div class="topbox_embedded_web_video" />');
  
          }
        }
  
        // AJAX
        else if (link.attr('data-lightbox-type') == 'ajax') {
          $.ajax({
            url: href,
            cache: false,
            success: function(data) {
              var wrap = $('<div class="topbox_ajax" />');
              wrap.append(data);
            },
            error: function() {
              var wrap = $('<div class="topbox_error"><p>' + $this.options.errorMessage + '</p></div>');
              content.html(wrap);
            }
          });
        }
  
        // Inline HTML
        else if (href.substring(0, 1) == '#' && link.attr('data-lightbox-type') == 'inline') {
          if ($(href).length) {
            var wrap = $('<div class="topbox_inline" />');
            wrap.append($(href).clone().show());
            content.html(wrap);
          } else {
            var wrapError = $('<div class="topbox_error"><p>' + $this.options.errorMessage + '</p></div>');
            content.html(wrapError);
          }
        }
  
        // PDF
        else if (href.match(/\.(pdf)$/i) !== null) {
          if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
            var pdfLink = href
            var pdfMobileMessage = $('<div class="topbox_pdf_mobile_message"><p>' + $this.options.pdfMessage + '<br><a href="' + pdfLink + '" target="_blank" class="topbox_pdf_mobile_button">' + $this.options.pdfButton + '</a></p></div>');
            content.html(pdfMobileMessage);
          } else {
            var iframe = $('<iframe>', {
              src: href,
              'class': 'topbox_pdf',
              frameborder: 0,
              vspace: 0,
              hspace: 0,
              scrolling: 'auto'
            });
            content.html(iframe);
            $('iframe.topbox_pdf').wrap('<div class="topbox_pdf_wrap" />');
          }
        }
  
        // HTML5 audio
        else if (href.match(/\.(ogg|mp3)$/i) !== null) {
          var audioframe = $('<audio>', {
            src: href,
            'id': 'player',
            'class': 'topbox_html5audio',
            'controls': 'true',
            'playsinline': 'true',
            'preload': 'auto',
            'autoplay': 'true'
          });
          content.html(audioframe);
          $('audio.topbox_html5audio').wrap('<div class="topbox_html5_audio_wrap" />');
        }
  
        // HTML5 video
        else if (href.match(/\.(ogv|mov|webm|mp4)$/i) !== null) {
          var vidframe = $('<video>', {
            src: href,
            'id': 'player',
            'class': 'topbox_html5video',
            'controls': 'true',
            'playsinline': 'true',
            'preload': 'auto',
            'autoplay': 'true'
          });
          content.html(vidframe);
          $('video.topbox_html5video').wrap('<div class="topbox_html5_video_wrap" />');
        }
  
        // iFrame (default)
        else if (link.attr('data-lightbox-type') == 'iframe') {
          var iframe = $('<iframe>', {
            src: href,
            'class': 'topbox_iframe',
            frameborder: 0,
            vspace: 0,
            hspace: 0,
            scrolling: 'auto'
          });
          content.html(iframe);
          $('iframe.topbox_iframe').wrap('<div class="topbox_iframe_wrap" />');
        }
  
        // Video iFrame
        else if (link.attr('data-lightbox-type') == 'video-iframe') {
          var iframe = $('<iframe>', {
            src: href,
            'class': 'topbox_video_iframe',
            frameborder: 0,
            vspace: 0,
            hspace: 0,
            scrolling: 'auto'
          });
          content.html(iframe);
          $('iframe.topbox_video_iframe').wrap('<div class="topbox_video_iframe_wrap" />');
  
        } else {
          return false;
        }
  
        // Set the title
        if (link.attr(this.options.titleSource)) {
          var titleWrap = $('<span>', {
            'id': 'topbox_title',
            'class': 'topbox_title'
          });
          titleWrap.text(link.attr(this.options.titleSource));
          $('.topbox_title_wrap').html(titleWrap);
        } else {
          $('.topbox_title_wrap').html('');
        }
      },
  
      constructLightbox: function() {
        if ($('.topbox_overlay').length) return $('.topbox_overlay');
  
        var overlay = $('<div>', {
          'aria-labelledby': 'topbox_title',
          'role': 'dialog',
          'class': 'topbox_overlay topbox_skin_' + this.options.skin + ' topbox_effect_' + this.options.effect
        });
        var fill = $('<div class="topbox_fill"></div>');
        var wrap = $('<div>', {
          'class': 'topbox_wrapper'
        });
        var content = $('<div>', {
          'class': 'topbox_content'
        });
        var title = $('<div>', {
          'class': 'topbox_title_wrap'
        });
        // Why are we using links here and not buttons? Links permit tab / keybaord focus better
        var nav = $('<a href="#" class="topbox_nav topbox_prev" tabindex="2" title="' + this.options.previousToolTip + '"></a><a href="#" class="topbox_nav topbox_next" tabindex="3" title="' + this.options.nextToolTip + '"></a>');
        var close = $('<a href="#" class="topbox_close" tabindex="1" title="' + this.options.closeToolTip + '"></a>');
  
        overlay.append(fill);
        wrap.append(content);
        wrap.append(title);
        overlay.append(wrap);
        overlay.append(nav);
        overlay.append(close);
        $('body').append(overlay);
  
        var $this = this;
        if ($this.options.clickOverlayToClose) {
          overlay.on('click', function(e) {
            if (e.target === this || $(e.target).hasClass('topbox_wrapper') || $(e.target).hasClass('topbox_content')) {
              $this.destructLightbox();
            }
          });
        }
        if ($this.options.clickImgToClose) {
          overlay.on('click', function(e) {
            if (e.target === this || $(e.target).hasClass('topbox_image')) {
              $this.destructLightbox();
            }
          });
        }
  
        close.on('click', function(e) {
          e.preventDefault();
          $this.destructLightbox();
        });
  
        // Custom close buttons
        $('.topbox_closer').on('click', function(e) {
          e.preventDefault();
          $this.destructLightbox();
        });
  
        // Lock keyboard / tab focus to TopBox (prevents a user being able to tab behind the open lightbox)
        $("*[tabindex]").each(function(i) {
          // Store tabindex as data and change all instances to -1
          $(this).data('tabindex', $(this).attr('tabindex')).attr('tabindex', '-1');
        });
        $(".topbox_overlay *[tabindex]").each(function(index) {
          // Restore any tabindex in TopBox back to their defaults, e.g. close button 1, prev 2, next 3
          $(this).attr('tabindex', $(this).data('tabindex'));
        });
  
        return overlay;
      },
  
      destructLightbox: function() {
        var $this = this;
        this.options.beforeHideLightbox.call(this);
  
        $('.topbox_overlay').removeClass('topbox_open');
        $('.topbox_nav').hide();
        $('body').removeClass('topbox_open topbox_body_effect_' + $this.options.effect);
  
        // Remove click handlers
        $('.topbox_prev').off('click');
        $('.topbox_next').off('click');
  
        // Empty content
        $('.topbox_content').empty();
  
        // Restore tabindex values
        $("*[tabindex]").each(function(i) {
          $(this).attr('tabindex', $(this).data('tabindex'));
        });
  
        this.options.afterHideLightbox.call(this);
      },
  
    };
  
    $.fn[pluginName] = function(options) {
      return this.each(function() {
        if (!$.data(this, pluginName)) {
          $.data(this, pluginName, new TopBox(this, options));
        }
      });
    };
  
    // Start Swipe support
    var addSwipeTo = function(selector) {
      $(selector).swipe("destroy");
      $(selector).swipe({
        swipe: function(event, direction, distance, duration, fingerCount, fingerData) {
          if (direction == "left") {
            $(".topbox_next").trigger("click");
          }
          if (direction == "right") {
            $(".topbox_prev").trigger("click");
          }
        }
      });
    };
  
    $(document).on('click', ".lightbox", function() {
      addSwipeTo(".topbox_overlay");
    });
    // End Swipe support
  
  });