const types = {   
    blank : '.',
    x : 'x',
    o : 'o'
};

let gamePlaying = true;

// Game logic
let gameLogic = (function(){

    let cells_ = [];
    
    let countBlank;
    
    let gameOver = false;
    
    let getCheck = (rule) => (x=0, y=0, len=cells_.length) => {
        let marker = cells_[y][x] === types.x || cells_[y][x] === types.o;
        let count = 1;
        while (marker && count < len){
            marker &= rule(x, y, count) === cells_[y][x];
            count++;
        }
        return marker;
    }
    
    let checkRow = (y=0, x=0, len=cells_.length) => getCheck((x, y, count) => cells_[y][x+count])(x, y, len);
    
    let checkCol = getCheck((x, y, count) => cells_[y+count][x]);
    
    let checkMainDiag = getCheck((x, y, count) => cells_[y+count][x+count]);
    
    let checkAntiDiag = (x=cells_.length-1, y=0, len=cells_.length) => getCheck((x, y, count) => cells_[y+count][x-count])(x, y, len);

    // if length of winning row is less than width of the field this doesn't work
    function checkWin(){
        for (let i = 0; i < cells_.length; i++){
            if(checkCol(i) || checkRow(i)){
                return true;
            }
        }
        if (checkMainDiag() || checkAntiDiag()){ return true;}
        return false;
    };

    return {
        printCells: function(){
            console.log(cells_);  
        },
        
        init : function(cells) {
            countBlank = cells*cells;
            for (let i = 0; i < cells; i++){
                cells_.push([]);
                for(let j = 0; j < cells; j++){
                    cells_[i].push('.');
                }
            }
        },

        addMark : function(x, y, type) {
            if (cells_[y][x] != types.blank){
                return false;
            }
            cells_[y][x] = type;
            countBlank -= 1;
            if(checkWin() || countBlank === 0){
                gameOver = true;
            }
            return true;
        },
            
        isGameOver : function() {
            return gameOver;
        }
    }
})();


//DOM
let domEls = {
    canvas: document.querySelector('canvas'),
    playingField: document.querySelector('.playing-field')    
};

let canvasRepresentation = (function(){
    
    let field = {
        side : 0,
        cells : 3,
        left : 0,
        top : 0
    };
    
    let cellWidth = 0;
    
    let ctx;
    
    return {
        init: function(cells = 3){
            domEls.canvas.width = 500;
            domEls.canvas.height = 500;
            field.side = 0.9 * Math.min(domEls.canvas.height, domEls.canvas.width);
            field.cells = cells;
            cellWidth = field.side/field.cells;
            field.left = (domEls.canvas.width - field.side) / 2;
            field.top = (domEls.canvas.height - field.side) / 2;
            ctx = domEls.canvas.getContext('2d');
            ctx.fillStyle = '#bbbbff';
            ctx.fillRect( field.left, field.top, field.side, field.side);           
        },
        
        addMark : function(x, y, type){
            let centerX = field.left + cellWidth * (x + 0.5);
            let centerY = field.top + cellWidth * (y + 0.5);
            if(type === types.x){
                ctx.beginPath();
                ctx.moveTo(centerX - 0.4*cellWidth, centerY - 0.4*cellWidth);
                ctx.lineTo(centerX + 0.4*cellWidth, centerY + 0.4*cellWidth);
                ctx.moveTo(centerX + 0.4*cellWidth, centerY - 0.4*cellWidth);
                ctx.lineTo(centerX - 0.4*cellWidth, centerY + 0.4*cellWidth);
                ctx.stroke();
            }else{
                ctx.beginPath();
                ctx.arc(centerX, centerY, 0.4*cellWidth, 0, 2 * Math.PI, false);
                ctx.stroke();
            }
        },
        
        convertCoordinates: function(canvasX, canvasY){
            let fieldAreaX = canvasX - field.left, fieldAreaY = canvasY - field.top;
            let fieldX = Math.trunc(fieldAreaX / cellWidth), fieldY = Math.trunc(fieldAreaY / cellWidth);
            if(fieldX >= field.cells || fieldY >= field.cells){
                fieldX = -1;
                fieldY = -1;
            }
            return [fieldX, fieldY]
        }
    }
})();

//let TableRepresentation = (function(){});

let representation = canvasRepresentation;//domEls.canvas.getContext ? canvasRepresentation : tableRepresentation;

let player = types.x;

function changePlayer(){
    player = player === types.x ? types.o : types.x;
}

domEls.playingField.addEventListener('click', function(event){
    if(!gamePlaying){
        return;
    }
    let viewportOffset = domEls.playingField.getBoundingClientRect();
    // these are relative to the viewport, i.e. the window
    let top = viewportOffset.top;// + pageYOffset;
    let left = viewportOffset.left;// + pageXOffset;
    console.log(`x = ${event.x - left}, y = ${event.y - top}`);
    let canvasX = event.x - left, canvasY = event.y - top;
    let [fieldX, fieldY] = representation.convertCoordinates(canvasX, canvasY);
    console.log(`fieldX = ${fieldX}`);
    if(fieldX == -1){
        return;
    }
    if(gameLogic.addMark(fieldX, fieldY, player)){
        representation.addMark(fieldX, fieldY, player);
        changePlayer();
        gamePlaying = !gameLogic.isGameOver();
    }
    
});

gameLogic.init(3);
representation.init();



































