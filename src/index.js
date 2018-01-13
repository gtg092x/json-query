import {
  isPlainObject,
  isFunction,
  get,
  isRegExp,
} from 'lodash';
import * as OPS from './ops';

function baseOp(ops, key, rule, value, next = () => true) {
  const result = ops[key](rule, value);
  if (isFunction(result)) {
    return result(next);
  }
  return result;
}

function baseIsOp(ops, key) {
  return ops[key];
}

export function configure({
  ops = {},
  getter = get,
} = {}) {
  const allOps = {
    ...OPS,
    ...ops,
  };
  const op = baseOp.bind(this, allOps);
  const isOp = baseIsOp.bind(this, allOps);

  const addOp = (cmd, fn) => {
    if (isPlainObject(cmd)) {
      return Object.assign(allOps, cmd);
    }
    return addOp({
      [cmd]: fn,
    });
  };

  const removeOp = (cmd) => {
    if (Array.isArray(cmd)) {
      cmd.forEach(removeOp);
      return;
    }
    if (isPlainObject(cmd)) {
      Object.keys(cmd).filter(k => !!cmd[k]).forEach(removeOp);
      return;
    }
    delete allOps[cmd];
  };

  const check = (rules, values, and = true) => {
    if (isFunction(rules)) {
      return rules(values, and);
    }
    if (isFunction(values)) {
      return check(rules, values(rules, and), and);
    }
    const method = and ? 'every' : 'some';
    if (Array.isArray(rules)) {
      return rules[method](rule => check(rule, values));
    }
    if (isRegExp(rules)) {
      return op('$regex', rules, values, check);
    }
    if (!isPlainObject(rules)) {
      return op('$eq', rules, values, check);
    }
    return Object.keys(rules)[method]((key) => {
      if (isOp(key)) {
        return op(key, rules[key], values, check);
      }
      const gotVal = getter(values, key);
      if (gotVal !== undefined) {
        return check(rules[key], gotVal);
      }
      return false;
    });
  };

  const jsonRules = function setJsonRules(baseRules) {
    return values => check(baseRules, values);
  };
  jsonRules.addOp = addOp;
  jsonRules.addOps = addOp;
  jsonRules.removeOp = removeOp;
  jsonRules.removeOps = removeOp;
  return jsonRules;
}

export default configure();
