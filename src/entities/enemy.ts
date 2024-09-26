import {Entity} from "./entity.ts";
import Phaser, {Scene} from "phaser";
import {ElwynnForest} from "../scenes/elwynn-forest.ts";

export class Enemy extends Entity {
  private player: Entity;
  private isFollowing: boolean;
  private agroDistance: number;
  private attackRange: number;
  private followRange: number;
  private moveSpeed: number;
  private isAlive: boolean;
  private initialPosition: {x: number, y: number};

  constructor(scene: Scene, x: number, y: number, texture: string, type?: string) {
    super(scene, x, y, texture);

    this.initialPosition = {x, y}
    this.isFollowing = false
    this.isAlive = true
    this.agroDistance = 100
    this.attackRange = 40
    this.followRange = 250
    this.moveSpeed = 100

    this.cycleTween()
    this.setFlipX(true)

  }

  cycleTween () {
    this.scene.tweens.add({
      targets: this,
      duration: 2000,
      repeat: -1,
      yoyo: true,
      x: this.x + 100,
      onRepeat: () => {
        this.setFlipX(true)
      },
      onYoyo: () => {
        this.setFlipX(false)
      }
    })
  }

  setPlayer(player: Entity) {
    this.player = player
  }
  
  stopCycleTween() {
    this.scene.tweens.killTweensOf(this)
  }

  followToPlayer(player) {
    this.scene.physics.moveToObject(this, player, this.moveSpeed)
  }

  returnToOriginalPosition(distanceToPosition) {
    this.setVelocity(0, 0)

    this.scene.tweens.add({
      targets: this,
      x: this.initialPosition.x,
      y: this.initialPosition.y,
      duration: distanceToPosition * 1000 / this.moveSpeed,
      onComplete: () => {
        this.cycleTween()
      }
    })
  }

  attack (target: Entity) {
    const time = Math.floor(this.scene.game.loop.time)

    if (time % 2000 <= 3) {
      target.takeDamage(10)
    }
  }

  takeDamage (damage) {
    super.takeDamage(damage)

    if (this.health <= 0) {
      this.deactivate()
    }
  }

  deactivate () {
    const scene = this.scene as ElwynnForest
    this.stopCycleTween();
    this.setPosition(this.initialPosition.x, this.initialPosition.y)
    this.setVisible(false);
    this.isAlive = false
    this.destroy();
    scene.killsCounter += 1
  }

  update() {
    // 1. расчет дистанции до персонажа
    const player = this.player;
    const distanceToPlayer = Phaser.Math.Distance.Between(this.x, this.y, this.player.x, this.player.y)
    const distanceToPosition = Phaser.Math.Distance.Between(this.x, this.y, this.initialPosition.x, this.initialPosition.y)

    // 2. Остановка цикла, включение режима следования
    if (!this.isFollowing && distanceToPlayer < this.agroDistance) {
      this.isFollowing = true
      this.stopCycleTween()
    }

    // 3. Режим следования

    if (this.isFollowing && this.isAlive) {
      this.followToPlayer(player)

      // 3.1 Начало файтинга
      if (distanceToPlayer < this.attackRange) {
        this.setVelocity(0, 0)
        this.attack(player)
      }

      // 3.2 Возврат на исходную, если расстояние больше followRange
      if (distanceToPosition > this.followRange) {
        this.isFollowing = false
        this.returnToOriginalPosition(distanceToPosition)
      }
    }
  }
}
