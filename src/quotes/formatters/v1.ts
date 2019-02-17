
const entipicUrl = require('entipic.url');
import { Quote } from "@ournet/api-client";
import moment = require("moment");
import { truncateText } from "../../helpers";
import { getHost } from 'ournet.links';

export default (quote: Quote) => {
    const backColor = '#f2f0ea';
    const darkBackColor = '#dfdacb';
    const accentColor = '#ca0000';
    const secondColor = '#333';
    const textColor = '#333';
    const quoteTextColor = '#f3f3f3';
    const muteColor = '#999';
    const width = 640;
    const headerHeight = 110;
    // const height = width * (0.562);
    // const maxQuoteTextHeight = height/10;

    let imageId: string = '';
    if (quote.events && quote.events.length) {
        imageId = quote.events[quote.events.length - 1].imageId || imageId;
    }
    if (!imageId) {
        imageId = quote.source.imageId || imageId;
    }

    const date = moment(quote.lastFoundAt).locale(quote.lang);

    const authorImage = entipicUrl(quote.author.name, 'b', quote.lang, quote.country);

    const ournetLink = getHost('news', quote.country);

    return `
    <html>
        <head>
        <meta charset="utf-8">
        <style>
        *, :after, :before {
            box-sizing: inherit;
        }
        html {
            background:${backColor};
            font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";
            font-size: 20px;
            line-height: 1.5;
            color: ${textColor};
            margin:0px;padding:0px;
            -ms-text-size-adjust: 100%;
            -webkit-text-size-adjust: 100%;
        }
        body {
            margin:0px;padding:0px;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            width: ${width}px;
        }
        #container {
            padding: 25px;
            position: relative;
        }
        #e1 {
            position: absolute;
            width: ${width}px;
            height: ${headerHeight}px;
            background: #fff;
            border-top: 6px solid ${accentColor};
            box-shadow: 0px 0px 3px rgba(1,1,1,0.4);
        }
        #logo {
            float: right;
            position: relative;
            top: 4px;
            text-align: right;
            width: 50px;
            height: 50px;
        }
        #quote {
            margin-bottom: 25px;
            margin-top: 6px;
        }
        #quote-text {
            background: rgba(0,0,0,.9);
            font-style: italic;
            padding: 6px 10px 8px 10px;
            position: relative;
            display: block;
            color: ${quoteTextColor};
            // font-size: 110%;
            font-weight: 600;
            text-decoration: none!important;
            // font-family: Georgia,Helvetica,serif;
            line-height: 1.4;
            text-indent: 22px;
            border-radius: 3px;
            text-shadow: 0px 1px 1px #000;
        }
        .with-image #quote-text {
            background: rgba(0,0,0,.4);
        }
        #quote-text>i {
            color: ${accentColor};
            font-size: 150%;
            position: absolute;
            left: 8px;
            top: 4px;
            font-weight: 700;
            text-indent: 0;
        }
        #quote-media {
            padding-bottom: 25px;
            position: relative;
        }
        #quote-media:before {
            content: "";
            width: 0;
            height: 0;
            display: block;
            overflow: hidden;
            border: 13px solid #fff;
            border-color: transparent transparent rgba(0,0,0,.9) transparent;
            position: absolute;
            bottom: 0px;
            left: 18px;
        }
        #quote-media__icon {
            float: left;
            margin-right: 12px;
            display: block;
            width: 60px;
            height: 60px;
            border-radius: 100%;
            background-color: ${darkBackColor};
            color: ${darkBackColor};
        }
        #quote-media__body {
            overflow: hidden;
            display: block;
            color: ${muteColor};
        }
        #author-name {
            color: ${secondColor};
            font-weight: 600;
            white-space: nowrap;
            text-overflow: ellipsis;
            max-width: 100%;
            overflow: hidden;
            // line-height: 25px;
        }
        #quote-date {
            font-size: 80%;
        }
        #news {
            padding-top: 25px;
            // color: #fff;
            font-weight: 600;
            font-size: 90%;
            position: relative;
        }
        #news>span {
            color: ${accentColor};
        }
        .with-image #news {
            color: #fff;
        }
        .with-image>#back-image {
            background-image: url('http://news.ournetcdn.net/events/${imageId.substr(0, 3)}/master/${imageId}.jpg');
            background-size: cover;
            background-repeat: no-repeat;
            background-position-x: center;
            position: absolute;
            top: ${headerHeight}px;
            left: 0px;
            right: 0px;
            bottom: 0px;
            overflow: hidden;
        }
        .with-image #back-image-mask {
            background: #000;
            opacity: .65;
            position: absolute;
            top: ${headerHeight}px;
            left: 0px;
            right: 0px;
            bottom: 0px;
        }
        #ournet-link {
            color: ${muteColor};
            font-size: 12px;
            position: absolute;
            right: 25px;
            bottom: 4px;
            text-decoration: none;
        }
        </style>
        </head>
        <body>
        <div id="e1"></div>
        <div id="e2"></div>
        <div id="container" class="${imageId ? 'with-image' : ''}">
            <div id="back-image"></div>
            <div id="back-image-mask"></div>
            <div id="logo">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3937 3937"><g><path fill="#2b363c" fill-rule="nonzero" d="M668 1298c25-23 27-61 4-86L466 984c-23-25-61-27-86-4l-228 206c-25 23-27 61-4 87l206 228c23 25 62 27 86 4l229-206zM896 679c25 7 51-7 58-32l65-224c7-24-7-51-32-58l-224-65c-25-7-50 7-58 32l-65 224c-7 25 7 50 32 58l224 65zM1204 384c-4 24 12 47 36 51l221 35c24 4 47-12 51-37l36-221c3-24-13-47-37-51l-220-36c-24-4-47 13-51 37l-35 220zM1004 1334c-31 14-67 1-81-30l-127-279c-14-31-1-67 29-81l279-128c31-14 67 0 81 30l127 279c14 30 0 67-30 81l-279 127zM1018 2345c-54 26-118 2-143-51l-232-489c-25-55-3-118 51-144l490-232c54-25 118-2 143 51l232 490c26 54 3 118-51 143l-490 232z"></path><path fill="#ca0000" fill-rule="nonzero" d="M2978 788c-494-269-1069-245-1527 9l339 724c235-154 544-177 808-34 382 208 523 688 315 1069-208 382-688 523-1069 315-187-102-316-269-375-458l-216 101c-16 9-33 16-50 23l-459 214c130 338 376 633 718 819 768 418 1732 133 2150-635s133-1732-635-2149z"></path></g></svg>
            </div>
            <div id="quote">
                <div id="quote-media">
                    <img id="quote-media__icon" src="${authorImage}" alt=${quote.author.name}/>
                    <div id="quote-media__body">
                        <div id="author-name">${quote.author.name}</div>
                        <div id="quote-date">${date.format('LL')}</div>
                    </div>
                </div>
                <div id="quote-text">
                    <i>“</i>
                    ${truncateText(quote.text, 280)}
                </div>
            </div>
            <div id="news">
                <span>—</span> ${truncateText(quote.source.title, 120)}
            </div>
            <a id='ournet-link'>${ournetLink}</a>
        </div>
        </body>
    </html>`;
}

// function darkBackColorRgba(a: number) {
//     return `rgba(223,218,203,${a})`;
// }
