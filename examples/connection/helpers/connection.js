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
   * Url (optional)
   *
   * Specify a url string to use for collection.
   * You can use context variables with {{var}}.
   */
  url: 'http://www.example.com',

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
