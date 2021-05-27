
var videosList = new Array();
const browser = (chrome) ? chrome : browser;
/**
 * Query for link video on active tab
 */
browser.tabs.query({active: true, currentWindow: true}, function(tabs) {
    browser.tabs.sendMessage(tabs[0].id, {type: "getLinks"}, videos => {
        if(videos) {
            for(let link of videos) {
                videosList.push(link);
            }
            exibeListaDeLink();
        }
    });
});

/**
 * Set listeners on window load
 */
window.onload = () => {
    var btnCopy = document.getElementById('copy');
    var btnDown = document.getElementById('down');
    btnCopy.addEventListener('click', () => {
        // Clipboard API available?
        if (!navigator.clipboard) {
            var gettedLinks = document.getElementById('getted-links');
            selectElementText(gettedLinks);

            document.execCommand('copy')
            return
        } else {
            var gettedLinks = document.querySelectorAll('li');
            selectElementText(document.getElementsByTagName('ul')[0]);
            copyToClickBoard(gettedLinks);
        }
    });

    btnDown.addEventListener('click', downloadM3U);

    var gettedLinks = document.getElementById('getted-links');
    if(!videosList.length) {
        gettedLinks.innerHTML = '<div>Empty list</div>'
    }
    // exibeListaDeLink()
}

const downloadM3U = () => {
    if(!videosList.length) {
        return false;
    }
    var element = document.createElement('a');
    let txtContent = '#EXTM3U\n';
    let page = '';
    videosList.forEach(item => {
        let inf = '#EXTINF:';
        inf += item.duration + ',' + item.title + '\n';
        inf += item.url + '\n';
        txtContent += inf;
        page = item.page;
    })
    console.log(txtContent)
    var illegalRe = /[\/\?<>\\:\*\|"]/g;
    var controlRe = /[\x00-\x1f\x80-\x9f]/g;
    var reservedRe = /^\.+$/;
    var replacement = '_';
    page = page.replace(illegalRe,replacement).replace(controlRe,replacement).replace(reservedRe, replacement);
    let data = new Date().toLocaleString('pt-br');
    let filename = 'GetLink-' + page + '-' + data + '.m3u';
    console.log(filename);
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(txtContent));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
  }

/**
 * Build links list
 */
const exibeListaDeLink = () => {
    var gettedLinks = document.getElementById('getted-links');
    var listToCopy = document.getElementById('list-to-copy');
    if(videosList.length) {
        var ul = document.createElement('ul');
        gettedLinks.innerHTML = '';
        listToCopy.value = '';
        
        for(let link of videosList) {
            let li = document.createElement('li');
            li.innerText = link.url;
            li.title = link.title;
            listToCopy.value += link.url + '\n';
            ul.appendChild(li);
        }
        gettedLinks.appendChild(ul);
    } 
}

/**
 * Make selectio on text node
 * @param {object} el 
 * @param {Window} win (optional)
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

/**
 * Make copy to clipboard using Clipboard API
 * @param {Array<object>} arEl 
 */
const copyToClickBoard = arEl => {
    var content = '';
    for(let el of arEl) {
        content += el.innerText + '\n';
    }

    navigator.clipboard.writeText(content)
        .then(() => {
        console.log("Text copied to clipboard...")
    })
        .catch(err => {
        console.log('Something went wrong', err);
    })
 
}
