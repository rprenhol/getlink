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
var config = { attributes: true, childList: true, subtree: true };

// Callback function to execute when mutations are observed
var callback = function(records) {
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
/**
 * Busca por iframes em childs adicionadas dinamicamente.
 * 
 * @param  {Array} elChilds
 */
function searchIframes(elChilds) {

  var iFrames = [];
  for(var elChild of elChilds) {
    for(var item of elChild.target.getElementsByTagName('iframe')) {
      if(iFrames.indexOf(item) === -1) iFrames.push(item);
    }
  }

  getVideos(iFrames,'vimeo');
}

/**
 * Identifica iframes que possuem o padrão desejado.
 * Tendo identificado, o mesmo é adicionado a um Array (videos[]) exclusivo de
 * elementos já processados.
 * 
 * @param  {Array} iFrames
 * @param  {string} pattern
 */
function getVideos(iFrames, pattern) {
  for(var item of iFrames) {
    if(item.getAttribute('src').includes(pattern)) {
      // Possui o padrão (pattern)
      if(videos.indexOf(item) === -1) {
        // Ainda não foi processado
        videos.push(item); // Adiciona ao Array
        adicionaEiqueta(item);
      }
    }
  }
}

window.addEventListener('load', function() {
  /**
   * Busca por iframes após o evento 'onload'
   * passa os elementos para getVideos
   */
  getVideos(document.getElementsByTagName('iframe'), 'vimeo');
});

function adicionaEiqueta(item) {
  var link = item.src;
  var linkId = link.split('/').pop();

  if(document.getElementById(linkId)) {
    return false;
  }

  // Novos elementos
  var el = document.createElement('div'); // Container
  el.setAttribute('id','iframe-' + linkId);

  var elLink = document.createElement('span'); // Link
  var elLinkTxt = document.createTextNode(link);
  var elEspaco = document.createTextNode(' ');
  var elBtn = document.createElement('img'); // Botão de cópia
  
  elLink.appendChild(elLinkTxt);
  elLink.style.verticalAlign = 'super';
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

  // Definindo estilo
  el.style.position = 'absolute';
  el.style.fontSize = '10px';
  el.style.zIndex = 1000;
  el.style.left = item.offsetLeft;
  el.style.top = item.offsetTop;
  el.style.backgroundColor = 'rgba(255,255,255,0.8)';
  el.style.whiteSpace = 'nowrap';
  el.style.overflow = 'hidden';

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

