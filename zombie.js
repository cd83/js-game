#!/usr/bin/env node

  'use strict';
  
  //Requires
  var keypress = require('keypress')
    , c = require('axel')
    , int = parseInt
    , sin = Math.sin
    // , cos = Math.cos
    // , floor = Math.floor
    // , ceil = Math.ceil
    // , pow = Math.pow
    , score = 0
    , kills = 0
    , bullets = []
    , maxBullets = 20
    , bulletSpeed = 0.425
    , width = c.cols
    , height = c.rows
    , p1x = c.cols/2
    , p1y = c.rows-2
    , lp1x = p1x
    , lp1y = p1y
    , gameLoop
    , interval = 20
    , tick =0
    , enemies = []
    , maxEnemies = 20
    , enemySpeed = 0.025
    , enemyMinY = 0;

    // var theBrush = '█';
  var theBrush = ' ';
  
  function genEnemies(){
      if (enemies.length>=maxEnemies){
        return;
      }

      for (var ii=0; ii<getRandom(1,2); ii++)
        enemies.push({
          x: int(getRandomFixedX()),
          y: int(getRandomFixedY())
      });
  } 

  function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  function getRandomFixedY() {
      var fixed = [8,0,-12,-8,-16,-32,8,-8,-8,-32,8];
      var i = parseInt(Math.random()*(fixed.length-1));
      return fixed[i];
  }

  function getRandomFixedX() {
      var fixed = [5,10,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,100,110,115,100,100,115];
      var i = parseInt(Math.random()*(fixed.length-1));
      return fixed[i];
  }

  function shoot(){
    var newBullet = {
      x: p1x+5,
      y: p1y-3, 
      speed: bulletSpeed
    };

    bullets.push(newBullet);

    if(bullets.length>maxBullets){
      bullets.shift();
    }
  }

  function enemyOffScreen(){
    enemies.forEach(function(enemy,i){
       if (enemyMinY < int(enemy.y)) {
            enemyMinY = int(enemy.y)
            updateScore(0);
        }
      if (enemy.y >= (p1y + 5)) {
          // kill the enemy when off the screen
          enemies.splice(i,1);

          if (enemies.length <= 0) {
            enemyMinY = 0;
            genEnemies();
          }
      }
    })
  }

  function enemyWave(){
    //if (enemyMinY == 6 || enemyMinY == 12  || enemyMinY == 18 || enemyMinY == 24 || enemyMinY == 30 || enemyMinY == 36 || enemyMinY == 42) {
      genEnemies();
    //}
  }


  function updateBullets(){
    bullets.forEach(function(bullet){
    
      // Set last positions
      bullet.lx = bullet.x;
      bullet.ly = bullet.y;
      
      // Move and accelarate
      bullet.y-=bullet.speed;
      bullet.speed+=bullet.speed*0.025;
    
      if( int(bullet.x)!==int(bullet.lx) ||
          int(bullet.y)!==int(bullet.ly))
        {
          // Draw off
          c.cursor.reset();
          c.brush = ' ';
          c.point(bullet.lx, bullet.ly);

          // Draw on
          c.brush = theBrush;
          c.bg(255,225,255);
          c.point(bullet.x, bullet.y);
      }

      function destroyBullet(){
        c.cursor.reset();
        c.brush = ' ';
        c.point(bullet.x, bullet.y);
        bullets.shift();
        return;
      }

      enemies.forEach(function(enemy,i){
        var D = c.dist(enemy.x, enemy.y, bullet.x, bullet.y);
        if(D<5){
          genExplosion(enemy.x,enemy.y);
          destroyBullet();
          enemyMinY = 0 ;  // reset this every kill
          enemies.splice(i,1);
          kills ++;
          if (enemies.length <= 0) {
            enemyMinY = 0;
            genEnemies();
          }
          updateScore(12.34*bullet.speed);
        }
      });

      if(bullet.y<0){
        destroyBullet();
      }
      
    })
  }

  var explosions = [];
  function genExplosion(x,y){
    explosions.push({
      x:x,
      y:y,
      size:0,
      lsize:0,
      rate: 1,
      max: 5
    });
  }
  function updateExplosions(){
    explosions.forEach(function(exp){
      exp.lsize = exp.size;
      
      c.cursor.reset();
      c.brush = ' ';
      c.circ(exp.x, exp.y, exp.lsize);

      c.bg(getRandom(153,255),0,0);  //RED
      // c.bg(getRandom(0,255),getRandom(0,255),getRandom(0,255));  // random
      c.brush = theBrush;
      c.circ(exp.x, exp.y, exp.size);

      exp.size+=exp.rate;
      if(exp.size>exp.max){
        c.cursor.reset();
        c.circ(exp.x, exp.y, exp.lsize);
        explosions.shift();
      }
    });
  }

  function updateEnemies(){
    enemies.forEach(function(enemy){
      enemy.ly = enemy.y;
      enemy.lx = enemy.x;
      enemy.y+=enemySpeed;
      enemy.x=enemy.x+(sin(tick/10)/1.5);
     
      // Only draw enemies again if they have moved
      if(int(enemy.y)!==int(enemy.ly) ||
          int(enemy.x)!==int(enemy.lx)) 
        {
          c.cursor.reset();
          c.brush = ' ';
          drawEnemy(int(enemy.lx), int(enemy.ly));

         c.bg(51,103,0); //green
         //c.bg(255,0,0); //RED

         //c.bg(getRandom(0,255),getRandom(0,255),getRandom(0,255));

          c.brush = theBrush;
          drawEnemy(int(enemy.x), int(enemy.y));  
      }
    });
  }

  function updateScore(add){
    score+=add;
    c.cursor.reset();
    c.fg(255,255,255);
    c.text(0, c.rows, "Score: "+ int(score) + '  Kills: '+ int(kills) + '  C.Cols: ' + c.cols);
  }

  function drawPlayer(x, y){
    var y2 = y-1;  // shift toon up
    c.brush = theBrush;
 
    c.bg(0,0,255);
    c.line(x-1, y2-2, x+2, y2-2);  // head
    c.line(x+0, y2-1, x+0, y2-1); // throat
    c.line(x+3, y2-1, x+4, y2-1); // right arm
    c.line(x+4, y2-2, x+4, y2-2); // gun
    c.line(x+2, y2, x+3, y2+1);  // right body
    c.line(x-2, y2, x-3, y2-1);  // left arm
    c.line(x-1, y2, x+1, y2);  // body middle
    c.line(x-1, y2, x-1, y2+2); // left leg
    c.line(x-2, y2+2, x-2, y2+2); // left foot
    c.line(x+1, y2, x+1, y2+2); // right leg
    c.line(x+2, y2+2, x+2, y2+2); // right foot 
  }

  function erasePlayer(x, y){
    var y2 = y-1;  // shift toon up
    c.brush = ' ';
    c.cursor.reset();

    c.line(x-1, y2-2, x+2, y2-2);  // head
    c.line(x+0, y2-1, x+0, y2-1); // throat
    c.line(x+3, y2-1, x+4, y2-1); // right arm
    c.line(x+4, y2-2, x+4, y2-2); // gun
    c.line(x+2, y2, x+3, y2+1);  // right body
    c.line(x-2, y2, x-3, y2-1);  // left arm
    c.line(x-1, y2, x+1, y2);  // body middle
    c.line(x-1, y2, x-1, y2+2); // left leg
    c.line(x-2, y2+2, x-2, y2+2); // left foot
    c.line(x+1, y2, x+1, y2+2); // right leg
    c.line(x+2, y2+2, x+2, y2+2); // right foot  
  }

  function drawEnemy(x,y){
    c.line(x-1, y-2, x+2, y-2);  // head
    c.line(x+0, y-1, x+0, y-1); // throat
    c.line(x+3, y-1, x+4, y-1); // right arm
    c.line(x+2, y, x+3, y+1);  // right body
    c.line(x-2, y, x-3, y-1);  // left arm
    c.line(x-1, y, x+1, y);  // body middle
    c.line(x-1, y, x-1, y+2); // left leg
    c.line(x-2, y+2, x-2, y+2); // left foot
    c.line(x+1, y, x+1, y+2); // right leg
    c.line(x+2, y+2, x+2, y+2); // right foot
  }


  function eachLoop(){
    tick+=1;

    width = c.cols;
    height = c.rows;
  
    updateBullets();
    updateEnemies();
    updateExplosions();
    checkKeyDown();
    enemyOffScreen();
    enemyWave();

    erasePlayer(lp1x,lp1y);
    drawPlayer(p1x,p1y);
  }

  
  function endGame(){
    process.stdin.pause();
    clearInterval(gameLoop);
    c.cursor.on();
    c.cursor.restore();
    console.log('Game Ended.');
  }


  function start(){
    c.cursor.off();
    c.clear();
    gameLoop = setInterval(eachLoop, interval);
    process.stdin.setRawMode(true);
    keypress(process.stdin);
    process.stdin.resume();
  }


  start();

  function left(){
    lp1x = p1x;
    p1x-=p1x>4?1:0;
  }
  function right(){
    lp1x = p1x;
    p1x+=p1x<width-4?1:0;
  }


  //// KEYBOARD EVENTS ///////////////////////////////////////////////////////
  var keyDown = null;
  var lastChecked = now();
  var releaseTime = 25;

  function now(){
    return (+new Date());
  };


var dir;
  function checkKeyDown(){
    switch(dir){
    case 'left':
      left();
      break;
    case 'right':
      right();
      break;
    }

    lastChecked = now();
  }

process.stdin.on('keypress', function (ch, key) {
  
  if (key) {
    // if (key.name == 'escape') endGame();
    if (key.name == 'left') dir = 'left';
    if (key.name == 'right') dir = 'right';
    if (key.name == 'space') shoot();
    //if (key) shoot(); // kid friendly - everything shoots

    if (key && key.ctrl && key.name == 'c') {
      console.log('Ctrl+C pressed to exit the game.') 
      endGame();
    }
  }
});
