/**
 * transform.js
 *
 * Implement the transform function here.
 *
 * Use context data, aspects, subject(s), and the response from the remote data
 * source to generate samples to send to Refocus.
 *
 * Your transform implementation must return an array of valid samples. The
 * size of the array should equal the number of subjects * the number of
 * aspects.
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
   * @param {Object} ctx - The context from the Sample Generator, expected to
   *  have "alternateMessageCode" and "separator" attributes.
   * @param {Array} aspects - Expecting an array of one aspect.
   * @param {Array} subjects - Expecting an array of one or more subjects.
   * @param {http.ServerResponse} res - The response object, expected to have
   *  a "text" attribute containing a list of random integers, one per line.
   * @returns {Array} an array of samples
   */
  transformBulk(ctx, aspects, subjects, res) {
    /* Get the array of random integers from the response text. */
    const integers = splitString(res.text, ctx.separator);

    /* Return array of samples, one for each subject. */
    return subjects.map((s, i) => ({
      name: sampleName(s.absolutePath, aspects[0].name),
      value: new String(integers[i] || 0),
      messageCode: safeMessageCode(integers[i] || 0, ctx.alternateMessageCode),
    }));
  },

  helpers: {
    /**
     * The sample's message code can only be 5 characters max, so if the
     * stringified value would take up more than 5 chars, return the alternate
     * value ("alt").
     */
    safeMessageCode(mc, alt = '') {
      if (typeof mc === 'boolean') return mc.toString();
      if (!mc) return '';
      const str = mc.toString();
      return (str.length <= 5) ? str : alt;
    }, // safeMessageCode

    /**
     * Constructs sample name from subject absolutePath and aspect name.
     *
     * @param {String} absolutePath - The subject absolutePath
     * @param {String} aspectName - The aspect name
     * @returns {String} The sample name, or undefined if invalid inputs
     */
    sampleName(absolutePath, aspectName) {
      if (typeof absolutePath !== 'string' || typeof aspectName !== 'string') {
        return undefined;
      }

      return `${absolutePath}|${aspectName}`;
    }, // sampleName

    /**
     * Separate a string into an array of strings using the separator provided.
     *
     * @param {String} str - The string to split
     * @param {String} sep - The separator, defaults to new line
     * @returns {Array} Array of strings, or empty array if str is empty or not
     *  a string
     */
    splitString(str, sep = '\n') {
      if (!str || typeof str !== 'string') return [];
      return str.split(sep);
    }, // split
  },
};
