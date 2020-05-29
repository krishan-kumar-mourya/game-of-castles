var GameOfCastles = GameOfCastles || {};

GameOfCastles.GameState = {

  //initiate game settings
  init: function(currentLevel) {
    //use all the area, don't distort scale
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    
    //initiate physics system
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    
    //game constants
    this.PLAYER_SPEED = 200;
    this.BULLET_SPEED = 1000; // pixels/second
    this.SHOT_DELAY = 300; // milliseconds (10 bullets/3 seconds)
    
    //level data
    this.numLevels = 3;
    this.currentLevel = currentLevel ? currentLevel : 1;
    console.log('current level:' + this.currentLevel);

  },

  //load the game assets before the game starts
  preload: function() {
    this.game.load.image('background', 'assets/images/background1.jpeg');
    this.load.image('player', 'assets/images/bow.png');    
    this.load.image('bullet', 'assets/images/arrow.png');    
    this.game.load.image('castle', '/assets/images/castle3.png');
    this.load.image('enemyParticle', 'assets/images/enemyParticle.png');    
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
    this.player = this.add.sprite(75, this.game.height - 120, 'player');
    this.player.anchor.setTo(0.5);
    this.player.scale.setTo(0.4);
    this.game.physics.arcade.enable(this.player);
    this.player.body.collideWorldBounds = true;
    
    //initiate player bullets and player shooting
    this.initBullets();
      
    //create a sprite for the castle
    this.castle = this.game.add.sprite(this.game.width-20, this.game.height-250, 'castle');
    this.castle.anchor.setTo(1, 1);
    this.game.physics.enable(this.castle, Phaser.Physics.ARCADE);
    this.castle.body.allowGravity = false;
    this.castle.body.immovable = true;
    
    //initiate the enemies
    this.initEnemies();
    
    //load level
    this.loadLevel();
    
    this.orchestra = this.add.audio('orchestra');
    this.orchestra.play();
  },
  update: function() {
    
    this.game.physics.arcade.overlap(this.playerBullets, this.enemies, this.damageEnemy, null, this);
    
    this.game.physics.arcade.overlap(this.enemyBullets, this.player, this.killPlayer, null, this);
      
    this.game.physics.arcade.overlap(this.playerBullets, this.enemyBullets, this.killBullets, null, this);
      
    // Aim the gun at the pointer.
    // All this function does is calculate the angle using
    // Math.atan2(yPointer-yGun, xPointer-xGun)
    this.player.rotation = this.game.physics.arcade.angleToPointer(this.player);
      
    // Shoot a bullet
    if (this.game.input.activePointer.isDown) {
        this.createPlayerBullet();
    }
      
    this.playerBullets.forEach(function(bullet) {
        bullet.rotation = Math.atan2(bullet.body.velocity.y, bullet.body.velocity.x);
    }, this);
    
  },
  
  //initiate the player bullets group
  initBullets: function(){
    this.playerBullets = this.add.group();
    this.playerBullets.enableBody = true;
  },
  
  //create or reuse a bullet - pool of objects
  createPlayerBullet: function(){
    // Enforce a short delay between shots by recording
    // the time that each bullet is shot and testing if
    // the amount of time since the last shot is more than
    // the required delay.
    if (this.lastArrowShotAt === undefined) this.lastArrowShotAt = 0;
    if (this.game.time.now - this.lastArrowShotAt < this.SHOT_DELAY) return;
    this.lastArrowShotAt = this.game.time.now;
      
    var bullet = this.playerBullets.getFirstExists(false);
    
    //only create a bullet if there are no dead ones available to reuse
    if(!bullet) {
      bullet = new GameOfCastles.PlayerBullet(this.game, this.player.x, this.player.y);
      this.playerBullets.add(bullet);
    }
    else {
      //reset position
      bullet.reset(this.player.x, this.player.y);
    }
    bullet.rotation = this.player.rotation;
    
    // Shoot it in the right direction
    bullet.body.velocity.x = Math.cos(bullet.rotation) * this.BULLET_SPEED;
    bullet.body.velocity.y = Math.sin(bullet.rotation) * this.BULLET_SPEED;      
    
  },
  
  initEnemies: function(){
  
    this.enemies = this.add.group();
    this.enemies.enableBody = true;
    
    this.enemyBullets = this.add.group();
    this.enemyBullets.enableBody = true;
    
  },
  
  damageEnemy: function(bullet, enemy) {
    enemy.damage(1);    
    bullet.kill();
  },
  
  killPlayer: function() {
    this.player.kill();
    this.orchestra.stop();
    alert("You Lost, Game Over!");
    this.game.state.start('GameState');
  },
    
  killBullets: function(playerBullet, enemyBullet) {
    playerBullet.kill();
    enemyBullet.kill();
  },
  
  createEnemy: function(x, y, health, key, scale, speedX, speedY){
  
    var enemy = this.enemies.getFirstExists(false);
    
    if(!enemy){
      enemy = new GameOfCastles.Enemy(this.game, x, y, key, health, this.enemyBullets);
      this.enemies.add(enemy);
    }
    
    enemy.reset(x, y, health, key, scale, speedX, speedY);
  },
  
  loadLevel: function(){
    
    this.currentEnemyIndex = 0;
    
    this.levelData = JSON.parse(this.game.cache.getText('level' + this.currentLevel));
    
    //end of the level timer
    this.endOfLevelTimer = this.game.time.events.add(this.levelData.duration * 1000, function(){
      console.log('level ended!');
      
      this.orchestra.stop();
      
      if(this.currentLevel < this.numLevels) {
        this.currentLevel++;
      }
      else {
        this.currentLevel = 1;
      }
      
      this.game.state.start('GameState', true, false, this.currentLevel);
      
    }, this);
    
    
    this.scheduleNextEnemy();
    
  },
  
  scheduleNextEnemy: function() {
    var nextEnemy = this.levelData.enemies[this.currentEnemyIndex];
    
    if(nextEnemy){
      var nextTime = 1000 * ( nextEnemy.time - (this.currentEnemyIndex == 0 ? 0 : this.levelData.enemies[this.currentEnemyIndex - 1].time));
      
      this.nextEnemyTimer = this.game.time.events.add(nextTime, function(){
        this.createEnemy(this.game.world.width + 100, this.game.world.height - 150, nextEnemy.health, nextEnemy.key, nextEnemy.scale, nextEnemy.speedX, 0);
        
        this.currentEnemyIndex++;
        this.scheduleNextEnemy();
      }, this);
    }
  }
  

};