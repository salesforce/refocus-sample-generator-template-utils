/**
 * connection.js
 *
 * Set up the connection for your remote data source.
 * You must set either "url" or "toUrl".
 * Use "url" if the url is static or can be generated by substituting context vars.
 * Use "toUrl" if you need to dynamically create the url based on subjects and aspects.
 *
 * DO NOT modify the function signature.
 * DO NOT import or require any other modules.
 * DO NOT modify the module.exports (for testing).
 */

module.exports = {

  /**
   * Creates a url string by concatenating all the subjects/aspects
   * names and including them in the expression.
   * @param {Object} ctx - The context from the Sample Generator
   * @param {Array} aspects - Array of one or more aspects (where each object
   *  in the array has a "name" attribute)
   * @param {Array} subjects - Array of one or more subjects
   * @returns {String} the url
   */
  toUrl(ctx, aspects, subjects) {
    let baseUrl = ctx.baseUrl;
    const aspectNames = concatArray(aspects);
    const subjectNames = concatArray(subjects);
    baseUrl = baseUrl + `?expression=${ctx.window}:subjects:[${subjectNames}]` +
    `:tests:[${aspectNames}]`;
    return baseUrl;
  },

  /**
   * ContextDefinition (optional)
   *
   * Define context variables that the connection relies on here.
   * The values that get passed in to the connection will be assigned in the
   * Sample Generator. You can also specify a default value here, to be used if
   * "required" is false and no value is set.
   */
  contextDefinition: {
    baseUrl: {
      description: 'the base url to add the params to',
      required: true,
    },
    window: {
      description: 'the window value to be set in the url',
      required: false,
      default: '-15m',
    },
  },

  /**
   * Helpers (optional)
   *
   * Define helper functions to be used in toUrl.
   */
  helpers: {

    /**
     * Returns a string concatenated of the elements in the array.
     * @param  {Array} arr - Array of objects have the name attribute.
     * @returns {String} of concatenated names.
     */
    concatArray(arr) {
      return arr.map((e) => e.name).join(',');
    },
  },
};
