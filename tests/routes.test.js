import test from 'node:test';
import assert from 'node:assert/strict';
import {pickRoute,moods,surroundings,presets} from '../routes.js';
test('all 27 combinations produce the requested duration, atmosphere and route length',()=>{
  let total=0;
  for(const mood of Object.keys(moods))for(const time of [20,40,60])for(const sound of Object.keys(surroundings)){
    const route=pickRoute({mood,time,sound});
    assert.equal(route.time,time);assert.equal(route.sound,surroundings[sound].label);
    assert.equal(route.stops.length,{20:3,40:4,60:5}[time]);
    assert.ok(route.description.includes(moods[mood].phrase));
    assert.equal(new Set(route.stops).size,route.stops.length);total++;
  }
  assert.equal(total,27);
});
test('defaults, form strings, presets and repeat selection',()=>{
  assert.deepEqual(pickRoute(),pickRoute(presets.water));
  assert.equal(pickRoute({time:'20'}).stops.length,3);
  for(const value of Object.values(presets))assert.ok(pickRoute(value).title);
  const original=pickRoute();pickRoute(presets.canal);assert.deepEqual(pickRoute(),original);
});
test('invalid selection is rejected',()=>{
  for(const value of [{mood:'bad'},{sound:'bad'},{time:0},{mood:'__proto__'}])assert.throws(()=>pickRoute(value),RangeError);
});
