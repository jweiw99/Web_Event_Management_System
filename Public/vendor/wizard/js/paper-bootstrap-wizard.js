searchVisible = 0;
transparent = true;
var pic_valid = true;
var pic_valid_st = false;

$(document).ready(function () {

    // Wizard Initialization
    $('.wizard-card').bootstrapWizard({
        'tabClass': 'nav nav-pills',
        'nextSelector': '.btn-next',
        'previousSelector': '.btn-previous',

        onNext: function (tab, navigation, index) {
            var valid = 1;
            var check = validate_now(index);
            if (check) valid = $('.wizard-card form').eq(index - 1).valid();
            if (pic_valid) pic_valid_st = validate_picture();
            else pic_valid_st = true;
            if (!valid || !pic_valid_st) {
                return false;
            } else {
                if ($('#eventmethod') && $('#eventmethod').val() == 'edit' && index == 1) {
                    updateEvent(index);
                }
            }
        },

        onInit: function (tab, navigation, index) {

            //check number of tabs and fill the entire row
            var total = navigation.find('li').length;
            width = 100 / total;

            navigation.find('li').css('width', width + '%');

        },

        onTabClick: function (tab, navigation, index) {
            var valid = 1;
            var check = validate_now(index);
            if (check) valid = $('.wizard-card form').eq(index - 1).valid();
            if (pic_valid) pic_valid_st = validate_picture();
            else pic_valid_st = true;
            if (!valid || !pic_valid_st) {
                return false;
            } else {
                if ($('#eventmethod') && $('#eventmethod').val() == 'edit' && index == 1) {
                    updateEvent(index);
                }
                return true;
            }

        },

        onTabShow: function (tab, navigation, index) {
            var total = navigation.find('li').length;
            var current = index + 1;

            var wizard = navigation.closest('.wizard-card');

            // If it's the last tab then hide the last button and show the finish instead
            if (current >= total) {
                $(wizard).find('.btn-next').hide();
                $(wizard).find('.btn-finish').show();
            } else {
                $(wizard).find('.btn-next').show();
                $(wizard).find('.btn-finish').hide();
            }

            //update progress
            var move_distance = 100 / total;
            index = index == -1 ? 0 : index;
            move_distance = move_distance * (index) + move_distance / 2;

            wizard.find($('.progress-bar')).css({ width: move_distance + '%' });
            //e.relatedTarget // previous tab
            wizard.find($('.wizard-card .nav-pills li:nth-child(' + (index + 1) + ')')).addClass('active');
            wizard.find($('.wizard-card .nav-pills li.active a .icon-circle')).addClass('checked');

        }
    });


    // Prepare the preview for profile picture
    $("#eventpic").change(function () {
        readURL(this);
    });

    $('[data-toggle="wizard-radio"]').click(function () {
        wizard = $(this).closest('.wizard-card');
        wizard.find('[data-toggle="wizard-radio"]').removeClass('active');
        $(this).addClass('active');
        $(wizard).find('[type="radio"]').removeAttr('checked');
        $(this).find('[type="radio"]').attr('checked', 'true');
    });

    $('[data-toggle="wizard-checkbox"]').click(function () {
        if ($(this).hasClass('active')) {
            $(this).removeClass('active');
            $(this).find('[type="checkbox"]').removeAttr('checked');
        } else {
            $(this).addClass('active');
            $(this).find('[type="checkbox"]').attr('checked', 'true');
        }
    });

    $('.set-full-height').css('height', 'auto');

});

function validate_now(index) {
    switch (index) {
        case 1:
            $('.wizard-card form').eq(index - 1).validate({
                rules: {
                    eventname: {
                        required: true,
                        minlength: 3
                    },
                    location: {
                        required: true,
                        minlength: 3
                    },
                    desc: {
                        required: true,
                        minlength: 3
                    },
                    eventtime: {
                        required: true
                    }
                }
            });
            return 1;
        case 2:
            $('.wizard-card form').eq(index - 1).validate({
                ignore: "",
                rules: {
                    eventcreated: {
                        required: true
                    }
                }
            });
            return 1;
        case 3:
            return 0;
        case 4:
            return 0;
        default:
            break;
    }
}

function validate_picture() {
    return ($("#eventpic")[0].files && $("#eventpic")[0].files[0])?true:false;
}

//Function to show image before upload

function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        pic_valid = true;
        reader.onload = function (e) {
            $('#wizardPicturePreview').attr('src', e.target.result).fadeIn('slow');
        }
        reader.readAsDataURL(input.files[0]);
    } else {
        $('#wizardPicturePreview').attr('src', 'images/default-event.jpg').fadeIn('slow');
    }
}


function debounce(func, wait, immediate) {
    var timeout;
    return function () {
        var context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        }, wait);
        if (immediate && !timeout) func.apply(context, args);
    };
};
