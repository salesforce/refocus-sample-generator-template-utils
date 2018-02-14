/**
 * utils/testUtils.js
 */
const rce = require('@salesforce/refocus-collector-eval');
const exec = require('child_process').exec;
const projectName = require('../package.json').name;
const fs = require('fs-extra');

module.exports = {
  assignContext(ctx, def) {
    if (!ctx || !def) return;

    Object.keys(ctx).forEach((key) => {
      if (!def[key]) {
        throw new Error(
          `context variable "${key}" was passed to the function but is not ` +
          `defined in the contextDefinition`
        );
      }
    });

    Object.keys(def).forEach((key) => {
      if (!ctx[key] && def[key].required) {
        throw new Error(
          `contextDefinition.${key} is marked as required but was not included ` +
          `when calling this function`
        );
      }

      if (!ctx[key] && def[key].default) {
        ctx[key] = def[key].default;
      }
    });
  }, // assignContext

  buildTransform() {
    return new Promise((resolve, reject) => {
      exec('sgtu-build-transform', (err) => {
        if (err) reject(err);
        resolve();
      });
    });
  }, // buildTransform

  buildConnection() {
    return new Promise((resolve, reject) => {
      exec('sgtu-build-connection', (err) => {
        if (err) reject(err);
        resolve();
      });
    });
  }, // buildConnection

  prepareUrl(ctx, aspects, subjects) {
    const sgt = fs.readJsonSync(`./${projectName}.json`);
    this.assignContext(ctx, sgt.contextDefinition);
    return rce.prepareUrl(ctx, aspects, subjects, sgt.connection, true);
  }, // prepareUrl

  prepareHeaders(ctx) {
    const sgt = fs.readJsonSync(`./${projectName}.json`);
    this.assignContext(ctx, sgt.contextDefinition);
    return rce.prepareHeaders(sgt.connection.headers, ctx);
  }, // prepareHeaders

  doTransform(ctx, aspects, subj, res) {
    const sgt = fs.readJsonSync(`./${projectName}.json`);
    this.assignContext(ctx, sgt.contextDefinition);
    if (!res.statusCode) res.statusCode = 200;
    const fn =
      rce.getTransformFunction(sgt.transform, res.statusCode);
    const args = {
      aspects,
      ctx,
      generatorTemplate: sgt,
      res,
    };
    const bulk = sgt.connection.bulk;
    if (bulk) {
      args.subjects = subj;
    } else {
      args.subject = subj;
    }

    return rce.safeTransform(fn, args, true);
  }, // evalTransformFunction
};
