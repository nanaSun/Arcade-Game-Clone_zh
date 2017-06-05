/**
* @description enemy对象
* @constructor
* @param {int} line - enemy在哪一行中
* @param {int} speed - enemy的移动速度
* @param {int} delay - enemy延迟出现的时间
*/
var Enemy = function(line,speed,delay) {
    this.sprite = 'images/enemy-bug.png';
    this.line=line;
    this.speed=101*speed;//101是一块草坪的宽度
    this.delay=delay;
    this.init();

};
Enemy.prototype.init=function(){
    this.isstop=false;
    this.x= -101 - 404*this.delay;//初始X位置
    this.y= 60 + 83 * this.line;//初始Y位置
};
//开始移动
Enemy.prototype.start=function(){
    this.isstop=false;
};
//enemy停止移动
Enemy.prototype.stop=function(){
    this.isstop=true;
};
Enemy.prototype.update = function(dt) {
    if(this.isstop) return ;//如果isstop为true，停止更新
    if(this.x>=505){ this.x=-101;}//如果离开屏幕，从初始位置再开始
    this.x +=dt*this.speed; //移动距离
    this.render();
};
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};
//获取enemy的中心点
Enemy.prototype.getRange=function(){
    return {x:(this.x+2+this.x+98)/2,y:this.y};
};

/**
* @description player
* @param {array} playerImages - 玩家图片
* @constructor
*/
var playerClass = function(playerImages) {
    this.playerImages=playerImages;
    this.playerImagesLen=playerImages.length-1;
    this.sprite = 0;
    this.minX=0;
    this.maxX=404;
    this.minY=-10;
    this.maxY=405;
    //player的每次水平移动都等于草坪的宽度
    this.speedX=101;
    //player的每次垂直移动都等于草坪的高度
    this.speedY=83;
    this.isChoosedPlayer=false;
    this.init();
};
playerClass.prototype.choosePlayer=function(sprite){
    ctx.fillStyle="white";
    ctx.font="18px sans-serif";
    ctx.textAlign="center";
    ctx.fillText("左右键选择人物",250,420);
    ctx.fillStyle="white";
    ctx.font="18px sans-serif";
    ctx.textAlign="center";
    ctx.fillText("回车键开始",250,450);
};
//更换人物
playerClass.prototype.changePlayer=function(sprite){
     this.sprite = sprite;
};

playerClass.prototype.init=function(){
    this.x=202;
    this.y=405;
    this.isstop=true;
};

playerClass.prototype.start=function(){
    this.isstop=false;
};
playerClass.prototype.stop=function(){
    this.isstop=true;
};

//获取player的中心点
playerClass.prototype.getRange=function(){
    return {x:(this.x+28+this.x+94)/2,y:this.y};
};
playerClass.prototype.update = function() {
    if(this.isstop) {
        return ;
    }
    // 防止player超出屏幕
    this.x=this.x>=this.maxX?this.maxX:(this.x<=this.minX?this.minX:this.x);
    this.y=this.y>=this.maxY?this.maxY:(this.y<=this.minY?this.minY:this.y);
    this.render();
};
playerClass.prototype.render = function() {
    ctx.drawImage(Resources.get(this.playerImages[this.sprite]), this.x, this.y);
    if(!this.isChoosedPlayer){
        this.choosePlayer();
    }
};
//键盘控制player
playerClass.prototype.handleInput = function(code) {
    if(!this.isChoosedPlayer){
        switch(code) {
            case "left":
                this.sprite++;
                if(this.sprite>this.playerImagesLen) this.sprite=0;
                break;
            case "right":
                this.sprite--;
                if(this.sprite<0) this.sprite=this.playerImagesLen;
                break;
            case "enter":
                this.isChoosedPlayer=true;
                this.start();
                break;
        } 
    }else{
        if(this.isstop) return ;
        switch(code) {
            case "left":
                this.x -=this.speedX;
                break;
            case "up":
                this.y -=this.speedY;
                break;
            case "right":
                this.x +=this.speedX;
                break;
            case "down":
                this.y +=this.speedY;
                break;
        } 
    }
};

/**
* @description 成功和失败的类
* @constructor
*/
function stageClear(txt){
    this.txt=txt;
    this.init();
}
stageClear.prototype.start=function(){
    this.isstart=true;
};
stageClear.prototype.init = function() {
    this.isstart=false;
    this.x=-300;
    this.y=-300;
};
stageClear.prototype.update = function() {
    if(this.isstart){
        this.x=250;
        this.y=300;
        this.render();
    } 
};
stageClear.prototype.render = function() {   
    ctx.fillStyle="blue";
    ctx.font="60px sans-serif";
    ctx.fontWight="border";
    ctx.textAlign="center";
    ctx.fillText(this.txt,this.x,this.y);
    ctx.font="30px sans-serif";
    ctx.fillText("按下enter，重新开始!",this.x,this.y+70);

};
stageClear.prototype.handleInput = function(code,callback) {
    if(!this.isstart) return;
    switch(code) {
        case "enter":
            callback();
            break;
    }
};
//设置三行敌人
var enemiesNum=3;
var playerImages=[     
    'images/char-boy.png',
    'images/char-cat-girl.png',
    'images/char-horn-girl.png',
    'images/char-pink-girl.png',
    'images/char-princess-girl.png'
];
var allEnemies =[];
for (var i = 0; i <3; i++) {
    var randomNum=Math.random();
    //每一行有两个敌人，且速度相同
    allEnemies.push(new Enemy(i,2+randomNum*2,0),new Enemy(i,1+randomNum*2,1));
}
var player=new playerClass(playerImages);

var successClear=new stageClear("~~~~CLEAR~~~~");
var failClear=new stageClear("~~~~FAIL~~~~");
var cap=70;

// 检查用户是否和敌人相撞
function checkCollisions(){
    var tmpp=player.getRange();
    //当tmpp.y 等于-10，也就是小河的位置， 游戏胜利，并且停止所有在移动的对象. 
    if(tmpp.y==-10){
        gameStop();
        successClear.start();
        return;
    }
    var res=false;
    res=allEnemies.some(function(e){
        var tmpe=e.getRange();
        return (tmpp.y-tmpe.y===13&&Math.abs(tmpp.x-tmpe.x)<cap);
    });
    //如果res是true，也就是游戏结束，一切从头开始
    if(res){
        gameStop();
        failClear.start();
    }
}

//一切重新开始
function gameInit(){
    allEnemies.forEach(function(e){
        e.stop();
        e.init();
    });
    player.stop();
    player.init();
    player.start();
    successClear.init();
    failClear.init();
}
//一切都停止
function gameStop(){
    allEnemies.forEach(function(e){
        e.stop();
    });
    player.stop();
}
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        13: 'enter'
    };
    player.handleInput(allowedKeys[e.keyCode]);
    var sallowedKeys = {
        13: 'enter'// 按下回车键，重新开始
    };
    successClear.handleInput(sallowedKeys[e.keyCode],function(){
        gameInit();
    });
    failClear.handleInput(sallowedKeys[e.keyCode],function(){
        gameInit();
    });
});
