var modeDark = false

if (modeDark == false) {
    document.getElementById('styles').href = 'style.css';
}

var mail = undefined;


window.addEventListener("load", (event) => {
    document.getElementById('beyazlik').style.opacity = '0%';
    setTimeout(loading(), 500)
});

function loading() {
    document.getElementById('beyazlik').style.display = 'none';
}

function next(veri) {
    var desta = document.getElementById(veri).value;
    if (desta != '' && desta != ' ') {
        if (veri == 'email') {
            var ms = document.getElementById('mail-sor');
            var as = document.getElementById('ad-sor');
            var fs = document.getElementsByClassName('farkli-s');
            var or = document.getElementsByClassName('or');
            ms.style.display = 'none';
            as.style.display = 'block';
            for (let i = 0; i < or.length; i++) {
                or[i].style.display = 'none';
            }
            for (let i = 0; i < fs.length; i++) {
                fs[i].style.display = 'none';
            }
            mail = desta;
        } else {
            var ad = desta;
            if (desta) {
                socket.emit('ad', ad);
                desta = '';
            }
        }
    }
}