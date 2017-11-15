# refocus-sample-generator-template-utils (Refocus Sample Generator Template Utilities)

A sample generator template is just a json document, so of course you can write one by hand, but why bother? We hope you'll take advantage of the tooling provided here to make it easy for any developer with some javascript knowledge to write, test and deploy new Sample Generator Templates.

## Prerequisites

Install [node.js](https://docs.npmjs.com/getting-started/installing-node).

## Installation

Install the Refocus Sample Generator Template Utilities, then run `npm link` to create global symlinks to the /bin commands.

```
$ npm install —-save-dev refocus-sample-generator-template-utils
$ npm link
```

## Create a New Refocus Sample Generator Template Project
Run `sgtu-init <projectName>` to create a new Refocus Sample Generator Template project.

```
$ sgtu-init <projectName> [--transform <exampleName>] [--toUrl <exampleName>]
```

The optional `transform` and `toUrl` arguments can initialize your project based on one of the examples in the `/examples` directory.

Transform Examples:
- `mockBulk` - creates mock samples based only on the aspects and subjects passed in.
- `mockBySubject` - creates mock samples based only on the aspects and subject passed in.
- `basicBulk` - creates samples from a basic json response for bulk requests.
- `basicBySubject` - creates samples from a basic json response for bySubject requests.
- `errorHandlersBulk` - example errorHandlers for bulk requests
- `errorHandlersBulk` - example errorHandlers for bySubject requests
- `helpers` - example helper functions
- `randomNumbers` - a bulk transform example using helpers

After running the `sgtu-init` command, your project will be initialized with the following resources to help you get started:
- `/README.md` - since *of course* you will be publishing this on github!
- `/[your-template-name].json` - sample generator template json
- `/transform/transform.js` - implement your transform function here
- `/transform/testTransform.js` - implement unit tests for your transform function here
- `/toUrl/toUrl.js` - implement your toUrl function here (if needed)
- `/toUrl/testToUrl.js` - implement unit tests for your toUrl function here (if needed)
- `/test/connection.js` - implement unit tests for your connection here

Project initialization also adds some dependencies and scripts to your package.json which will help you validate, test, build and install your sample generator template:

### Dependencies
- nock
- mocha
- chai
- istanbul

### Scripts
- `deploy`
- `test`
- `test-connection`
- `test-to-url`
- `test-transform`
- `validate`

## Development (aka "What do I do next?")

### Connection Information

Update the connection attribute of the generated json file with the details on how to connect to the data source.

- `bulk` (Boolean, optional, default=`false`) - set to `false` if you want to send one request for each of the designated subjects; set to `true` if you want to collect data for all of the designated subjects in a single request.
- `headers` (Object, optional) - headers to include in the request. For each named header, if you define it using an object, the Sample Generator is expected to provide the value; if you define it with a string, the header is set using that value.
- `method` (String, default=`GET` [`DELETE`|`GET`|`HEAD`|`PATCH`|`POST`|`PUT`])
- `timeout` (Number, optional, default=[the Refocus Collector's default value], max=[some hard-coded max]) - the number of milliseconds to wait before aborting the request. If undefined or non-numeric values or greater than max, the connection will use the Refocus Collector's default value.
- `url` (String) - you may embed substitution variables in the string using double curly braces, e.g. http://www.xyz.com?id={{key}}. The variable names must all be defined in the `contextDefinition`. Omit the `url` attribute if you intend to implement a `toUrl` function instead.

For example:

```json
"connection": {
  "bulk": false,
  "headers": {
    "Authorization": "{{token}}",
    "Accept": "application/json"
  },
  "timeout": 10000
  "url": "{{baseUrl}}/v1/xyz?key={{aspect[0].name}}&&id={{subject.name}}"
}
```

You must also specify some connection test metadata in /test/connection.js.

### Context Definition

Update the contextDefinition attribute of the generated json file to define any variables you need to make available to your url (via double curly braces) or to your toUrl and transform functions via the functions' context argument `ctx`. Each key defined here must provide an object with the following attributes:

- `description` (String, required) - provide enough detail for the user to understand what value to provide
- `required` (Boolean, optional, default = `false`) - set to `true` if your users *must* provide a value for this context variable in their sample generators.
- `default` (Any, optional) - a value to populate the context variable when your users do not provide a value in their sample generators.

### Transform

Go to `/transform/transform.js` and implement your logic in the function which is already stubbed out in that file. The function must return an array of samples. The function body has access to these variables:

- `context` - a reference to the sample generator context data, with defaults applied.
- `aspects` - an array of one or more aspects as specified by the sample generator.
- `subject` - if connection.bulk is set to false, this is a reference to the subject.
- `subjects` - if connection.bulk is set to true, this is reference to the array of subjects.
- `res` - a reference to the HTTP response. See https://nodejs.org/api/http.html#http_class_http_incomingmessage for more details on the format of the HTTP response. Typically, the body of the response will be in res.body or res.text, depending on the content type.

Provide guidance for the developer to answer stuff like “how are you handling error type x?”, “what happens if y is missing?”, “what does the expected res look like?”, describe your algorithm in user-readable form, etc. — these things can go into a description, etc.

Write your tests in the stubbed out `/transform/testTransform.js` file.

### toUrl

If you need to do more complex transformations to generate a URL, rather than just simple variable substitutions, go to  /src/toUrl.js and implement your logic in the function which is already stubbed out in that file. The function must return a string. The function body has access to these variables:

- `context` - a reference to the sample generator context data, with defaults applied.
- `aspects` - an array of one or more aspects as specified by the sample generator.
- `subjects` - an array of one or more subjects as specified by the sample generator.

Write your tests in the stubbed out `/test/toUrl.js` file.

## Finish describing the SGT

Review all the details in package.json and fill in the following details:

- `description` - provide some guidance about what would make a good description
- `tags` - optional but recommended  (each keyword is /[a-zA-Z0-9-\_]+/ and separated by a space)
- `author`
  - `name`
  - `email`
  - `url`
- `repository`
  - `type` - defaults to git
  - `url` - optional but recommended

## Testing

These scripts have been added to your `package.json`:

- `test`
- `test-connection`
- `test-to-url`
- `test-transform`

You can run any of these scripts from the command line by calling `npm run [SCRIPT-NAME]`.

## Validate

Validates the template json file.

```
$ npm run validate
```

## Build

Once your tests are passing, assemble the sample generator template to prepare for installation into Refocus.

```
$ npm run build
```

Note: You cannot run build if any tests are failing OR if code coverage is below [TODO]%. This script *also* runs `validate` on the generated template json.

It is highly recommended to put the entire project under source control, e.g. github, for version control and sharing.

## Deploy

Upload your brand new sample generator template into an instance of Refocus. Note: Upload should run test and build and validate before actually uploading.

```
$ npm run deploy TEMPLATE_FILE REFOCUS_URL REFOCUS_TOKEN
```

## Maintenance

### Versioning

If you update your sample generator template, you must increment the version attribute. The version must be in the form of `MAJOR.MINOR.PATCH`. Increment the `MAJOR` version when you make incompatible API changes; increment the `MINOR` version when you add functionality in a backwards-compatible manner; increment the `PATCH` version when you make backwards-compatible bug fixes. See http://semver.org/ for more information on semantic versioning.
