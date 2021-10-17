"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CollisionGrid = (function () {
    function CollisionGrid(bound, cellWidth, cellHeight) {
        this.bound = bound;
        this.cellWidth = cellWidth;
        this.cellHeight = cellHeight;
        this.numHorizCells = Math.ceil(this.boundWidth(bound) / cellWidth);
        this.numVertCells = Math.ceil(this.boundHeight(bound) / cellHeight);
        this.grid = new Array(this.numHorizCells * this.numVertCells);
    }
    CollisionGrid.prototype.boundWidth = function (bound) {
        return bound.hiX - bound.loX;
    };
    CollisionGrid.prototype.boundHeight = function (bound) {
        return bound.hiY - bound.loY;
    };
    CollisionGrid.prototype.boundsIntersect = function (a, b) {
        return !(a.loX > b.hiX || a.loY > b.hiY || a.hiX < b.loX || a.hiY < b.loY);
    };
    CollisionGrid.prototype.insert = function (bound, justTest) {
        if (justTest === void 0) { justTest = false; }
        if (bound.hiX < this.bound.loX ||
            bound.loX > this.bound.hiX ||
            bound.hiY < this.bound.loY ||
            bound.loY > this.bound.hiY) {
            return false;
        }
        var minCellX = this.getCellX(bound.loX);
        var maxCellX = this.getCellX(bound.hiX);
        var minCellY = this.getCellY(bound.loY);
        var maxCellY = this.getCellY(bound.hiY);
        var baseIdx = minCellY * this.numHorizCells + minCellX;
        var idx = baseIdx;
        for (var j = minCellY; j <= maxCellY; j++) {
            for (var i = minCellX; i <= maxCellX; i++) {
                var cell = this.grid[idx++];
                if (cell) {
                    for (var k = 0; k < cell.length; k++) {
                        if (this.boundsIntersect(bound, cell[k])) {
                            return false;
                        }
                    }
                }
            }
            idx += this.numHorizCells - (maxCellX - minCellX + 1);
        }
        if (justTest) {
            return true;
        }
        idx = baseIdx;
        for (var j = minCellY; j <= maxCellY; j++) {
            for (var i = minCellX; i <= maxCellX; i++) {
                if (!this.grid[idx]) {
                    this.grid[idx] = [bound];
                }
                else {
                    this.grid[idx].push(bound);
                }
                idx++;
            }
            idx += this.numHorizCells - (maxCellX - minCellX + 1);
        }
        return true;
    };
    CollisionGrid.prototype.getCellX = function (x) {
        return Math.floor((x - this.bound.loX) / this.cellWidth);
    };
    CollisionGrid.prototype.getCellY = function (y) {
        return Math.floor((y - this.bound.loY) / this.cellHeight);
    };
    return CollisionGrid;
}());
exports.CollisionGrid = CollisionGrid;
