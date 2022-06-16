const base85 = require("../ascii85.js");

const wikiExampleInput =
    "Man is distinguished, not only by his reason, but by this singular passion from "                +
    "other animals, which is a lust of the mind, that by a perseverance of delight in the continued " +
    "and indefatigable generation of knowledge, exceeds the short vehemence of any carnal pleasure.";

const wikiExampleOutput =
    "<~9jqo^BlbD-BleB1DJ+*+F(f,q/0JhKF<GL>Cj@.4Gp$d7F!,L7@<6@)/0JDEF<G%<+EV:2F!,"   +
    "O<DJ+*.@<*K0@<6L(Df-\\0Ec5e;DffZ(EZee.Bl.9pF\"AGXBPCsi+DGm>@3BB/F*&OCAfu2/AKY" +
    "i(DIb:@FD,*)+C]U=@3BN#EcYf8ATD3s@q?d$AftVqCh[NqF<G:8+EV:.+Cf>-FD5W8ARlolDIa"   +
    "l(DId<j@<?3r@:F%a+D58'ATD4$Bl@l3De:,-DJs`8ARoFb/0JMK@qB4^F!,R<AKZ&-DfTqBG%G"   +
    ">uD.RTpAKYo'+CT/5+Cei#DII?(E,9)oF*2M7/c~>";


const encoded = base85.encode(wikiExampleInput);
const encodedFixed = encoded.replaceAll("\r", "");

console.log("[orig] ", wikiExampleOutput === encoded);      // false
console.log("[fixed]", wikiExampleOutput === encodedFixed); // true

console.log("[enc-dec]", wikiExampleInput === base85.decode(base85.encode(wikiExampleInput))); // true

// const long = "a".repeat(100000);
// console.log("[enc-dec][long]", long === base85.decode(base85.encode(long))); // RangeError: Maximum call stack size exceeded


let byteString = "";
for (let i = 0; i < 256; i++) {
    byteString += String.fromCharCode(i);
}
console.log("[enc-dec-bs]", byteString === base85.decode(base85.encode(byteString)));
