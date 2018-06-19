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
   * @param {Object} ctx - The context from the Sample Generator, expected to
   *  have "alternateMessageCode" and "separator" attributes.
   * @param {Array} aspects - Array of one or more aspects (where each object
   *  in the array has a "name" attribute)
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
    separator: {
      description: 'the separator to use when splitting the response',
      required: false,
      encrypted: false,
      default: '\n',
    },
    alternateMessageCode: {
      description: 'the message code to use if the message is greater than 5 characters',
      required: true,
      encrypted: false,
    },
  },

  /**
   * Helpers (optional)
   *
   * Define helper functions here if you need to be able to test them directly.
   */
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
    splitString(str, sep) {
      if (!str || typeof str !== 'string') return [];
      return str.split(sep);
    }, // split
  },
};
