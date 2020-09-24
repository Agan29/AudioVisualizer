/*
 * @Author: Agan
 * @Date: 2020-09-22 00:57:39
 * @LastEditors: Agan
 * @LastEditTime: 2020-09-23 00:15:05
 * @Description: 
 */

const { resolveModuleName } = require('ts-pnp');

exports.resolveModuleName = (
  typescript,
  moduleName,
  containingFile,
  compilerOptions,
  resolutionHost
) => {
  return resolveModuleName(
    moduleName,
    containingFile,
    compilerOptions,
    resolutionHost,
    typescript.resolveModuleName
  );
};

exports.resolveTypeReferenceDirective = (
  typescript,
  moduleName,
  containingFile,
  compilerOptions,
  resolutionHost
) => {
  return resolveModuleName(
    moduleName,
    containingFile,
    compilerOptions,
    resolutionHost,
    typescript.resolveTypeReferenceDirective
  );
};
