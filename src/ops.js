import {
  isDate,
  isNumber,
  isString,
  isEmpty,
  isEqual,
  isRegExp,
} from 'lodash';
import { isMatch } from 'micromatch';

function coerce(rule, val) {
  if (isNumber(val)) {
    return Number(rule);
  }
  if (isDate(val)) {
    return new Date(rule).getTime();
  }
  return rule;
}

function toCompare(val) {
  if (isDate(val)) {
    return val.getTime();
  }
  return val;
}

const toLower = str => (isString(str) ? str.toLowerCase() : str);

export const $and = (rules, values) => next => next(rules, values, true);
export const $or = (rules, values) => next => next(rules, values, false);
export const $not = (rules, values) => next => !next(rules, values, true);
export const $lower = (rules, values) =>
    next => isString(values) && next(rules, values.toLowerCase(), true);
export const $upper = (rules, values) =>
    next => isString(values) && next(rules, values.toUpperCase(), true);
export const $gte = (rule, val) => toCompare(val) >= coerce(rule, val);
export const $gt = (rule, val) => toCompare(val) > coerce(rule, val);
export const $lt = (rule, val) => toCompare(val) < coerce(rule, val);
export const $lte = (rule, val) => toCompare(val) <= coerce(rule, val);
export const $eq = (rule, val) => coerce(rule, val) === toCompare(val);
export const $exact = (rules, values) => isEqual(rules, values);
export const $exists = (rule, val) => val !== undefined;
export const $empty = (rule, val) => isEmpty(val);
export const $null = (rule, val) => val === null;
export const $ilike = (rule, val) => next => next({ $like: toLower(rule) }, toLower(val));
export const $regex = (rule, val) =>
    isString(val) && (isString(rule) || isRegExp(rule)) && !!val.match(new RegExp(rule));
export const $like = (rule, val) => isString(rule) && isString(val) &&
    isMatch(val, rule.replace(/%/g, '*'));
export const $includes = (rule, val) =>
  (Array.isArray(val) ? val.includes(rule) : [val].includes(rule));
export const $oneOf = (rule, val) => rule.includes(val);
export const $ne = (rule, val) => coerce(rule, val) !== val;
