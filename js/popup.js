
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

    var gettedLinks = document.getElementById('getted-links');
    if(!videosList.length) {
        gettedLinks.innerHTML = '<div>Empty list</div>'
    }
    // exibeListaDeLink()
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
