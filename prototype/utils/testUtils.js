/**
 * utils/testUtils.js
 */
const RefocusCollectorEval = require('@salesforce/refocus-collector-eval');
const exec = require('child_process').exec;
const projectName = require('../package.json').name;
let sgt;

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
    assignContext(ctx, sgt.contextDefinition);
    const args = {ctx, aspects, subjects};
    return RefocusCollectorEval.safeToUrl(sgt.connection.toUrl, args, true);
  }, // generateUrl

  doTransform(ctx, aspects, subj, res) {
    return this.evalTransformFunction(sgt.transform.transform, ctx, aspects,
      subj, res);
  }, // doTransform

  // TODO: move the status code matching to RefocusCollectorEval and use it here
  doHandleError(statusCode, ctx, aspects, subj, res) {
    let func;
    const errorHandlers = sgt.transform.errorHandlers;
    if (errorHandlers) {
      Object.keys(errorHandlers).forEach((statusMatcher) => {
        const re = new RegExp(statusMatcher);
        if (re.test(statusCode)) {
          func = errorHandlers[statusMatcher];
        }
      });
    }

    return this.evalTransformFunction(func, ctx, aspects, subj, res);
  }, // doHandleError

  evalTransformFunction(functionBody, ctx, aspects, subj, res) {
    assignContext(ctx, sgt.contextDefinition);
    let args;
    const bulk = sgt.connection.bulk;
    const generatorTemplate = sgt;
    if (bulk) {
      args = { ctx, aspects, subjects: subj, res, generatorTemplate };
    } else {
      args = { ctx, aspects, subject: subj, res, generatorTemplate };
    }

    return RefocusCollectorEval.safeTransform(functionBody, args, true);
  }, // evalTransformFunction

};

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
}
