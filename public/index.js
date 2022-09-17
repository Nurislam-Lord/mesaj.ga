var rsayi = Math.floor(Math.random()*4);
if(rsayi==0){
    document.querySelector('body').style.backgroundImage='url(https://i.hizliresim.com/38sn6fo.jpg)'
}else if(rsayi==1){
    document.querySelector('body').style.backgroundImage='url(https://i.hizliresim.com/2uucpmk.png)'
}else if(rsayi==2){
    document.querySelector('body').style.backgroundImage='url(https://i.hizliresim.com/1lxslvz.jpg)'
}else if(rsayi==3){
    document.querySelector('body').style.backgroundImage='url(https://i.hizliresim.com/egzhvyz.jpg)'
}

function kapat(id) {
    document.getElementById(id).style.display="none";
}

function ac(id,dl) {
    document.getElementById(id).style.display=dl;
}

function dbox() {
    var rot = document.getElementById('abs').style.transform;
    if (rot=='rotate(180deg)') {
        document.getElementById('abs').style.transform='rotate(0deg)';
    } else {
        document.getElementById('abs').style.transform='rotate(180deg)';
    }
}

function menua() {
    document.getElementById('menua').style.display="none";
    document.getElementById('menuk').style.display="inline";
    document.getElementById('m1').style.display="block";
    document.getElementById('m2').style.display="block";
    document.getElementById('nhr').style.display="block";
    document.getElementById('menuler').style.height="100vh";

}

function menuk() {
    document.getElementById('menua').style.display="inline";
    document.getElementById('menuk').style.display="none";
    document.getElementById('m1').style.display="none";
    document.getElementById('m2').style.display="none";
    document.getElementById('nhr').style.display="none";
    document.getElementById('menuler').style.height="auto";    
    document.getElementById('menuler').style.height="85px";    
    arak();
}

function araa() {
    document.getElementById('ara').style.display="block";
    document.getElementById('m5').style.display="block";
    document.getElementById('m4').style.display="none";
    document.getElementById('ara').style.paddingBottom="10px";
}

function araa2() {
    document.getElementById('ara').style.display="block";
    document.getElementById('m6').style.display="inline";
    document.getElementById('m7').style.display="none";
    document.getElementById('ara').style.paddingBottom="10px";
}

function arak() {
    document.getElementById('ara').style.display="none";
    document.getElementById('m5').style.display="none";
    document.getElementById('m4').style.display="block";
    document.getElementById('ara').style.paddingBottom="0px";
}

function arak2() {
    document.getElementById('ara').style.display="none";
    document.getElementById('m6').style.display="none";
    document.getElementById('m7').style.display="inline";
    document.getElementById('ara').style.paddingBottom="0px";
}