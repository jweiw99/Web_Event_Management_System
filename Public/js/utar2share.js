var defaultpage = "profile.html";
var quotaexceed = false;

(function ($) {
    "use strict"; // Start of use strict

    // Scroll to top button appear
    $(document).on('scroll', function () {
        var scrollDistance = $(this).scrollTop();
        if (scrollDistance > 100) {
            $('.scroll-to-top').fadeIn();
        } else {
            $('.scroll-to-top').fadeOut();
        }
    });

    // Smooth scrolling using jQuery easing
    $(document).on('click', 'a.scroll-to-top', function (e) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: 0
        }, 1000, 'easeInOutExpo');
        e.preventDefault();
    });

    // prevent firebase storage quota exceed
    /*
    $.ajax({
        dataType: "json",
        url: "https://firebasestorage.googleapis.com/v0/b/miniproject-ca058.appspot.com/o/logo.png?alt=media&token=77fc1417-8470-4b01-b3b0-ee42f829a461",
        mimeType: "application/json",
        error: function (error) {
            if (error.responseJSON && error.responseJSON.error.code == 402) {
                quotaexceed = true;
            }
            quotaexceed = true;
        }
    });
    */

})(jQuery); // End of use strict


function initApp() {
    return new Promise((resolve, reject) => {
        firebase.auth().onAuthStateChanged(function (user) {
            if (!user) {
                window.location.href = "index.html";
            }

            var username = user.displayName == null ? "User" : user.displayName;
            var photo = user.photoURL == null ? "https://i.imgur.com/oW1dGDI.jpg" : user.photoURL;
            $("#usernamebar").text(username);
            $("#userprofilepic").attr("src", photo);

            var docRef = firebase.firestore().collection("users");
            docRef.where("email", "==", user.email).where("gender", "==", "").get().then(function (querySnapshot) {
                if (!querySnapshot.empty && getPagename() != defaultpage) {
                    if (typeof $.dialog == 'undefined') {
                        $.getScript('js/bootstrap-dialog.min.js', function () {
                            $.dialog.alert('Missing Information', "Please Fill Up Your Information First.", function () {
                                window.location.href = defaultpage;
                            });
                        });
                    } else {
                        $.dialog.alert('Missing Information', "Please Fill Up Your Information First.", function () {
                            window.location.href = defaultpage;
                        });
                    }
                }
                resolve(user);
            });
        });
    });

}

$("#SignOut").click(function (e) {
    firebase.auth().signOut();
    window.location.href = "index.html";
});

function getPagename() {
    var loc = window.location.pathname;
    var pathName = loc.substring(loc.lastIndexOf('/') + 1);
    return pathName;
}

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