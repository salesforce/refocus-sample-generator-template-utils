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
   * @param {Array} aspects - Array of one or more aspects
   * @param {Object} subject - A single subject object
   * @param {http.ServerResponse} res - The response object
   * @returns {Array} an array of samples
   */
  transformBySubject(ctx, aspects, subject, res) {
    const samples = [];
    let sampleCount = 0;
    aspects.forEach((aspect) => {
      sampleCount++;
      samples.push({
        name: generateSampleName(subject, aspect), // required, string of form xx.xx|xx
        value: `${sampleCount % 2}`, // optional, string
        messageCode: '0000', // optional, string, 5 char max
        messageBody: `this is mock sample ${sampleCount}`, // optional, string, 4096 char max
        relatedLinks: [{ // optional, array of link objects with name and url props
          name: 'link1',
          url: generateSampleUrl(subject, aspect),
        }],
      });
    });

    return samples;
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

    generateSampleUrl(subject, aspect) {
      return `http://www.example.com/${aspect.name}?data=${subject.name}`;
    },
  },

};

