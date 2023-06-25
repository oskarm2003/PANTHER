import { Entity } from "../engine/entities_objects"
import { pos2D, pos3D } from "../engine/globals"
import { TEXTURES } from "./assets"
import { PLAYER } from "./main"

const CONTROL_PANEL_CANVAS: HTMLCanvasElement = document.getElementById('control-panel') as HTMLCanvasElement
const CONTROL_PANEL_CTX: CanvasRenderingContext2D = CONTROL_PANEL_CANVAS.getContext('2d')
const CONTROL_PANEL_TEXTURE: HTMLImageElement = TEXTURES.control_panel

const handle_control_panel = (message: string, score: number, people: number, lives: number, view_children: Array<pos2D>) => {
    CONTROL_PANEL_CANVAS.style.imageRendering = 'pixelated'
    CONTROL_PANEL_CTX.drawImage(CONTROL_PANEL_TEXTURE, 0, 0)
    CONTROL_PANEL_CTX.fillStyle = '#ffffff'
    CONTROL_PANEL_CTX.font = '6px atari'
    CONTROL_PANEL_CTX.fillText('Score', 24, 12)
    CONTROL_PANEL_CTX.fillText(score + '', 42 - 4 * (score + '').length, 20)
    CONTROL_PANEL_CTX.fillText(people + '', 300 - 4 * (people + '').length, 14)
    CONTROL_PANEL_CTX.fillText(lives + '', 250, 22)
    CONTROL_PANEL_CTX.fillText(view_children.length - (PLAYER.dead ? 0 : 1) + '', 250, 32)
    for (let el of view_children) {
        if (el.x > -5 && el.x < 40 && el.y > -13 && el.y < 13) {
            CONTROL_PANEL_CTX.fillRect(el.x + 92, el.y + 28, 2, 1)
        }
    }
    CONTROL_PANEL_CTX.textAlign = 'center'
    CONTROL_PANEL_CTX.fillText(message, 160 - message.length * 0.5, 5)
    CONTROL_PANEL_CTX.textAlign = 'start'

}

const get_radar_positions: (entities: Array<Entity>, view_pos: number) => Array<pos2D> = (entities: Array<Entity>, view_pos: number) => {

    let radar_positions: Array<pos2D> = new Array()

    for (let obj of entities) {
        if (obj.name == 'PERSON') { continue }
        let radar_pos: pos3D = { x: obj.space_pos.x - view_pos, y: obj.space_pos.y, z: obj.space_pos.z }
        radar_pos.x /= 12
        radar_pos.z /= 8
        radar_positions.push({ x: radar_pos.x, y: radar_pos.z })
    }

    return radar_positions

}

const blackout = () => {
    CONTROL_PANEL_CTX.fillStyle = '#000000'
    CONTROL_PANEL_CTX.fillRect(0, 0, 1000, 1000)
}

export { handle_control_panel, get_radar_positions, blackout }