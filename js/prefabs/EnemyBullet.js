var GameOfCastles = GameOfCastles || {};

GameOfCastles.EnemyBullet = function(game, x, y) {
  Phaser.Sprite.call(this, game, x, y, 'bullet');
  
  //some default values
  this.anchor.setTo(0.5);
  this.scale.setTo(-0.2, 0.2);
    
  // Enable physics on the bullet
  //game.physics.arcade.enable(this);
    
  // Arrows should kill themselves when they leave the world.
  // Phaser takes care of this for me by setting this flag
  // but you can do it yourself by killing the bullet if
  // its x,y coordinates are outside of the world.
  this.checkWorldBounds = true;
  this.outOfBoundsKill = true; 
};

GameOfCastles.EnemyBullet.prototype = Object.create(Phaser.Sprite.prototype);
GameOfCastles.EnemyBullet.prototype.constructor = GameOfCastles.EnemyBullet;