
function qrcode_GE() {
    $("#qrCodeModal").modal("show");
    if ($("#QRcode_preview").empty()) {
        var qrcode_opts = {
            render: 'canvas',
            ecLevel: 'H',
            size: 250,
            fill: '#000',
            text: firebase.auth().currentUser.uid,
            quiet: 1,
            mode: 4,
            mSize: 0.25,
            mPosX: 0.5,
            mPosY: 0.5,
            label: '',
            fontname: 'sans',
            fontcolor: '#000',
            image: $("#userprofilepic")[0]
        };
        $("#QRcode_preview").qrcode(qrcode_opts);
    }
}