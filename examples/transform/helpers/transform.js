/**
 * transform.js
 *
 * Implement the transform function here.
 *
 * Use context data, aspects, subject(s), and the response from the remote data
 * source to generate samples to send to Refocus.
 *
 * Your transform implementation must return an array of valid samples. The size
 * of the array should equal the number of subjects * the number of aspects.
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
   * @param {Array} aspects - Array of one or more aspects
   * @param {Array} subjects - Array of one or more subjects
   * @param {http.ServerResponse} res - The response object
   * @returns {Array} an array of samples
   */
  //transformBulk(ctx, aspects, subjects, res) {
  // return [];
  //},

  /**
   * Use this function signature if you collect data for a single subject at
   * a time from your connection.url.
   *
   * @param {Object} ctx - The context from the Sample Generator
   * @param {Array} aspects - Array of one or more aspects
   * @param {Object} subject - A single subject object
   * @param {http.ServerResponse} res - The response object
   * @returns {Array} an array of samples
   */
  //transformBySubject(ctx, aspects, subject, res) {
  //  return [];
  //},

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
    //'404': function(ctx, aspects, subjects, res) {
    //  return [];
    //},
  },

  /**
   * Helpers (optional)
   *
   * Define helper functions here if you need to be able to test them directly.
   */
  helpers: {
    /**
     * Generates a sample name from subject and aspect objects
     *
     * @param   {Object} subject - A subject object
     * @param   {Object} aspect - An aspect object
     * @returns {String} sample name
     */
    generateSampleName(subject, aspect) {
      return `${subject.absolutePath}|${aspect.name}`;
    },

    /**
     * Truncates the message if it is too long.
     *
     * @param   {String} msg - The message
     * @param   {Number} max - The maximum length allowed for the message
     * @returns {String} the message, truncated if it was too long
     */
    truncateMessage(msg, max = 4096) {
      if (msg.length > max) {
        return msg.substring(0, max - 3) + '...';
      } else {
        return msg;
      }
    },
  },

}

