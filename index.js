#!/usr/bin/env node

"use strict";

const ngrok = require("ngrok");
const qrcode = require("qrcode-terminal");
const chalk = require("chalk");
const argv = require("yargs").argv;
const _ = require("lodash");

async function main() {
  const options = {};
  // collect all shorthand props
  _.each(argv._, (value) => {
    // protocol (proto)
    if (['http', 'tcp', 'tls'].indexOf(value) >= 0) options.proto = value;
    // port (addr)
    if (!isNaN(parseInt(value))) options.addr = value;
  });
  // map remainder of args to snake_case
  _.each(argv, (value, key) => {
    if (key !== '_' && key !== '$0') {
      options[_.snakeCase(key)] = value;
    }
  });

  const url = await ngrok.connect(options);

  const code = await new Promise(resolve =>
    qrcode.generate(url, { small: true }, qr => resolve(qr))
  );

  const output = [
    `---------------------------`,
    `> ngrok ${process.argv.slice(2).join(' ')}`,
    `---------------------------`,
    chalk.underline.cyan(url),
    `---------------------------`,
    code
  ].join("\r\n");

  console.log(output);
}

main()
  .then(() => {})
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
