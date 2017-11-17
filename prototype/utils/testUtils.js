/**
 * utils/testUtils.js
 */
const RefocusCollectorEval = require('@salesforce/refocus-collector-eval');
const exec = require('child_process').exec;
const projectName = require('../package.json').name;
let sgt;

module.exports = {
  build(done) {
    exec('sgtu-build', (err) => {
      if (err) return done(err);
      sgt = require(`../${projectName}.json`);
      done();
    });
  }, // buildTransform

  generateUrl(ctx, aspects, subjects) {
    return this.evalToUrlFunction(sgt.connection.toUrl, ctx, aspects, subjects);
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
    let args;
    const bulk = sgt.connection.bulk;
    const generatorTemplate = sgt;
    if (bulk) {
      args = { ctx, aspects, subjects: subj, res, generatorTemplate };
    } else {
      args = { ctx, aspects, subject: subj, res, generatorTemplate };
    }

    return RefocusCollectorEval.safeTransform(functionBody, args);
  }, // evalTransformFunction

  evalToUrlFunction(functionBody, ctx, aspects, subjects) {
    const args = {ctx, aspects, subjects};
    return RefocusCollectorEval.safeToUrl(functionBody, args);
  }, // evalToUrlFunction

};
