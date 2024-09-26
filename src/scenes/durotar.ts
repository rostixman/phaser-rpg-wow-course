import Phaser from "phaser";
import durotarJson from '../assets/durotar.json'
import {LAYERS, SIZES, SPRITES, TILES} from "../utrils/constants.ts";
import {Player} from "../entities/player.ts";

export class Durotar extends Phaser.Scene {
  private player?: Player;

  constructor() {
    super('DurotarScene');
  }

  preload () {
    this.load.image(TILES.DUROTAR, 'src/assets/durotar.png')
    this.load.tilemapTiledJSON('map', 'src/assets/durotar.json')
    this.load.spritesheet(SPRITES.PLAYER, 'src/assets/characters/alliance.png', {
      frameWidth: SIZES.PLAYER.WIDTH,
      frameHeight: SIZES.PLAYER.HEIGHT
    })
  }

  create() {
    const map = this.make.tilemap({key: 'map'})
    const tileset = map.addTilesetImage(durotarJson.tilesets[0].name, TILES.DUROTAR, SIZES.TILE, SIZES.TILE)
    const groundLayer = map.createLayer(LAYERS.GROUND, tileset, 0, 0)
    const wallsLayer = map.createLayer(LAYERS.WALLS, tileset, 0, 0)
    this.player = new Player(this, 400, 250, SPRITES.PLAYER)
  }

  update(time: number, delta: number) {
    this.player.update(delta)
  }
}
