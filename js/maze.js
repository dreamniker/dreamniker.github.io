/**
 * Created by Никита on 15.07.2014.
 */
//МОГУТ БЫТЬ УТЕЧКИ ПАМЯТИ ПРИ ИЗ-ЗА МАТРИЦ ПОСЕЩАЕМОСТИ И ПРОХОДИМОСТИ

function Maze( playgroundWidth , playgroundHeight , mazeCanvas , assets ){
	
	/*
		Если еденицу сдвинуть на доступное направление то получим часть кода
	
	*/
    this.assets = assets;
	this.canvas = mazeCanvas;
	//this.drawBackground(this.canvas);
	
	this.theme = "l";
	//Вего 15 разных тайлов, их можно получить поворачивая 4 тайла
	this.tiles = {
        quantity : 16,
		width : 256,
		/*
		0 - нет прохода
		1 - 1 проход
		2 - 2 прохода параллельно
		3 - 3 прохода
		4 - 4 прохода
        5 - 2 прохода уголком
	*/
		numb : [ 0 , 1 , 1 , 5 , 1 , 2 , 5 , 3 , 1 , 5 , 2 , 3 , 5 ,  3 , 3 , 4 ],
		//На сколько градусов нужно повернуть тайл numb чтобы получить нужный
		turn:[ 0 , 0 , Math.PI/2 , Math.PI/2*3 , Math.PI , 0 , 0 , 0 , Math.PI/2*3 , Math.PI , Math.PI/2 , Math.PI/2*3 , Math.PI/2 , Math.PI , Math.PI/2 , 0 ]
	};

    this.createFullMazeSprite();

	
	
	
    this.DIRECT = {
        FIRST:0,
        RIGHT:0,
        DOWN:1,
        LEFT:2,
		UP:3,
        LAST:3,
        x:[1,0,-1,0],
        y:[0,1,0,-1]
    };
    this.playgroundWidth = playgroundWidth;
    this.playgroundHeight = playgroundHeight;
    this.wallWidth = 0;
    this.cageWidth = 0;
}

Maze.prototype.createFullMazeSprite = function(){
    this.sprite = this.assets.mazeSprite;

    this.spriteCanvas = document.createElement("canvas");
    this.spriteCTX = this.spriteCanvas.getContext("2d");
    this.spriteCanvas.height = this.tiles.width;
    this.spriteCanvas.width = this.tiles.width * 6;
    this.spriteCTX.drawImage(this.sprite , 0 , 0);

    this.fullSprite = document.createElement("canvas");
    this.fullSpriteCTX = this.fullSprite.getContext("2d");
    this.fullSprite.height = this.tiles.width;
    this.fullSprite.width = this.tiles.width * 16;

    for(var tile = 0; tile < this.tiles.quantity; tile++){
        this.fullSpriteCTX.save();
        this.fullSpriteCTX.translate(   tile * this.tiles.width  + this.tiles.width / 2 , this.tiles.width / 2);
        this.fullSpriteCTX.rotate( this.tiles.turn[tile]);
        this.fullSpriteCTX.drawImage(
            this.spriteCanvas,
                this.tiles.numb[tile] * this.tiles.width , 0 , this.tiles.width , this.tiles.width ,
                - this.tiles.width / 2 ,  - this.tiles.width / 2 , this.tiles.width , this.tiles.width );
        this.fullSpriteCTX.restore();
    }
}


Maze.prototype.generate = function( width , height , personPositionX , personPositionY ){
    //Координаты пробивателя стен в лабиринте
    this.destroyer = {
        x : personPositionX,
        y : personPositionY,
        step : 1,
        wayX : [],
        wayY : [],
        wayFirst : 0,
        wayLength : 1
    };
    this.destroyer.wayX[ 0 ] = personPositionX;
    this.destroyer.wayY[ 0 ] = personPositionY;



    this.width = width;
    this.height = height;
    this.terrainMatrix = [];

    //Просчитываем размеры для прорисовки
    /*var del = 5;
    this.wallWidth = this.playgroundWidth / ((this.width ) * (del + 1) + 1);
    this.cageWidth = this.wallWidth * del;
*/
	this.cageWidth = this.playgroundWidth / ( this.width + 2 );
	
    for(var x = 0; x < width + 3; x++){
        this.terrainMatrix[ x ] = [];
        for(var y = 0; y < height + 3; y++){
            this.terrainMatrix[ x ][ y ]={
                left_wall : true,
                up_wall : true,
                bridge : false,
				tileIndex : 0,
                step : 0
            };
        }
    }
    this.terrainMatrix[ this.destroyer.x ][ this.destroyer.y ].step = 1;
    var maxChainLength = width;

    while (this.destroyer.wayFirst < this.destroyer.wayLength ) {
        //Пробиваем стены и создаем одну цепь лабиринта
        while (true) {
            var direct = this.randomPassableDestroyDirect(this.destroyer.x, this.destroyer.y);
            if (direct == -1) {
                break;
            }

            this.destroyWall(this.destroyer.x, this.destroyer.y, direct);
            this.goDestroyer(direct);

            //Если длина цепи слишком большая, прервать построение этой цепи и начать следующую
            if(this.terrainMatrix[ this.destroyer.x ][ this.destroyer.y ].step > maxChainLength){
                this.destroyer.wayX [ this.destroyer.wayLength ] = this.destroyer.x;
                this.destroyer.wayY [ this.destroyer.wayLength ] = this.destroyer.y;

                this.destroyer.wayLength = this.destroyer.wayLength + 1;
                break;
            }
        } //while (true)

        this.destroyer.x = this.destroyer.wayX [ this.destroyer.wayFirst ];
        this.destroyer.y = this.destroyer.wayY [ this.destroyer.wayFirst ];
        this.destroyer.step = this.terrainMatrix[ this.destroyer.x ][ this.destroyer.y ].step;

        this.destroyer.wayFirst++;
    }
    this.addBorderCages();
	this.createImageOfMaze( this.canvas );
	
};

Maze.prototype.addBorderCages = function (){
    for (var x = this.width; x > 0 ; x--){
        for (var y = this.height ; y > 0; y--){
             this.terrainMatrix [ x ][ y ].left_wall = this.terrainMatrix [ x - 1 ][ y - 1 ].left_wall;
             this.terrainMatrix [ x ][ y ].up_wall = this.terrainMatrix [ x - 1 ][ y - 1 ].up_wall;
        }
    }
    for (var x = 0; x < this.width + 2 ; x++){
        this.terrainMatrix [ x ][ 0 ].left_wall = true;
        this.terrainMatrix [ x ][ this.height + 1 ].left_wall = true;
        this.terrainMatrix [ x ][ 0 ].up_wall = this.terrainMatrix [ x ][ 1 ].up_wall;
        this.terrainMatrix [ x ][ this.height + 1 ].up_wall = this.terrainMatrix [ x ][ 1 ].up_wall;
    }

    for (var y = 0; y < this.height + 2 ; y++){
        this.terrainMatrix [ 0 ][ y ].up_wall = true;
        this.terrainMatrix [ this.width + 1 ][ y ].up_wall = true;
        this.terrainMatrix [ 0][ y ].left_wall = this.terrainMatrix [ 1 ][ y ].left_wall;
        this.terrainMatrix [ this.width + 1 ][ y ].left_wall = this.terrainMatrix [ 1 ][ y ].left_wall;
    }


    this.width+=2;
    this.height+=2;
};



Maze.prototype.goDestroyer = function ( direct ){
    this.destroyer.x = this.normalizeX( this.destroyer.x + this.DIRECT.x[direct] );
    this.destroyer.y = this.normalizeX( this.destroyer.y + this.DIRECT.y[direct] );
    this.destroyer.step = this.destroyer.step + 1;
    this.terrainMatrix[ this.destroyer.x ][ this.destroyer.y ].step = this.destroyer.step;

    this.destroyer.wayX [ this.destroyer.wayLength ] = this.destroyer.x;
    this.destroyer.wayY [ this.destroyer.wayLength ] = this.destroyer.y;
    this.destroyer.wayLength = this.destroyer.wayLength + 1;
};



Maze.prototype.destroyWall = function ( x, y, direct ){
    switch ( direct ){
        //Лабиринт цикличный, т.е. после x == width - 1 идет x == 0
        case this.DIRECT.RIGHT:
            this.terrainMatrix[ ( x + 1 ) % this.width ][ y ].left_wall = false;
            break;
        case this.DIRECT.DOWN:
            this.terrainMatrix[ x ][ ( y + 1 ) % this.height ].up_wall = false;
            break;
        case this.DIRECT.LEFT:
            this.terrainMatrix[ x ][ y ].left_wall = false;
            break;
        case this.DIRECT.UP:
            this.terrainMatrix[ x ][ y ].up_wall = false;
            break;
        default :
            console.log("ERROR");
            break;
    }
};



//Возвращает 0 если все клетки НЕпроходимы
Maze.prototype.randomPassableDirect = function( x , y ){
    var PassableDirects = [];
    var numOfPassableDirects = 0;
    for(var direct = this.DIRECT.FIRST; direct <= this.DIRECT.LAST; direct++){
        if(this.canGo( x , y, direct)){
            PassableDirects[ numOfPassableDirects ] = direct;
            numOfPassableDirects++;
        }
    }
    if( 0 == numOfPassableDirects ) return 0;

    //Рандомное число от 0 до numOfPassableDirects ( >>0 отбрасывает дробную часть )
    var randomIndex = Math.random()*numOfPassableDirects>>0;
    return PassableDirects [ randomIndex ];
};



Maze.prototype.randomPassableDestroyDirect = function( x , y ){
    var PassableDirects = [];
    var numOfPassableDirects = 0;
    for(var direct = this.DIRECT.FIRST; direct <= this.DIRECT.LAST; direct++){
        if(this.canDestroy( x , y, direct)){
            PassableDirects[ numOfPassableDirects ] = direct;
            numOfPassableDirects++;
        }
    }
    if( 0 == numOfPassableDirects ) return -1;

    //Рандомное число от 0 до numOfPassableDirects ( >>0 отбрасывает дробную часть )
    var randomIndex = Math.random()*numOfPassableDirects>>0;
    return PassableDirects [ randomIndex ];
};



Maze.prototype.canGo = function( x, y, direct ){
    switch ( direct ){
        case this.DIRECT.RIGHT:
            return !this.terrainMatrix[ ( x + 1 ) % this.width ][ y ].left_wall;
            break;
        case this.DIRECT.DOWN:
            return !this.terrainMatrix[ x ][ ( y + 1 ) % this.height ].up_wall;
            break;
        case this.DIRECT.LEFT:
            return !this.terrainMatrix[ x ][ y ].left_wall;
            break;
        case this.DIRECT.UP:
            return !this.terrainMatrix[ x ][ y ].up_wall;
            break;
        default :
            alert(direct);
            console.log("ERROR");
            break;
    }
};

Maze.prototype.getIndexOfTile = function( x , y ){
			var index = 0;
			for ( var direct = this.DIRECT.FIRST; direct <= this.DIRECT.LAST; direct++ ){
				if(this.canGo( x , y , direct )){
					index += 1<<direct;	
				}
			}
			return index;
		};



Maze.prototype.canDestroy = function( x, y, direct ){
    var normalX = this.normalizeX( x + this.DIRECT.x[ direct ] );
    var normalY = this.normalizeY( y + this.DIRECT.y[ direct ] );

    return (this.terrainMatrix[ normalX ][ normalY ].step == 0);
};



Maze.prototype.normalizeX = function ( x ){
    return ( ( x % this.width ) + this.width ) % this.width;
};



Maze.prototype.normalizeY = function ( y ){
    return ( ( y % this.height ) + this.height ) % this.height;
};



Maze.prototype.createImageOfMaze = function(canvas){
   this.drawBackground( canvas ); 
   var ctx = canvas.getContext("2d");
   for ( var x = 0; x < this.width; x++ ) {
		for ( var y = 0; y < this.height; y++ ) {
            var kk = 1;
			var positionOnSprite = this.getIndexOfTile( x , y ) * this.tiles.width;
			ctx.drawImage(
                this.fullSprite ,
                positionOnSprite , 0 , this.tiles.width , this.tiles.width ,
                x * this.tiles.width , y * this.tiles.width, this.tiles.width , this.tiles.width  );
		}
   }
    


}

Maze.prototype.drawBackground = function(canvas){
	var ctx = canvas.getContext("2d");
    ctx.fillStyle = "#bbada0";
    ctx.fillRect( 0, 0 , this.width*this.tiles.width , this.height*this.tiles.width);
}

Maze.prototype.draw = function ( canvas ){
	var ctx = canvas.getContext("2d");
	ctx.drawImage( this.canvas , 0 , 0 , this.width*this.tiles.width , this.height*this.tiles.width , 0 , 0 , this.playgroundWidth , this.playgroundHeight );
}

/*Maze.prototype.draw = function( canvas ){
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "#bbada0";
    ctx.fillRect( 0, 0 , this.playgroundWidth , this.playgroundHeight);



    for(var x = 1; x < this.width + 1; x++){
        for(var y = 1; y < this.height + 1; y++){
            var xCords = this.wallWidth * ( x ) + this.cageWidth * ( x - 1 );
            var yCords = this.wallWidth * ( y ) + this.cageWidth * ( y - 1 );
            ctx.fillStyle = "#eee4da";
            ctx.fillRect( xCords, yCords , this.cageWidth , this.cageWidth);

            for (var direct = this.DIRECT.FIRST; direct <= this.DIRECT.LAST; direct++){
                if(this.canGo(x , y , direct)){
                    ctx.fillRect( xCords + this.wallWidth * this.DIRECT.x[direct] , yCords + this.wallWidth * this.DIRECT.y[direct] , this.cageWidth , this.cageWidth );
                }
            }
        }
    }

};
*/
/*
Maze.prototype.draw = function( canvas ){
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "#bbada0";
    ctx.fillRect( 0, 0 , this.playgroundWidth , this.playgroundHeight);



    for(var x = 0; x < this.width; x++){
        for(var y = 0; y < this.height; y++){
            var xCords = this.wallWidth * ( x + 1 ) + this.cageWidth * x;
            var yCords = this.wallWidth * ( y + 1 ) + this.cageWidth * y;
            ctx.fillStyle = "rgb(238, 228, 218)";
            ctx.fillRect( xCords, yCords , this.cageWidth , this.cageWidth);

            for (var direct = this.DIRECT.FIRST; direct <= this.DIRECT.LAST; direct++){
                if(this.canGo(x , y , direct)){
                    ctx.fillRect( xCords + this.wallWidth * this.DIRECT.x[direct] , yCords + this.wallWidth * this.DIRECT.y[direct] , this.cageWidth , this.cageWidth );
                }
            }
        }
    }

};
*/