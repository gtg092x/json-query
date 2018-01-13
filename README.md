# JSON Conditions

Mongo conditions without mongo.

## Installation

`npm i @hixme/json-conditions --save`

## Usage

```js
import conditions from '@hixme/json-conditions'

const rules = conditions({
    name: 'bob',
});

rules({
    name: 'bob',
    activities: 'walking',
}); // returns true
```

### Custom Ops

```js
import { configure as configureJsonConditions } from '@hixme/json-conditions';

const ops = {
    $icecream: (rule, value) => (rule ? value === 'icecream' : value !== 'icecream'),
};

const conditions = configureJsonConditions({
    ops,
});

const rules = conditions({
    food: {$icecream: true},
});
rules({
    food: 'icecream',
}); // returns true
```

```js'
import conditions from 'json-conditions';

conditions.addOp('$cookie', (rule, value) => (rule ? value === 'cookie' : value !== 'cookie'))

const rules = conditions({
    food: {$cookie: true},
});
rules({
    food: 'cookie',
}); // returns true

conditions.removeOp('$cookie');

rules({
    food: 'cookie',
}); // returns false

```

### Middleware Ops

Returned functions for an ops rule will be called with another function `next`.

Next can be called with the signature `next(<rule>, <value>, [<strict>])`.

- `rule` the rule passed to the op ex. `{$myop: 1}`: `1`
- `value` the value checked in the evaluated object
- `strict` if true, all child rules must be true - if false at least one rule must be true. Default: `true`.

```js
import conditions from '@hixme/json-conditions';

conditions.addOps({
  $square: (rule, value) => next => next(rule, value * value),
});

const rules = conditions({
    score: {$square: {$eq: 9}},
});

rules({
    score: 3,
}); // returns true
```

## API

### conditions

Default export - a rules creator

`conditions(<rules>)`

- `rules` a json object that matches the following options

### {configure}

Returns a custom rules creator.

`configure({<config>})`

-  `config` an object that can contain the following properties
  - `config.ops` an object with additional rule ops.
  - `config.getter` a custom getter for an object property. Defaults to `lodash.get`

### rules creator

#### `addOp()` adds an op or ops

```js
conditions.addOp({$twiceAsBig: (rule, value) => value * 2 === rule });
// or
conditions.addOp('$twiceAsBig', (rule, value) => value * 2 === rule)
const rules = conditions({
  $twiceAsBig: 10,
});
rules(20) // true
rules(10) // false
```

#### `removeOp()` removes an op or ops

```js
conditions.removeOp({$twiceAsBig: true });
// or
conditions.removeOp('$twiceAsBig');
// or
conditions.removeOp(['$twiceAsBig']);
const rules = conditions({
  $twiceAsBig: 10,
});
rules(20) // false
```

### $and

```js
const rules = conditions({$and: [{$gt: 1}, {$lt: 10}]})
rules(4) // true
rules(40) // false
```

### $or

```js
const rules = conditions({$or: [{$lt: 10}, {$gt: 20}]})
rules(4) // true
rules(40) // true
rules(15) // false
```

```js
const rules = conditions({$or: {
    name: 'bob',
    food: 'sushi',
}})
rules({name: 'bob'}) // true
rules({food: 'sushi'}) // true
rules({name: 'randy'}) // false
```

### $not

```js
const rules = conditions({$not: {$lt: 10}})
rules(20) // true
rules(4) // false
```

### $gt

```js
const rules = conditions({$gt: 10})
rules(20) // true
rules(10) // false
rules(4) // false
```

### $gte

```js
const rules = conditions({$gte: 10})
rules(20) // true
rules(10) // true
rules(4) // false
```

### $lt

```js
const rules = conditions({$lt: 10})
rules(20) // false
rules(10) // false
rules(4) // true
```

### $lte

```js
const rules = conditions({$lte: 10})
rules(20) // false
rules(10) // true
rules(4) // true
```

### $eq

```js
const rules = conditions({$eq: 10})
rules(20) // false
rules(10) // true
```

### $exact

Value must match rules exactly

```js
const rules = conditions({$exact: {hi: 'mom'}})
rules({hi: 'mom'}) // true
rules({hi: 'mom', bye: 'dad'}) // false
```

### $ne

```js
const rules = conditions({$ne: 10})
rules(10) // false
rules(20) // true
```

### $like

Case sensitive match

```js
const rules = conditions({$like: 'Bob%'})
rules('bob') // false
rules('Bobby') // true
rules('randy') // false
```

### $regex

RegeExp match

```js
const rules = conditions({$regex: '^b.*'})
rules('bob') // true
rules('randy') // false
```

Or just use a regular expression

```js
const rules = conditions(/^b.*/)
rules('bob') // true
rules('randy') // false
```

### $ilike

Case insensitive match

```js
const rules = conditions({$like: 'Bob%'})
rules('bob') // true
rules('Bobby') // true
rules('randy') // false
```

### $oneOf

```js
const rules = conditions({$oneOf: ['hello', 'world']})
rules('hello') // true
rules('world') // true
rules('bob') // false
```

### $includes

```js
const rules = conditions({$includes: 'bob'})
rules(['hello', 'world']) // false
rules(['bill', 'bob']) // true
```
