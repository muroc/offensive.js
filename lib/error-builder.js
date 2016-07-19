'use strict';

var Assertion = require('./classes/assertion').default;
var UnaryOperator = require('./classes/unary-operator').default;
var Types = require('./utils/types');

module.exports.default = ErrorBuilder;

// code that builds error message is invoked only when assertion fails
// performace is not a concern here
function ErrorBuilder(context) {
  var that = Object.create(ErrorBuilder.prototype);
  that.context = context;
  that.assertions = [];
  return that;
}

ErrorBuilder.prototype = {
  addMessages: function addMessages(assertions) {
    this.assertions = this.assertions.concat(assertions);
    return this;
  },

  build: function build() {
    var groupByName = groupByVariableName.bind(null, this.context);
    var toString = groupToString.bind(null, this.context);

    var message = this.assertions
      .reduce(replaceEmptyWithChildren, [])
      .reduce(mergeWithOperators(), [])
//      .map(tee.bind(null, console.log))
      .reduce(removeDuplicates, [])
      .reduce(groupByName, [])
      .reduce(function(builder, group) { return builder + toString(group); }, '');

    return new Error(message);
  },
};

function removeDuplicates(retVal, assertion) {
  if (retVal.length === 0 || retVal[retVal.length - 1].message !== assertion.message) {
    retVal.push(assertion);
  }
  return retVal;
}

function replaceEmptyWithChildren(retVal, group) {
  if (group.message && group.message.length !== 0) {
    retVal.push(group);
  } else {
    group.done.reduce(replaceEmptyWithChildren, retVal);
  }
  return retVal;
}

function mergeWithOperators() {
  var unary = [];
  var binary = null;

  return function(retVal, assertionOrOperator) {
    if (assertionOrOperator instanceof Assertion) {
      var assertion = assertionOrOperator;
      assertion.operators = { unary: unary, binary: binary };
      unary = [];
      binary = null;
      retVal.push(assertion);
      return retVal;
    }

    var operator = assertionOrOperator;
    if (operator instanceof UnaryOperator) {
      unary.push(operator.message);
      return retVal;
    }

    if (binary) {
      throw new Error('BUG! Two binary operators before one assertion.');
    }
    binary = operator.message;
    return retVal;
  };
}

function groupByVariableName(context, retVal, assertion) {
  var name = assertion.getter.name(context);
  var current = retVal.length === 0? createGroup(assertion): retVal.pop();
  var currentName = current.getter.name(context);
  if (name !== currentName) {
    retVal.push(current);
    current = createGroup(assertion);
  }
  var operators = operatorsToString(assertion.operators).full;
  var message = ensureArray(assertion.message).join(' ');
  current.message.push(operators + message);
  current.result &= assertion.result;
  retVal.push(current);
  return retVal;
}

function createGroup(assertion) {
  // has the same properties as assertion
  var group = {
    operators: assertion.operators,
    getter: assertion.getter,
    message: [],
    result: true,
  };
  assertion.operators = { unary: [], binary: '' };
  return group;
}

function groupToString(context, group) {
  var operators = operatorsToString(group.operators);
  if (operators.binary) {
    operators.binary = ' '+ operators.binary;
  }
  var name = group.getter.name(context);
  var conditions = group.message.join(' ');
  var value = group.getter.value(context);
  var retVal = operators.binary + name +' must be '+ operators.unary + conditions +'; got '+ value;
  return retVal;
}

function operatorsToString(operators) {
  var unary = operators.unary.join(' ');
  if (unary.length) {
    unary += ' ';
  }
  var binary = operators.binary || '';
  if (binary.length) {
    binary += ' ';
  }
  return {
    binary: binary,
    unary: unary,
    full: binary + unary,
  };
}

function ensureArray(value) {
  return Types.isArray(value)? value: [ value ];
}

// debugging

/* eslint-disable no-unused-vars */

function tee(func, group) {
  func(group);
  return group;
}

function pipe() {
  var pipeline = [].slice.call(arguments);

  return function(initialArg) {
    return pipeline.reduce(function(arg, filter) { return filter(arg); }, initialArg);
  };
}

/*
  eslint-env node
 */
