var GameOfCastles = GameOfCastles || {};

GameOfCastles.GameState = {
  //initiate game settings
  init: function(currentLevel) {
    //use all the area, don't distort scale
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    
    //initiate physics system
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
      
    // Define constants
    this.PLAYER_SPEED = 200;
    this.BULLET_SPEED = -1000;
    this.SHOT_DELAY = 300; // milliseconds (10 bullets/3 seconds)
    this.ARROW_SPEED = 1100; // pixels/second
    this.NUMBER_OF_BULLETS = 20;
    this.GRAVITY = 980; // pixels/second/second
      
    //level data
    this.numLevels = 3;
    this.currentLevel = currentLevel ? currentLevel : 1;
    console.log('current level:' + this.currentLevel);
  },
    
  //load the game assets before the game starts
  preload: function() {
    this.game.load.image('background', 'assets/images/background1.jpeg');
    this.load.image('player', 'assets/images/player.png');    
    this.load.image('bullet', 'assets/images/bullet.png');    
    this.load.image('enemyParticle', 'assets/images/enemyParticle.png');
    this.game.load.image('bow', '/assets/images/bow.png');
    this.game.load.image('arrow', '/assets/images/arrow.png');
    this.game.load.image('castle', '/assets/images/castle3.png');
    this.game.load.image('enemy', '/assets/images/guard.png');
    this.game.load.spritesheet('explosion', '/assets/images/explosion.png', 128, 128);
      
    this.load.spritesheet('yellowEnemy', 'assets/images/yellow_enemy.png', 50, 46, 3, 1, 1); 
    this.load.spritesheet('redEnemy', 'assets/images/red_enemy.png', 50, 46, 3, 1, 1);   
    this.load.spritesheet('greenEnemy', 'assets/images/green_enemy.png', 50, 46, 3, 1, 1);  
      
    //load level data
    this.load.text('level1', 'assets/data/level1.json');
    this.load.text('level2', 'assets/data/level2.json');
    this.load.text('level3', 'assets/data/level3.json');
      
    this.load.audio('orchestra', ['assets/audio/8bit-orchestra.mp3', 'assets/audio/8bit-orchestra.ogg']);
  },
    
  //executed after everything is loaded
  create: function() {
    // Set stage background color
    this.game.stage.backgroundColor = 0x4488cc;
    //create a sprite for the background
    this.background = this.game.add.sprite(0, 0, 'background');
    this.background.width = this.game.width;
    this.background.height = this.game.height;
      
    //player
    this.player = this.add.sprite(this.game.world.centerX, this.game.world.height - 50, 'player');
    this.player.anchor.setTo(0.5);
    this.game.physics.arcade.enable(this.player);
    this.player.body.collideWorldBounds = true;
      
    //initiate player bullets and player shooting
    this.initBullets();
    this.shootingTimer = this.game.time.events.loop(Phaser.Timer.SECOND/5, this.createPlayerBullet, this);
      
    // Create an object representing our bow
    this.bow = this.game.add.sprite(75, this.game.height - 120, 'bow');
    this.bow.scale.setTo(0.4, 0.4);
    // Set the pivot point to the center of the gun
    this.bow.anchor.setTo(0.5, 0.5);
    this.game.physics.enable(this.bow, Phaser.Physics.ARCADE);
    this.bow.body.allowGravity = false;
    //this.bow.body.immovable = true;
      
    // Create an object pool of bullets
    this.arrowPool = this.game.add.group();
    for(var i = 0; i < this.NUMBER_OF_BULLETS; i++) {
        // Create each bullet and add it to the group.
        var bullet = this.game.add.sprite(0, 0, 'arrow');
        bullet.scale.setTo(0.2, 0.2);
        this.arrowPool.add(bullet);

        // Set its pivot point to the center of the bullet
        bullet.anchor.setTo(0.5, 0.5);

        // Enable physics on the bullet
        this.game.physics.enable(bullet, Phaser.Physics.ARCADE);

        // Set its initial state to "dead".
        bullet.kill();
    }
      
    //create a sprite for the castle
    this.castle = this.game.add.sprite(this.game.width-20, this.game.height-250, 'castle');
    this.castle.anchor.setTo(1, 1);
    this.game.physics.enable(this.castle, Phaser.Physics.ARCADE);
    this.castle.body.allowGravity = false;
    this.castle.body.immovable = true;
      
    //initiate the enemies
    this.initEnemies();
      
    //create a pool of enemies
//    this.enemy = this.game.add.sprite(this.game.width-250, this.game.height-120, 'enemy');
//    this.enemy.anchor.setTo(0, 1);
//    this.enemy.scale.setTo(-0.1, 0.1);
//    this.game.physics.enable(this.enemy, Phaser.Physics.ARCADE);
//    this.enemy.body.allowGravity = false;
//    this.enemy.body.immovable = true; 
      
    // Create an object pool of bullets
    this.enemyPool = this.game.add.group();
    for(var i = 0; i < this.NUMBER_OF_BULLETS; i++) {
        // Create each enemy and add it to the group.
        var enemy = this.game.add.sprite(this.game.width, this.game.height-120, 'enemy');
        enemy.scale.setTo(-0.1, 0.1);
        this.enemyPool.add(enemy);

        // Set its pivot point to the center of the bullet
        enemy.anchor.setTo(0.5, 0.5);

        // Enable physics on the bullet
        this.game.physics.enable(enemy, Phaser.Physics.ARCADE);
        enemy.body.allowGravity = false;
        enemy.body.immovable = true; 
        enemy.body.velocity.x = -100;

        // Set its initial state to "dead".
        //enemy.kill();
    }
    
    // Turn on gravity
    this.game.physics.arcade.gravity.y = this.GRAVITY;

    // Create a group for explosions
    this.explosionGroup = this.game.add.group();

    // Simulate a pointer click/tap input at the center of the stage
    // when the example begins running.
    this.game.input.activePointer.x = this.game.width/2;
    this.game.input.activePointer.y = this.game.height/2 - 100;
      
    this.orchestra = this.add.audio('orchestra');
    this.orchestra.play();
  },
    
  update: function() {
    this.game.physics.arcade.overlap(this.playerBullets, this.enemies, this.damageEnemy, null, this);
    
    this.game.physics.arcade.overlap(this.enemyBullets, this.player, this.killPlayer, null, this);
    
    //player is not moving by default
    this.player.body.velocity.x = 0;
    
    //listen to user input
    if(this.game.input.activePointer.isDown) {
      //get the location of the touch
      var targetX = this.game.input.activePointer.position.x;   
      
      //define the direction of the speed
      var direction = targetX >= this.game.world.centerX ? 1 : -1;   
      
      //move the player
      this.player.body.velocity.x = direction * this.PLAYER_SPEED; 
    }
    // Check if enemy have collided with the bow
    this.game.physics.arcade.overlap(this.enemyPool, this.bow, function(enemy, bow) {
        // Create an explosion
        bow.kill();
        this.getExplosion(enemy.x, enemy.y);
        // Kill the bullet
        
        alert("Game Over: You lost!");
        GameOfCastles.game.state.start('GameState');    
        
    }, null, this);
      
    // Check if bullets have collided with the castle
    this.game.physics.arcade.overlap(this.arrowPool, this.castle, function(arrow, castle) {
        // Create an explosion
        this.getExplosion(arrow.x, arrow.y);

        // Kill the bullet
        arrow.kill();
    }, null, this);
      
    // Check if arrows have collided with the enemies
    this.game.physics.arcade.overlap(this.arrowPool, this.enemyPool, function(bullet, enemy) {
        // Create an explosion
        this.getExplosion(bullet.x, bullet.y);

        // Kill the bullet
        bullet.kill();
        enemy.kill();
    }, null, this);

    // Rotate all living bullets to match their trajectory
    this.arrowPool.forEachAlive(function(bullet) {
        bullet.rotation = Math.atan2(bullet.body.velocity.y, bullet.body.velocity.x);
    }, this);

    // Aim the gun at the pointer.
    // All this function does is calculate the angle using
    // Math.atan2(yPointer-yGun, xPointer-xGun)
    this.bow.rotation = this.game.physics.arcade.angleToPointer(this.bow);

    // Shoot a bullet
    if (this.game.input.activePointer.isDown) {
        this.shootArrow();
    }
  },
  
  shootArrow: function() {
    // Enforce a short delay between shots by recording
    // the time that each bullet is shot and testing if
    // the amount of time since the last shot is more than
    // the required delay.
    if (this.lastArrowShotAt === undefined) this.lastArrowShotAt = 0;
    if (this.game.time.now - this.lastArrowShotAt < this.SHOT_DELAY) return;
    this.lastArrowShotAt = this.game.time.now;

    // Get a dead bullet from the pool
    var bullet = this.arrowPool.getFirstDead();

    // If there aren't any bullets available then don't shoot
    if (bullet === null || bullet === undefined) return;

    // Revive the bullet
    // This makes the bullet "alive"
    bullet.revive();

    // Arrows should kill themselves when they leave the world.
    // Phaser takes care of this for me by setting this flag
    // but you can do it yourself by killing the bullet if
    // its x,y coordinates are outside of the world.
    bullet.checkWorldBounds = true;
    bullet.outOfBoundsKill = true;

    // Set the bullet position to the gun position.
    bullet.reset(this.bow.x, this.bow.y);
    bullet.rotation = this.bow.rotation;

    // Shoot it in the right direction
    bullet.body.velocity.x = Math.cos(bullet.rotation) * this.ARROW_SPEED;
    bullet.body.velocity.y = Math.sin(bullet.rotation) * this.ARROW_SPEED;
},
  
  getExplosion: function(x, y) {
    // Get the first dead explosion from the explosionGroup
    var explosion = this.explosionGroup.getFirstDead();

    // If there aren't any available, create a new one
    if (explosion === null) {
        explosion = this.game.add.sprite(0, 0, 'explosion');
        explosion.anchor.setTo(0.5, 0.5);

        // Add an animation for the explosion that kills the sprite when the
        // animation is complete
        var animation = explosion.animations.add('boom', [0,1,2,3], 60, false);
        animation.killOnComplete = true;

        // Add the explosion sprite to the group
        this.explosionGroup.add(explosion);
    }

    // Revive the explosion (set it's alive property to true)
    // You can also define a onRevived event handler in your explosion objects
    // to do stuff when they are revived.
    explosion.revive();

    // Move the explosion to the given coordinates
    explosion.x = x;
    explosion.y = y;

    // Set rotation of the explosion at random for a little variety
    explosion.angle = this.game.rnd.integerInRange(0, 360);

    // Play the animation
    explosion.animations.play('boom');

    // Return the explosion itself in case we want to do anything else with it
    return explosion;
  },
    
   //initiate the player bullets group
  initBullets: function(){
    this.playerBullets = this.add.group();
    this.playerBullets.enableBody = true;
  },
    
  //create or reuse a bullet - pool of objects
  createPlayerBullet: function(){
    var bullet = this.playerBullets.getFirstExists(false);
    
    //only create a bullet if there are no dead ones available to reuse
    if(!bullet) {
      bullet = new GameOfCastles.PlayerBullet(this.game, this.player.x, this.player.top);
      this.playerBullets.add(bullet);
    }
    else {
      //reset position
      bullet.reset(this.player.x, this.player.top);
    }
    
    //set velocity
    bullet.body.velocity.y = this.BULLET_SPEED;
    
  },
    
  initEnemies: function() {
  
    this.enemies = this.add.group();
    this.enemies.enableBody = true;
    
    this.enemyBullets = this.add.group();
    this.enemyBullets.enableBody = true;
      
    this.loadLevel();
    
  },
    
  damageEnemy: function(bullet, enemy) {
    enemy.damage(1);    
    bullet.kill();
  },
  
  killPlayer: function() {
    this.player.kill();
    this.orchestra.stop();
    this.game.state.start('GameState');
  },
    
  createEnemy: function(x, y, health, key, scale, speedX, speedY){
  
    var enemy = this.enemies.getFirstExists(false);
    
    if(!enemy){
      enemy = new GameOfCastles.Enemy(this.game, x, y, key, health, this.enemyBullets);
      this.enemies.add(enemy);
    }
    
    enemy.reset(x, y, health, key, scale, speedX, speedY);
  },
    
  loadLevel: function() {
    
    this.currentEnemyIndex = 0;
      
    this.levelData = JSON.parse(this.game.cache.getText('level' + this.currentLevel));
       
    this.scheduleNextEnemy();
    
  },
  
  scheduleNextEnemy: function() {
    var nextEnemy = this.levelData.enemies[this.currentEnemyIndex];
    
    if(nextEnemy){
      var nextTime = 1000 * ( nextEnemy.time - (this.currentEnemyIndex == 0 ? 0 : this.levelData.enemies[this.currentEnemyIndex - 1].time));
      
      this.nextEnemyTimer = this.game.time.events.add(nextTime, function(){
        this.createEnemy(nextEnemy.x * this.game.world.width, -100, nextEnemy.health, nextEnemy.key, nextEnemy.scale, nextEnemy.speedX, nextEnemy.speedY);
        
        this.currentEnemyIndex++;
        this.scheduleNextEnemy();
      }, this);
    }
  }

};
