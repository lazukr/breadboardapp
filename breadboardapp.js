/*
 * breadboardapp by Lazukr.
 * 
 * This is a webapp that is designed to allow users to create breadboard schematics neatly.
 * If you find any bugs, please report at https://github.com/lazukr/breadboardapp
 *
 *
 */ 

const BEIGE = "#F5D3B3";
const RED = "#FF0000";

const WIDTH = 130;
const HEIGHT = 35;
const SQUARE_SIZE = 10;
const TERMINAL_WIDTH = 63;
const TERMINAL_HEIGHT = 5;
const BUS_WIDTH = 40;
const BUS_HEIGHT = 1;

const upperTerminalArray = [];
const lowerTerminalArray = [];

function main() {

    const stage = new createjs.Stage("canvas");
    initBoard();
    renderBoard(stage);
    stage.update();

}

function initBoard() {
    
    let i;

    for (i = 0; i < TERMINAL_WIDTH; i++) {
        upperTerminalArray.push(createNode(TERMINAL_HEIGHT, (i+1)*2));
        lowerTerminalArray.push(createNode(TERMINAL_HEIGHT, (i+1)*2));
    }
}

function createNode(slots, pos) {

    const strip = [];
    let i;

    for (i = 0; i < slots; i++) {
        strip.push((i+1)*2);
    }

    return {
        pos: pos,
        strip: strip
    };
}


function renderBoard(stage) {
    
    const rect = coordToGrid({
        x: 0,
        y: 0,
        w: WIDTH,
        h: HEIGHT
    });

    drawRect(stage, rect.x, rect.y, rect.w, rect.h, BEIGE);
    upperTerminalArray.forEach(value => {
        value.strip.forEach(pos => {
            const square = coordToGrid({
                x: value.pos,
                y: pos
            });
            drawSquare(stage, square.x, square.y, RED); 
        });
    });
}

function drawSquare(stage, x, y, color) {

    const square = new createjs.Shape();
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

