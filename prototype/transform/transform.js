/**
 * transform.js
 *
 * Implement the transform function here.
 *
 * Use context data, aspects, subject(s), and the response from the remote data
 * source to generate samples to send to Refocus.
 *
 * Your transform implementation must return an array of valid samples. The size of
 * the array should equal the number of subjects * the number of aspects.
 *
 * Each sample should have a messageBody no longer than 4096 characters. If the
 * message is longer than that it will be truncated at 4096 by default.
 * If your samples need to include information that would be truncated you
 * should shorten the message yourself before setting it on the samples.
 *
 * DO NOT modify the function signature.
 * DO NOT import or require any other modules.
 * DO NOT modify the module.exports (for testing).
 *
 * Define helper functions in exports.helpers below.
 * Define error handlers in exports.errorHandlers below.
 */

module.exports = {

  /**
   * Use this function signature if you collect data from your connection.url
   * for *all* the subjects in a single request.
   *
   * @param {Object} ctx - The context from the Sample Generator
   * @param {Array} aspects - Array of one or more aspects (where each object
   *  in the array has a "name" attribute)
   * @param {Array} subjects - Array of one or more subjects
   * @param {http.ServerResponse} res - The response object
   * @returns {Array} an array of samples
   */
  /*
  transformBulk(ctx, aspects, subjects, res) {
   return [];
  },
  */

  /**
   * Use this function signature if you collect data for a single subject at
   * a time from your connection.url.
   *
   * @param {Object} ctx - The context from the Sample Generator
   * @param {Array} aspects - Array of one or more aspects (where each object
   *  in the array has a "name" attribute)
   * @param {Object} subject - A single subject object
   * @param {http.ServerResponse} res - The response object
   * @returns {Array} an array of samples
   */
  /*
  transformBySubject(ctx, aspects, subject, res) {
    return [];
  },
  */

  /**
   * Error Handlers (optional)
   *
   * Responses with a status code other than 200 will be handled by the default
   * error handler in refocus-collector/src/remoteCollection/errorSamples.js
   * You can override this for specific status codes by defining error handling
   * functions here.
   * The key is a regular expression to be matched against the status code.
   * The function signature should correspond to the transform function defined above.
   */
  errorHandlers: {
    /*
    '404': function(ctx, aspects, subjects, res) {
      return [];
    },
    */
  },

  /**
   * Response Schema (optional)
   *
   * Define a JSON Schema with which to validate the response object before
   * passing it to the transform function
   */
  /*
   responseSchema: {
     type: 'object',
     required: ['body'],
     properties: {
       body: { ... },
     },
   },
   */

  /**
   * ContextDefinition (optional)
   *
   * Define context variables that the connection relies on here.
   * The values that get passed in to the connection will be assigned in the
   * Sample Generator.
   * You can also specify a default value here, to be used if "required" is
   * false and no value is set.
   * If the value is sensitive and must be stored encrypted, set "encrypted: true".
   */
  contextDefinition: {
    /*
    var1: {
      description: 'description...',
      required: false,
      encrypted: false,
      default: 4,
    },
    */
  },

  /**
   * Helpers (optional)
   *
   * Define helper functions here if you need to be able to test them directly.
   */
  helpers: {
    /*
    generateSampleName(subject, aspect) {
      return `${subject.absolutePath}|${aspect.name}`;
    },
    */
  },

};

