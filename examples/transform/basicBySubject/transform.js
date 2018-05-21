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
  transformBySubject(ctx, aspects, subject, res) {
    return aspects.map((a) => ({
      name: generateSampleName(subject, a),
      value: `${res.body[a.name]}`,
    }));
  },

  /**
   * Helpers (optional)
   *
   * Define helper functions here if you need to be able to test them directly.
   */
  helpers: {
    generateSampleName(subject, aspect) {
      return `${subject.absolutePath}|${aspect.name}`;
    },
  },

};
