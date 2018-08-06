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


var targetNode = document.body;

// Options for the observer (which mutations to observe)
var config = { attributes: false, childList: true, subtree: true };

// Callback function to execute when mutations are observed
var callback = function(records) {
  //searchIframes();
  var elParents = [];
  for(var mutation of records) {
    //console.log(mutation.target.hasChildNodes());
    if(mutation.target.hasChildNodes()) {
      elParents.push(mutation);
    }
  }
  searchIframes(elParents);
};

// Create an observer instance linked to the callback function
var observer = new MutationObserver(callback);

// Start observing the target node for configured mutations
observer.observe(targetNode, config);

// Later, you can stop observing
// observer.disconnect();

var videos = [];
function searchIframes(elParents) {
  var iFrames = [];
  for(var elParent of elParents) {
    for(var item of elParent.target.getElementsByTagName('iframe')) {
      if(iFrames.indexOf(item) === -1) iFrames.push(item);
    }
  }

  for(var item of iFrames) {
    if(item.getAttribute('src').includes('vimeo')) {
      if(videos.indexOf(item) === -1) {
        videos.push(item);
        adicionaEiqueta(item);
      }
    }
  }
}

function adicionaEiqueta(item) {
  var link = item.src;
  var linkId = link.split('/').pop();

  if(document.getElementById(linkId)) {
    console.log(linkId + ' já existe!');
    return false;
  }

  // Novos elementos
  var el = document.createElement('div'); // Container
  el.setAttribute('id','iframe-' + linkId);

  var elLink = document.createElement('span'); // Link
  var elEspaco = document.createTextNode(' ');
  var elBtn = document.createElement('img'); // Botão de cópia
  elLink.innerHTML = link;

  //elBtn.innerHTML = '';
  elBtn.setAttribute('src',browser.extension.getURL('icon/copy.svg'));
  elBtn.setAttribute('alt','Copiar');
  elBtn.addEventListener('click', function() {
    selectElementText(elLink);
    document.execCommand('copy');
  });

  // Definindo estilo
  el.style.position = 'absolute';
  el.style.fontSize = '10px';
  el.style.zIndex = 1000;
  el.style.left = item.offsetLeft;
  el.style.top = item.offsetTop;
  el.style.backgroundColor = 'rgba(255,255,255,0.8)';

  elBtn.style.height = '16px';
  elBtn.style.margin = '2px';
  elBtn.setAttribute('title','Copiar');
  elBtn.style.cursor = 'pointer';
  // Adicionando elementos
  el.appendChild(elLink);
  el.appendChild(elEspaco);
  el.appendChild(elBtn);
  item.parentElement.appendChild(el);
}

function selectElementText(el, win) {
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

