/**
 * Created by Никита on 18.07.2014.
 */

function Person( maze , tileX , tileY, assets ){
    this.maze = maze;

    this.startX = 0;
    this.startY = 0;
    this.deltaX = 0;
    this.deltaY = 0;
    this.move = false;
    this.directs = new Queue( 50 );

    this.x = 0;
    this.y = 0;
    this.timePerMmove = 150;
    this.timeOfMmove = 0;
    this.tileX = tileX;
    this.tileY = tileY;
    this.color = "#b3a5e4"
	this.img = assets.person;
}

Person.prototype.locate = function () {
    this.x = this.maze.wallWidth + ( this.maze.wallWidth + this.maze.cageWidth ) * ( this.tileX /* - 1*/ );
    this.y = this.maze.wallWidth + ( this.maze.wallWidth + this.maze.cageWidth ) * ( this.tileY /* - 1*/);
};


Person.prototype.update = function ( deltaTime ){
    if( this.move ){
        this.timeOfMmove += deltaTime;
        this.x = this.startX + ( this.deltaX * this.timeOfMmove ) / this.timePerMmove;
        this.y = this.startY + ( this.deltaY * this.timeOfMmove ) / this.timePerMmove;
        //Нормализуем (на случай выхода за край) !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!НУЖНО ОПТИМИЗИРОВАТЬ!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1
        this.x = ( this.x + maze.playgroundWidth + 3 * ( maze.wallWidth + maze.cageWidth ) )% ( maze.playgroundWidth + 2 * ( maze.wallWidth + maze.cageWidth ) ) - ( maze.wallWidth + maze.cageWidth );
        this.y = ( this.y + maze.playgroundHeight + 3 * ( maze.wallWidth + maze.cageWidth ) ) % ( maze.playgroundHeight + 2 * ( maze.wallWidth + maze.cageWidth ) ) - ( maze.wallWidth + maze.cageWidth );

        //this.x = ( this.x + maze.playgroundWidth )% maze.playgroundWidth;
        //this.y = ( this.y + maze.playgroundHeight ) % maze.playgroundHeight;

        if( this.timeOfMmove >= this.timePerMmove ){
            this.nextMove();
        }
    }
};

Person.prototype.goInDirect = function( direct ) {
    if( this.move ){
        this.directs.enqueue ( direct );
        return;
    }
    var tileX = this.tileX;
    var tileY = this.tileY;
    this.deltaX = 0;
    this.deltaY = 0;
    while( this.maze.canGo( tileX , tileY , direct) ){
        //Тайл в который нужно попасть
        tileX = tileX + DIRECT.x[direct];
        tileY = tileY + DIRECT.y[direct];

        if(tileX != ( tileX + maze.width ) % maze.width) {
            tileX = ( tileX + maze.width ) % maze.width;
            this.deltaX += 2 * DIRECT.x[direct] * (maze.cageWidth + maze.wallWidth);
        }
        if(tileY != ( tileY + maze.height ) % maze.height){
            tileY = ( tileY + maze.height ) % maze.height;
            this.deltaY +=2 * DIRECT.y[direct] * (maze.cageWidth + maze.wallWidth);
        }

        //Расстояние которое нужно пройти
        this.deltaX += DIRECT.x[direct] * (maze.cageWidth + maze.wallWidth);
        this.deltaY += DIRECT.y[direct] * (maze.cageWidth + maze.wallWidth);
        if(this.canTurn( tileX , tileY , direct ) ) break;
    }
    if(tileX != this.tileX || tileY != this.tileY) {
        this.move = true;
        this.startX = this.x;
        this.startY = this.y;
        this.tileX = tileX;
        this.tileY = tileY;
    }
};

Person.prototype.canTurn = function ( x , y , direct ){
    if ( this.maze.canGo ( x , y , (direct + 1) % 4 ) ) return true;
    if ( this.maze.canGo ( x , y , (direct - 1 + 4) % 4 ) ) return true;
    return false;
};

Person.prototype.nextMove = function(){
    this.locate();
    this.move = false;
    this.timeOfMmove = this.timeOfMmove - this.timePerMmove;
    if( !this.directs.isEmpty() ){
        this.goInDirect(this.directs.dequeue());
    }
};


Person.prototype.draw = function(canvas){
    var ctx = canvas.getContext("2d");
    /*ctx.fillStyle = this.color;
    ctx.fillRect( this.x , this.y , this.maze.cageWidth , this.maze.cageWidth);*/
	ctx.drawImage ( this.img , this.x , this.y , this.maze.cageWidth , this.maze.cageWidth );
};