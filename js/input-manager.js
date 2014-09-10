KEY={L:37,T:38,R:39,D:40,TW:87,RD:68,DS:83,LA:65};
start={
	x:0,
	y:0	
};
now={
	x:0,
	y:0	
};


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


ld={
	x:0,
	y:0,
	flag:false,
	set:function(x,y){
		if(this.x!=x||this.y!=y){
			this.x=x;this.y=y;
			this.flag=true;	
		}else this.flag=false;
	}
};
document.onkeydown = function(e){
	//maze.createImageOfMaze( mazeCanvas );
	switch(e.keyCode){
	case KEY.L:person.goInDirect(DIRECT.LEFT);break;
	case KEY.T:person.goInDirect(DIRECT.UP);break;
	case KEY.R:person.goInDirect(DIRECT.RIGHT);break;
	case KEY.D:person.goInDirect(DIRECT.DOWN);break;
	}
	

	/*switch(e.keyCode){
	case KEY.LA:monstr.goInDirect(-1,0);break;
	case KEY.TW:monstr.goInDirect(0,-1);break;
	case KEY.RD:monstr.goInDirect(1,0);break;
	case KEY.DS:monstr.goInDirect(0,1);break;
	}
	switch(e.keyCode){
	case KEY.L:monstr.goInDirect(-1,0);break;
	case KEY.T:monstr.goInDirect(0,-1);break;
	case KEY.R:monstr.goInDirect(1,0);break;
	case KEY.D:monstr.goInDirect(0,1);break;
	}*/
};

document.addEventListener('touchstart', function(event) {
	
	person.goInDirect(DIRECT.LEFT);
    person.goInDirect(DIRECT.UP);
    person.goInDirect(DIRECT.RIGHT);
    person.goInDirect(DIRECT.DOWN);
    
	
	
  	start.x=event.targetTouches[0].pageX;
 	start.y=event.targetTouches[0].pageY;
	ld.set(0,0);
}, false);

document.addEventListener('touchmove', function(event) {
  now.x=event.targetTouches[0].pageX;
  now.y=event.targetTouches[0].pageY;
	del=50;
	if(now.x<start.x-del){
		ld.set(-1,0);
	}
	if(now.x>start.x+del){
		ld.set(1,0);
	}
	
	if(now.y<start.y-del){
		ld.set(0,-1);
	}
	
	if(now.y>start.y+del){
		ld.set(0,1);
	}
	if(ld.flag){
		person.goInDirect(ld.x,ld.y);
		start.x=now.x;
		start.y=now.y;
		ld.flag=false;
	}
}, false);
