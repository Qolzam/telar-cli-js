/* eslint-disable @typescript-eslint/no-explicit-any */
// based on https://github.com/TehShrike/deepmerge
// MIT License
// Copyright (c) 2012 - 2022 James Halliday, Josh Duff, and other contributors of deepmerge

const JSON_PROTO = Object.getPrototypeOf({})

type Options = {
  all?: boolean
  cloneProtoObject?: (obj: any) => any
  mergeArray?: (args: {
    clone: (entry: any) => any
    deepmerge: (target: any, source: any) => any
    getKeys: (value: any) => string[]
    isMergeableObject: (value: any) => boolean
  }) => (target: any[], source: any[]) => any[]
  symbols?: boolean
}

function deepmergeConstructor(options?: Options) {
  // eslint-disable-next-line unicorn/consistent-function-scoping
  function isNotPrototypeKey(value: string): boolean {
    return value !== 'constructor' && value !== 'prototype' && value !== '__proto__'
  }

  function cloneArray(value: any[]): any[] {
    const result = Array.from({length: value.length})
    for (const [i, element] of value.entries()) {
      result[i] = clone(element)
    }

    return result
  }

  function cloneObject(target: any): any {
    const result: any = {}

    if (cloneProtoObject && Object.getPrototypeOf(target) !== JSON_PROTO) {
      return cloneProtoObject(target)
    }

    const targetKeys = getKeys(target)
    for (const key of targetKeys) {
      if (isNotPrototypeKey(key as string)) {
        result[key] = clone(target[key])
      }
    }

    return result
  }

  function concatArrays(target: any[], source: any[]): any[] {
    const result = Array.from({length: target.length + source.length})
    for (const [i, element] of target.entries()) {
      result[i] = clone(element)
    }

    for (const [i, element] of source.entries()) {
      result[i + target.length] = clone(element)
    }

    return result
  }

  const {propertyIsEnumerable} = Object.prototype
  function getSymbolsAndKeys(value: any): (string | symbol)[] {
    const result = Object.keys(value)
    const keys = Object.getOwnPropertySymbols(value)
    for (const key of keys) {
      if (propertyIsEnumerable.call(value, key)) {
        result.push(key as unknown as string)
      }
    }

    return result
  }

  const getKeys: any = options?.symbols ? getSymbolsAndKeys : Object.keys

  const cloneProtoObject = options?.cloneProtoObject

  // eslint-disable-next-line unicorn/consistent-function-scoping
  function isMergeableObject(value: any): boolean {
    return typeof value === 'object' && value !== null && !(value instanceof RegExp) && !(value instanceof Date)
  }

  // eslint-disable-next-line unicorn/consistent-function-scoping
  function isPrimitive(value: any): boolean {
    return typeof value !== 'object' || value === null
  }

  const isPrimitiveOrBuiltIn =
    typeof Buffer === 'undefined'
      ? (value: any) => typeof value !== 'object' || value === null || value instanceof RegExp || value instanceof Date
      : (value: any) =>
          typeof value !== 'object' ||
          value === null ||
          value instanceof RegExp ||
          value instanceof Date ||
          value instanceof Buffer

  const mergeArray = options?.mergeArray
    ? options.mergeArray({clone, deepmerge: _deepmerge, getKeys, isMergeableObject})
    : concatArrays

  function clone(entry: any): any {
    return isMergeableObject(entry) ? (Array.isArray(entry) ? cloneArray(entry) : cloneObject(entry)) : entry
  }

  function mergeObject(target: any, source: any): any {
    const result: any = {}
    const targetKeys = getKeys(target)
    const sourceKeys = getKeys(source)
    for (const key of targetKeys) {
      if (isNotPrototypeKey(key as string) && !sourceKeys.includes(key)) {
        result[key] = clone(target[key])
      }
    }

    for (const key of sourceKeys) {
      if (isNotPrototypeKey(key as string)) {
        result[key] = key in target ? _deepmerge(target[key], source[key]) : clone(source[key])
      }
    }

    return result
  }

  function _deepmerge(target: any, source: any): any {
    const sourceIsArray = Array.isArray(source)
    const targetIsArray = Array.isArray(target)

    if (isPrimitive(source)) {
      return source
    }

    if (isPrimitiveOrBuiltIn(target)) {
      return clone(source)
    }

    if (sourceIsArray && targetIsArray) {
      return mergeArray(target, source)
    }

    if (sourceIsArray !== targetIsArray) {
      return clone(source)
    }

    return mergeObject(target, source)
  }

  function _deepmergeAll(...args: any[]): any {
    if (args.length === 0) {
      return {}
    }

    if (args.length === 1) {
      return clone(args[0])
    }

    if (args.length === 2) {
      return _deepmerge(args[0], args[1])
    }

    let result: any = args[0]
    for (let i = 1; i < args.length; ++i) {
      result = _deepmerge(result, args[i])
    }

    return result
  }

  return options?.all ? _deepmergeAll : _deepmerge
}

export default deepmergeConstructor
export {deepmergeConstructor as deepmerge}
