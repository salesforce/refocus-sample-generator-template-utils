/**
 * utils/testUtils.js
 */
const RefocusCollectorEval = require('@salesforce/refocus-collector-eval');
const exec = require('child_process').exec;
const projectName = require('../package.json').name;
let sgt;

function assignContext(ctx, def) {
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
} // assignContext

module.exports = {
  buildTransform(done) {
    exec('sgtu-build-transform', (err) => {
      if (err) return done(err);
      sgt = require(`../${projectName}.json`);
      done();
    });
  }, // buildTransform

  buildToUrl(done) {
    exec('sgtu-build-to-url', (err) => {
      if (err) return done(err);
      sgt = require(`../${projectName}.json`);
      done();
    });
  }, // buildToUrl

  generateUrl(ctx, aspects, subjects) {
    sgt = require(`../${projectName}.json`);
    assignContext(ctx, sgt.contextDefinition);
    const args = { ctx, aspects, subjects };
    return RefocusCollectorEval.safeToUrl(sgt.connection.toUrl, args, true);
  }, // generateUrl

  doTransform(ctx, aspects, subj, res) {
    sgt = require(`../${projectName}.json`);
    const fn =
      RefocusCollectorEval.getTransformFunction(sgt.transform, res.statusCode);
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

    return RefocusCollectorEval.safeTransform(fn, args, true);
  }, // evalTransformFunction
};
