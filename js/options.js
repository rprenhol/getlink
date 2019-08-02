function saveOptions(e) {
    e.preventDefault();
    let value = 'simples';
    document.getElementsByName('formato').forEach((child) =>{
        if(child.checked)
            value = child.value;
    })
    chrome.storage.local.set({
        formatoURL: value
    }, function() {
        var status = document.getElementById('status');
        status.textContent = 'Saved!'
        setTimeout(function() {
            status.textContent = '';
        }, 2000);
    });

}

function restoreOptions() {

    function setCurrentChoice(result) {
        formato = result.formatoURL || 'simples';
        formatoURLBtn = document.getElementsByName('formato');
        formatoURLBtn.forEach( (child) => {
            child.checked = (child.name == formato);
        });
    }

    function onError(error) {
        console.log(`Error: ${error}`);
    }

    chrome.storage.local.get('formatoURL', result => {
        formato = result.formatoURL || 'simples';
        formatoURLBtn = document.getElementsByName('formato');
        formatoURLBtn.forEach( (child) => {
            child.checked = (child.value == formato);
        });
    });
}

window.onload = function() {
    document.getElementsByTagName('form')[0].addEventListener("submit", saveOptions);
}
document.addEventListener("DOMContentLoaded", restoreOptions);
