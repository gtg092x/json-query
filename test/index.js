import { assert } from 'chai'
import conditions, { configure } from '../src/index'

describe('Conditions.', () => {
  it('extra ops', () => {
    const ops = {
      $icecream: (rule, arg) => rule ? arg === 'icecream' : arg !== 'icecream',
    };
    const conds = configure({
      ops,
    });
    let rules = conds({
      food: {$icecream: true},
    });
    assert(rules({food: 'icecream'}));
    rules = conds({
      food: {$icecream: false},
    });
    assert(rules({food: 'sandwich'}));

    rules = conds({
      score: {$square: {$eq: 9}},
    });
    assert(!rules({score: -3}));
    conds.addOp({
      $square: (rule, arg) => next => next(rule, arg * arg),
    });
    assert(rules({score: -3}));
    conds.removeOp('$square');
    assert(!rules({score: -3}));
    conds.addOp({
      $square: (rule, arg) => next => next(rule, arg * arg),
    });
    assert(rules({score: -3}));
    conds.removeOp(['_', '$square']);
    assert(!rules({score: -3}));
    conds.addOp({
      $square: (rule, arg) => next => next(rule, arg * arg),
    });
    assert(rules({score: -3}));
    conds.removeOp({
      $square: 1,
      $icecream: 0,
    });
    assert(!rules({score: -3}));
    rules = conds({
      food: {$icecream: true},
    });
    assert(rules({food: 'icecream'}));
  });
  it('square cond', () => {
    conditions.addOps({
      $square: (rule, value) => next => next(rule, value * value),
    });
    const rules = conditions({
      score: {$square: 9},
    });
    assert(rules({
      score: 3,
    }));
  });
  it('bob', () => {
    const rules = conditions({
      name: 'bob',
    });
    assert(rules({name: 'bob', activities: 'walking'}));
  });
  it('bobgex', () => {
    const rules = conditions({
      name: /^b.*/,
    });
    assert(rules({name: 'bob'}));
  });
  it('regex', () => {
    const rules = conditions({ $regex: '^b.*' });
    assert(rules('bob'));
    assert(!rules('randbob'));
  });
  it('and vals', () => {
    const rules = conditions({$and: [{$gt: 1}, {$lt: 10}]});
    assert(rules(4), '4 and');
    assert(!rules(40), '40 and');
  });
  it('upper', () => {
    const rules = conditions({$upper: {$eq: 'HI'}});
    assert(rules('hi'), 'upper hi');
  });
  it('lower', () => {
    const rules = conditions({$lower: {$eq: 'hi'}});
    assert(rules('HI'), 'lower hi');
  });
  it('dot accessor', () => {
    const rules = conditions({'name.first': 'matt'});
    assert(rules({name: {first: 'matt'}}), 'matt dot');
    assert(!rules({name: {first: 'bob'}}), 'bob dot');
  });
  it('object val mismiatch', () => {
    const rules = conditions({name: 'bob'});
    assert(!rules(4), '4 val obj');
  });
  it('or object', () => {
    const rules = conditions({
      $or: {
        name: 'bob',
        food: 'sushi',
      }
    });
    assert(rules({food: 'sushi'}), 'or sushi');
    assert(rules({name: 'bob'}), 'or bob');
    assert(!rules({name: 'matt'}), 'or not matt');
  });
  it('or vals', () => {
    const rules = conditions({$or: [{$lt: 10}, {$gt: 20}]});
    assert(rules(4), '4 or');
    assert(rules(40), '40 or');
    assert(!rules(15), '15 or');
  });
  it('not vals', () => {
    const rules = conditions({$not: {$lt: 10}});
    assert(!rules(4), '4 not');
    assert(rules(40), '40 not');
  });
  it('functions', () => {
    const rules = conditions({
      hello: val => val === 'world',
    });
    assert(rules({hello: 'world'}));
  });
  it('value functions', () => {
    const rules = conditions({
      hello: 'world',
    });
    assert(rules({hello: () => 'world'}));
  });
  it('gt', () => {
    const rules = conditions({$gt: 1});
    assert(rules(2));
    assert(!rules(-1));
    assert(!rules(1));
  });
  it('gte', () => {
    const rules = conditions({$gte: 1});
    assert(rules(2));
    assert(!rules(-1));
    assert(rules(1));
  });
  it('lte', () => {
    const rules = conditions({$lte: 1});
    assert(!rules(2));
    assert(rules(-1));
    assert(rules(1));
  });
  it('lt', () => {
    const rules = conditions({$lt: 1});
    assert(!rules(2));
    assert(rules(-1));
    assert(!rules(1));
  });
  it('lt date coercion', () => {
    const myBday = new Date('1986-02-13');
    const beforeThat = new Date('1976-02-13');
    const rules = conditions({$gt: myBday});
    assert(rules(new Date()));
    assert(!rules(beforeThat));
  });
  it('oneOf', () => {
    const rules = conditions({$oneOf: [10, 11, 12]});
    assert(rules(10));
    assert(!rules(9));
  });
  it('includes', () => {
    const rules = conditions({$includes: 10});
    assert(rules([10, 11, 12]));
    assert(!rules([1]));
  });
  it('exact', () => {
    const rules = conditions({$exact: {hi: 'mom', bye: 'dad'}});
    assert(rules({hi: 'mom', bye: 'dad'}));
    assert(!rules({hi: 'mom', bye: 'dad', ciao: 'bella'}));
  });
  it('deep includes', () => {
    const rules = conditions({
      world: {$includes: 10}
    });
    assert(rules({
      world: [10, 11, 12]
    }));
    assert(!rules({
      world: [1, 111, 112]
    }));
  });
  it('dates', () => {
    const now = new Date();
    const rules = conditions(now);
    assert(rules(now));
  });
  it('default and', () => {
    const rules = conditions({$like: '%ld', $not: 'old'});
    assert(rules('world'));
    assert(!rules('old'));
  });
  it('value rules', () => {
    const rules = conditions('world');
    assert(rules('world'));
    assert(!rules('old'));
  });
  it('and value', () => {
    const rules = conditions({$and: [
      {$like : 'wor%'},
      {$like : '%ld'},
    ]});
    assert(rules('world'));
    assert(!rules('worry'));
  });
  it('and object', () => {
    const rules = conditions({$and: [
      {hello: {$like : 'wor%'}},
      {hello: {$like : '%ld'}},
    ]});
    assert(rules({hello: 'world'}));
    assert(!rules({hello: 'worry'}));
  });
  it('and deep', () => {
    const rules = conditions({hello: {
      $and: [
        {$like : 'wor%'},
        {$like : '%ld'},
      ]
    }});
    assert(rules({hello: 'world'}));
    assert(!rules({hello: 'worry'}));
  });

  it('or value', () => {
    const rules = conditions({$or: [
      {$like : 'wor%'},
      {$like : '%ld'},
    ]});
    assert(rules('world'));
    assert(rules('old'));
    assert(!rules('red'));
  });
  it('or object', () => {
    const rules = conditions({$or: [
      {hello: {$like : 'wor%'}},
      {hello: {$like : '%ld'}},
    ]});
    assert(rules({hello: 'world'}));
    assert(rules({hello: 'old'}));
    assert(!rules({hello: 'red'}));
  });
  it('or deep', () => {
    const rules = conditions({hello: {
      $or: [
        {$like : 'wor%'},
        {$like : '%ld'},
      ]
    }});
    assert(rules({hello: 'world'}));
    assert(rules({hello: 'old'}));
    assert(!rules({hello: 'red'}), 'not red');
  });
  it('object eq', () => {
    const rules = conditions({hello: {$eq : 'world'}});
    assert(rules({hello: 'world'}));
  });
  it('object neq', () => {
    const rules = conditions({hello: {$ne : 'world'}});
    assert(rules({hello: 'mom'}));
    assert(!rules({hello: 'world'}));
  });
  it('like', () => {
    const rules = conditions({hello: {$like : 'wor%'}});
    assert(rules({hello: 'world'}));
    assert(rules({hello: 'worry'}));
  });
  it('deep like', () => {
    const rules = conditions({hello: {$not: {$like : 'wor%'}}});
    assert(!rules({hello: 'world'}));
    assert(!rules({hello: 'worry'}));
  });
  it('deep deep like', () => {
    const rules = conditions({hello: {$not: {$not: {$like : 'wor%'}}}});
    assert(rules({hello: 'world'}));
    assert(rules({hello: 'worry'}));
  });
  it('value', () => {
    const rules = conditions({$eq: 10});
    assert(rules(10));
  });
  it('not value', () => {
    const rules = conditions({$ne: 10});
    assert(!rules(10));
  });
  it('deep - like crazy deep', () => {
    const rules = conditions({
      hello: 'world',
      hi: {$oneOf: ['mom', 'dad', 'bob']},
      name: {
        first: {$ne: 'matt'}
      },
      home: {
        $not: {
          city: 'LA'
        }
      },
      food: {
        $ilike: 'SUSHI'
      }
    });
    assert(rules({
      hello: 'world',
      hi: 'mom',
      name: {first: 'bob'},
      home: {city: 'ATL'},
      food: 'sushi'
    }));
    assert(!rules({
      hello: 'world',
      hi: 'mom',
      name: {first: 'matt'},
      home: {city: 'LA'}
    }));
  });
});
