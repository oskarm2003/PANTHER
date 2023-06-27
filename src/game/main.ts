import View from "../engine/view";
import { Entity } from "../engine/entities_objects"
import { TEXTURES } from "./assets";
import { set_player_global } from "../engine/globals";
import { set_platform } from "./platform";

window.addEventListener('touchstart', () => { });
window.addEventListener('touchend', () => { });
window.addEventListener('touchcancel', () => { });
window.addEventListener('touchmove', () => { });

export const ENEMIES_TEXTURES: Array<any> = [
    [TEXTURES.enemy_bend_green, TEXTURES.enemy_green],
    [TEXTURES.enemy_bend_yellow, TEXTURES.enemy_yellow],
    [TEXTURES.enemy_bend_purple, TEXTURES.enemy_purple],
    [TEXTURES.enemy_bend_pink, TEXTURES.enemy_pink],
    [TEXTURES.enemy_bend_red, TEXTURES.enemy_red],
    [TEXTURES.enemy_bend_violet, TEXTURES.enemy_violet]
]


export const SPEED = 1
export const PLAYER = new Entity({ x: 96, y: 8, z: -30 }, TEXTURES.player, TEXTURES.player_shadow, TEXTURES.player_projectile, 'PLAYER')
// PLAYER.show_axes = true


export const CANVAS: HTMLCanvasElement = document.getElementById('game-field') as HTMLCanvasElement
export const VIEW = new View(CANVAS)

let start = async () => {
    set_platform()
    set_player_global(PLAYER)
    VIEW.explosion_texture = TEXTURES.explosion
    VIEW.add_entity(PLAYER)
}

start()