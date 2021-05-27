/**
 * getlink.js
 * 
 * -- Management
 * 
 * @license Apache License, Version 2.0
 * @version 1.0
 * @author Rafael Prenholato <rprenhol@gmail.com>
 * @link https://github.com/rprenhol/getlink
 */

const browser = (chrome) ? chrome : browser;
var targetNode = document.body;
var formatoURL = 'simples';
chrome.storage.local.get('formatoURL', result => {
    formatoURL = result.formatoURL || formatoURL;
});

var videosList = new Array();

// Options for the observer (which mutations to observe)
var config = { attributes: true, childList: true, subtree: true };

// Callback function to execute when mutations are observed
var callback = (records) => {
    //searchIframes();
    var elChilds = [];
    for(var mutation of records) {
        if(mutation.target.hasChildNodes()) {
            elChilds.push(mutation);
        }
    }
    searchIframes(elChilds);
};

// Create an observer instance linked to the callback function
var observer = new MutationObserver(callback);

// Start observing the target node for configured mutations
observer.observe(targetNode, config);

// Later, you can stop observing
// observer.disconnect();

var videos = [];
var promisesList = [];
var sR = null;

/**
 * Listening for popup requests
 */
browser.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        sR = sendResponse;
        switch(message.type) {
            case "getLinks":
                if(videosList.length) {
                    sR(videosList || new Array());
                } else {
                    startToGet();
                }
                break;
            default:
                console.error("Unrecognised message: ", message);
        }
    }
);


/**
 * Execute on window load
 */
window.onload = () => {
    /**
     * Busca por iframes após o evento 'onload'
     * passa os elementos para getVideos
     */
    startToGet();
    rePos();
};

/**
 * Tags postion reval
 */
const rePos = () => {
    var links = document.querySelectorAll('[id^="getlink-"]');
    for(let link of links) {
        let url = link.querySelector('span').innerText;
        let sib = document.querySelector('iframe[src^="' + url + '"]');

        let coord = sib.getBoundingClientRect();
        link.style.top = (coord.top + document.body.scrollTop) + 'px';
        link.style.left = (coord.left) + 'px';
    }
}

/**
 * Centralized function call
 */
const startToGet = () => {
    getVideos(document.querySelectorAll('iframe'), 'player.vimeo.com/video','src');
}

/**
 * Busca por iframes em childs adicionadas dinamicamente.
 * 
 * @param  {Array} elChilds
 */
const searchIframes = elChilds => {

    var iFrames = [];
    for(var elChild of elChilds) {
        for(var item of elChild.target.getElementsByTagName('iframe')) {
            if(iFrames.indexOf(item) === -1) iFrames.push(item);
        }
    }

    getVideos(iFrames,'player.vimeo.com/video', 'src');
}

/**
 * Identifica iframes que possuem o padrão desejado.
 * Tendo identificado, o mesmo é adicionado a um Array (videos[]) exclusivo de
 * elementos já processados.
 * 
 * @param  {Array<Element>} elements
 * @param  {string} pattern
 * @param  {string} attr
 */
const getVideos = (elements, pattern, attr) => {
    for(var item of elements) {
        if(item.hasAttribute(attr) && item.getAttribute(attr).includes(pattern)) {
            // Possui o padrão (pattern)
            if(videos.indexOf(item) === -1) {
                // Ainda não foi processado
                videos.push(item); // Adiciona ao Array
                adicionaEtiquetas(item);
            }
        }
    }
    // if(sR) {
    //     Promise.all(promisesList).finnaly(() =>{
    //         sR(videosList);
    //     });
    // }
}

/**
 * 
 * @param {object} item 
 */
const adicionaEtiquetas = item => {
    var link = item.src;
    let video = {};
    
    if(formatoURL == 'simples') {
        link = link.split('?')[0];
        // link = link.replace('player.','');
        // link = link.replace('/video','');
    }

    new Promise((resolve,reject) => {
        let ar = new Array();
        var player = new Vimeo.Player(item);
        var t = player.getVideoTitle().then(title => { 
            video.title = title;
        })
        ar.push(t);
        var d = player.getDuration(item).then(duration => {
            video.duration = duration;
        })
        ar.push(d);

        video.url = link
        video.page = document.title || window.location.href;
        Promise.all(ar).finally(() => {
            resolve();
        })
        
    }).then(() => {
        videosList.push(video);
    });

    var linkId = link.split('/').pop();

    if(document.getElementById(linkId)) {
        return false;
    }

    // Novos elementos
    var el = document.createElement('div'); // Container
    el.setAttribute('id','getlink-' + linkId);

    var elLink = document.createElement('span'); // Link
    var elLinkTxt = document.createTextNode(link);
    var elEspaco = document.createTextNode(' ');
    var elBtn = document.createElement('img'); // Botão de cópia

    elLink.appendChild(elLinkTxt);
    elLink.style.verticalAlign = 'middle';
    elLink.style.display = 'inline-block';

    //elBtn.innerHTML = '';
    var b = (chrome)? chrome : browser;
    elBtn.setAttribute('src',b.extension.getURL('icon/copy.svg'));
    elBtn.setAttribute('alt','Copiar');
    elBtn.addEventListener('click', function() {
        selectElementText(elLink);
        document.execCommand('copy');
    });
    elBtn.style.height = '16px';
    elBtn.style.margin = '2px';
    elBtn.setAttribute('title','Copiar');
    elBtn.style.cursor = 'pointer';
    elBtn.style.display = 'inline-block';

    // Adicionando elementos
    el.appendChild(elLink);
    el.appendChild(elEspaco);
    el.appendChild(elBtn);
    item.parentElement.appendChild(el);

}
/**
 * Manipulação de texto a ser copiado para a área de transferência
 * 
 * @param  {object} el
 * @param  {window} win
 */
const selectElementText = (el, win) => {
    win = win || window;
    var doc = win.document, sel, range;
    if (win.getSelection && doc.createRange) {
        sel = win.getSelection();
        range = doc.createRange();
        range.selectNodeContents(el);
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (doc.body.createTextRange) {
        range = doc.body.createTextRange();
        range.moveToElementText(el);
        range.select();
    }
}