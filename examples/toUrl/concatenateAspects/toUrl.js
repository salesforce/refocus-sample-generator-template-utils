/**
 * src/toUrl.js
 *
 * Implement the toUrl function here.
 *
 * Use context data, aspects and subjects to generate the url to connect to
 * your remote data source.
 *
 * Your toUrl implementation must return a string url.
 *
 * DO NOT modify the function signature.
 * DO NOT import or require any other modules.
 * DO NOT modify the module.exports (for testing).
 * DO NOT declare any functions OUTSIDE the body of the toUrl function
 *  itself.
 *
 */

module.exports = {

 /*
  * Creates an url string by concatenating the aspects names and including
  * them in the expression.
  * @param {Object} ctx - The context from the Sample Generator
  * @param {Array} aspects - Array of one or more aspects
  * @param {Array} subjects - Array of one or more subjects
  * @returns {String} the url
  */
 toUrl(ctx, aspects, subjects) {
    let baseUrl = ctx.baseUrl;
    const aspectNames = aspects.map((aspect) => aspect.name).join(',');
    baseUrl = baseUrl + '/expression=' + ctx.window + ':subjects:all' +
    ':tests:[' + aspectNames + ']';
    return baseUrl;
  },

};
