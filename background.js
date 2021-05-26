var linksColetados = new Array();

var sendToPopup = (request, sender, sendResponse) => {
    console.log(request);

    browser.runtime.sendMessage({ url: request.url }).then(msg => {
        console.log(msg);
    }, err => {
        console.error(err);
    });
    sendResponse({ response: "Reached" });
}

browser.runtime.onMessage.addListener(sendToPopup);
