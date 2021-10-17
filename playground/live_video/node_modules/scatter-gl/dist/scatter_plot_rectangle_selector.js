"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ScatterPlotRectangleSelector = (function () {
    function ScatterPlotRectangleSelector(container, selectionCallback, styles) {
        this.startCoordinates = [0, 0];
        this.svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svgElement.style.display = 'none';
        this.svgElement.style.height = '100%';
        this.svgElement.style.width = '100%';
        this.svgElement.style.position = 'absolute';
        container.insertAdjacentElement('afterbegin', this.svgElement);
        this.rectElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        this.rectElement.style.stroke = styles.select.stroke;
        this.rectElement.style.strokeDasharray = styles.select.strokeDashArray;
        this.rectElement.style.strokeWidth = "" + styles.select.strokeWidth;
        this.rectElement.style.fill = styles.select.fill;
        this.rectElement.style.fillOpacity = "" + styles.select.fillOpacity;
        this.svgElement.appendChild(this.rectElement);
        this.selectionCallback = selectionCallback;
        this.isMouseDown = false;
    }
    ScatterPlotRectangleSelector.prototype.onMouseDown = function (offsetX, offsetY) {
        this.isMouseDown = true;
        this.rectElement.style.display = 'block';
        this.svgElement.style.display = 'block';
        this.startCoordinates = [offsetX, offsetY];
        this.lastBoundingBox = {
            x: this.startCoordinates[0],
            y: this.startCoordinates[1],
            width: 1,
            height: 1,
        };
    };
    ScatterPlotRectangleSelector.prototype.onMouseMove = function (offsetX, offsetY) {
        if (!this.isMouseDown) {
            return;
        }
        this.lastBoundingBox.x = Math.min(offsetX, this.startCoordinates[0]);
        this.lastBoundingBox.y = Math.max(offsetY, this.startCoordinates[1]);
        this.lastBoundingBox.width =
            Math.max(offsetX, this.startCoordinates[0]) - this.lastBoundingBox.x;
        this.lastBoundingBox.height =
            this.lastBoundingBox.y - Math.min(offsetY, this.startCoordinates[1]);
        this.rectElement.setAttribute('x', '' + this.lastBoundingBox.x);
        this.rectElement.setAttribute('y', '' + (this.lastBoundingBox.y - this.lastBoundingBox.height));
        this.rectElement.setAttribute('width', '' + this.lastBoundingBox.width);
        this.rectElement.setAttribute('height', '' + this.lastBoundingBox.height);
    };
    ScatterPlotRectangleSelector.prototype.onMouseUp = function () {
        this.isMouseDown = false;
        this.svgElement.style.display = 'none';
        this.rectElement.style.display = 'none';
        this.rectElement.setAttribute('width', '0');
        this.rectElement.setAttribute('height', '0');
        this.selectionCallback(this.lastBoundingBox);
    };
    return ScatterPlotRectangleSelector;
}());
exports.ScatterPlotRectangleSelector = ScatterPlotRectangleSelector;
