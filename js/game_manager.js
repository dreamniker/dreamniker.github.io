/**
 * Created by Никита on 26.07.2014.
 */

var canvas = document.getElementById("myCanvas");
var mazeCanvas = document.getElementById("mazeCanvas");
var person;
var maze;
var playgroundWidth = 500;

assets = new Assets();
window.onload = function(){
	maze=new Maze( playgroundWidth , playgroundWidth , mazeCanvas ,assets);
	
	var wh = 6;
	
	
	maze.generate(wh,wh,0,0);
	
	
	
	person = new Person(maze , 1  , 1 , assets);
	person.locate();
	
	var lastFrameTime = (new Date()).getTime();
	function loop(){
		var deltaTime = (new Date()).getTime() - lastFrameTime ;
		lastFrameTime = (new Date()).getTime();
	
		person.update(deltaTime);
	
		maze.drawBackground(canvas);
		person.draw(canvas);
        maze.draw(canvas);
	
	
		setTimeout(loop,10);
	}
	loop();
};