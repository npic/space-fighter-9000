var gameOver,
    kbdState, KEYS,
    context,
    images,
    sounds,
    CANVAS_W, CANVAS_H,
    FPS,
    player,
    bullets,
    enemies, MAXENEMIES,
    stars, MAXSTARS;

function Ship(image, x, y)
{
    this.alive = true;
    this.image = image;
    this.SPRITE_W = this.image.width;
    this.SPRITE_H = this.image.height;
    this.x = x;
    this.y = y;
    this.angle = -Math.PI / 2;
    this.hp = 100;
    this.strength = 10;
    this.speed = 5;
    this.score = 0;
    this.SHOOTINTERVAL = FPS;
    this.shootCounter = 0;
    this.MOVEINTERVAL = FPS/2;
    this.moveCounter = 0;
    this.center = function()
                  {
                      var halfW = this.SPRITE_W / 2;
                      var halfH = this.SPRITE_H / 2;
                      return { x: this.x+halfW, y: this.y+halfH };
                  };
    this.shoot = function()
                 {
                     var sC = this.center();
                     var gunX = sC.x + (this.SPRITE_W / 2) * Math.cos(this.angle);
                     var gunY = sC.y + (this.SPRITE_H / 2) * Math.sin(this.angle);
                     bullets.push(new Bullet(gunX, gunY, this.angle, this.strength));
                     sounds.gun().play();
                 };
    this.lookAt = function(x, y)
                  {
                      var c = this.center();
                      this.angle = myAtan(c.x, c.y, x, y);
                  };
    this.move = function(direction)
                {
                    var c = this.center();
                    switch(direction)
                    {
                        case 'UP':
                            if (c.y-this.speed > 0)
                            {
                                this.y -= this.speed;
                            }
                            break;
                        case 'DOWN':
                            if (c.y+this.speed < CANVAS_H)
                            {
                                this.y += this.speed;
                            }
                            break;
                        case 'LEFT':
                            if (c.x-this.speed > 0)
                            {
                                this.x -= this.speed;
                            }
                            break;
                        case 'RIGHT':
                            if (c.x+this.speed < CANVAS_W)
                            {
                                this.x += this.speed;
                            }
                            break;
                    }
                };
    this.draw = function()
                {
                    var c = this.center();
                    context.save();
                    context.translate(c.x, c.y);
                    context.rotate(this.angle);
                    context.drawImage(this.image, this.x-c.x, this.y-c.y);
                    context.restore();
                };
    this.update = function()
                  {
                      var pC = player.center();
                      this.lookAt(pC.x, pC.y);
                      this.shootCounter++;
                      this.moveCounter++;
                      if (this.shootCounter == this.SHOOTINTERVAL)
                      {
                          this.shoot();
                          this.shootCounter = 0;
                      }
                      if (this.moveCounter == this.MOVEINTERVAL)
                      {
                          if (this.x < player.x)
                          {
                              this.move('RIGHT');
                          }
                          if (this.x > player.x)
                          {
                              this.move('LEFT');
                          }
                          if (this.y < player.y)
                          {
                              this.move('DOWN');
                          }
                          if (this.y > player.y)
                          {
                              this.move('UP');
                          }
                          this.moveCounter = 0;
                      }
                  };
}

function Bullet(x, y, angle, strength)
{
    this.alive = true;
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.strength = strength;
    this.speed = 10;
    this.checkCollision = function(ship)
                          {
                              var c = ship.center();
                              return ((Math.abs(this.x-c.x) < ship.SPRITE_W/2) && (Math.abs(this.y-c.y) < ship.SPRITE_H/2));
                          };
    this.draw = function()
                {
                    context.save();
                    context.translate(this.x, this.y);
                    context.beginPath();
                    context.arc(0, 0, 2, 0, 2 * Math.PI, false);
                    context.fillStyle = "#FFFF00";
                    context.fill();
                    context.restore();
                }
    this.update = function()
                  {
                      var dx = this.speed * Math.cos(this.angle);
                      var dy = this.speed * Math.sin(this.angle);
                      this.x += dx;
                      this.y += dy;
                      if ((this.x < 0) || (this.x > CANVAS_W) || (this.y < 0) || (this.y > CANVAS_H))
                      {
                          this.alive = false;
                      }
                      if (this.checkCollision(player))
                      {
                          player.hp -= this.strength;
                          if (player.hp <= 0)
                          {
                              player.alive = false;
                              sounds.death().play();
                          }
                          this.alive = false;
                          sounds.hit().play();
                      }
                      for (var i = 0; i < enemies.length; i++)
                      {
                          if (this.checkCollision(enemies[i]))
                          {
                              enemies[i].hp -= this.strength;
                              if (enemies[i].hp <= 0)
                              {
                                  enemies[i].alive = false;
                                  sounds.death().play();
                              }
                              this.alive = false;
                              sounds.hit().play();
                              break;
                          }
                      }
                  }
}

function Star()
{
    this.x = Math.floor(Math.random() * CANVAS_W);
    this.y = Math.floor(Math.random() * CANVAS_H);
    this.radius = Math.floor(Math.random() * 3) + 1;
    this.color = '#'+('000000'+(Math.random()*0xFFFFFF<<0).toString(16)).slice(-6);
    this.draw = function()
                {
                    context.save();
                    context.translate(this.x, this.y);
                    context.beginPath();
                    context.arc(0, 0, this.radius, 0, 2 * Math.PI, false);
                    context.fillStyle = this.color;
                    context.fill();
                    context.restore();
                };
}

function update()
{
    if(gameOver)
    {
        return;
    }
    for (var i = bullets.length-1; i >= 0; i--)
    {
        if (bullets[i].alive)
        {
            bullets[i].update();
        }
        else
        {
            bullets.splice(i, 1);
        }
    }
    player.update();
    for (var i = enemies.length-1; i >= 0; i--)
    {
        if (enemies[i].alive)
        {
            enemies[i].update();
        }
        else
        {
            enemies.splice(i, 1);
            player.score++;
        }
    }
    if (enemies.length < MAXENEMIES)
    {
        var newX = Math.floor(Math.random() * CANVAS_W);
        var newY = Math.floor(Math.random() * CANVAS_H);
        enemies.push(new Ship(images.enemy, newX, newY));
    }
    if (!player.alive)
    {
        gameOver = true;
    }
}

function draw()
{
    if (gameOver)
    {
        context.fillStyle = "#FF0000";
        context.textAlign = "center";
        context.font = "20pt Arial";
        context.fillText("You die... Score: " + player.score, CANVAS_W/2, CANVAS_H/2, CANVAS_W);
        return;
    }
    context.fillStyle = "#000000";
    context.fillRect(0, 0, CANVAS_W, CANVAS_H);
    for (var i = 0; i < stars.length; i++)
    {
        stars[i].draw();
    }
    for (var i = 0; i < bullets.length; i++)
    {
        bullets[i].draw();
    }
    player.draw();
    for (var i = 0; i < enemies.length; i++)
    {
        enemies[i].draw();
    }
}

function getMousePos(canvas, evt)
{
    var rect = canvas.getBoundingClientRect();
    var mouseX = evt.clientX - rect.left;
    var mouseY = evt.clientY - rect.top;
    return { x: mouseX, y: mouseY };
}

function mouseMoveHandler(evt)
{
    if (gameOver)
    {
        return;
    }
    var mP = getMousePos(evt.target, evt);
    player.lookAt(mP.x, mP.y);
}

function mouseClickHandler(evt)
{
    if (gameOver)
    {
        return;
    }
    player.shoot();
}

function keyDownHandler(evt)
{
    if (gameOver)
    {
        return;
    }
    switch (evt.keyCode)
    {
        case KEYS.UP:
            kbdState.UP = true;
            break;
        case KEYS.DOWN:
            kbdState.DOWN = true;
            break;
        case KEYS.LEFT:
            kbdState.LEFT = true;
            break;
        case KEYS.RIGHT:
            kbdState.RIGHT = true;
            break;
    }
}

function keyUpHandler(evt)
{
    if (gameOver)
    {
        return;
    }
    switch (evt.keyCode)
    {
        case KEYS.UP:
            kbdState.UP = false;
            break;
        case KEYS.DOWN:
            kbdState.DOWN = false;
            break;
        case KEYS.LEFT:
            kbdState.LEFT = false;
            break;
        case KEYS.RIGHT:
            kbdState.RIGHT = false;
            break;
    }
}

function myAtan(x1, y1, x2, y2)
{
    var cathY = y2 - y1;
    var cathX = x2 - x1;
    var result = Math.atan(cathY/cathX);
    if (x1 > x2)
    {
        result += Math.PI;
    }
    return result;
}

function main()
{
    gameOver = false;
    canvas = document.getElementById("scene");
    CANVAS_W = canvas.width;
    CANVAS_H = canvas.height;
    context = canvas.getContext("2d");
    FPS = 30;

    player = new Ship(images.player, CANVAS_W/2, CANVAS_H);
    player.x -= player.SPRITE_W/2;
    player.y -= player.SPRITE_H;
    player.update = function()
                    {
                        if (kbdState.UP)
                        {
                            player.move('UP');
                        }
                        if (kbdState.DOWN)
                        {
                            player.move('DOWN');
                        }
                        if (kbdState.LEFT)
                        {
                            player.move('LEFT');
                        }
                        if (kbdState.RIGHT)
                        {
                            player.move('RIGHT');
                        }
                    };

    bullets = new Array();
    enemies = new Array();
    MAXENEMIES = 3;

    stars = new Array();
    MAXSTARS = 50;
    for (var i = 0; i < MAXSTARS; i++)
    {
        stars.push(new Star());
    }

    kbdState = { UP: false, DOWN: false, LEFT: false, RIGHT: false };
    KEYS = { UP: 87, DOWN: 83, LEFT: 65, RIGHT: 68 };

    canvas.addEventListener('mousemove', mouseMoveHandler, true);
    canvas.addEventListener('click', mouseClickHandler, true);
    window.addEventListener('keydown', keyDownHandler, true);
    window.addEventListener('keyup', keyUpHandler, true);

    setInterval(function() { update(); draw(); }, 1000/FPS);
}

function preload()
{
    var resToGo = 5;
    var callback = function()
                   {
                       resToGo--;
                       if (resToGo == 0)
                       {
                           main();
                       }
                   };

    sounds = {};
    sounds.gun = function()
                 {
                     return (new Audio("gun.wav"));
                 };
    sounds.hit = function()
                 {
                     return (new Audio("hit.wav"));
                 };
    sounds.death = function()
                   {
                       return (new Audio("death.wav"));
                   };
    sounds.gun().oncanplaythrough = callback;
    sounds.hit().oncanplaythrough = callback;
    sounds.death().oncanplaythrough = callback;

    images = {};
    images.player = new Image();
    images.player.onload = callback;
    images.player.src = "player.png";
    images.enemy = new Image();
    images.enemy.onload = callback;
    images.enemy.src = "enemy.png";
}

window.onload = preload;

