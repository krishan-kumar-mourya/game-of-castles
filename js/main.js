var GameOfCastles = GameOfCastles || {};

//initiate the Phaser framework
GameOfCastles.game = new Phaser.Game('100%', '100%', Phaser.AUTO);

GameOfCastles.game.state.add('GameState', GameOfCastles.GameState);
GameOfCastles.game.state.start('GameState');    