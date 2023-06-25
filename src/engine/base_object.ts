import View from './view'
import { generate_id, pos2D, pos3D } from './globals'

class Object {

    space_pos: pos3D
    screen_pos: pos2D
    name: string
    show_axes: boolean
    parent: View

    constructor(position: pos3D, name?: string) {

        this.space_pos = position
        if (name) {
            this.name = name
        } else {
            this.name = generate_id(8)
        }
    }

    //translates virtual position to screen position
    protected translate_pos(pos: pos3D, renderer_xpos: number): pos2D {

        const radius = pos.x - renderer_xpos
        const angle = Math.PI / 7

        return {
            x: Math.floor(Math.cos(angle) * radius + pos.z * Math.cos(angle)),
            y: Math.floor(-(Math.sin(angle) * radius) + pos.z * Math.sin(angle) + this.parent.canvas.height - pos.y)
        }
    }

    translate_self() {
        this.screen_pos = this.translate_pos(this.space_pos, this.parent.renderer_xpos)
    }

    //removes self from scene elements list
    kill(scene_layer: number) {

        for (let i = 0; i < this.parent.scene_children[scene_layer].length; i++) {
            if (this.parent.scene_children[scene_layer][i] == this) {
                this.parent.scene_children[scene_layer].splice(i, 1)
            }
        }

    }

    calc_axes() {

        let renderer_xpos = this.parent.renderer_xpos
        let pos = this.space_pos

        return [
            this.translate_pos({ x: pos.x - 400, y: pos.y, z: pos.z }, renderer_xpos),
            this.translate_pos({ x: pos.x + 400, y: pos.y, z: pos.z }, renderer_xpos),
            this.translate_pos({ x: pos.x, y: pos.y - 400, z: pos.z }, renderer_xpos),
            this.translate_pos({ x: pos.x, y: pos.y + 400, z: pos.z }, renderer_xpos),
            this.translate_pos({ x: pos.x, y: pos.y, z: pos.z - 400 }, renderer_xpos),
            this.translate_pos({ x: pos.x, y: pos.y, z: pos.z + 400 }, renderer_xpos)
        ]
    }

    draw_axes(ctx: CanvasRenderingContext2D) {

        const axes = this.calc_axes()

        ctx.beginPath()
        ctx.strokeStyle = '#ff0000'
        ctx.moveTo(axes[0].x, axes[0].y)
        ctx.lineTo(axes[1].x, axes[1].y)
        ctx.stroke()

        ctx.beginPath()
        ctx.strokeStyle = '#00ff00'
        ctx.moveTo(axes[2].x, axes[2].y + 100)
        ctx.lineTo(axes[3].x, axes[3].y - 100)
        ctx.stroke()

        ctx.beginPath()
        ctx.strokeStyle = '#0000ff'
        ctx.moveTo(axes[4].x, axes[4].y)
        ctx.lineTo(axes[5].x, axes[5].y)
        ctx.stroke()
    }

    draw(ctx: CanvasRenderingContext2D): void {
        console.error('None draw method inherited;\nMost likely wrong Object instance created')
    }

}

export default Object