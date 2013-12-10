/*

injectExamples.js - inject examples into the README

The MIT License (MIT)

Copyright (c) 2013 Tristan Slominski

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

*/
"use strict";

var fs = require('fs'),
    path = require('path');

var readmeDoc = fs.readFileSync(path.join(__dirname, '..', 'README.md'));
var readmeScript = fs.readFileSync(path.join(__dirname, '..', 'examples', 'readme.js'));

var useStrict = readmeScript.toString().match(/"use strict";/);
readmeScript = readmeScript.toString().slice(useStrict.index);

var replacement = [
  "## Usage",
  "",
  "To run the below example run:",
  "",
  "    npm run readme",
  "",
  "```javascript",
  readmeScript,
  "```"
].join('\n');

var usage = readmeDoc.toString().match(/## Usage/);
var tests = readmeDoc.toString().match(/## Tests/);

// some safety checks
if (!usage) {
    console.error("Unable to find ## Usage in README");
    process.exit(1);
}

if (!tests) {
    console.error("Unable to find ## Tests in README");
    process.exit(1);
}

if (tests.index < usage.index) {
    console.error("## Tests is after ## Usage, existing");
    process.exit(1);
}

var firstSlice = readmeDoc.toString().slice(0, usage.index);
var secondSlice = readmeDoc.toString().slice(tests.index);

readmeDoc = firstSlice + replacement + '\n\n' + secondSlice;

fs.writeFileSync(path.join(__dirname, '..', 'README.md'), readmeDoc);