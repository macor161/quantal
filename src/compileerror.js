// Original source code: https://github.com/trufflesuite/truffle/blob/v5.0.10/packages/truffle-compile/compileerror.js

const colors = require('colors');
const TruffleError = require('truffle-error');
const inherits = require('util').inherits;

inherits(CompileError, TruffleError);

function CompileError(message) {
  // Note we trim() because solc likes to add extra whitespace.
  const fancy_message =
    message.trim() + '\n\n' + colors.red('Compilation failed. See above.');
  const normal_message = message.trim();

  CompileError.super_.call(this, normal_message);
  this.message = fancy_message;
}

module.exports = CompileError;
