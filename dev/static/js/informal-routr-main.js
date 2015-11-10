var drawnItems;
var map;
var sidebar;
var data;


// Lets override the polyline editing handlers so a double click is not closing the line. Cool.
L.Editable.PathEditor.prototype.onVertexMarkerClick = function (e) {
    var index = e.vertex.getIndex();
    if (e.originalEvent.ctrlKey) {
        this.onVertexMarkerCtrlClick(e);
    } else if (e.originalEvent.altKey) {
        this.onVertexMarkerAltClick(e);
    } else if (e.originalEvent.shiftKey) {
        this.onVertexMarkerShiftClick(e);
    } else if (index >= this.MIN_VERTEX - 1 && index === e.vertex.getLastIndex() && this.drawing === L.Editable.FORWARD) {
        //this.commitDrawing();
    } else if (index === 0 && this.drawing === L.Editable.BACKWARD && this._drawnLatLngs.length >= this.MIN_VERTEX) {
        this.commitDrawing();
    } else if (index === 0 && this.drawing === L.Editable.FORWARD && this._drawnLatLngs.length >= this.MIN_VERTEX && this.CLOSED) {
        this.commitDrawing();  // Allow to close on first point also for polygons
    } else {
        this.onVertexRawMarkerClick(e);
    }
};

function loadEditTools(map) {

    map.editTools.startPolyline();

    map.on('editable:drawing:click', function (e) {
        //console.log(e.layer._latlngs);
        saveRoute(e.layer._latlngs);
    });

    map.on('editable:vertex:dragend', function (e) {
        //console.log(e.layer._latlngs);
        saveRoute(e.layer._latlngs);
    });

    // fired when you click the last one
    map.on('editable:drawing:commit', function(e) {
        saveRoute(e.layer._latlngs);
    });

    map.on('dblclick', function(e) {
        alert('super');
    })

}

/**
 * Loads the contents of body_location into the element el
 *
 * Install: bower install showdown
 *
 * @param body_location     location of the md file
 * @param el                jquery selector, i.e '#xxx'
 *
 */
function loadMarkdown(body_location, el) {

    // DEP: https://github.com/showdownjs/showdown
    // bower install showdown

    function getText(myUrl){
        var result = null;
        $.ajax( { url: myUrl,
                type: 'get',
                dataType: 'html',
                async: false,
                success: function(data) { result = data; }
            }
        );
        FileReady = true;
        return result;
    }

    var converter = new showdown.Converter();
    var text      = getText(body_location);
    var html      = converter.makeHtml(text);
    $(el).html(html);
}

function loadUndoButton(map) {

    var b = L.easyButton('<div class="undo-icon" title="Remove the last point.">&nbsp;</div>',
        function(btn, map) {

            $("#map").fadeOut("slow");
            $("#thank-you").fadeIn("slow");
            map.editTools.stopDrawing();

        }).addTo(map);
}

function loadInformal(map) {

    var b = L.easyButton({
        id: 'informal-button',
        states: [
            {
                onClick: function(btn, map) {
                    sidebar.show();
                },
                icon: '<div class="informal-city-icon">&nbsp;</div>'
            }
        ]}).addTo( map );

    $('.informal-city-icon').parent().parent().hide();
}

function loadSaveAndClose(map) {

    var b = L.easyButton('<div class="save-disk-icon" title="Save your route and close this window.">&nbsp;</div>',
        function(btn, map) {

            $("#map").fadeOut("slow");
            $("#thank-you").fadeIn("slow");
            map.editTools.stopDrawing();

        }).addTo(map);
}

/**
 * Loads the sidebar with the welcome text.
 * @param map
 */
function loadSidebar(map) {

    var sidebar = L.control.sidebar('sidebar', {
        position: 'left'
    });

    map.addControl(sidebar);

    sidebar.show();

    sidebar.on('hide', function () {
        $('.informal-city-icon').parent().parent().fadeIn();
    });

    sidebar.on('show', function () {
        $('.informal-city-icon').parent().parent().fadeOut();
    });

    return sidebar;

}

/**
 * Adds the search button to the map.
 * Currently wired up to OpenstreetMaps Nominatim service.
 * @param map
 */
function addSearch(map) {
    map.addControl( new L.Control.Search({
        url: 'http://nominatim.openstreetmap.org/search?format=json&q={s}',
        jsonpParam: 'json_callback',
        propertyName: 'display_name',
        propertyLoc: ['lat','lon'],
        circleLocation: false,
        markerLocation: false,
        autoType: true,
        autoCollapse: true,
        minLength: 2,
        zoom:10
    }) );
}

function saveRoute(polyLine) {
    var coordinate_sequence = [];
    for (var cid in polyLine) {
        coordinate_sequence.push(
            {
                'lat': polyLine[cid].lat,
                'lng': polyLine[cid].lng
            }
        )
    }
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: "save_route",
        data: JSON.stringify({
            'polyline': coordinate_sequence,
            'user_id': user_id}),
        success: function (data) {
            //console.log(data);
        },
        dataType: "json"
    });
}

function addCtrlZ(map) {
    var Z = 90, latlng, redoBuffer = [],
        onKeyDown = function (e) {
            if (e.keyCode == Z) {
                if (!map.editTools._drawingEditor) return;
                if (e.shiftKey) {
                    if (redoBuffer.length) map.editTools._drawingEditor.push(redoBuffer.pop());
                } else {
                    latlng = this.editTools._drawingEditor.pop();
                    if (latlng) redoBuffer.push(latlng);
                }
            }
        };
    L.DomEvent.addListener(document, 'keydown', onKeyDown, map);
    map.on('editable:drawing:end', function () {
        redoBuffer = [];
    });
}



function getStyles() {
    return [
        {"featureType":"administrative", "elementType":"geometry.stroke", "stylers":[{"visibility":"on"}, {"color":"#ababab"}]},
        {"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#444444"}]},
        {"featureType":"administrative.country","elementType":"geometry.stroke","stylers":[{"lightness":"59"}]},
        {"featureType":"administrative.country","elementType":"labels.text","stylers":[{"lightness":"50"},{"color":"#7e7e85"},{"weight":"0.21"}]},
        {"featureType":"administrative.province","elementType":"geometry.stroke","stylers":[{"weight":"0.5"},{"color":"#afafaf"},{"visibility":"on"}]},
        {"featureType":"administrative.province","elementType":"labels.text","stylers":[{"visibility":"off"},{"color":"#7e7e85"}]},
        {"featureType":"administrative.province","elementType":"labels.text.fill","stylers":[{"color":"#7e7e85"}]},
        {"featureType":"administrative.locality","elementType":"labels.text","stylers":[{"visibility":"on"},{"lightness":"59"}]},
        {"featureType":"administrative.locality","elementType":"labels.text.fill","stylers":[{"lightness":"-39"}]},
        {"featureType":"administrative.locality","elementType":"labels.icon","stylers":[{"lightness":"48"},{"visibility":"on"}]},
        {"featureType":"administrative.neighborhood","elementType":"labels.text","stylers":[{"visibility":"off"}]},
        {"featureType":"administrative.land_parcel","elementType":"geometry.stroke","stylers":[{"visibility":"off"},{"color":"#c4c4c7"}]},
        {"featureType":"administrative.land_parcel","elementType":"labels.text","stylers":[{"visibility":"off"}]},
        {"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2f2f2"}]},
        {"featureType":"landscape.natural.terrain","elementType":"labels.text","stylers":[{"color":"#ff0000"},{"visibility":"off"}]},
        //{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"}]},
        {"featureType":"road","elementType":"all","stylers":[{"saturation":-100},{"lightness":45}]},
        {"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"on"}]},
        {"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#eaeaea"},{"weight":".5"}]},
        {"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"weight":".75"},{"color":"#e4e3e3"}]},
        {"featureType":"road.highway","elementType":"labels","stylers":[{"visibility":"on"},{"lightness":"20"}]},
        {"featureType":"road.highway","elementType":"labels.text.fill","stylers":[{"visibility":"on"}]},
        {"featureType":"road.highway","elementType":"labels.text.stroke","stylers":[{"weight":"0.49"}]},
        {"featureType":"road.arterial","elementType":"all","stylers":[{"visibility":"on"}]},
        {"featureType":"road.arterial","elementType":"labels.text","stylers":[{"visibility":"on"}]},
        {"featureType":"road.arterial","elementType":"labels.text.fill","stylers":[{"lightness":"43"}]},
        {"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},
        {"featureType":"road.local","elementType":"all","stylers":[{"visibility":"on"}]},
        {"featureType":"road.local","elementType":"geometry.stroke","stylers":[{"visibility":"on"},{"saturation":"-41"},{"color":"#c8c8c8"}]},
        {"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},
        {"featureType":"water","elementType":"all","stylers":[{"color":"#ffffff"},{"visibility":"on"}]},
        {"featureType":"water","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#b6cdfb"}]}, //a5a5aa
        {"featureType":"water","elementType":"labels.text","stylers":[{"lightness":"100"},{"gamma":"1.13"},{"saturation":"-96"},{"visibility":"on"},{"color":"#eff0f6"},{"weight":"0.01"}]},
        {"featureType":"water","elementType":"labels.text.fill","stylers":[{"lightness":"74"}]},
        {"featureType":"water","elementType":"labels.text.stroke","stylers":[{"visibility":"on"}]}

    ];
}