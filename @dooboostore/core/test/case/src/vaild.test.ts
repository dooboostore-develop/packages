import {describe} from "node:test";
import {ValidUtils} from "../../../src";
import assert from "node:assert/strict";

describe('vaild test', () => {

  describe('vaild Utils Test', () => {
    console.log('--- Running vaild Utils Test ---');
    const test = function (){}
    class TestClass {

    }



    console.log('isClassType', ValidUtils.isClassType(test));
    console.log('isClassType', ValidUtils.isClassType(TestClass));
    console.log('isFunction', ValidUtils.isFunctionType(()=>1));
    console.log('isFunction', ValidUtils.isFunctionType(function(){}));
    console.log('isFunction', ValidUtils.isFunctionType(test));
    console.log('isFunction', ValidUtils.isFunctionType(TestClass));
    // console.log('isConstructor', ValidUtils.isConstructor(()=>1));
    // console.log('isConstructor', ValidUtils.isConstructor(function(){}));
    // console.log('isConstructor', ValidUtils.isConstructor(test));
    // console.log('isConstructor', ValidUtils.isConstructor(TestClass));
    // assert(ValidUtils.isFunction(test) === true);
    // assert(ValidUtils.isFunction(TestClass)===true);

  })
})