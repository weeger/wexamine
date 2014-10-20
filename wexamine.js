/**
 * wexamine v1.0.1
 *
 * Copyright Romain WEEGER 2014
 * http://www.wexample.com
 * 
 * Licensed under the MIT and GPL licenses :
 * 
 *  - http://www.opensource.org/licenses/mit-license.php
 *  - http://www.gnu.org/licenses/gpl.html
 */
(function () {
  'use strict';
  // <--]
  var WexamineProto = function () {
    this.variablesCache = {};
    this.extendPasses = false;
    this.extendPassesRecursionKey = '__recursion__';
    this.version = '1.0.1';
  };

  WexamineProto.prototype = {
    windowVariablePreventWarning: [
      'webkitStorageInfo'
    ],

    /**
     * This is a fork of jQuery's extend.
     * @returns {*|{}}
     */
    extend: function () {
      if (!Array.isArray(this.extendPasses)) {
        this.extendPasses = [];
      }
      // Make a copy of arguments to avoid JS inspector hints.
      var to_add, name, copy_is_array, clone,
      // The target object who receive parameters
      // form other objects.
        target = arguments[0] || {},
      // Index of first argument to mix to target.
        i = 1,
      // Mix target with all function arguments.
        length = arguments.length,
      // Define if we merge object recursively.
        deep = false;

      // Handle a deep copy situation.
      if (typeof target === 'boolean') {
        deep = target;
        // Skip the boolean and the target.
        target = arguments[ i ] || {};
        // Use next object as first added.
        i += 1;
      }

      // Handle case when target is a string or something (possible in deep copy)
      if (typeof target !== 'object' && typeof target !== 'function') {
        target = {};
      }

      // Loop trough arguments.
      for (false; i < length; i += 1) {
        // Only deal with non-null/undefined values
        if ((to_add = arguments[i]) !== null) {
          this.extendPasses.push(arguments[i]);
          for (name in to_add) {
            // Extend the base object.
            // We do not wrap for loop into hasOwnProperty,
            // to access to all values of object.
            // Prevent never-ending loop.
            if (this.windowIgnore(name, to_add) || target === to_add[name]) {
              continue;
            }
            // check if object is not equal to itself or to another
            // parent objects saved into extendPass variable.
            if (typeof to_add[name] === 'object' && this.extendPasses.indexOf(to_add[name]) !== -1) {
              target[name] = this.extendPassesRecursionKey;
            }
            // Recurse if we're merging plain objects or arrays.
            else if (deep && to_add[name] && (this.isPlainObject(to_add[name]) || (copy_is_array = Array.isArray(to_add[name])))) {
              if (copy_is_array) {
                copy_is_array = false;
                clone = target[name] && Array.isArray(target[name]) ? target[name] : [];
              }
              else {
                clone = target[name] && this.isPlainObject(target[name]) ? target[name] : {};
              }
              // Never move original objects, clone them.
              target[name] = this.extend(deep, clone, to_add[name]);
            }
            // Don't bring in undefined values.
            else if (to_add[name] !== undefined) {
              target[name] = to_add[name];
            }
          }
          this.extendPasses.splice(this.extendPasses.indexOf(arguments[i]), 1);
        }
      }
      return target;
    },

    globalVariableIgnore: function (variable) {
      return variable === window ||
        variable === window.document ||
        // Do no scan wexamine.
        variable === this;
    },

    /**
     * Check to see if an object is a plain object
     * (created using "{}" or "new Object").
     * Forked from jQuery.
     * @param obj
     * @returns {boolean}
     */
    isPlainObject: function (obj) {
      // Not plain objects:
      // - Any object or value whose internal [[Class]] property is not "[object Object]"
      // - DOM nodes
      // - window
      if (obj === null || typeof obj !== "object" || obj.nodeType || (obj !== null && obj === obj.window)) {
        return false;
      }
      // Support: Firefox <20
      // The try/catch suppresses exceptions thrown when attempting to access
      // the "constructor" property of certain host objects, ie. |window.location|
      // https://bugzilla.mozilla.org/show_bug.cgi?id=814622
      try {
        if (obj.constructor && !this.hasOwnProperty.call(obj.constructor.prototype, "isPrototypeOf")) {
          return false;
        }
      } catch (e) {
        return false;
      }
      // If the function hasn't returned already, we're confident that
      // |obj| is a plain object, created by {} or constructed with new Object
      return true;
    },

    variableSnap: function (name, object) {
      this.variablesCache[name] = this.extend(true, {}, object);
    },

    variableCheck: function (name, object, ignore, output) {
      output = output === undefined ? {} : output;
      ignore = (ignore === undefined) ? [] : ignore;
      this.variablesDiff(this.variablesCache[name], object, ignore, output, 0, name);
      return output;
    },

    changeLog: function (name, object, ignore) {
      this.log(this.variableCheck(name, object, ignore));
    },

    variablesDiff: function (objectA, objectB, ignore, output, level, trace) {
      var typeofA,
        typeofB,
        passed = {},
        i;

      output = (output === undefined) ? [] : output;
      trace = (trace === undefined) ? 'root' : trace;
      level = (level === undefined) ? 0 : level;

      // Trace has been declared into ignore variables.
      if (Array.isArray(ignore) && ignore.indexOf(trace) !== -1) {
        return output;
      }

      // Objects are identical, or one of them has been saved as a recursion.
      if (objectA === objectB || objectA === this.extendPassesRecursionKey || objectB === this.extendPassesRecursionKey) {
        return output;
      }

      typeofA = typeof objectA;
      typeofB = typeof objectB;

      if (typeofA !== typeofB) {
        output[trace] = 'object type changed : ' + typeofA +
          (typeofA === 'string' || typeofA === 'number' ? ' (' + objectA + ')' : '') +
          ' to ' + typeofB +
          (typeofB === 'string' || typeofB === 'number' ? ' (' + objectB + ')' : '') + '.';
      }
      else if (typeofB === 'object') {

        for (i in objectA) {
          if (objectA.hasOwnProperty(i) &&
            // Ignore from window key
            !this.windowIgnore(i, objectA) && !this.windowIgnore(i, objectB) &&
            // Ignore global objects.
            !this.globalVariableIgnore(objectA[i]) && !this.globalVariableIgnore(objectB[i])) {
            output = this.extend(output, this.variablesDiff(objectA[i], objectB[i], ignore, output, level + 1, trace + '.' + i), true);
            passed[i] = true;
          }
        }

        for (i in objectB) {
          if (objectB.hasOwnProperty(i) &&
            // Ignore from window key
            !this.windowIgnore(i, objectA) && !this.windowIgnore(i, objectB) &&
            // Ignore global objects.
            !this.globalVariableIgnore(objectA[i]) && !this.globalVariableIgnore(objectB[i]) && !passed.hasOwnProperty(i)) {
            output = this.extend(output, this.variablesDiff(objectA[i], objectB[i], ignore, output, level + 1, trace + '.' + i), true);
          }
        }
      }
      else if (objectA !== objectB) {
        output[trace] = 'object value changed : "' + objectA + '" to "' + objectB + '".';
      }

      return output;
    },

    /**
     * Some access to vars can generate warnings into debug consoles,
     * we avoid warnings to keep a more visible log.
     */
    windowIgnore: function (variableKey, object) {
      object = object === undefined ? window : object;
      return (object === window && this.windowVariablePreventWarning.indexOf(variableKey) !== -1);
    },

    /**
     * Cache window object.
     */
    windowSnap: function () {
      var i;
      // Create an object containing current window data.
      this.windowCache = {};
      for (i in window) {
        // We do not check hasOwnProperty.
        if (this.windowIgnore(i)) {
          this.windowCache[i] = i;
        }
      }
      // Second pass with variables_init.
      this.variableSnap('window', window);
    },

    /**
     * Check length of window object.
     */
    windowCheck: function () {
      var i, output = {};
      for (i in window) {
        // We do not check hasOwnProperty.
        if (!this.windowCache.hasOwnProperty(i) && this.windowIgnore(i)) {
          output[i] = 'window[' + i + '] object not deleted on tearDown (non deep check)';
        }
      }
      // Second pass with variables_exit.
      return this.variableCheck('window', window, undefined, output);
    },

    windowChangeLog: function () {
      this.log(this.windowCheck());
    },

    resultToArray: function (result) {
      var i, output = [];
      for (i in result) {
        if (result.hasOwnProperty(i)) {
          output.push('wexamine> ' + i + ': ' + result[i]);
        }
      }
      return output;
    },

    log: function (result) {
      // Convert result to array.
      result = this.resultToArray(result);
      // Display array in console.
      var i, length = result.length;
      for (i = 0; i < length; i++) {
        window.console.log(result[i]);
      }
    }
  };
  // Create a separated object avoid recursions
  // on sanitizing wexam object.
  window.wexamine = new WexamineProto();
  // [-->
}());