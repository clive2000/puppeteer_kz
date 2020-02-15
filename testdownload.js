const request = require('request');
const fs = require('fs');
const {JSEncrypt} = require('./jsencrypt');
const axios = require('axios');
const Crypto = require("crypto-js");

const e = "QOnHfk91mXNvwE5lpAjSGZqdNyFan+rzDLeGH0xhR/A+byXlfOtrNv0WSJR3KzxINh2M2+QHr2p5sul3c9pofTub7ttVlfooQicQtCHEoyqJ9Swf9TpiwSwAeWV4yhFUOVY59sAKHLhei6xEJX88XctM9Dou0J/fnrLCk8MJW2dN3ohbDf/O215jU14/Dxfi5WzuZ8+UoW6lbM7XP5fX6b3XqMrjBGjANFACbvU5YXEM8E5tTgftwJ5hgsboSbXupJUnZ+jLOw+vRDnDq4ZttAs3HsJfV6CrhxLAEucrz0+SN9Hy3XciZsrSr6EOIFjdEGxKgWEBYyH7NeLOdGc4UA==";

const rsa = {
    "privateKey" : `-----BEGIN RSA PRIVATE KEY-----
    MIIEoAIBAAKCAQEAhTuyKwOPp1OjEGC7FgYXF3y3VlVFA64W2Ea/cUR1NnxsaV9h
    Dh0ThUY/FyEJyPmmxQcx2yeZpMPNv7hJIha6o1BDXTU7GPIeMxb+tO3lJ63uoVCo
    qmuDezW6Pz4Hisr7+iw/c1GSOoMAKaPH3tI7z799/hYqGMc0tPF1KnAG9zamfBp4
    tiOM3gMXeWacgeRArfWBV6/E2C30xL3MPHtVCUNkvoD3GOdnpE/merbNIq5bnKjN
    XuwTytAcGs69W/RcL+TlTYudopTBvfGsjIdXidAa50ZN7cQgVauV7WmEkagKibyr
    7JXxVkRgJq9E+8NrigMneCO5cym7I418x/3zzwIBAwKCAQBY0nbHV7UaN8IK6ydk
    BA9k/c+O44NXyWSQLypLgvjO/Z2blOtevg0DhCoPa1vbURnYr3aSGmZt195/0DDB
    ZHxs4Czozidl9r7Muf8jSUNvyUnA4HBxnQJSI9F/fq+x3Kf8HX+iNmF8V1VxF9qU
    jCff1P6pZBwQhM3N9k4cSq9PeM4H37xKIABbVY7bt9DLR+1kthUG4TGUV905s1V6
    RsFxXN43z0MU+gDs6icxgF9YbBA7s2nvJK567p5JGK2Y6Is+3yZKyVLc6acrCTAI
    xZdZ99UbEkHtKOMTIBotBOkP5fERx4+u3OawhYiYWmoA89//PTIfTkep2Qm5Dw0i
    eqwrAoGBALxl2jkizJEcDh+mDqp8aOGS/pDnohuyfufik9LA1viU2lFwTai6wOn6
    pgU2hxoBHUDL6Fr9LUJpPVsqpYcJ0QIQJgF0yDYJ2IaHvjvca7hQLL0vFaZ+IyaV
    YIj8bTOxp1rfYrFHRHqokuLx9NmZzMHg/22eMj1d5dGlt4KfNIPhAoGBALUKcKUk
    Jvs49KGJxDjUj3sD5dDlu97HK0ELnPlEOjpKXcX6fGm+r3xGSqZ57yQc7wJ3M1N7
    B8upLNOChDHsxolBcCpolWtNXcB1paii8zwyr54PlUSL46UjmuWtdPNIJ8YPrqMf
    Bhyk6TBQMsxgiNmqJ+6q/BCWflroP2Z1EW2vAoGAfZk8JhczC2gJam60cahF67dU
    YJpsEnb/RUG34dXkpbiRi6AzxdHV8VHEA3mvZqto1d1Fkf4eLEYo53HDr1vgrArE
    APiFeVvlrwUpfT2dJYrIfh9jxFQXbw5AW1Lzd8vE5z+XINotpxsMl0v4kREzK+tU
    877MKOlD4RklAb94V+sCgYB4saBuGBn80KMWW9gl4wpSApk17n0/L3IrXRNQ2CbR
    hukupv2b1HT9hDHEUUoYE0oBpMziUgUycMiNAa12ndmw1krG8GOc3j6ATm5wbKIo
    IcppX7jYXUJuF7yZHk33hW/ZX8nCFK69w0YgNXcy6wXmcW/0cf1gZFQ8mtTu+LZJ
    HwKBgH45Glo6dEuRiu9+wj2NzgbYfHDwTbIxZ9VjIVXZWXIAdVCUqQU411fqJnN5
    IXrVW4cAA/ZuwQmQbHYy12Em7ENK9/0rbLlzex54fCCbfLiEszXshxj2DDQRQtWI
    Nks/9Hjv/gCs3nnT9F1il6bVlZ5z2aL24NWZE8XhJaoJNKX0
    -----END RSA PRIVATE KEY-----
    `,

    "publicKey" : "-----BEGIN PUBLIC KEY-----\r\nMIIBIDANBgkqhkiG9w0BAQEFAAOCAQ0AMIIBCAKCAQEAhTuyKwOPp1OjEGC7FgYX\r\nF3y3VlVFA64W2Ea/cUR1NnxsaV9hDh0ThUY/FyEJyPmmxQcx2yeZpMPNv7hJIha6\r\no1BDXTU7GPIeMxb+tO3lJ63uoVCoqmuDezW6Pz4Hisr7+iw/c1GSOoMAKaPH3tI7\r\nz799/hYqGMc0tPF1KnAG9zamfBp4tiOM3gMXeWacgeRArfWBV6/E2C30xL3MPHtV\r\nCUNkvoD3GOdnpE/merbNIq5bnKjNXuwTytAcGs69W/RcL+TlTYudopTBvfGsjIdX\r\nidAa50ZN7cQgVauV7WmEkagKibyr7JXxVkRgJq9E+8NrigMneCO5cym7I418x/3z\r\nzwIBAw==\r\n-----END PUBLIC KEY-----\r\n"
}

function decryptRsa(e) {
    const decrypt = new JSEncrypt();
    decrypt.setPrivateKey(rsa['privateKey']);
    console.log('decrpted key is ' + decrypt.decrypt(e));
    return '22g0mwrX_Ut%GOu1';
}

function btoa(s) {
    return Buffer.from(s, 'binary').toString('base64')
}

/**
 * @return {string}
 */
function Uint8ToBase64(t) {
    let c = "";
    for (let o = 32768, a = 0, s = t.length, l; a < s;) {
        l = t.subarray(a, Math.min(a + o, s));
        c += String.fromCharCode.apply(null, l);
        a += o;
    }
    return btoa(c);
}

function wordArrayToU8(t) {
    let o = t.words, a = t.sigBytes, s = new Uint8Array(a), c = 0, l;
    for (; c < a; c++) {
        l = o[c >>> 2] >>> 24 - c % 4 * 8 & 255;
        s[c] = l;
    }
    return s
}

const url = 'https://phei.keledge.com:50002/transfer/dcd/net/content/stream?q=Yjqzhk4LiuBpUhVJNwdWttgDZ8L85%2b3ZPa8uFZLSShTNRGkgEbssClplDn%2fALIe446F9%2bMVqs2wogGiOXvljMkjzDBRRaMuW3M287lKRJR4AJ7A7PsB5xg7Hs23Uiw66&BridgePlatformName=aqrcloud_web&fn=xiQ+kSuTNwC2xuX1BPiTEw==';

(async () =>{
    await axios.get(url,
        {
            responseType: 'arraybuffer'
        })
        .then((response) => {
            let arrayBuffer = response.data;
            let a = new Uint8Array(arrayBuffer);
            let s = Uint8ToBase64(a);
            let c = Crypto.AES.decrypt(s, Crypto.enc.Utf8.parse(authorKey), {
                mode: Crypto.mode.ECB,
                padding: Crypto.pad.Pkcs7
            });
            let buffer = wordArrayToU8(c);
            if (buffer.length < 2000) {
                console.log('decode error!');
                return
            }
            fs.writeFileSync(`1.pdf`, buffer);
        })
        .catch((error) => {
            console.log(error);
        });
})();




decryptRsa(e);