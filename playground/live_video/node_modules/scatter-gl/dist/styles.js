"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var makeDefaultStyles = function () {
    var defaultStyles = {
        backgroundColor: '#ffffff',
        axesVisible: true,
        fog: {
            color: '#ffffff',
            enabled: true,
            threshold: 5000,
        },
        label: {
            fontSize: 10,
            scaleDefault: 1,
            scaleLarge: 2,
            fillColorSelected: '#000000',
            fillColorHover: '#000000',
            strokeColorSelected: '#ffffff',
            strokeColorHover: '#ffffff',
            strokeWidth: 3,
            fillWidth: 6,
        },
        label3D: {
            fontSize: 80,
            scale: 2.2,
            color: 'black',
            backgroundColor: '#ffffff',
            colorUnselected: '#ffffff',
            colorNoSelection: '#ffffff',
        },
        point: {
            colorUnselected: 'rgba(227, 227, 227, 0.7)',
            colorNoSelection: 'rgba(117, 117, 217, 0.7)',
            colorSelected: 'rgba(250, 102, 102, 0.7)',
            colorHover: 'rgba(118, 11, 79, 0.7)',
            scaleDefault: 1.0,
            scaleSelected: 1.2,
            scaleHover: 1.2,
        },
        polyline: {
            startHue: 60,
            endHue: 360,
            saturation: 1,
            lightness: 0.3,
            defaultOpacity: 0.2,
            defaultLineWidth: 2,
            selectedOpacity: 0.9,
            selectedLineWidth: 3,
            deselectedOpacity: 0.05,
        },
        select: {
            fill: '#dddddd',
            fillOpacity: 0.2,
            stroke: '#aaaaaa',
            strokeWidth: 2,
            strokeDashArray: '10 5',
        },
        sprites: {
            minPointSize: 5.0,
            imageSize: 30,
            colorUnselected: '#ffffff',
            colorNoSelection: '#ffffff',
        },
    };
    return defaultStyles;
};
function makeStyles(userStyles) {
    var defaultStyles = makeDefaultStyles();
    if (userStyles === undefined) {
        return defaultStyles;
    }
    for (var key in defaultStyles) {
        var _key = key;
        if (typeof defaultStyles[_key] === 'object' &&
            typeof userStyles[_key] === 'object') {
            defaultStyles[_key] = Object.assign(defaultStyles[_key], userStyles[_key]);
        }
        else if (userStyles[_key] !== undefined) {
            defaultStyles[_key] = userStyles[_key];
        }
    }
    return defaultStyles;
}
exports.makeStyles = makeStyles;
