var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });
var map;
var tileset;
var layer;
 function preload () {
    game.load.image('logo', 'images/logo.jpg');
	game.load.tilemap('level1', 'data/testmap2.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tiles-1', 'images/maps/map1.png');
}

function create () {
    var logo = game.add.sprite(game.world.centerX, game.world.centerY, 'logo');
    logo.anchor.setTo(0.5, 0.5);
	map = game.add.tilemap('level1');

    map.addTilesetImage('tiles-1');
	layer = map.createLayer('Tile Layer 1');
	layer.resizeWorld();
}

function update () {
		
}