var canvas;
var context;
var myLogos;
var myCustomLogos;
var debug;
var myEditor;
var f;
var canvasScale = 1;
var SCALE_FACTOR = 1.2;
var current;
var list = [];
var state = [];
var index = 0;
var index2 = 0;
var action = false;
var boundingBox;
var bgImageBox;
var isIE= false;
var refresh = true;
var ischanged = false;//the only way it will be false is if we save the design i.e. passing the data to add cart API method
var ie = (function () {
    var undef, v = 3, div = document.createElement('div');

    while (
        div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
            div.getElementsByTagName('i')[0]
        );

    return v > 4 ? v : undef;
}());
var ua = window.navigator.userAgent;
var msie = ua.indexOf("MSIE ");

if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))      // If Internet Explorer, return version number
    isIE=true;

var ie10 = (function () {
    "use strict";
    var tmp = (document["documentMode"] || document.attachEvent) && "ev"
        , msie = tmp
            && (tmp = window[tmp + "al"])
            && tmp("/*@cc_on 1;@*/")
            && +((/msie (\d+)/i.exec(navigator.userAgent) || [])[1] || 0)
        ;
    return msie || void 0;
})();
var hexDigits = new Array
("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f");

//Function to convert hex format to a rgb color
function rgb2hex(rgb) {
    rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}

function hex(x) {
    return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
}
function getQuerystring(key, default_) {
    if (default_ == null) default_ = "";
    key = key.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + key + "=([^&#]*)");
    var qs = regex.exec(window.location.href);
    
    if (qs == null)
        return default_;
    else
        return qs[1];
}
function confirmExit() {
    if (typeof(ie) == "undefined")
        if (typeof(ie10) == "undefined")

            if (ischanged == false)
                ;
            else
                return "You are about to navigate away from your project. Would you like to save it before leaving?";

}
function checkboundries(e) {
    checkAllboundries()
}

function checkAllboundries() {
    var warning = 0;

    $.each(canvas.getObjects(), function (i, item) {
        var target = item
            , height = target.currentHeight
            , width = target.currentWidth
            , top = target.top
            , left = target.left
            , rightBound = boundingBox.left + boundingBox.width
            , bottomBound = boundingBox.top + boundingBox.height
            , modified = false;
        // don't move off top
        if (item.selectable) {
            if (left < boundingBox.left) {
                warning = 1;
            }
            if (top < boundingBox.top) {
                warning = 1;
            }
            if (top + height > bottomBound) {
                warning = 1;
            }
            if (left + width > rightBound) {
                warning = 1
            }
        }
    });


    if (warning) {

        $('#warning').show();
        $('#warning').css('left', $('#canvas').offset().left + parseInt(myEditor.canvasDimentions.left)).css('top', $('#canvas').offset().top - 30 + parseInt(myEditor.canvasDimentions.top))

    }
    else {

        $('#warning').hide();
    }
}

window.onbeforeunload = confirmExit; //A function that will be executed if the user wants to naviagte away from web page
$(document).ready(function () {

    myEditor = new Editor();
    myEditor.loadEditor();
    myEditor.resetUndoState();
    debug = new editorDebugger();

    if (hideChangeProduct == 1) {
        $('#change_product').hide();
        $('ul.oe_menu li:nth-child(2) div').css('left', '0px');
        $('ul.oe_menu li:nth-child(3) div').css('left', '-232px');
        $('ul.oe_menu li:nth-child(4) div').css('left', '-464px');
        $('ul.oe_menu li:nth-child(2)').each(function (i, item) {
            if (typeof($(item).attr('class')) == "undefined")
                $(item).width('300px');
        });
        $('ul.oe_menu li:nth-child(3)').each(function (i, item) {
            if (typeof($(item).attr('class')) == "undefined")
                $(item).width('300px');
        })
        $('ul.oe_menu li:nth-child(4)').each(function (i, item) {
            if (typeof($(item).attr('class')) == "undefined")
                $(item).width('200px');
        })

    }
    if (hideNamesandNumbers == 1) {
        $('#ui-accordion-accordion-header-4').hide();
        $('#ui-accordion-accordion-header-6').css('top', '823px');
        $('.accordian-price-box').css('top', '890px');
    }

    canvas.on("object:added", function (e) {

        if (action === true) {

            var object = e.target;
            state[++index] = JSON.stringify(canvas.toDatalessJSON(['logoid', 'selectable', 'evented', 'id']));
            refresh = true;
            action = false;
            canvas.renderAll();
            ischanged = true;
            checkAllboundries();
        }
    });
    canvas.on("object:modified", function (e) {
        var object = e.target;
        state[++index] = JSON.stringify(canvas.toDatalessJSON(['logoid', 'selectable', 'evented', 'id']));
        action = false;
        ischanged = true;
        checkAllboundries();
        });

    canvas.on("object:removed", function (e) {
        var object = e.target;
        state[++index] = JSON.stringify(canvas.toDatalessJSON(['logoid', 'selectable', 'evented', 'id']));
        action = false;
        ischanged = true;
        checkAllboundries()
    });
    canvas.on('object:moving', checkboundries);

});

function Editor() {
    this.mouseX = 0;
    this.mouseY = 0;
    this.myDesigns = '';
    this.textColors = [];
    this.availableColors = [];
    this.textFonts = [];
    this.availableShapes = [];
    this.defaultColor = '#AE3540';
    this.currentFont = 'Helvetica';
    this.defaultFont = 'Helvetica';
    this.currentFontColor = '#AE3540';
    this.currentFontShape = 'STRAIGHT';
    this.currentFontRange = $('#range').val();
    this.currentFontRadius = $('#radius').val();
    this.currentFontSpacing = $('#spacing').val();
    this.currentFontSmall = $('#small').val();
    this.currentFontLarge = $('#large').val();
    this.currentFontAlign = '';
    this.currentShadowEffect = '';
    this.currentShadowColor = '#AE3540';
    this.shadowOffsetX = 10;
    this.shadowOffsetY = 10;
    this.currentOutlineEffect = '';
    this.currentOutlineColor = '#AE3540';
    this.currentOutlineWidth = 1;
    this.currentImageFile = '';
    this.currentLogoId = '';
    this.currentCustomImageFile = '';
    this.currentImagecolor = '';
    this.currentProductColor = '';
    this.cartLineInfo = '';
    this.defaultView = '';
    this.currentNumberFont = '';
    this.currentNameFont = '';
    this.currentNumberColor = '';
    this.currentNameColor = '';
    this.jsons = new Object();
    this.nameNumberJsons = new Object();
    this.currentView = '';
    this.currentNameNumberView = 0;
    this.currentNameNumber = '';
    this.canvasDimentions = new Object();
    this.currentDecorationMethod = 'Printed';
    this.productSizes = new Object();
    this.grabAvailableSizes = function () {
        var data = {'style': myEditor.cartLineInfo.styleNumber, 'color': myEditor.currentProductColor};
        jQuery.ajax({
            url: available_sizes_API,
            data: data,
            type: "POST",
            success: function (data) {
                if (typeof(data) == "string")
                    var json = jQuery.parseJSON(data);
                else
                    var json = data;
                myEditor.productSizes = json.availableSizes;
                myEditor.populateAvailableSizes();
            },
            error: function (data) {

            }

        });
    };



    this.getFontId = function (name) {

        var id;
        $.each(myEditor.textFonts, function (i, obj) {
            if (obj.fontName == name)
                id = obj.FontID;
        });
        return id;
    }

    this.getColorId = function (name) {

        var id;
        $.each(myEditor.textColors, function (i, obj) {
            if (obj.colorHexCode == name)
                id = obj.textColorID;
        });
        return id;
    }

    this.getShapeId = function (name) {

        var id;
        $.each(myEditor.availableShapes, function (i, obj) {
            if (obj.ShapeName == name)
                id = obj.ShapeID;
        });
        return id;
    }

    this.getObjectColors = function (obj) {
        var colors = [];
        if (obj.type == "images") {

        }
        else if (obj.type == "path") {
            if ((obj.fill).indexOf('rgb') > -1)
                var colorId = rgb2hex(obj.fill);
            else
                var colorId = (obj.fill);
            colors.push(colorId)
        }
        else if (obj.type == "path-group") {

            $.each(obj.paths, function (i, item) {

                if (jQuery.inArray(item.fill, colors) > -1) {


                }
                else {
                    if (typeof(item.fill) != "object") {
                        if ((item.fill).indexOf('rgb') > -1)
                            var colorId = rgb2hex(item.fill);
                        else
                            var colorId = (item.fill);
                        colors.push(colorId)
                    }
                }

            });

        }

        return colors;
    }

    this.prepareSummaryJSON = function () {

        if (myEditor.currentView != "") {
            //Remove the bg and bounding box images

            var alldata = canvas.toDatalessJSON(['logoid', 'selectable', 'evented', 'id']);
            var my_objs = Array();
            $.each(alldata.objects, function (i, item) {

                if (i == 0 || i == 1)
                    ;
                else {
                    my_objs.push(item);
                }

            })
            var json = JSON.stringify({'background': '', 'objects': my_objs});
            myEditor.jsons[myEditor.currentView] = json;

        }
        var obj = new Object();
        obj.decorationMethod = myEditor.currentDecorationMethod;
        obj.loadedDesignName = myEditor.loadedDesignName;
        obj.notes = $('.notes-tbox').val();
        obj.designViews = new Array();
        $.each(myEditor.cartLineInfo.productImages, function (i, view) {
            var views = new Object();
            views.viewName = view.viewName
            views.designObjects = new Array();
            $objs = myEditor.jsons[views.viewName];
            $objs = jQuery.parseJSON($objs);
            $.each($objs.objects, function (j, $obj) {
                var newobj = new Object();
                if ($obj.type == 'image') {
                    newobj.src = $obj.src;
                    newobj.type = 'uploadedLogo';
                }
                else if ($obj.type == 'path' || $obj.type == 'path-group') {
                    newobj.type = 'stockLogo';
                    newobj.logoID = $obj.logoid;
                    newobj.customizedColors = myEditor.getObjectColors($obj);
                }
                else {
                    newobj.type = 'text';
                    newobj.fontID = myEditor.getFontId($obj.fontFamily);
                    newobj.textColorID = myEditor.getColorId($obj.fill);
                    newobj.textShapeID = myEditor.getShapeId($obj.effect);
                    if ($obj.shadow != null) {
                        newobj.shadowColorID = myEditor.getColorId($obj.shadow.color);
                        newobj.shadowOffsetX = $obj.shadow.offsetX;
                        newobj.shadowOffsetY = $obj.shadow.offsetY;
                    }
                    if ($obj.stroke != null) {
                        newobj.outlineColorID = myEditor.getColorId($obj.stroke);
                        newobj.outlineWidth = $obj.strokeWidth;
                    }
                    newobj.textString = $obj.text;
                }
                views.designObjects.push(newobj);
            })
            obj.designViews.push(views);
        });

    }

    this.resetUndoState = function () {
        current = '';
        list = [];
        state = [];
        index = 0;
        index2 = 0;
        var action = false;
        var refresh = true;
        state[0] = JSON.stringify(canvas.toDatalessJSON(['logoid', 'selectable', 'evented', 'id']));

    };
    this.saveState = function (isText) {
        /*if(typeof(isText)!='undefined')
        {
            var obj=canvas.getActiveObject();
            myEditor.changeFontColor(obj.get('fill'));
            myEditor.changeFont(obj.get('fontFamily'));
            if(obj.shadow!=null)
                myEditor.changeShadowEffect(1);
        }*/
        state[++index] = JSON.stringify(canvas.toDatalessJSON(['logoid', 'selectable', 'evented', 'id']));
        action = false;
    };

    this.show_menu = function (id) {
        $('.menus').hide();
        $('#' + id).show();
        $('#' + id).css('z-index', '999');
        $('#' + id).offset({'left': $('.preview').offset().left - 4})

    }
    this.hide_menu = function () {
        $('.menus').hide();
    }

    this.populateAvailableSizes = function () {

        //populate names/numbers
        $('.namenumber_size').each(function (i, item) {
            var html = '';
            $.each(myEditor.productSizes, function (j, size) {
                html += '<option value="' + size + '">' + size + '</option>';
            });
            $(item).html(html);

        });
    };
    this.selectFontFace = function (fontFace) {
        myEditor.currentFont = fontFace;
        $('#current_font').html(fontFace);
        $('#current_font').css('font-family', fontFace);
    }
    this.selectTextShape = function (fontShape) {
        myEditor.currentFontShape = fontShape;
        $('#my_text_shape').val(fontShape);
        $('#current_shape').html('<img src="images/' + fontShape + '.png" height="28px" />');
        $('#range').show();
        $('#radius').show();
        $('#spacing').show();
        $('#small').show();
        $('#large').show();
        $('.labelSlider').show();
        if (fontShape == "STRAIGHT") {
            $('#range').hide();
            $('#radius').hide();
            $('#small').hide();
            $('#large').hide();
            $('#spacing').hide();
            $('.range').hide();
            $('.radius').hide();
            $('.small').hide();
            $('.large').hide();
            $('.spacing').hide();
            $('.shadow_shapes').hide();
        }
        else if (fontShape == "curved" || fontShape == "arc") {
            $('#range').hide();
            $('#small').hide();
            $('#large').hide();
            $('.range').hide();
            $('.small').hide();
            $('.large').hide();
            $('.shadow_shapes').show();
        }
        else {
            $('#radius').hide();
            $('#spacing').hide();
            $('#range').hide();
            $('.radius').hide();
            $('.spacing').hide();
            $('.range').hide();
            $('.shadow_shapes').show();
        }
    }
    this.changeTextShape = function (fontShape) {
        myEditor.currentFontShape = fontShape;
        $('#my_text_shape').val(fontShape);
        $('#current_shape').html('<img src="images/' + fontShape + '.png" height="28px" />');
        $('#range').show();
        $('#radius').show();
        $('#spacing').show();
        $('#small').show();
        $('#large').show();
        $('.labelSlider').show();

        if (fontShape == "STRAIGHT") {
            $('#range').hide();
            $('#radius').hide();
            $('#small').hide();
            $('#large').hide();
            $('#spacing').hide();
            $('.range').hide();
            $('.radius').hide();
            $('.small').hide();
            $('.large').hide();
            $('.spacing').hide();
            $('.shadow_shapes').hide();
        }
        else if (fontShape == "curved" || fontShape == "arc") {
            $('#range').hide();
            $('#small').hide();
            $('#large').hide();
            $('.range').hide();
            $('.small').hide();
            $('.large').hide();
            $('.shadow_shapes').show();
        }
        else {
            $('#radius').hide();
            $('#spacing').hide();
            $('#range').hide();
            $('.radius').hide();
            $('.spacing').hide();
            $('.range').hide();
            $('.shadow_shapes').show();
        }
        $('#current_shape').html('<img src="images/' + fontShape + '.png" height="28px" />');
        myEditor.updateText();
    };
    this.selectEffectColor = function (colorName, colorCode) {
        $('.effectColors').removeClass('selectedFont');
        $('#effectColor_' + colorName).addClass('selectedFont');
        myEditor.currentEffectColor = colorCode;

    }
    this.selectFontColor = function (colorName, colorCode) {
        $('.fontColors').removeClass('selectedFont');
        $('#fontColor_' + colorName).addClass('selectedFont');
        myEditor.currentFontColor = colorCode;
        $('a', '#my_text_colors_link').css('background', colorCode);

    }
    this.changeFontColor = function (colorCode) {
        var obj = canvas.getActiveObject();
        if (!obj) return;
        if (obj.type == "text" || obj.type == "curvedText") {
            if (typeof(obj.effect) != "undefined")
                obj.letters.set('fill', colorCode);
            else
                obj.fill = colorCode;
            obj.fill = colorCode;
        }

        canvas.renderAll();
        myEditor.saveState();
    }
    this.changeDecorationMethod = function (method) {
        $('#method_Printed').removeClass('selectedFont').css('border', '2px solid transparent');
        $('#method_Pressed').removeClass('selectedFont').css('border', '2px solid transparent');
        $('#method_Stitched').removeClass('selectedFont').css('border', '2px solid transparent');

        $(".pink2").css("background-color", "#dbdbdb").css('color', '#443e40');
        myEditor.currentDecorationMethod = method;
        $('#method_' + method).addClass('selectedFont');
        $(".pink2", '#method_' + method).css("background-color", "#ec0086").css('color', '#FFF');
        $('#method_' + method).css('border', '2px solid #ec0086');
        //Show Add Text
        $("#accordion").accordion("option", "active", 1);
        if ($('#my_text').val() == "")
            $('#my_text').val('Your text here')
        myEditor.addText();
        canvas.setActiveObject(canvas.item(0))
        //TODO: do the decoration methods
    };
    this.changeShadowColor = function (colorCode) {
        var obj = canvas.getActiveObject();
        if (!obj) return;
        if (obj.type == "text" || obj.type == "curvedText") {

            if (typeof(obj.shadow) != "undefined" && obj.shadow != null) {

                canvas.getActiveObject().set('shadow', {
                    color: colorCode,
                    blur: 1,
                    offsetX: myEditor.shadowOffsetX,
                    offsetY: myEditor.shadowOffsetY
                });
                $('#my_effects_colors_shadow_pal').val(colorCode)
                //$("#my_effects_colors_shadow_pal").spectrum("set", $('#my_effects_colors_shadow_pal').val());
                //obj.fill=myEditor.colorCode;
                canvas.getActiveObject().setText(canvas.getActiveObject().text);
                myEditor.saveState();
                canvas.renderAll();

            }
        }

    }
    this.changeOutlineColor = function (colorCode) {
        var obj = canvas.getActiveObject();
        if (!obj) return;
        if (obj.type == "text" || obj.type == "curvedText") {
            if (typeof(obj.stroke) != "undefined" && obj.stroke != null && obj.stroke != "") {

                canvas.getActiveObject().set('stroke', colorCode);
                canvas.getActiveObject().set('strokeWidth', 1);
                $('#my_effects_colors_outline_pal').val(colorCode)
              //  $("#my_effects_colors_outline_pal").spectrum("set", $('#my_effects_colors_outline_pal').val());
                canvas.getActiveObject().setText(canvas.getActiveObject().text);
                myEditor.saveState();
                canvas.renderAll();
            }
        }

    }

    this.changeShadowEffect = function (apply) {
        var obj = canvas.getActiveObject();
        if (!obj) return;
        if (obj.type == "text" || obj.type == "curvedText") {
            if (apply == 1) {

                canvas.getActiveObject().set('shadow', {
                    color: myEditor.currentShadowColor,
                    blur: 1,
                    offsetX: myEditor.shadowOffsetX,
                    offsetY: myEditor.shadowOffsetY
                });
                $('#effect_outline').removeClass('selectedFont');
                myEditor.currentOutlineEffect = '';
                myEditor.changeOutlineEffect(0);
                canvas.getActiveObject().setText(canvas.getActiveObject().text);

            }
            else {
                obj.set('shadow', null);
                for (var i = 0; i < obj.letters._objects.length; i++) {
                    obj.letters.item(i).set('shadow',null)
                }
            }
            myEditor.saveState();
            canvas.renderAll();
        }

    }

    this.changeOutlineEffect = function (apply) {
        var obj = canvas.getActiveObject();
        if (!obj) return;
        if (obj.type == "text" || obj.type == "curvedText") {
            if (apply == 1) {
                obj.set('stroke', myEditor.currentOutlineColor);
                obj.set('strokeWidth', parseInt(myEditor.currentOutlineWidth));
                $('#effect_shadow').removeClass('selectedFont');
                myEditor.currentShadowEffect = '';
                myEditor.changeShadowEffect(0)
                canvas.getActiveObject().setText(canvas.getActiveObject().text);
            }
            else {
                obj.set('stroke', null);
                obj.set('strokeWidth', parseInt(myEditor.currentOutlineWidth));
                for (var i = 0; i < obj.letters._objects.length; i++) {
                    obj.letters.item(i).set('stroke',null);
                    obj.letters.item(i).set('strokeWidth', parseInt(myEditor.currentOutlineWidth));
                }
            }

            myEditor.saveState();
            canvas.renderAll();
        }

    }
    this.changeFont = function (font) {
        myEditor.currentFont = font;
        console.log(font);
        $('#current_font').html(font);
        $('#current_font').css('font-family', font);
        var obj = canvas.getActiveObject();
        if (!obj) return;
        if (obj.type == "text" || obj.type == "curvedText") {
            if (typeof(obj.effect) != "undefined")
            {
                obj.set('fontFamily', font);
                obj.letters.set('fontFamily', font);
            }
            else
                obj.fontFamily = myEditor.currentFont;
            myEditor.saveState();
            canvas.renderAll();

        }
        $('.dropit-trigger').height('10px');
    }
    this.changeNameFont = function (font, dontapply) {
        myEditor.currentNameFont = font;
        $('#current_font_namenumber').html(font);
        $('#current_font_namenumber').css('font-family', font);

        if (typeof(dontapply) != "undefined") return;
        myEditor.addNameNumbers(myEditor.currentNameNumberView);

    }
    this.changeNumberFont = function (font, dontapply) {
        myEditor.currentNumberFont = font;
        $('#current_font_number').html(font);
        $('#current_font_number').css('font-family', font);
        if (typeof(dontapply) != "undefined") return;
        {
            myEditor.addNameNumbers(myEditor.currentNameNumberView);
        }
    }
    this.changeNameColor = function (color, dontapply) {
        myEditor.currentNameColor = color;

        $('#namenumber_colors_pal').val(color)
       // $("#namenumber_colors_pal").spectrum("set", $('#namenumber_colors_pal').val());
        if (typeof(dontapply) != "undefined") return;
        {
            myEditor.addNameNumbers(myEditor.currentNameNumberView);
        }
    }
    this.changeNumberColor = function (color, dontapply) {
        myEditor.currentNumberColor = color;

        $('#number_colors_pal').val(color)
       // $("#number_colors_pal").spectrum("set", $('#number_colors_pal').val());
        if (typeof(dontapply) != "undefined") return;
        {
            myEditor.addNameNumbers(myEditor.currentNameNumberView);
        }
    }

    this.selectImageColor = function (colorName, colorCode) {
        $('.imageColors').removeClass('selectedFont');
        $('#imageColor_' + colorName).addClass('selectedFont');
        myEditor.currentImageColor = colorCode;
        myEditor.changeImageColor('', myEditor.currentImageColor);

    }
    this.changeProductColor = function (colorID, colorName, colorCode) {
        myEditor.selectProductColor(colorName, colorCode);
        var data = {'style': myEditor.cartLineInfo.styleNumber, 'size': myEditor.cartLineInfo.selectedSize, 'length': myEditor.cartLineInfo.selectedLength, 'color': colorID, 'colorCode': colorCode};
        jQuery.ajax({
            url: change_product_color_API,
            type: "POST",
            data: data,
            success: function (data) {
                if (typeof(data) == "string")
                    var json = jQuery.parseJSON(data);
                else
                    var json = data;
                var productInfo = (json);
                myEditor.cartLineInfo.productImages = productInfo.productImages;

                var thumbs = '';
                $.each(myEditor.cartLineInfo.productImages, function (i, item) {
                    if (i == 0)
                        myEditor.defaultView = item.viewName;

                    thumbs += '<div class="thumb1"><a href="#1" onclick="myEditor.changeView(\'' + item.viewName + '\')"><img class="thumb" src="' + item.thumbnailImageFile + '" width="52" height="55" data-header-img="' + item.imageFile + '"/></a></div>';
                });
                $('.p-views').html(thumbs);
                myEditor.changeView(myEditor.defaultView);


            }
        });

    }


    this.selectProductColor = function (colorName, colorCode) {
        $('.productColors').removeClass('selectedFont');
        $('#productColor').html(colorName);
        colorName = colorCode.replace('#', '');
        $('#productColor_' + colorName).addClass('selectedFont');
        myEditor.currentProductColor = colorCode;

        //myEditor.changeImageColor('',myEditor.currentImageColor);

    }
    this.selectTextEffect = function (effect) {
        $('#effect_' + effect).addClass('selectedFont');
        if (effect == "outline")
            myEditor.currentOutlineEffect = 'outline';
        if (effect == "shadow")
            myEditor.currentShadowEffect = 'shadow';
    }
    this.toggleShadowEffect = function () {
        if (myEditor.currentShadowEffect == 'shadow') {
            $('#effect_shadow').removeClass('selectedFont');
            myEditor.currentShadowEffect = '';
            myEditor.changeShadowEffect(0);
        }
        else {
            $('#effect_shadow').addClass('selectedFont');
            myEditor.currentShadowEffect = 'shadow';
            myEditor.changeShadowEffect(1);
        }
    }
    this.toggleOutlineEffect = function () {
        if (myEditor.currentOutlineEffect == 'outline') {
            $('#effect_outline').removeClass('selectedFont');
            myEditor.currentOutlineEffect = '';
            myEditor.changeOutlineEffect(0);
        }
        else {
            $('#effect_outline').addClass('selectedFont');
            myEditor.currentOutlineEffect = 'outline';
            myEditor.changeOutlineEffect(1);
        }
    }
    this.bringFront = function () {

        if (!canvas.getActiveObject()) return false;
        canvas.bringToFront(canvas.getActiveObject());
    };
    this.moveBack = function () {

        if (!canvas.getActiveObject()) return false;
        canvas.sendToBack(canvas.getActiveObject());
        canvas.sendToBack(boundingBox);
        canvas.sendToBack(bgImageBox);
    };

    this.undo = function () {
        index--;
        if (index < 0) {
            index = 0;
            canvas.loadFromDatalessJSON(state[index], canvas.renderAll.bind(canvas));

            return;
        }


        canvas.loadFromDatalessJSON(state[index], canvas.renderAll.bind(canvas));

        action = false;

    }
    this.redo = function () {
        index++;
        action = false;
        if (index >= state.length - 1) {
            index = state.length - 1;
            canvas.loadFromDatalessJSON(state[index], canvas.renderAll.bind(canvas));
            return;
        }


        canvas.loadFromDatalessJSON(state[index], canvas.renderAll.bind(canvas));

    }
    this.zoomIn = function () {
        canvasScale = canvasScale * SCALE_FACTOR;

        canvas.setHeight(canvas.getHeight() * SCALE_FACTOR);
        canvas.setWidth(canvas.getWidth() * SCALE_FACTOR);

        var objects = canvas.getObjects();
        for (var i in objects) {
            var scaleX = objects[i].scaleX;
            var scaleY = objects[i].scaleY;
            var left = objects[i].left;
            var top = objects[i].top;

            var tempScaleX = scaleX * SCALE_FACTOR;
            var tempScaleY = scaleY * SCALE_FACTOR;
            var tempLeft = left * SCALE_FACTOR;
            var tempTop = top * SCALE_FACTOR;

            objects[i].scaleX = tempScaleX;
            objects[i].scaleY = tempScaleY;
            objects[i].left = tempLeft;
            objects[i].top = tempTop;

            objects[i].setCoords();
        }

        canvas.renderAll();
    };
    this.zoomOut = function () {

        canvasScale = canvasScale / SCALE_FACTOR;
        canvas.setHeight(canvas.getHeight() / SCALE_FACTOR);
        canvas.setWidth(canvas.getWidth() / SCALE_FACTOR);
        var objects = canvas.getObjects();
        for (var i in objects) {
            var scaleX = objects[i].scaleX;
            var scaleY = objects[i].scaleY;
            var left = objects[i].left;
            var top = objects[i].top;

            var tempScaleX = scaleX * (1 / SCALE_FACTOR);
            var tempScaleY = scaleY * (1 / SCALE_FACTOR);
            var tempLeft = left * (1 / SCALE_FACTOR);
            var tempTop = top * (1 / SCALE_FACTOR);

            objects[i].scaleX = tempScaleX;
            objects[i].scaleY = tempScaleY;
            objects[i].left = tempLeft;
            objects[i].top = tempTop;

            objects[i].setCoords();
        }

        canvas.renderAll();
    }
    this.zoomReset = function () {
        //
        canvas.setHeight(canvas.getHeight() / canvasScale);
        canvas.setWidth(canvas.getWidth() / canvasScale);

        var objects = canvas.getObjects();
        for (var i in objects) {
            var scaleX = objects[i].scaleX;
            var scaleY = objects[i].scaleY;
            var left = objects[i].left;
            var top = objects[i].top;

            var tempScaleX = scaleX * (1 / canvasScale);
            var tempScaleY = scaleY * (1 / canvasScale);
            var tempLeft = left * (1 / canvasScale);
            var tempTop = top * (1 / canvasScale);

            objects[i].scaleX = tempScaleX;
            objects[i].scaleY = tempScaleY;
            objects[i].left = tempLeft;
            objects[i].top = tempTop;

            objects[i].setCoords();
        }

        canvas.renderAll();
        canvasScale = 1;
    }
    this.selectImage = function (imageId, imageFile) {

        $('.allImages').removeClass('selectedFont');
        $('#images_' + imageId).addClass('selectedFont');
        myEditor.currentImageFile = imageFile;
        myEditor.currentLogoId = imageId;
        canvas.deactivateAll();
        canvas.renderAll()

    }
    this.selectCustomImage = function (imageId, imageFile) {

        $('.allCustomImages').removeClass('selectedFont');
        $('#customImages_' + imageId).addClass('selectedFont');
        myEditor.currentCustomImageFile = imageFile;

    }

    this.getColorName = function (colorCode) {
        var colorName = '';
        $.each(myEditor.textColors, function (i, item) {
            if (item.colorHexCode == colorCode)
                colorName = item.colorName;

        })
        return colorName;

    }

    this.imageColorChange = function () {
        $('.ui-widget-overlay').bind('click');
        if ($('#my_image_colors').dialog())
            $('#my_image_colors').dialog("close");

        var link = $('#my_image_colors_link');
        $('#my_image_colors').dialog({
            dialogClass: "no-close",
            width: 275,
            modal: true,
            maxHeight: 360,
            position: { my: "top", at: "bottom", of: link },
            title: 'Edit text color',
            draggable: false,
            close: function (event, ui) {


            },
            open: function (event, ui) {

                $('.ui-widget-overlay').bind('click', function (e) {
                    jQuery('#my_image_colors').dialog('close');

                });
            }
        });//end dialog
    };
    this.textColorChange = function () {
        if ($('#my_text_colors').dialog())
            $('#my_text_colors').dialog("close");

        var link = $('#my_text_colors_link');
        $('#my_text_colors').dialog({
            dialogClass: "no-close",
            width: 275,
            maxHeight: 360,
            position: { my: "top", at: "bottom", of: link },
            title: 'Edit text color',
            draggable: false,
            close: function (event, ui) {


            }
        });//end dialog
    };
    this.loadView = function (viewName) {
        var width = 500;
        var height = 500;
        var left = 100;
        var top = 10;
        var bgImage = '';
        $.each(myEditor.cartLineInfo.productImages, function (i, item) {
            if (item.viewName == viewName) {
                width = parseInt(item.customizableArea.width);
                height = parseInt(item.customizableArea.height);
                left = item.customizableArea.left;
                top = item.customizableArea.top;
                bgImage = item.imageFile;
            }
        });

        $('.main-canvas-container').css('left', left).css('top', top).css('position', 'relative').css('width', width);
        $('#canvas-container').css('background', 'url(' + bgImage + ') no-repeat');
        //canvas.setHeight(height);
        //canvas.setWidth(width);
        canvas.setHeight(600);
        canvas.setWidth(600);
        myEditor.canvasDimentions = {'left': left, 'top': top, 'width': width, 'height': height};
        canvas.loadFromDatalessJSON(myEditor.jsons[viewName]);
        canvas.getObjects().forEach(function (item) {
            if (item.type == "Group") item.type = "images"
        });
        canvas.renderAll()
        if (myEditor.jsons[viewName] != "") {


        }
        canvas.renderAll();
        myEditor.currentView = viewName;
        setTimeout(function () {
            if (canvas.getObjects().length > 0) canvas.setActiveObject(canvas.item(0));
            canvas.deactivateAll().renderAll();
        }, 1000);
    }
    this.updateDimentions = function () {

        var width = $('#txtWidth').val();
        var height = $('#txtHeight').val();
        var left = parseInt($('#txtLeft').val()) + "px";
        var top = parseInt($('#txtTop').val()) + "px";
        $('.main-canvas-container').css('left', left).css('top', top).css('position', 'relative').css('width', width);
        canvas.setHeight(height);
        canvas.setWidth(width);
        canvas.renderAll();
    }

    this.saveImage = function (func) {
        var imageStr = canvas.toDataURL('png');
        var data = {'image': imageStr};
        jQuery.ajax({
            url: save_image_API,
            type: "POST",
            data: data,
            async: false,
            success: function (data) {
                if (typeof(data) == "string")
                    var json = jQuery.parseJSON(data);
                else
                    var json = data;
                if (func == "shareFB")
                    window.open('http://www.facebook.com/sharer/sharer.php?u=' + (json.image));
                if (func == "shareTW")
                    window.open('http://twitter.com/share?text=' + json.image + '&url=' + json.image);
                if (func == "sharePIN")
                    window.open('http://www.pinterest.com/pin/create/button/?url=' + json.image + '&media=' + json.image + '&description=Next%20stop%3A%20Pinterest');
                if (func == "shareG")
                    window.open('https://plus.google.com/share?url=' + json.image + '&title=My%20Design')
                if (func == "shareLD")
                    window.open('http://www.linkedin.com/shareArticle?mini=true&url=' + json.image + '&title=My%20Design&summary=This%20is%20the%20design%20I%20created')


                //window.open('https://www.facebook.com/sharer.php?app_id=669445573070065&sdk=joey&u=http%3A%2F%2Fimage1.putlocker.bz%2Fimages%2Fcovers%2Fmandela-long-walk-to-freedom-online-free-putlocker.jpg&display=popup');

            },

            error: function (result) {
                alert('Error occured, please try again later!');
            }
        });

    }
    this.saveDesignWithoutObject = function () {

        var bg = canvas.getObjects()[0];
        canvas.remove(canvas.getObjects()[0])
        var bounding = canvas.getObjects()[0];
        canvas.remove(canvas.getObjects()[0])
        var imageStr = canvas.toDataURL('png');
        var data = {'imageStr': imageStr};
        canvas.add(bg);
        canvas.add(bounding);
        canvas.sendToBack(bounding);
        canvas.sendToBack(bg);
        canvas.renderAll();
        jQuery.ajax({
            url: save_design_without_object_API,
            type: "POST",
            data: data,
            success: function (data) {
                alert('Design has been saved');
            },

            error: function (result) {
                alert('Error occured, please try again later!');
            }
        });
    }
    this.saveDesign = function () {
        var name = $('#txtDesignName').val();
        var email = $('#txtDesignEmail').val();
        var bg = canvas.getObjects()[0];
        canvas.remove(canvas.getObjects()[0])
        var bounding = canvas.getObjects()[0];
        canvas.remove(canvas.getObjects()[0])
        var json = JSON.stringify(canvas.toDatalessJSON(['logoid', 'selectable', 'evented', 'id']));
        var imageStr = canvas.toDataURL('png');
		alert(imageStr)
        var data = {'name': name, 'email': email, 'json': json, 'imageStr': imageStr};
        canvas.add(bg);
        canvas.add(bounding);
        canvas.sendToBack(bounding);
        canvas.sendToBack(bg);
        canvas.renderAll();
        jQuery.ajax({
            url: save_design_API,
            type: "POST",
            data: data,
            success: function (data) {
                alert('Design has been saved to database');
            },

            error: function (result) {
                alert('Error occured, please try again later!');
            }
        });
    }
    this.saveDesignAdmin = function () {
        var name = $('#txtDesignName').val();
        var email = $('#txtDesignEmail').val();
        var json = JSON.stringify(canvas.toDatalessJSON(['logoid', 'selectable', 'evented', 'id']));
        var imageStr = canvas.toDataURL('png');
        var data = {'name': name, 'email': email, 'json': json, 'imageStr': imageStr};
        jQuery.ajax({
            url: save_design_admin_API,
            type: "POST",
            data: data,
            success: function (data) {
                alert('Design has been saved to database');
            },

            error: function (result) {
                alert('Error occured, please try again later!');
            }
        });
    }
    this.loadDesigns = function () {

        jQuery.ajax({
            url: load_designs_API,
            type: "POST",
            success: function (data) {
                //alert('Design has been saved to database');
                if (typeof(data) == "string")
                    var json = jQuery.parseJSON(data);
                else
                    var json = data;
                html = '';
                myEditor.myDesigns = json;
                $.each(myEditor.myDesigns.designs, function (i, item) {
                    html += '<span class="thumb-menu2 myDesigns" style="overflow:hidden" onclick="myEditor.selectDesign(' + i + ')"  id="designs_' + i + '"><img height="135" src="' + item.Image_str + '"></span>';
                });
                $('#myDesigns').html(html);
            },

            error: function (result) {
                alert('Error occured, please try again later!');
            }
        });

    }
    this.selectDesign = function (index) {
        $('.myDesigns').removeClass('selectedFont');
        $('#designs_' + index).addClass('selectedFont');
        var myDesignSrc = myEditor.myDesigns.designs[index].Image_str;
        $('#myDesign').attr('src', myDesignSrc);
        $('#myDesign_link').attr('onclick', 'myEditor.loadDesign(' + index + ')');
    };
    this.loadDesign = function (index) {

        var myDesignJson = myEditor.myDesigns.designs[index].JSON_str;
        myEditor.loadedDesignName = myEditor.myDesigns.designs[index].Name
        myEditor.jsons[myEditor.currentView] = myDesignJson;
        canvas.loadFromDatalessJSON(myDesignJson);
        canvas.getObjects().forEach(function (item) {
            if (item.type == "Group") item.type = "images"
        });
        canvas.renderAll()
        canvas.renderAll();
        setTimeout(function () {
            if (canvas.getObjects().length > 0) canvas.setActiveObject(canvas.item(0));
            canvas.deactivateAll().renderAll();
        }, 1000);

    };
    this.saveDimentions = function () {

        var width = parseInt($('#txtWidth').val()) + "px";
        var height = parseInt($('#txtHeight').val()) + "px";
        var left = parseInt($('#txtLeft').val()) + "px";
        var top = parseInt($('#txtTop').val()) + "px";
        var data = {'left': left, 'top': top, 'width': width, 'height': height, 'style': myEditor.cartLineInfo.styleNumber, 'view': myEditor.currentView};
        jQuery.ajax({
            url: save_dimensions_API,
            type: "POST",
            data: data,
            success: function (data) {
                alert('Dimensions saved to database for this product line');
            },

            error: function (result) {
                alert('Error occured, please try again later!');
            }
        });

    }


    this.changeView = function (viewName) {
        var width = 500;
        var height = 500;
        var left = 100;
        var top = 10;
        var bgImage = '';
        $.each(myEditor.cartLineInfo.productImages, function (i, item) {
            if (item.viewName == viewName) {
                width = parseInt(item.customizableArea.width);
                height = parseInt(item.customizableArea.height);
                left = item.customizableArea.left;
                top = item.customizableArea.top;
                bgImage = item.imageFile;
                //For admin dimensions adjustment
                $('#txtLeft').val(parseInt(left));
                $('#txtTop').val(parseInt(top));
                $('#txtWidth').val(parseInt(width));
                $('#txtHeight').val(parseInt(height));
            }
        });
        if (myEditor.currentView != "") {
            //Remove the bg and bounding box images
            canvas.remove(canvas.getObjects()[0])
            canvas.remove(canvas.getObjects()[0])
            var json = JSON.stringify(canvas.toDatalessJSON(['logoid', 'selectable', 'evented', 'id','shadow']));
            myEditor.jsons[myEditor.currentView] = json;
        }
        //$('.main-canvas-container').css('left',left).css('top',top).css('position','relative').css('width',width);
        //$('#canvas-container').css('background','url('+bgImage+') no-repeat');

        canvas.setHeight(600);
        canvas.setWidth(600);
        myEditor.canvasDimentions = {'left': left, 'top': top, 'width': width, 'height': height};

        canvas.loadFromDatalessJSON(myEditor.jsons[viewName]);

        boundingBox = new fabric.Rect({
            fill: "transparent",
            width: myEditor.canvasDimentions.width,
            height: myEditor.canvasDimentions.height,
            hasBorders: false,
            hasControls: false,
            lockMovementX: true,
            lockMovementY: true,
            selectable: false,
            strokeDashArray: [5, 5],
            evented: false,
            id: 'bounding',
            left: parseInt(myEditor.canvasDimentions.left),
            top: parseInt(myEditor.canvasDimentions.top),
            stroke: "#ccc",
            strokeWidth: 2
        });

        //canvas.setBackgroundImage(bgImage, canvas.renderAll.bind(canvas));
        fabric.Image.fromURL(bgImage, function (imageobj) {
            var width = imageobj.width;
            var height = imageobj.height;


            imageobj.set({
                selectable: false,
                width: width,
                height: height,
                hasBorders: false,
                hasControls: false,
                lockMovementX: true,
                lockMovementY: true,
                id: 'bg',
                selectable: false,
                evented: false
            });
            imageobj.setControlVisible('mt', false);
            canvas.add(imageobj);
            canvas.add(boundingBox);
            bgImageBox = imageobj;
            canvas.sendToBack(boundingBox);
            canvas.sendToBack(bgImageBox);


        });
        canvas.getObjects().forEach(function (item) {
            if (item.type == "Group") item.type = "images"
        });
        canvas.renderAll()
        if (myEditor.jsons[viewName] != "") {


        }
        myEditor.resetUndoState();
        canvas.renderAll();
        myEditor.currentView = viewName;
        if (myEditor.currentView == "Back") {
            $('.namenumber_name').each(function (i, item) {
                if ($(item).val() != "") {
                    myEditor.addNameNumbers(i + 1)

                }

            });
        }
        canvas.renderAll()
        setTimeout(function () {
            if (canvas.getObjects().length > 0) canvas.setActiveObject(canvas.item(0));
            canvas.deactivateAll().renderAll();
        }, 1000);
    }
    this.loadColorsData = function () {
        var data = {'style': myEditor.cartLineInfo.styleNumber, 'size': myEditor.cartLineInfo.selectedSize, 'length': myEditor.cartLineInfo.selectedLength};
        //Load product colors
        jQuery.ajax({
            url: available_colors_API,
            type: "POST",
            data: data,
            success: function (data) {
                if (typeof(data) == "string")
                    var json = (jQuery.parseJSON(data));
                else
                    var json = data;
                var counter = 0;
                var counter2 = 0;
                var palette = [];
                myEditor.availableColors = json.availableColors;
                var html3 = '<div class="product_colors"><ul>';
                var html2 = '<table width="100%" cellpadding="0" cellspacing="0"><tr>';
                $.each(json.availableColors, function (i, item) {
                    if (Object.prototype.toString.call(palette[counter]) === '[object Array]')
                        ;
                    else
                        palette[counter] = new Array();
                    palette[counter].push(item.colorHexCode);
                    var colorCode = (item.colorHexCode).replace('#', '')
                    html3 += '<li><a href="#a" class="productColors" id="productColor_' + colorCode + '" title="' + item.colorName + '" onclick="myEditor.changeProductColor(\'' + item.colorID + '\',\'' + item.colorName + '\',\'' + item.colorHexCode + '\');" class="color" style="background:' + item.colorHexCode + '; width:20px; height:20px;" onmouseover="this.style.border=\'3px solid ' + item.colorHexCode + '\';" onmouseout="this.style.border=\'1px solid transparent\';">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</a></li>';
                    html2 += '<td><span class="color" style="background:' + item.colorHexCode + '; width:20px; height:20px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></td>';
                    counter2++;
                    if ((counter2 % 25) === 0) {
                        html3 += '</tr><tr>';
                        html2 += '</tr><tr>';
                        counter++;
                    }
                });
                html3 += '</ul></div>';
                html2 += '</tr></table>';
                var defaultColor = myEditor.cartLineInfo.selectedColor.colorHexCode;
                $('#my_product_colors').html(html3);
                myEditor.selectProductColor(myEditor.cartLineInfo.selectedColor.colorName, defaultColor);
                $('#productColors').html(html2);
                myEditor.grabAvailableSizes();


//                $("#my_product_colors_pal").spectrum({
//                    showPaletteOnly: true,
//                    showPalette: true,
//                    color: defaultColor,
//                    palette: palette,
//                    change: function (color) {
//                        //TODO: Add the product color change code here
//                    }
//                });
            }
        });

    };
    this.loadData = function () {

        myEditor.loadDesigns();
        //Load Cartlineinfor
        var line = getQuerystring('line');
        var data = {"line": line};
        jQuery.ajax({
            url: cart_line_info_API,
            type: "POST",
            data: data,
            success: function (data) {
                if (typeof(data) == "string")
                    var cartLineInfo = (jQuery.parseJSON(data));
                else
                    var cartLineInfo = data;
                myEditor.cartLineInfo = cartLineInfo.cartLineInfo;
                var thumbs = '';
                $.each(myEditor.cartLineInfo.productImages, function (i, item) {
                    if (i == 0)
                        myEditor.defaultView = item.viewName;
                    myEditor.jsons[(item.viewName).toString()] = '{"objects":[],"background":""}';
                    thumbs += '<div class="thumb1"><a href="#1" onclick="myEditor.changeView(\'' + item.viewName + '\')"><img class="thumb" src="' + item.thumbnailImageFile + '" width="52" height="55" data-header-img="' + item.imageFile + '"/></a></div>';
                });
                $('.p-views').html(thumbs);
                $('#productImage').html('<img src="' + myEditor.cartLineInfo.productImage + '"/>');
                $('#productTitle').html('<strong>' + myEditor.cartLineInfo.productName + '</strong>');
                $('#productDesc').html(myEditor.cartLineInfo.productDesc);
                $('#productColor').html(myEditor.cartLineInfo.selectedColor.colorName);

                $('#productPrice').html(myEditor.cartLineInfo.price)

                myEditor.changeView(myEditor.defaultView);

                myEditor.loadColorsData();

                //Load text colors
                data = {'decorationmethod': myEditor.currentDecorationMethod};
                jQuery.ajax({
                    url: text_colors_API,
                    type: "POST",
                    data: data,
                    success: function (data) {
                        if (typeof(data) == "string")
                            var json = (jQuery.parseJSON(data));
                        else
                            var json = data;
                        var html2 = '<table width="100%" cellpadding="0" cellspacing="0"><tr>';
                        var html3 = '<table width="100%" cellpadding="0" cellspacing="0"><tr>';
                        var counter = 0;
                        var counter2 = 0;
                        var palette = [];
                        myEditor.textColors = json.availableTextColors;
                        $.each(json.availableTextColors, function (i, item) {
                            html3 += '<td><a href="#a" class="imageColors" id="imageColor_' + item.colorName + '" title="' + item.colorName + '" onclick="myEditor.selectImageColor(\'' + item.colorName + '\',\'' + item.colorHexCode + '\');" class="color" style="background:' + item.colorHexCode + '; width:20px; height:20px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</a></td>';
                            if (Object.prototype.toString.call(palette[counter]) === '[object Array]')
                                ;
                            else
                                palette[counter] = new Array();
                            palette[counter].push(item.colorHexCode);
                            counter2++;
                            if ((counter2 % 8) === 0) {
                                html3 += '</tr><tr>';
                                counter++;
                            }
                        });


                        $('#my_image_colors').html(html3);
                        $('#my_image_colors_title').hide();
                        $('#my_image_colors_link').hide();

//                        $("#my_text_colors_pal").spectrum({
//                            showPaletteOnly: true,
//                            showPalette: true,
//                            color: myEditor.defaultColor,
//                            palette: palette,
//                            change: function (color) {
//                                myEditor.currentFontColor = ("#" + color.toHex()).toUpperCase();
//                                myEditor.changeFontColor(myEditor.currentFontColor);
//                            }
//                        });

//                        $("#my_effects_colors_shadow_pal").spectrum({
//                            showPaletteOnly: true,
//                            showPalette: true,
//                            color: myEditor.defaultColor,
//                            palette: palette,
//                            change: function (color) {
//                                myEditor.currentShadowColor = ("#" + color.toHex()).toUpperCase();
//                                myEditor.changeShadowColor(myEditor.currentShadowColor);
//
//                            }
//                        });

//                        $("#namenumber_colors_pal").spectrum({
//                            showPaletteOnly: true,
//                            showPalette: true,
//                            color: myEditor.defaultColor,
//                            palette: palette,
//                            change: function (color) {
//
//                                myEditor.currentNameColor = ("#" + color.toHex()).toUpperCase();
//                                myEditor.changeNameColor(myEditor.currentNameColor);
//                            }
//                        });
//
//                        $("#number_colors_pal").spectrum({
//                            showPaletteOnly: true,
//                            showPalette: true,
//                            color: myEditor.defaultColor,
//                            palette: palette,
//                            change: function (color) {
//                                myEditor.currentNumberColor = ("#" + color.toHex()).toUpperCase();
//                                myEditor.changeNumberColor(myEditor.currentNumberColor);
//                            }
//                        });
//
//                        $("#my_effects_colors_outline_pal").spectrum({
//                            showPaletteOnly: true,
//                            showPalette: true,
//                            color: myEditor.defaultColor,
//                            palette: palette,
//                            change: function (color) {
//                                myEditor.currentOutlineColor = ("#" + color.toHex()).toUpperCase();
//                                myEditor.changeOutlineColor(myEditor.currentOutlineColor);
//                            }
//                        });


                        data = {'decorationmethod': myEditor.currentDecorationMethod};


                        jQuery.ajax({
                            url: text_fonts_API,
                            type: "POST",
                            data: data,
                            success: function (data) {
                                if (typeof(data) == "string")
                                    var json = (jQuery.parseJSON(data));
                                else
                                    var json = data;
                                var html = '';
                                var html2 = '<ul><li>';
                                var html3 = '<ul><li>';
                                var html4 = '<ul><li>';
                                var head = '<style type="text/css">';
                                myEditor.textFonts = json.availableFonts;
                                $.each(json.availableFonts, function (i, item) {
                                    html += '<option value="' + item.fontName + '" style="font-family:\'' + item.fontName + '\', Tahoma;">' + item.fontName + '</option>';
                                    html2 += '<li> <a href="#1" onclick="myEditor.changeFont(\'' + item.fontName + '\')" style="font-family:\'' + item.fontName + '\', Tahoma;">' + item.fontName + '</a></li>';
                                    html3 += '<li> <a href="#1" onclick="myEditor.changeNameFont(\'' + item.fontName + '\')" style="font-family:\'' + item.fontName + '\', Tahoma;">' + item.fontName + '</a></li>';
                                    html4 += '<li> <a href="#1" onclick="myEditor.changeNumberFont(\'' + item.fontName + '\')" style="font-family:\'' + item.fontName + '\', Tahoma;">' + item.fontName + '</a></li>';
                                    head += '@font-face {font-family:' + item.fontName + '; src: url(' + item.fontFile + ');} .font_' + item.fontName + ' {font-family:' + item.fontName + '}';

                                });
                                html += '';
                                html2 += '</li></ul>';
                                html3 += '</li></ul>';
                                html4 += '</li></ul>';
                                head += '</style>';

                                $("head").append(head);
                                $('.fonts_menu li').append(html2);
                                $('.fonts_menu').dropit();
                                $('.fonts_menu2 li').append(html3);
                                $('.fonts_menu2').dropit();
                                $('.fonts_menu3 li').append(html4);
                                $('.fonts_menu3').dropit();

                                myEditor.searchProducts();//Load the default view of products
                                myEditor.loadTextShapes();
                                myLogos = new Logos();
                                myLogos.myLogosFilter();
                                myCustomLogos = new customLogos();
                                myCustomLogos.myCustomLogosFilter();
                                myEditor.changeFont(myEditor.defaultFont);
                                myEditor.changeNameColor(myEditor.defaultColor, 1);
                                myEditor.changeNameFont(myEditor.defaultFont, 1);
                                myEditor.changeNumberColor(myEditor.defaultColor, 1);
                                myEditor.changeNumberFont(myEditor.defaultFont, 1);

                            },

                            error: function (result) {
                            }
                        });


                    },

                    error: function (result) {
                    }
                });
            },

            error: function (result) {
            }
        });

    }
    this.loadTextShapes = function () {

        data = {'decorationmethod': myEditor.currentDecorationMethod};
        //
        jQuery.ajax({
            url: text_shapes_API,
            type: "POST",
            data: data,
            success: function (data) {
                if (typeof(data) == "string")
                    var json = (jQuery.parseJSON(data));
                else
                    var json = data;
                var html2 = '<ul><li>';
                var defaultShape = '';
                myEditor.availableShapes = json.availableShapes;
                $.each(json.availableShapes, function (i, item) {
                    if (i == 0)
                        defaultShape = item.ShapeName;
                    html2 += '<li> <img href="#1" onclick="myEditor.changeTextShape(\'' + item.ShapeName + '\')" src="images/' + item.ShapeName + '.png"/></li>';

                });
                html2 += '</li></ul>';

                $('.text_shapes li').append(html2);
                $('.text_shapes').dropit();
                myEditor.selectTextShape(defaultShape);

            },

            error: function (result) {
            }
        });
    }
    this.searchProducts = function () {

        var text = $('#txtSearch').val();
        if (text == "Search Products")
            text = '';
        var category = $('#selCategory').val();
        if (category == "Select Category")
            category = '';
        var subCategory = $('#selSubCategory').val();
        if (subCategory == "Sub Category")
            subCategory = '';
        var size = $('#selSize').val();
        if (size == "Size")
            size = '';
        var color = $('#selColor').val();
        if (color == "Color")
            color = '';


        data = {'maindepartment': category, 'subdepartment': subCategory, 'size': size, 'color': color, 'searchtext': text};
        jQuery.ajax({
            url: search_products_API,
            type: "POST",
            data: data,
            success: function (data) {
                if (typeof(data) == "string")
                    var json = (jQuery.parseJSON(data));
                else
                    var json = data;
                var html = '';
                $.each(json.productList.products, function (i, product) {
                    html += '<span class="thumb-menu"><a href="#1" onclick="myEditor.loadProductDetails(\'' + product.styleNumber + '\')"><img src="' + product.thumbnailImageFile + '" width="67" height="54"></a></span>';
                });
                html += '<br clear="all">';
                $('#products').html(html);
            }
        });

    };
    this.loadProductDetails = function (styleNumber) {

        data = {'style': styleNumber};
        jQuery.ajax({
            url: product_details_API,
            type: "POST",
            data: data,
            success: function (data) {
                if (typeof(data) == "string")
                    var json = (jQuery.parseJSON(data));
                else
                    var json = data;
                var color = $('#selColor').val();
                if (color == "Color")
                    color = '';
                $('#productImage').html('<img src="' + json.productInfo.imageFile + '"/>');
                $('#productTitle').html('<strong>' + json.productInfo.productName + '</strong>');
                $('#productDesc').html(json.productInfo.productDesc);
                $('#productPrice').html(json.productInfo.price)
                $('#styleNumber').val(styleNumber);
                /*var html2='<table width="100%" cellpadding="0" cellspacing="0"><tr>';
                 var counter2=0;
                 $.each(json.productDetails.availableColors, function (i, item) {

                 html2+='<td><span class="color" style="background:'+item.colorHexCode+'; width:20px; height:20px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></td>';
                 counter2++;
                 if((counter2%8)===0)
                 {
                 html2+='</tr><tr>';
                 counter++;
                 }
                 });
                 html2+='</tr></table>';*/
                var size = $('#selSize').val();
                if (size == "Size")
                    size = '';
                var length = '';
                var data = {'style': myEditor.cartLineInfo.styleNumber, 'size': size, 'length': length};

                //Load product colors
                jQuery.ajax({
                    url: available_colors_API,
                    type: "POST",
                    data: data,
                    success: function (data) {
                        if (typeof(data) == "string")
                            var json = (jQuery.parseJSON(data));
                        else
                            var json = data;
                        var counter = 0;
                        var counter2 = 0;
                        var palette = [];
                        myEditor.availableColors = json.availableColors;
                        var html3 = '<div><ul>';
                        $.each(json.availableColors, function (i, item) {
                            if (Object.prototype.toString.call(palette[counter]) === '[object Array]')
                                ;
                            else
                                palette[counter] = new Array();
                            palette[counter].push(item.colorHexCode);
                            var colorCode = (item.colorHexCode).replace('#', '')
                            html3 += '<li><a href="#a" class="productColors" id="productColor_' + colorCode + '" title="' + item.colorName + '" onclick="myEditor.changeProductColor(\'' + item.colorID + '\',\'' + item.colorName + '\',\'' + item.colorHexCode + '\');" class="color" style="background:' + item.colorHexCode + '; width:20px; height:20px;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</a></li>';
                            counter2++;
                            if ((counter2 % 8) === 0) {
                                html3 += '</tr><tr>';
                                counter++;
                            }
                        });
                        html3 += '</ul></div>';
                        var defaultColor = myEditor.cartLineInfo.selectedColor.colorHexCode;
                        $('#my_product_colors').html(html3);


                    }
                });


            }
        });
    };
    this.changeProduct = function () {

        var size = $('#selSize').val();
        if (size == "Size")
            size = '';
        var color = $('#selColor').val();
        if (color == "Color")
            color = '';

        var data = {'style': $('#styleNumber').val(), 'line': myEditor.cartLineInfo.lineNumber, 'size': size, 'length': '', 'color': color};
        jQuery.ajax({
            url: change_product_API,
            type: "POST",
            data: data,
            success: function (data) {
                if (typeof(data) == "string")
                    var productInfo = (jQuery.parseJSON(data));
                else
                    var productInfo = data;
                myEditor.cartLineInfo = productInfo.cartLineInfo;

                var thumbs = '';
                $.each(myEditor.cartLineInfo.productImages, function (i, item) {
                    if (i == 0)
                        myEditor.defaultView = item.viewName;

                    thumbs += '<div class="thumb1"><a href="#1" onclick="myEditor.changeView(\'' + item.viewName + '\')"><img class="thumb" src="' + item.thumbnailImageFile + '" width="52" height="55" data-header-img="' + item.imageFile + '"/></a></div>';
                });
                $('.p-views').html(thumbs);
                myEditor.changeView(myEditor.defaultView);
                myEditor.loadColorsData();

            }
        });

    }
    this.deleteSelected = function () {

        var activeObject = canvas.getActiveObject(),
            activeGroup = canvas.getActiveGroup();
        if (activeGroup) {
            var objectsInGroup = activeGroup.getObjects();
            canvas.discardActiveGroup();
            objectsInGroup.forEach(function (object) {
                canvas.remove(object);
            });
        }
        else if (activeObject) {
            canvas.remove(activeObject);
        }
    }
    this.addNameNumbersRow = function () {
        var counter = $('tr', '#namesnumbers').length;
        var html = '<tr>';
        html += '<td><input style="width:108px;" class="namenumber namenumber_name" name="name_' + counter + '" id="name_' + counter + '" type="text"></td>';
        html += '<td width="47"><input style="width:30px;" class="namenumber namenumber_number" name="number_' + counter + '" id="number_' + counter + '" type="text"></td>';
        html += '<td width="43"><select style="width:38px;" name="size_' + counter + '" class="namenumber_size" id="size_' + counter + '"></select></td>';
        html += '<td width="38"><select style="width:38px;" name="qty_' + counter + '" id="qty_' + counter + '">';
        html += '<option value="1">1</option>';
        html += '<option value="2">2</option>';
        html += '<option value="3">3</option>';
        html += '<option value="4">4</option>';
        html += '<option value="5">5</option>';
        html += '<option value="6">6</option>';
        html += '<option value="7">7</option>';
        html += '<option value="8">8</option>';
        html += '<option value="9">9</option>';
        html += '<option value="10">10</option>';
        html += '</select></td>';
        html += '</tr>';
        $('#namesnumbers').append(html);

        var sizes = '';
        $.each(myEditor.productSizes, function (j, size) {
            sizes += '<option value="' + size + '">' + size + '</option>';
        });
        $('#size_' + counter).html(sizes);
        myEditor.bindNameNumberEvent();
    }
    this.addNameNumbers = function (id) {

        //Save the back view without the names objects
        var json = JSON.stringify(canvas.toDatalessJSON(['logoid', 'selectable', 'evented', 'id']));
        myEditor.jsons['Back'] = json;

        //canvas.clear();
        myEditor.loadView('Back');

        if (typeof(myEditor.nameNumberJsons[id]) != "undefined") {
            var json = jQuery.parseJSON(myEditor.nameNumberJsons[id]);
            //json.objects[0].
            //canvas.clear();

            myEditor.loadView('Back');

            //canvas.loadFromJSONWidthoutClear(myEditor.nameNumberJsons[id])
        }
        canvas.getObjects().forEach(function (o) {
            if (typeof(o.id) != "undefined" && o.id == id)
                canvas.remove(o);
        });

        var name = new fabric.Text($('#name_' + id).val(), {
            left: canvas.width / 2,
            top: canvas.height / 2,
            fontFamily: myEditor.currentNameFont,
            fontSize: 75,
            angle: 0,
            radius: 500,
            spacing: 1,
            fill: myEditor.currentNameColor,
            scaleX: 1,
            scaleY: 1,
            fontWeight: '',
            textAlign: 'center',
            originX: 'left',

            hasRotatingPoint: true,
            centerTransform: true
        });
        name.setLeft((myEditor.canvasDimentions.width / 2) - (name.width / 2));
        name.setTop(50);

        //canvas.centerObjectH(name)

        var number = new fabric.Text($('#number_' + id).val(), {

            fontFamily: myEditor.currentNumberFont,
            fontSize: 150,
            angle: 0,
            radius: 0,
            spacing: 0,
            fill: myEditor.currentNumberColor,
            scaleX: 1,
            scaleY: 1,
            fontWeight: '',
            textAlign: 'center',
            originX: 'left',

            hasRotatingPoint: true,
            centerTransform: true
        });

        number.setTop((number.height));
        number.setLeft((myEditor.canvasDimentions.width / 2) - (number.width / 2));

        var group = new fabric.Group([ name, number ], { left: (name.width / 2), top: 50 });
        //group.setLeft((canvas.width/2) - (group.width/2));
        group.type = "names";
        group.id = id;


        canvas.add(group);
        canvas.setActiveObject(group);
        myEditor.centerAlignSelected();
        myEditor.middleAlignSelected();

        canvas.getActiveObject().evented = false;
        canvas.getActiveObject().hasControls = false;
        myEditor.nameNumberJsons
        /*canvas.add(name);
         canvas.add(number);*/
        canvas.renderAll();
        myEditor.currentNameNumber = id;

        var json = JSON.stringify(canvas.toDatalessJSON(['logoid', 'selectable', 'evented', 'id']));
        myEditor.nameNumberJsons[myEditor.currentNameNumber] = json;


    }
    this.bindNameNumberEvent = function () {

        $('.namenumber').on('keyup', function (event) {

            var x = event.target.id;
            number = x.substring(x.indexOf("_") + 1);

            myEditor.addNameNumbers(number);
            myEditor.currentNameNumberView = number;
        });

        $('.namenumber').on('focus', function (event) {
            if (myEditor.currentView != "") {
                var json = JSON.stringify(canvas.toDatalessJSON(['logoid', 'selectable', 'evented', 'id']));
                myEditor.jsons[myEditor.currentView] = json;
            }
            var x = event.target.id;
            if (myEditor.currentView != "Back")
                myEditor.changeView('Back');
            number = x.substring(x.indexOf("_") + 1);
            myEditor.addNameNumbers(number);
            myEditor.currentNameNumberView = number;

        });
    };

    this.move_up = function () {
        canvas.getActiveObject().top = canvas.getActiveObject().top - 40;
        canvas.renderAll()
    }
    this.move_down = function () {
        canvas.getActiveObject().top = canvas.getActiveObject().top + 40;
        canvas.renderAll()
    }
    this.move_left = function () {
        canvas.getActiveObject().left = canvas.getActiveObject().left - 40;
        canvas.renderAll()
    }
    this.move_right = function () {
        canvas.getActiveObject().left = canvas.getActiveObject().left + 40;
        canvas.renderAll()
    }
    this.loadEditor = function () {
        canvas = new fabric.Canvas('canvas');
        context = canvas.getContext("2d");
        f = fabric.Image.filters;
        myEditor.loadData();
//        $('#canvas').dropable({ //Make the canvas as jQuery UI Droppable
//            accept: "#my_logos span, #my_custom_logos span", //It will accept Images from My Items and Images from All Items tabs
//            activeClass: 'ui-state-highlighted',
//            drop: function (event, ui) {
//                myEditor.dropImage(ui.draggable);
//            }
//        });
        $('body').mousemove(function (event) {
            myEditor.mousemove(event);
        });
        canvas.on('object:selected', myEditor.onObjectSelected);
        canvas.on('selection:cleared', myEditor.onSelectionCleared);
        canvas.on('selection:cleared', myEditor.onSelectionCleared);
        $('#my_text').on('keyup', function (event) {
            var obj = canvas.getActiveObject();
            if (!obj) return;
            if (obj.type == "text" || obj.type == "curvedText") {
                myEditor.updateActualText();
            }
            if (event.keyCode === 13) {

                $('#my_text').val('')
                myEditor.addText();
                if (canvas.getObjects().length > 0)
                    canvas.setActiveObject(canvas.item(canvas.getObjects().length - 1));
            }

        });
        myEditor.bindNameNumberEvent();

        $(document).keyup(function (event) {
            if (event.which == 46)
                myEditor.deleteSelected();
            if (event.which == 38)//Up
                myEditor.move_up();
            if (event.which == 40)//Down
                myEditor.move_down();
            if (event.which == 37)//Left
                myEditor.move_left();
            if (event.which == 39)//Right
                myEditor.move_right();
        });
        if(1)
        {

            $('#my_fonts').on("change", function (e) {

                myEditor.selectFontFace($('#my_fonts').val());

            });
            $('#my_text_shape').on("change", function (e) {
                myEditor.selectTextShape($('#my_text_shape').val());

            });

            $('#addText').on("click", function (e) {
                myEditor.addText();

            });

            $('#updateText').on("click", function (e) {
                myEditor.updateText();

            });
            $('#range').on("change", function (e) {
                myEditor.currentFontRange = $('#range').val();
                myEditor.updateText();
            });
            $('#radius').on("change", function (e) {
                myEditor.currentFontRadius = $('#radius').val();
                myEditor.updateText();
            });
            $('#spacing').on("change", function (e) {
                myEditor.currentFontSpacing = $('#spacing').val();
                myEditor.updateText();
            });
            $('#small').on("change", function (e) {
                myEditor.currentFontSmall = $('#small').val();
                myEditor.updateText();
            });
            $('#large').on("change", function (e) {
                myEditor.currentFontLarge = $('#large').val();
                myEditor.updateText();
            });

            $('#shadowOffsetX').on("change", function (e) {
                myEditor.shadowOffsetX = $('#shadowOffsetX').val();
                myEditor.updateText();
            });
            $('#shadowOffsetY').on("change", function (e) {
                myEditor.shadowOffsetY = $('#shadowOffsetY').val();
                myEditor.updateText();
            });

            $('#currentOutlineWidth').on("change", function (e) {
                myEditor.currentOutlineWidth = $('#currentOutlineWidth').val();
                myEditor.updateText();
            });
        }


        $('#addLogo').on("click", function (e) {
            action = true;
            myEditor.addToCanvas(myEditor.currentImageFile, canvas.width / 2, canvas.height / 2, 'svg', myEditor.currentLogoId);

        });
        $('#addCustomLogo').on("click", function (e) {
            action = true;
            myEditor.addToCanvas(myEditor.currentCustomImageFile, canvas.width / 2, canvas.height / 2, 'image');

        });


    }
    //
    this.setStyle = function (object, styleName, value) {
        if (object.setSelectionStyles && object.isEditing) {
            var style = { };
            style[styleName] = value;
            object.setSelectionStyles(style);
            object.setCoords();
        }
        else {
            object[styleName] = value;
        }
        canvas.renderAll();
    }
    this.onSelectionCleared = function (e) {
        $('#my_text').val('');
        $('#addText').show();
        $('.textEffects').removeClass('selectedFont');
        myEditor.selectTextEffect(null);
        myEditor.currentShadowEffect = '';
        myEditor.currentOutlineEffect = '';
        $('.effectColors').removeClass('selectedFont');
        $('.fontColors').removeClass('selectedFont');
        $('#updateText').hide();
        myEditor.defaultSpectrum();
        $('#my_image_colors_title').hide();
        $('#my_image_colors_link').hide();
        $('#shadowOffsetX').val(10);
        $('#shadowOffsetY').val(10);

    }
    this.defaultSpectrum = function () {
        $('#my_effects_colors_shadow_pal').val(myEditor.defaultColor)
        $('#my_text_colors_pal').val(myEditor.defaultColor)
        $('#my_effects_colors_outline_pal').val(myEditor.defaultColor)
        myEditor.currentFontColor = myEditor.defaultColor;
        myEditor.currentShadowColor = myEditor.defaultColor;
        myEditor.currentOutlineColor = myEditor.defaultColor;
        //$("#my_text_colors_pal").spectrum("set", $('#my_text_colors_pal').val());
       // $("#my_effects_colors_outline_pal").spectrum("set", $('#my_effects_colors_outline_pal').val());
        //$("#my_effects_colors_shadow_pal").spectrum("set", $('#my_effects_colors_shadow_pal').val());
    };

    this.onObjectSelected = function (e) {
        var selectedObject = e.target;
        if (typeof(e.e) != "undefined") {
            e.e.preventDefault();
            e.e.stopPropagation();
        }
        if (selectedObject.selectable == false)
            return;
        if (/text/.test(selectedObject.type) || selectedObject.type == "curvedText") {

            $('#my_text').val(selectedObject.text);
            myEditor.currentFontRange = selectedObject.get('range');
            $('#range').val(myEditor.currentFontRange);

            myEditor.currentFontRadius = selectedObject.get('radius');
            $('#radius').val(myEditor.currentFontRadius);

            myEditor.currentFontSpacing = selectedObject.get('spacing');
            $('#spacing').val(myEditor.currentFontSpacing);

            myEditor.currentFontSmall = selectedObject.get('smallFont');
            $('#small').val(myEditor.currentFontSmall);

            myEditor.currentFontLarge = selectedObject.get('largeFont');
            $('#large').val(myEditor.currentFontLarge);


            $('#my_fonts').val(selectedObject.fontFamily);
            myEditor.selectFontFace(selectedObject.fontFamily);
            $('#my_fonts').trigger("chosen:updated");
            myEditor.selectFontColor(myEditor.getColorName(selectedObject.fill), selectedObject.fill);

            $('.textEffects').removeClass('selectedFont');
            $('#my_text_colors_pal').val(selectedObject.fill)
            //$("#my_text_colors_pal").spectrum("set", $('#my_text_colors_pal').val());
            if (typeof(selectedObject.stroke) != "undefined" && selectedObject.stroke != null && selectedObject.stroke != "") {

                myEditor.selectEffectColor(myEditor.getColorName(selectedObject.stroke), selectedObject.stroke);
                myEditor.currentOutlineColor = selectedObject.stroke;
                myEditor.currentOutlineWidth = selectedObject.strokeWidth;
                $('#currentOutlineWidth').val(myEditor.currentOutlineWidth);
                myEditor.selectTextEffect('outline');
                $('#my_effects_colors_outline_pal').val(selectedObject.stroke)
             //   $("#my_effects_colors_outline_pal").spectrum("set", $('#my_effects_colors_outline_pal').val());
            }
            if (typeof(selectedObject.shadow) != "undefined" && selectedObject.shadow != null) {

                myEditor.selectEffectColor(myEditor.getColorName(selectedObject.shadow.color), selectedObject.shadow.color);
                myEditor.currentShadowColor = selectedObject.shadow.color;
                myEditor.shadowOffsetX = selectedObject.shadow.offsetX;
                myEditor.shadowOffsetY = selectedObject.shadow.offsetY;
                $('#shadowOffsetX').val(myEditor.shadowOffsetX);
                $('#shadowOffsetY').val(myEditor.shadowOffsetY);
                myEditor.selectTextEffect('shadow');
                $('#my_effects_colors_shadow_pal').val(selectedObject.shadow.color)
               // $("#my_effects_colors_shadow_pal").spectrum("set", $('#my_effects_colors_shadow_pal').val());
            }
            if (typeof(selectedObject.fontStyle) != "undefined" && selectedObject.fontStyle == "italic") {

                myEditor.selectTextShape("ITALIC");
                $('#my_text_shape').val("ITALIC")
            }
            else {
                myEditor.selectTextShape("STRAIGHT");
                $('#my_text_shape').val("STRAIGHT")
            }
            $('#addText').hide();
            $('#updateText').show();
            $('#my_image_colors_title').hide();
            $('#my_image_colors_link').hide();
            $("#accordion").accordion("option", "active", 1);
            if (selectedObject.type == "curvedText") {
                myEditor.selectTextShape(selectedObject.effect)
            }
        }
        else if (selectedObject.type == "group") {
        }
        else if (selectedObject.type == "names") {
            $("#accordion").accordion("option", "active", 4);
        }
        else if (selectedObject.type == "image") {
            $("#accordion").accordion("option", "active", 3);
            $('#my_image_colors_title').hide();
            $('#my_image_colors_link').hide();
            $('#my_text').val('');
            $('#addText').show();
            $('#updateText').hide();
        }
        else {
            $("#accordion").accordion("option", "active", 2);
            $('#my_image_colors_title').show();
            $('#my_image_colors_link').show();
            $('#my_text').val('');
            $('#addText').show();
            $('#updateText').hide();
            myEditor.populateImageColors(selectedObject);
        }

    }
    this.populateImageColors = function (obj) {

        var colors = myEditor.grabObjectColors(obj);
        var html = '';
        var mainpalette = [];
        $.each(colors, function (i, color) {

            var colorId = color.replace('#', '');

            $('#image_color_' + colorId).remove();
            html += '<div class="obj_colors"><input type="hidden" id="image_color_' + colorId + '" />';
            var counter = 0;
            var palette = [];
            $.each(myEditor.textColors, function (i, item) {

                if (Object.prototype.toString.call(palette[counter]) === '[object Array]')
                    ;
                else
                    palette[counter] = new Array();
                palette[counter].push(item.colorHexCode);
                if ((i % 8) === 0) {
                    counter++;
                }

            });
            mainpalette = palette;


            html += '</div>';
        });
        //$('#my_image_colors').html(html);
        $('#my_image_colors_link').html(html);
        $.each(colors, function (i, currentColor) {

            var colorId = currentColor.replace('#', '');

//            $('#image_color_' + colorId).spectrum({
//                showPaletteOnly: true,
//                showPalette: true,
//                color: currentColor,
//                palette: mainpalette,
//                change: function (color) {
//                    myEditor.changeImageColor(currentColor, color.toHex());
//                    colorId = color.toHex();
//                    $('#image_color_' + colorId).val(color.toHex());
//
//
//                    $('#image_color_' + colorId).spectrum("set", color.toHex());
//                }
//            });
        });

    }
    this.addText = function () {
        action = false;
        var shape = myEditor.currentFontshape;
        /*if(myEditor.currentFontShape=="STRAIGHT")
         {

         var textSample = new fabric.Text($('#my_text').val(), {
         left: canvas.width/2,
         top: canvas.height/2,
         fontFamily: myEditor.currentFont,
         fontSize: 20,
         angle: 0,
         radius: 500,
         spacing: 1,
         fill: myEditor.currentFontColor,
         scaleX: 1,
         scaleY: 1,
         fontWeight: '',
         textAlign: 'center',
         originX: 'left',
         transformMatrix:[0.5,.30,0,1,0,0],
         hasRotatingPoint: true,
         centerTransform: true
         });
         }
         else */
        $('.shadow_shapes').hide();
        myEditor.currentOutlineEffect = '';
        myEditor.currentShadowEffect = '';
        myEditor.currentFontShape='STRAIGHT';
        myEditor.currentFont = 'Helvetica';
        myEditor.currentFontColor = '#AE3540';
        if (myEditor.currentFontShape == "ITALIC") {
            var textSample = new fabric.Text($('#my_text').val(), {
                left: canvas.width / 2,
                top: canvas.height / 2,
                fontFamily: myEditor.currentFont,
                fontSize: 20,
                fontStyle: 'italic',
                angle: 0,
                radius: 500,
                spacing: 1,
                fill: myEditor.currentFontColor,
                scaleX: 1,
                scaleY: 1,
                fontWeight: '',
                textAlign: 'center',
                originX: 'left',

                hasRotatingPoint: true,
                centerTransform: true
            });
        }
        else {
            if (myEditor.currentFontRange == 0) {
                myEditor.currentFontRange = 180;
            }
            var textSample = new fabric.CurvedText($('#my_text').val(), {
                left: canvas.width / 2,
                top: canvas.height / 2,
                fontFamily: myEditor.currentFont,
                fontSize: 20,
                angle: 0,
                range: myEditor.currentFontRange,
                smallFont: myEditor.currentFontSmall,
                largeFont: myEditor.currentFontLarge,
                radius: myEditor.currentFontRadius,
                spacing: myEditor.currentFontSpacing,
                effect: myEditor.currentFontShape,
                fill: myEditor.currentFontColor,
                scaleX: 1,
                scaleY: 1,
                fontWeight: '',
                textAlign: 'center',
                originX: 'left',

                hasRotatingPoint: true,
                centerTransform: true
            });
        }

        canvas.add(textSample);

        textSample.setControlVisible('mt', false);


        if (myEditor.currentOutlineEffect == "outline") {
            textSample.set('stroke', myEditor.currentOutlineColor);
            textSample.set('strokeWidth', 1);
        }
        if (myEditor.currentShadowEffect == "shadow") {

            canvas.getObjects()[canvas.getObjects().length - 1].set('shadow', {
                color: myEditor.currentShadowColor,
                blur: 1,
                offsetX: myEditor.shadowOffsetX,
                offsetY: myEditor.shadowOffsetY
            });

        }



        canvas.renderAll();
        canvas.setActiveObject(textSample);
        var obj = canvas.getActiveObject();
        obj.set('fill',myEditor.currentFontColor);
        canvas.setActiveObject(canvas.item(canvas.getObjects().length - 1));
        myEditor.centerAlignSelected();
        myEditor.middleAlignSelected();
        checkAllboundries();
        myEditor.saveState('Text');
        $('#my_text').val('')
    }
    this.print = function () {
        var image = new Image();
        image.src = canvas.toDataURL();

        var popup = window.open('', '', 'width=' + (canvas.width + 20) + ',height=' + (canvas.height + 20) + ',location=no,menubar=no,scrollbars=yes,status=no,toolbar=no');
        popup.document.title = "Print Image";
        $(popup.document.body).append(image);
        popup.print();
        return false;
    };

    this.updateActualText = function () {
        canvas.getActiveObject().setText($('#my_text').val());
        myEditor.saveState('Text');
        canvas.renderAll();
    }

    this.updateTextProps=function(o)
    {
        //myEditor.changeFontColor(myEditor.currentFontColor);
        //myEditor.changeShadowColor(myEditor.currentShadowColor);
        //myEditor.changeFont(myEditor.currentFont);
    }

    this.updateText = function () {
        if (canvas.getActiveObject()) {
            canvas.getActiveObject().setText($('#my_text').val());

            canvas.getActiveObject().fill = myEditor.currentFontColor;
            canvas.getActiveObject().fontFamily = myEditor.currentFont;
            if (myEditor.currentOutlineEffect == "outline") {
                canvas.getActiveObject().set('stroke', myEditor.currentOutlineColor);
                canvas.getActiveObject().strokeWidth = parseInt(myEditor.currentOutlineWidth);

                //canvas.renderAll();
                //alert('done here')

            }
            else {
                canvas.getActiveObject().strokeWidth = parseInt(myEditor.currentOutlineWidth);
                canvas.getActiveObject().stroke = null;

            }

            if (myEditor.currentShadowEffect == "shadow") {

                canvas.getActiveObject().set('shadow', {
                    color: myEditor.currentShadowColor,
                    blur: 1,
                    offsetX: myEditor.shadowOffsetX,
                    offsetY: myEditor.shadowOffsetY
                });


            }
            else {
                canvas.getActiveObject().shadow = null;
            }
            if (myEditor.currentFontShape == "ITALIC") {
                canvas.getActiveObject().fontStyle = 'italic';
            }
            else if (myEditor.currentFontShape == "ROUNDED") {
                canvas.getActiveObject().fontStyle = null;
            }
            else {
                canvas.getActiveObject().fontStyle = '';
            }
            canvas.getActiveObject().set('effect', myEditor.currentFontShape);
            canvas.getActiveObject().set('range', myEditor.currentFontRange);
            canvas.getActiveObject().set('radius', myEditor.currentFontRadius);
            canvas.getActiveObject().set('spacing', myEditor.currentFontSpacing);
            canvas.getActiveObject().set('smallFont', myEditor.currentFontSmall);
            canvas.getActiveObject().set('largeFont', myEditor.currentFontLarge);
            myEditor.saveState('Text');
            canvas.renderAll();
            //alert('saved here')
        }
    }
    this.leftAlignSelected = function () {
        var obj = canvas.getActiveObject();
        if (obj == null) {
            //this is a group selection
            obj = canvas.getActiveGroup();
            obj.left = boundingBox.left + parseInt(obj.currentWidth) / 2;// width of control + half of the total width
            obj.setCoords();
            canvas.renderAll();
        }
        else {
            //Single object
            obj.left = boundingBox.left;
            obj.setCoords();
            canvas.renderAll();
        }

    };

    this.rightAlignSelected = function () {
        var obj = canvas.getActiveObject();
        if (obj == null) {
            //this is a group selection
            obj = canvas.getActiveGroup();
            obj.left = myEditor.canvasDimentions.width - parseInt(obj.currentWidth) / 2;// width of canvas - half of the total width - controls width
            obj.setCoords();
            canvas.renderAll();
        }
        else {
            //Single object
            obj.left = (boundingBox.left + boundingBox.width) - parseInt(obj.currentWidth);
            obj.setCoords();
            canvas.renderAll();
        }

    };


    this.centerAlignSelected = function () {
        var obj = canvas.getActiveObject();
        if (obj == null) {
            //this is a group selection
            obj = canvas.getActiveGroup();
            obj.left = myEditor.canvasDimentions.width / 2 - boundingBox.left;// width of canvas - half of the total width - controls width
            obj.setCoords();
            canvas.renderAll();
        }
        else {
            //Single object
            obj.left = (boundingBox.width / 2) + boundingBox.left - (obj.currentWidth / 2);
            obj.setCoords();
            canvas.renderAll();
        }

    };


    this.topAlignSelected = function () {
        var obj = canvas.getActiveObject();
        if (obj == null) {
            //this is a group selection
            obj = canvas.getActiveGroup();
            obj.top = boundingBox.top + parseInt(obj.currentHeight) / 2;// height of control + half of the total height
            obj.setCoords();
            canvas.renderAll();
        }
        else {
            //Single object
            obj.top = boundingBox.top;
            obj.setCoords();
            canvas.renderAll();
        }

    };

    this.bottomAlignSelected = function () {
        var obj = canvas.getActiveObject();
        if (obj == null) {
            //this is a group selection
            obj = canvas.getActiveGroup();
            obj.top = boundingBox.height - parseInt(obj.currentHeight) / 2 + boundingBox.top;// height of canvas - half of the total height - controls height
            obj.setCoords();
            canvas.renderAll();
        }
        else {
            //Single object
            obj.top = boundingBox.height - parseInt(obj.currentHeight) + boundingBox.top;
            obj.setCoords();
            canvas.renderAll();
        }

    };


    this.middleAlignSelected = function () {
        var obj = canvas.getActiveObject();
        if (obj == null) {
            //this is a group selection
            obj = canvas.getActiveGroup();
            obj.top = myEditor.canvasDimentions.height / 2 - 6;// height of canvas - half of the total height - controls height
            obj.setCoords();
            canvas.renderAll();
        }
        else {
            //Single object
            obj.top = (boundingBox.height / 2) - (obj.currentHeight / 2) + boundingBox.top;
            obj.setCoords();
            canvas.renderAll();
        }

    };


    this.changeTextColor = function (color) {
        canvas.getActiveObject().set({fill: color});
        canvas.renderAll();
    }

    this.mousemove = function (e) {

        myEditor.mouseX = e.clientX - $('#canvas').offset().left;
        myEditor.mouseY = e.clientY - $('#canvas').offset().top;
        //myEditor.mouseX=canvas.getPointer(e.memo).x;
        //myEditor.mouseY=canvas.getPointer(e.memo).y;
    }
    this.dropImage = function (imageobj) {
        var image;
        var logoid = null;
        var type = 'svg';
        if (typeof(imageobj[0].children[0].attributes['svg']) != "undefined") {
            image = imageobj[0].children[0].attributes['svg'].nodeValue;
            logoid = imageobj[0].children[0].attributes['logoid'].nodeValue;

        }
        else {
            image = imageobj[0].children[0].attributes['src'].nodeValue;
            type = "image";
        }
        action = true;
        myEditor.addToCanvas(image, myEditor.mouseX, myEditor.mouseY, type, logoid);
    }
    this.applyFilter = function (index, filter, obj) {
        var filters = ['grayscale', 'invert', 'remove-white', 'sepia', 'sepia2',
            'brightness', 'noise', 'gradient-transparency', 'pixelate',
            'blur', 'sharpen', 'emboss', 'tint'];
        if (obj)
            ;
        else
            var obj = canvas.getActiveObject();
        obj.filters[index] = filter;
        obj.applyFilters(canvas.renderAll.bind(canvas));

    }

    this.grabObjectColors = function (obj) {
        var colors = [];
        if (obj.type == "images") {
            obj = obj.getObjects()[0]

            if (obj instanceof fabric.PathGroup) {

                obj.getObjects().forEach(function (o) {
                    if (jQuery.inArray(o.fill, colors) > -1) {


                    }
                    else {
                        if (typeof(o.fill) != "object") {
                            if ((o.fill).indexOf('rgb') > -1)
                                var colorId = rgb2hex(o.fill);
                            else
                                var colorId = (o.fill);
                            colors.push(colorId)
                        }
                    }
                });

            }
            else {
                if ((obj.fill).indexOf('rgb') > -1)
                    var colorId = rgb2hex(obj.fill);
                else
                    var colorId = (obj.fill);
                colors.push(colorId)
            }
        }
        else if (obj.type == "path-group") {
            //obj=obj.getObjects()[0]

            if (obj instanceof fabric.PathGroup) {

                obj.getObjects().forEach(function (o) {
                    if (jQuery.inArray(o.fill, colors) > -1) {


                    }
                    else {
                        if (typeof(o.fill) != "object") {
                            if ((o.fill).indexOf('rgb') > -1)
                                var colorId = rgb2hex(o.fill);
                            else
                                var colorId = (o.fill);
                            colors.push(colorId)
                        }
                    }
                });

            }
            else {
                if ((obj.fill).indexOf('rgb') > -1)
                    var colorId = rgb2hex(obj.fill);
                else
                    var colorId = (obj.fill);
                colors.push(colorId)
            }
        }
        else {
            if ((obj.fill).indexOf('rgb') > -1)
                var colorId = rgb2hex(obj.fill);
            else
                var colorId = (obj.fill);
            colors.push(colorId)
        }
        return colors;
    }
    this.convertToStitched = function () {
        var pattern = window.__pattern = new fabric.Pattern({
            source: 'images/bg.png',
            repeat: 'repeat'
        });
        var obj = canvas.getActiveObject();
        if (!obj) return;

        if (obj.fill instanceof fabric.Pattern) {
            obj.fill = null;
        }
        else {
            if (obj instanceof fabric.PathGroup) {
                obj.getObjects().forEach(function (o) {
                    o.fill = pattern;
                });
            }
            else {
                obj.fill = pattern;
            }
        }
        canvas.renderAll();
    }
    this.changeImageColor = function (oldColor, newColor) {

        if (newColor.indexOf('#') == -1)
            newColor = '#' + newColor;
        var obj = canvas.getActiveObject();
        if (!obj) return;
        var originalObj = obj;
        if (obj.fill instanceof fabric.Pattern) {
            obj.fill = null;
        }
        else {
            if (obj.type == "images") {
                obj = obj.getObjects()[0];

                if (obj instanceof fabric.PathGroup) {
                    obj.getObjects().forEach(function (o) {

                        var colorId = o.fill;
                        if ((o.fill).indexOf('rgb') > -1)
                            colorId = rgb2hex(o.fill);
                        if (colorId == oldColor)
                            o.fill = newColor;
                    });
                }
                else {

                    //obj.fill = newColor;
                    obj.setFill(newColor);
                    //obj=originalObj.getObjects()[1];
                    //obj.fill = newColor;
                    //obj.setFill(newColor);
                }

            }
            else if (obj.type == "path-group") {
                //obj=obj.getObjects()[0];
                if (obj instanceof fabric.PathGroup) {

                    obj.getObjects().forEach(function (o) {

                        var colorId = o.fill;
                        if ((o.fill).indexOf('rgb') > -1)
                            colorId = rgb2hex(o.fill);
                        if (colorId == oldColor)
                            o.fill = newColor;
                    });
                }
                else {
                    obj.fill = newColor;
                }

            }
            else {
                if (typeof(obj.filters) != "undefined") {

                }
                else
                //obj.fill = newColor;


                    shape = obj;
                if (shape.isSameColor && shape.isSameColor() || !shape.paths) {
                    shape.setFill(newColor);
                }
                else if (shape.paths) {
                    for (var i = 0; i < shape.paths.length; i++) {
                        shape.paths[i].setFill(newColor);
                    }
                }
            }
        }
        if (myEditor.currentDecorationMethod == "Stitched") {
            var pattern = window.__pattern = new fabric.Pattern({
                source: 'images/bg2.jpg',
                repeat: 'repeat'
            });
            var i = 0;
            canvas.getActiveObject().getObjects().forEach(function (o) {
                o.opacity = 1;
                o.setOpacity(1);
                if (i == 1)
                    o.setOpacity(0.3);
                if (i == 1) {
                    myEditor.applyFilter(12, new f.Tint({
                        color: '#000000',
                        opacity: 0.5
                    }), o);
                    var svg = o.toSVG();
                    svg.fill = '#FF0000';
                    canvas.renderAll();
                }


                i++;
                canvas.renderAll()
            });
            canvas.renderAll()
            /**/
        }

        canvas.renderAll()
        myEditor.populateImageColors(originalObj);


        canvas.renderAll();

    }
    this.addToCanvas = function (image, left, top, type, logoid) {

        var group = [];
        if (typeof(type) != "undefined" && type == "image") {

            fabric.Image.fromURL(image, function (imageobj) {
                var width = imageobj.width;
                var height = imageobj.height;
                if (width > height) {
                    var ratio = height / width;
                    if (width > canvas.width) {
                        width = canvas.width;
                        height = height * ratio;
                    }
                }
                else {
                    var ratio = width / height;
                    if (height > canvas.height) {
                        height = canvas.height;
                        width = width * ratio;
                    }
                }
                /**/

                imageobj.set({
                    left: left - (width / 2),
                    top: top - (height / 2),
                    width: width,
                    height: height
                });
                imageobj.setControlVisible('mt', false);
                canvas.add(imageobj);

            });
        }//end if typeof
        else {

            fabric.loadSVGFromURL(image, function (objects, options) {

                var shape = fabric.util.groupSVGElements(objects, options);
                //,
                //transformMatrix:[1,.30,0,1,0,0]
                var width = shape.width;
                var height = shape.height;
                var scaleX = 1;
                var scaleY = 1;
                if (width+50 > myEditor.canvasDimentions.width  || height+50 > myEditor.canvasDimentions.height)
                {

                    if (width > height) {
                        var ratio = height / width;
                        if (width > myEditor.canvasDimentions.width) {

                            scaleY = myEditor.canvasDimentions.height / shape.height
                            scaleX = myEditor.canvasDimentions.width / shape.width
                        }

                    }
                    else {
                        var ratio = width / height;

                        if (1) {
                            scaleY = myEditor.canvasDimentions.height / shape.height
                            scaleX = myEditor.canvasDimentions.width / shape.height


                            var rw = shape.width / myEditor.canvasDimentions.width; // width and height are maximum thumbnail's bounds
                            var rh = shape.height / myEditor.canvasDimentions.height;

                            if (rw > rh) {
                                newh = parseFloat(shape.height / rw);
                                neww = myEditor.canvasDimentions.width;

                            }
                            else {
                                neww = parseFloat(shape.width / rh);
                                newh = myEditor.canvasDimentions.height;
                            }
                            scaleX = (neww / (shape.width + 50));
                            scaleY = (newh / (shape.height + 50));

                        }


                    }

                }

                /* */
                var newleft = left - (width * scaleX / 2);
                var newtop = top - (height * scaleY / 2);
                var colorSet = '#00FFFF';
                shape.set({

                    scaleX: scaleX,
                    scaleY: scaleY,
                    logoid: logoid
                });

                shape.setControlVisible('mt', false);

                canvas.add(shape);
                canvas.setActiveObject(shape);
                myEditor.centerAlignSelected();
                myEditor.middleAlignSelected();
                checkAllboundries();
                canvas.renderAll();
                //shape.center();

            });
        }//End else


    }
    this.centerObject = function (obj) {


    }
}

function Logos() {
    this.API = stock_logos_API;
    this.items = [];
    this.loadLogos = function (json) {
        this.items = new Array();

        $.each(json.availableStockLogos, function (i, item) {
            var temp = new logoItem();
            temp.id = item.logoID;
            temp.image_name = item.logoName;
            temp.image_file = item.logoFile;
            temp.svg_file = item.logoSVG;

            myLogos.items.push(temp);
        });
        myLogos.populateGallery();
    }
    this.populateGallery = function () {
        var html = '';
        $.each(myLogos.items, function (i, item) {
            html += '<span class="thumb-menu3 allImages" id="images_' + item.id + '" onclick="myEditor.selectImage(\'' + item.id + '\',\'' + item.svg_file + '\')"><img src="' + item.image_file + '" svg="' + item.svg_file + '" logoId="' + item.id + '" style="height:65px;"/></span>';

        });
        $("#my_logos").html(html);
        $("#my_logos span").draggable({
            cancel: "a.ui-icon", // clicking an icon won't initiate dragging
            cursorAt: {cursor: "drag", left: 0, top: 0},
            helper: function (event, ui) {
                $(window).scrollTop(0)
                var objclass = '';
                if (navigator.userAgent.indexOf("MSIE 10") > -1) {
                    objclass = "ie10";
                }
                $('body').append('<div class="ui-draggable-dragging2 ' + objclass + '" ><img src="' + $(this)[0].children[0].src + '" height="50" custom_width="' + $(this)[0].children[0].naturalWidth + '" custom_height="' + $(this)[0].children[0].naturalHeight + '" /></div>');
                //return $( "<div class='ui-widget-header'>I'm a custom helper</div>" );
                return $('.ui-draggable-dragging2').get();
            },
            cursor: "pointer",
            start: function (event, ui) {
                $(window).scrollTop(0);
                canvas.deactivateAll();
                canvas.renderAll();
            },
            drag: function (event, ui) {
                $('.ui-draggable-dragging2').css("z-index", "2");
                var top = $('.ui-draggable-dragging2').css("top") + 1800;
                $('.ui-draggable-dragging2').css("top", top);

            },
            stop: function (event, ui) {
                /*var x=$('.ui-draggable-dragging2').clone();
                 $('body').append('<div class="final"></div>');
                 $('.final').append(x);*/

            }

        });
//
    };
    this.myLogosFilter = function () {
        $('#fullscreen_loading').show();
        var selCategory = $('#my_logos_selCategory').val();
        var txtSearch = $('#my_logos_txtSearch').val();
        if (txtSearch == "Search Art")
            txtSearch = "";

        jQuery.ajax({
            url: this.API,
            type: "POST",
            data: {
                category: selCategory,
                search: txtSearch,
                decorationmethod: myEditor.currentDecorationMethod
            },
            success: function (data) {
                if (typeof(data) == "string")
                    var json = jQuery.parseJSON(data);
                else
                    var json = data;
                myLogos.loadLogos(json);
            },

            error: function (result) {
            }
        });
    };
};


function customLogos() {
    this.API = custom_logos_API;
    this.items = [];
    this.loadLogos = function (json) {
        this.items = new Array();
        $.each(json.availableCustomLogos, function (i, item) {
            var temp = new customItem();
            temp.id = item.logoID;
            temp.image_name = item.logoName;
            temp.image_file = item.logoFile;
            myCustomLogos.items.push(temp);
        });
        if (myCustomLogos.items.length > 0)
            myCustomLogos.populateGallery();
        else
            $('#my_custom_logos').hide();
    }
    this.addCustomLogoItem = function (item) {

        this.items.push(item);
        //"Item"+item.image+"pushed")
    };
    this.populateGallery = function () {
        var html = '';
        $.each(myCustomLogos.items, function (i, item) {
            html += '<span class="thumb-menu3 allCustomImages" id="customImages_' + item.id + '" onclick="myEditor.selectCustomImage(' + item.id + ',\'' + item.image_file + '\')"><img src="' + item.image_file + '" style="height:65px;"/></span>';

        });
        //html+='<div class="white"><a href="#" id="addCustomLogo"><img src="images/add-product_03.jpg" width="230" height="42" border="0"></a></div>';
        $("#my_custom_logos").html(html);
        $("#my_custom_logos span").draggable({
            cancel: "a.ui-icon", // clicking an icon won't initiate dragging
            cursorAt: {cursor: "drag", left: 0, top: 0},
            helper: function (event, ui) {
                var objclass = '';
                if (navigator.userAgent.indexOf("MSIE 10") > -1) {
                    objclass = "ie10";
                }
                $('body').append('<div class="ui-draggable-dragging2 ' + objclass + '" ><img src="' + $(this)[0].children[0].src + '" height="50" custom_width="' + $(this)[0].children[0].naturalWidth + '" custom_height="' + $(this)[0].children[0].naturalHeight + '" /></div>');
                return $('.ui-draggable-dragging2').get();
            },
            cursor: "pointer",
            start: function (event, ui) {
                canvas.deactivateAll();
                canvas.renderAll()
            },
            drag: function (event, ui) {
                $('.ui-draggable-dragging2').css("z-index", "2");
                var top = $('.ui-draggable-dragging2').css("top") + 1800;
                $('.ui-draggable-dragging2').css("top", top);

            }

        });
//
    };
    this.myCustomLogosFilter = function () {
        $('#fullscreen_loading').show();
        jQuery.ajax({
            url: this.API,
            type: "POST",
            success: function (data) {
                if (typeof(data) == "string")
                    var json = jQuery.parseJSON(data);
                else
                    var json = data;
                myCustomLogos.loadLogos(json);
            },
            error: function (result) {
            }
        });
    };
};


function logoItem() {
    this.id = '';
    this.image_name = '';
    this.image_file = '';
    this.svg_file = '';

};

function customItem() {
    this.id = '';
    this.image_name = '';
    this.image_file = '';

};

function editorDebugger() {

    this.log = function (msg) {
        if (isDebug == 1)
            console.log(msg)
    }
}