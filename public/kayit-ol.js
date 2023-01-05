var modeDark = false
if (modeDark == false) {
    document.getElementById('styles').href = 'style.css';
}

// var gizle = document.getElementById('gizle');
// var goster = document.getElementById('goster');
var sifreInput = document.getElementsByClassName('input')[1]
var nextBtn = document.getElementsByClassName('sonraki-btn');
// goster.onclick = function () {
//     goster.style.display = "none";
//     gizle.style.display = "inline-block";
//     sifreInput.type = "text";
// }
// gizle.onclick = function () {
//     gizle.style.display = "none";
//     goster.style.display = "inline-block";
//     sifreInput.type = "password";
// }

var keb = 0;

nextBtn[0].onclick = function () {
    var input = document.getElementsByClassName('input');
    if (input[0].value != '') {
        if (input[0].value.indexOf('@') != -1) {
            if (input[0].value.indexOf('.') != -1) {
                var i = document.getElementsByTagName('i');
                var img = document.getElementsByTagName('img');
                var form1 = document.getElementById('form1');
                var form2 = document.getElementById('form2');
                if (input[0].value != '') {
                    form1.style.left = "-100%";
                    form2.style.left = "-100%";
                    console.log(input);
                    img[0].style.display = "none";
                    img[1].style.display = "inline-block";
                }
            } else {
                document.getElementsByClassName('alert-bg')[0].style.display = "flex";
                setTimeout(alertWindow, 10)
            }
        } else {
            document.getElementsByClassName('alert-bg')[0].style.display = "flex";
            setTimeout(alertWindow, 10)
        }

    }
}

nextBtn[1].onclick = function () {
    var input = document.getElementsByClassName('input');
    if (input[0].value != '') {
        var i = document.getElementsByTagName('i');
        var img = document.getElementsByTagName('img');
        var form1 = document.getElementById('form2');
        var form2 = document.getElementById('form3');
        if (input[0].value != '') {
            form1.style.left = "-200%";
            form2.style.left = "-200%";
            // i[4].style.display = "inline-block";
            // i[5].style.display = "inline-block";
            console.log(input);
            img[1].style.display = "none";
            img[2].style.display = "inline-block";
        }


    } else {
        document.getElementsByClassName('alert-bg')[0].style.display = "flex";
        setTimeout(alertWindow, 10)
    }
}

function alertWindow() {
    document.getElementsByClassName('alert-window')[0].style.top = "0%";
}

function alertWindowKapat() {
    document.getElementsByClassName('alert-bg')[0].style.display = "none";
}

function alertWindowKapat2() {
    document.getElementsByClassName('alert-bg2')[0].style.display = "none";
}

var tmmBtn = document.getElementsByClassName('tmm-btn');
tmmBtn[0].onclick = function () {
    document.getElementsByClassName('alert-window')[0].style.top = "-100%";
    setTimeout(alertWindowKapat, 300)
}
// tmmBtn[1].onclick = function () {
//     document.getElementsByClassName('alert-window2')[0].style.top = "-100%";
//     setTimeout(alertWindowKapat2, 300)
// }

window.onkeydown = function (olay) {
    if (olay.key == "Tab") {
        return false;
    } else if (olay.key == "Enter") {
        var input = document.getElementsByClassName('input');
        if (keb == 0) {
            var input = document.getElementsByClassName('input');
            if (input[0].value != '') {
                if (input[0].value.indexOf('@') != -1) {
                    if (input[0].value.indexOf('.') != -1) {
                        var i = document.getElementsByTagName('i');
                        var img = document.getElementsByTagName('img');
                        var form1 = document.getElementById('form1');
                        var form2 = document.getElementById('form2');
                        if (input[0].value != '') {
                            form1.style.left = "-100%";
                            form2.style.left = "-100%";
                            console.log(input);
                            img[0].style.display = "none";
                            img[1].style.display = "inline-block";
                        }
                        keb = 1
                    } else {
                        document.getElementsByClassName('alert-bg')[0].style.display = "flex";
                        setTimeout(alertWindow, 10)
                    }
                } else {
                    document.getElementsByClassName('alert-bg')[0].style.display = "flex";
                    setTimeout(alertWindow, 10)
                }
            }
        } else if (keb == 1) {
            var input = document.getElementsByClassName('input');
            if (input[1].value != '') {
                if (input[0].value.indexOf('@') != -1) {
                    if (input[0].value.indexOf('.') != -1) {
                        var i = document.getElementsByTagName('i');
                        var img = document.getElementsByTagName('img');
                        var form1 = document.getElementById('form2');
                        var form2 = document.getElementById('form3');
                        if (input[0].value != '') {
                            form1.style.left = "-200%";
                            form2.style.left = "-200%";
                            console.log(input);
                            img[1].style.display = "none";
                            img[2].style.display = "inline-block";
                        }
                    } else {
                        document.getElementsByClassName('alert-bg')[0].style.display = "flex";
                        setTimeout(alertWindow, 10)
                    }
                } else {
                    document.getElementsByClassName('alert-bg')[0].style.display = "flex";
                    setTimeout(alertWindow, 10)
                }
            }
        }
        return false;
    }
}