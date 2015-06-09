/* jshint node: true, strict: true */

"use strict";


var EventEmitter    = require('events').EventEmitter,
    util            = require('util');



var Parser = module.exports = function ()  { 
    this.message = '';
};
util.inherits(Parser, EventEmitter);



Parser.prototype.parse = function (chunk) {  

    this.message += chunk;
    chunk = this.message;

    var size    = chunk.length,
        start   = 0,
        offset  = 0,
        curr,
        next;

    while (offset < size) {
        curr = chunk[offset];
        next = chunk[offset + 1];

        if (curr === '\r' && next === '\n') {
            var piece = chunk.slice(start, offset);
            start = offset += 2;

            // Empty object

            if (!piece.length) { 
                continue; 
            }
            
            var msg;
            try {
                msg = JSON.parse(piece);
            } catch (error) {
                this.emit('error', error);
            } finally {
                if (msg) {
                    this.emit('message', msg);
                    continue;
                }
            }
        }
        offset++;
    }

    this.message = chunk.slice(start, size);
};
