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
    sgt = require(`../${projectName}.json`);
    const args = { ctx, aspects, subjects };
    return RefocusCollectorEval.safeToUrl(sgt.connection.toUrl, args);
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
  }, // doTransform
};
