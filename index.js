const puppeteer = require('puppeteer');
const axios = require('axios');
const {JSEncrypt} = require('./jsencrypt');
const Crypto = require("crypto-js");
const fs = require('fs');
const path = require('path');
const {cookie1,cookie2} = require('./cookies');



function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const chromeOptions = {
    headless:false,
    defaultViewport: null,
};

function decryptRsa(rsa,key) {
    const decrypt = new JSEncrypt();
    decrypt.setPrivateKey(rsa['privateKey']);
    console.log('decrpted key is ' + decrypt.decrypt(key));
    return decrypt.decrypt(key);
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

let downloadfile = async(res_body,cookie) => {
    let spliturls = res_body['Data']['SplitFileUrls'];
    let authorKey = res_body['Data']['Key'];
    let rsaKey = JSON.parse(cookie);
    // Use private key to decrypt authorKey
    let key = decryptRsa(rsaKey,authorKey);
    
    console.log("Start downloading...");
    let dir = path.join('.',`${id}`)
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
    for (let i = 0;i<spliturls.length;i++){
        let url = spliturls[i];
        let filepath = path.join(`${id}`,`${i+1}.pdf`);
        if (fs.existsSync(filepath)){
            console.log(`Page ${i+1} already exist, skipping...`);
            continue;
        }
        await axios.get(url,
        {
            responseType: 'arraybuffer'
        })
        .then((response) => {
            let arrayBuffer = response.data;
            let a = new Uint8Array(arrayBuffer);
            let s = Uint8ToBase64(a);
            let c = Crypto.AES.decrypt(s, Crypto.enc.Utf8.parse(key), {
                mode: Crypto.mode.ECB,
                padding: Crypto.pad.Pkcs7
            });

            let buffer = wordArrayToU8(c);
            // if (buffer.length < 2000) {
            //     console.log('decode error!');
            //     return
            // }
            console.log(`Downloaded ${i+1} of ${spliturls.length} files`);
            fs.writeFileSync(filepath, buffer);
        })
        .catch((error) => {
            console.log(error);
        });
        await sleep(500);
    }

};



let fetchid = async(id) => {
    console.log(`Parsing id ${id}`);
    const browser = await puppeteer.launch(chromeOptions);
    const page = await browser.newPage();
    await page.setViewport({
        width: 1200,
        height: 800
      });    

    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36');
    // await page.setCookie(cookie1);
    // await page.setCookie(cookie2);

    await page.goto(`https://www.keledge.com`,{waitUntil:'networkidle0'});
    await page.reload({waitUntil:'networkidle0'});
    // await page.goto(`https://www.keledge.com/wrap/details/book?id=${id}`,{waitUntil:'networkidle0'});

    await sleep(1000);
    let randomlink = await page.$('.VueEllipsis.book-name');
    await randomlink.click();
    await sleep(1000);
    await page.close();
    
    let pages = await browser.pages();
    const newpage = pages[pages.length-1];

    await sleep(5000);
    await newpage.goto(`https://www.keledge.com/wrap/details/book?id=${id}`,{waitUntil:'networkidle0'});


    // await sleep(500);
    //let button_div = await newpage.$("#app > div > div.home-controller > div.detail-container > div > div.detail_content > div.detail_top_wrap > div.c > div > div.operate_box > ul > li.operate-read-wrap > div");
    await newpage.evaluate(() => { 
        $('div.read-btn').css("opacity",100);
        $('div.read-btn').css("z-index",1);
    });
    let pdflink = await newpage.$("#app > div > div.home-controller > div.detail-container > div > div.detail_content > div.detail_top_wrap > div.c > div > div.operate_box > ul > li.operate-read-wrap > div > span:last-child");
    await pdflink.hover();
    await sleep(1000);
    await pdflink.click();
    await sleep(1000);
    await newpage.close();

    pages = await browser.pages();
    
    const pdfpage = pages[pages.length-1];
    await pdfpage.setRequestInterception(true);
    pdfpage.on('request', interceptedRequest => {
        interceptedRequest.continue();
    });
    pdfpage.on("response", async response => {
        const request = response.request();
        const url = request.url();
        if (url == 'https://api.keledge.com/aqr/authorize'){
            let res_body = await response.json();
            const cookie = await pdfpage.evaluate(()=>{
                    let cookie = $cookies.get('rsaKeys');
                    return cookie;
                }    
            );
            await browser.close();
            await downloadfile(res_body,cookie);
        }
    });
    await pdfpage.reload({waitUntil:'networkidle2'});
    console.log('webpage loaded');

};

const argv = require('minimist')(process.argv.slice(2));
let id = argv['_'][0];
if (!id) id = 17038702;




(async () => {
    await fetchid(id);
})();

