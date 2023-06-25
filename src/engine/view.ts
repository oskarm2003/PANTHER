import Object from './base_object'
import { Entity, Projectile } from './entities_objects'
import { add_by_order, backgroundObject, pos3D } from './globals'
import { CHUNK_WIDTH, Chunk, Decoration, BiomesTransition } from './background_objects'

class View {

    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D
    renderer_xpos: number
    scene_children: [Array<Object>, Array<Entity>, Array<Object>] //first array element is background, the second is entities, third is moving no ship entities
    background_generation: () => Array<Decoration>
    background_color: string
    private let_render: boolean
    private draw_road: boolean
    private road_end: boolean
    total_loops: number

    killer_positions: Array<pos3D>

    explosion_texture: HTMLImageElement

    constructor(canvas: HTMLCanvasElement) {

        this.canvas = canvas
        this.ctx = canvas.getContext('2d')
        this.ctx.imageSmoothingEnabled = false
        this.scene_children = [[], [], []];
        this.renderer_xpos = 0
        this.let_render = false
        this.draw_road = true
        this.road_end = false
        this.killer_positions = new Array()
        this.total_loops = 0

    }

    //adds a projectile
    add_projectile(what: Projectile) {
        what.parent = this
        what.translate_self()
        this.scene_children[2].push(what)
    }

    //adds an entity to the scene
    add_entity(...args: Array<Entity>): void {

        let array: Array<number> = new Array();
        for (let child of this.scene_children[1]) {
            array.push(child.space_pos.y)
        }

        for (let obj of args) {
            obj.parent = this
            obj.translate_self()
            this.scene_children[1].push(obj)
        }
    }

    //moves render x position
    move_rendering_space(value: number) {

        this.renderer_xpos += value
        for (const child of this.scene_children[1]) {
            child.translate_self()
        }
    }

    //sets default scene background color
    set_background(color: string, background_generation: () => Array<Decoration>) {

        this.background_color = color
        this.background_generation = background_generation

        if (this.scene_children[0].length == 0) {
            for (let i = 0; i < 5; i++) {
                let new_chunk = new Chunk({ x: (i - 1) * CHUNK_WIDTH, y: 0, z: 0 }, this, this.background_generation)
                new_chunk.parent = this
                this.scene_children[0].push(new_chunk)
            }
        }
    }

    //find by name
    find(name: string): Entity | null {

        for (let object of this.scene_children[1]) {

            if (object.name == name) {
                return object
            }
        }

        return null
    }

    //generate background
    new_background_chunk() {

        //add new chunk
        let new_chunk = new Chunk(
            {
                x: this.scene_children[0][this.scene_children[0].length - 1].space_pos.x + CHUNK_WIDTH,
                y: 0,
                z: 100
            }, this, this.background_generation
        )

        if (this.road_end) { this.road_end = false }
        this.scene_children[0].push(new_chunk)

    }

    //remove elements out of view
    remove_unseen() {

        for (let j = 0; j < this.scene_children.length; j++) {
            for (let i = 0; i < this.scene_children[j].length; i++) {
                if (this.scene_children[j][i].space_pos.x + CHUNK_WIDTH < this.renderer_xpos) {
                    if (j == 0 && this.scene_children[j][i] instanceof BiomesTransition) { continue }

                    this.scene_children[j].splice(i, 1)

                    if (j == 0) {
                        this.new_background_chunk()
                    }
                }
            }
        }

        for (let i = 0; i < this.killer_positions.length; i++) {
            if (this.killer_positions[i].x < this.renderer_xpos) {
                this.killer_positions.splice(i, 1)
            }
        }

    }

    //draw scene scene_children on the screen
    draw_scene() {

        //background draw
        for (let chunk of this.scene_children[0]) {
            if (chunk.space_pos.x < this.renderer_xpos + this.canvas.width * 1.5) {
                chunk.draw(this.ctx)
            }
        }

        //shadow draw
        for (let object of this.scene_children[1]) {
            if (object.space_pos.x > this.renderer_xpos && object.space_pos.x < this.renderer_xpos + this.canvas.width * 1.5) {
                object.draw_shadow(this.ctx)
            }
        }
        //entity draw
        for (let object of this.scene_children[1]) {
            if (object.space_pos.x > this.renderer_xpos && object.space_pos.x < this.renderer_xpos + this.canvas.width * 1.5) {
                object.draw(this.ctx)
            }
        }
        //projectiles draw
        for (let object of this.scene_children[2]) {
            if (object.space_pos.x > this.renderer_xpos && object.space_pos.x < this.renderer_xpos + this.canvas.width * 1.5) {
                object.draw(this.ctx)
            }
        }
    }

    //stop rendering
    stop_render() {
        this.let_render = false
    }

    //view repeating render
    async render(action: () => void) {

        this.let_render = true
        let request_id: number

        const frame = () => {

            this.total_loops++

            //remove out of view objects
            this.remove_unseen()

            //move projectiles
            for (let obj of this.scene_children[2]) {
                if (obj instanceof Projectile) {
                    obj.move()
                }
            }

            action()

            //clear view
            this.ctx.beginPath()
            this.ctx.fillStyle = this.background_color
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
            this.ctx.stroke()

            //draw new view
            this.draw_scene()

            if (this.let_render) {
                window.requestAnimationFrame(frame)
            }

        }
        request_id = window.requestAnimationFrame(frame)
    }
}

export default View