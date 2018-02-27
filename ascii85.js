/*
    ASCII85 a.k.a. Base85 implementation in JavaScript
    Copyright (C) 2018  Yuri Konotopov (Юрий Конотопов) <ykonotopov@gnome.org>

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
 */

'use strict';

var ascii85 = (function() {
	const LINE_WIDTH = 80;
	const TUPLE_BITS = [24, 16, 8, 0];
	const POW_85_4 = [
		85*85*85*85,
		85*85*85,
		85*85,
		85,
		1
	];

	function getEncodedChunk(tuple, bytes = 4)
	{
		var output;
		let d = ((tuple[0] << 24) | (tuple[1] << 16) | (tuple[2] << 8) | tuple[3]) >>> 0;

		if(d === 0 && bytes == 4)
		{
			output = new Uint8Array(1);
			output[0] = 0x7a; // z
		}
		else
		{
			output = new Uint8Array(bytes + 1);

			for(let i = 4; i >= 0; i--)
			{
				if(i <= bytes)
				{
					output[i] = d % 85 + 0x21; // 0x21 = '!'
				}

				d /= 85;
			}
		}

		return output;
	}

	function fromByteArray (byteArray, useEOD = true)
	{
		let output = [];
		let lineCounter = 0;

		if(useEOD)
		{
			output.push(0x3c); // <
			output.push(0x7e); // ~
		}

		for(let i = 0; i < byteArray.length; i += 4)
		{
			let tuple = new Uint8Array(4);
			let bytes = 4;

			for(let j = 0; j < 4; j++)
			{
				if(i + j < byteArray.length)
				{
					tuple[j] = byteArray[i + j];
				}
				else
				{
					tuple[j] = 0x00;
					bytes--;
				}
			}

			let chunk = getEncodedChunk(tuple, bytes);
			for(let j = 0; j < chunk.length; j++)
			{
				if(lineCounter >= LINE_WIDTH)
				{
					output.push(0x0d); // \n
					lineCounter = 0;
				}

				output.push(chunk[j]);
				lineCounter++;
			}
		}

		if(useEOD)
		{
			output.push(0x7e); // ~
			output.push(0x3e); // >
		}

		return String.fromCharCode.apply(null, output);
	}

	function encode (text)
	{
		let charset = 'UTF-8';
		let useEOD = true;

		if(arguments.length > 1)
		{
			if(typeof(arguments[1]) == 'string')
			{
				charset = arguments[1];

				if(arguments.length > 2)
				{
					useEOD = !!arguments[2];
				}
			}
			else
			{
				useEOD = !!arguments[1];
			}
		}

		return fromByteArray(new TextEncoder(charset || "UTF-8").encode(text), useEOD);
	}

	function getByteArrayPart(tuple, bytes = 4)
	{
		let output = new Uint8Array(bytes);

		for(let i = 0; i < bytes; i++)
		{
			output[i] = (tuple >> TUPLE_BITS[i]) & 0x00ff;
		}

		return output;
	}

	function toByteArray (text)
	{
		function pushPart()
		{
			let part = getByteArrayPart(tuple, tupleIndex - 1);
			for(let j = 0; j < part.length; j++)
			{
				output.push(part[j]);
			}
			tuple = tupleIndex = 0;
		}

		let output = [];
		let stop = false;

		let tuple = 0;
		let tupleIndex = 0;

		let i = text.startsWith("<~") && text.length > 2 ? 2 : 0;
		do
		{
			// Skip whitespace
			if(text.charAt(i).trim().length === 0)
				continue;

			let charCode = text.charCodeAt(i);

			switch(charCode)
			{
				case 0x7a: // z
					if(tupleIndex != 0)
					{
						throw new Exception("Unexpected 'z' character at position " + i);
					}

					for(let j = 0; j < 4; j++)
					{
						output.push(0x00);
					}
					break;
				case 0x7e: // ~
					let nextChar = '';
					let j = i + 1;
					while(j < text.length && nextChar.trim().length == 0)
					{
						nextChar = text.charAt(j++);
					}

					if(nextChar != '>')
					{
						throw new Exception("Broken EOD at position " + j);
					}

					if(tupleIndex)
					{
						tuple += POW_85_4[tupleIndex - 1];
						pushPart();
					}

					stop = true;
					break;
				default:
					if(charCode < 0x21 || charCode > 0x75)
					{
						throw new Exception("Unexpected character with code " + charCode + " at position " + i);
					}

					tuple += (charCode - 0x21) * POW_85_4[tupleIndex++];
					if(tupleIndex >= 5)
					{
						pushPart();
					}
			}
		}
		while(i++ < text.length && !stop)

		return new Uint8Array(output);
	}

	function decode (text, charset)
	{
		return new TextDecoder(charset || "UTF-8").decode(toByteArray(text));
	}

	return {
		fromByteArray: fromByteArray,
		toByteArray: toByteArray,
		encode: encode,
		decode: decode
	}
})();

var base85 = ascii85;
if (typeof module != 'undefined' && module.exports) module.exports = ascii85;

