/*
 * breadboardapp by Lazukr.
 * 
 * This is a webapp that is designed to allow users to create breadboard schematics neatly.
 * If you find any bugs, please report at https://github.com/lazukr/breadboardapp
 *
 *
 */ 

const BEIGE = "#F5D3B3";


const WIDTH = 130;
const HEIGHT = 35;
const SQUARE_SIZE = 10;


function main() {

    const stage = new createjs.Stage("canvas");
    renderBoard(stage);
    stage.update();

}

function renderBoard(stage) {
    
    var rect = coordToGrid({
        x: 0,
        y: 0,
        w: WIDTH,
        h: HEIGHT
    });

    drawRect(stage, rect.x, rect.y, rect.w, rect.h, BEIGE);

}

function drawSquare(stage, x, y, color) {

    var square = new createjs.Shape();
    square.graphics.beginFill(color).drawRect(x, y, SQUARE_SIZE, SQUARE_SIZE);
    stage.addChild(square);
}

function drawRect(stage, x, y, w, h, color) {
    const rect = new createjs.Shape();
    rect.graphics.beginFill(color).drawRect(x, y, w, h);
    stage.addChild(rect);
}

function coordToGrid(values) {
    Object.keys(values).forEach(key =>
        values[key] = values[key]*SQUARE_SIZE
    );

    return values;
}

