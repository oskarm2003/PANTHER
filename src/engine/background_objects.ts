import Object from "./base_object";
import { pos3D, pos2D, backgroundObject, PLAYER, calculate_distance } from "./globals";
import { TEXTURES } from "../game/assets";
import { Entity } from "./entities_objects";
import Mind from "./AI";
import { person_collected } from "../game/action";
import View from "./view";
import { CANVAS } from "../game/main";

const CHUNK_WIDTH = 128
const CHUNK_HEIGHT = 256

class Decoration extends Object {

    texture: HTMLImageElement
    animate: boolean
    single_texture_width: number
    to_draw_frame: number

    constructor(position: pos3D, texture: HTMLImageElement, animate: boolean, single_texture_width: number) {
        super(position)

        this.texture = texture
        this.animate = animate
        this.single_texture_width = single_texture_width
        this.to_draw_frame = 0

        if (!this.animate) {
            this.to_draw_frame = Math.floor(Math.random() * (this.texture.width / this.single_texture_width)) * this.single_texture_width
        }

    }

    override draw(ctx: CanvasRenderingContext2D): void {

        if (this.animate) {
            this.to_draw_frame += 0.1
            if (this.to_draw_frame > this.texture.width / this.single_texture_width) {
                this.to_draw_frame = 0
            }
        }

        ctx.beginPath()
        ctx.drawImage(this.texture, this.animate ? Math.floor(this.to_draw_frame) * this.single_texture_width : this.to_draw_frame, 0, this.single_texture_width, this.texture.height, this.screen_pos.x - this.single_texture_width / 2, this.screen_pos.y - this.texture.height / 2, this.single_texture_width, this.texture.height)
        ctx.stroke()

    }

}

class Bunker extends Decoration {

    capacity: number

    constructor(position: pos3D, texture: HTMLImageElement, single_texture_width: number) {
        super(position, texture, false, single_texture_width)
        this.capacity = Math.floor(Math.random() * 3) + 5
    }

    spawn_person(): void {
        let person = new Person({ x: this.space_pos.x, y: this.space_pos.y - 8, z: this.space_pos.z }, TEXTURES.person_walking, this.space_pos)
        person.parent = this.parent
        this.parent.scene_children[2].push(person)
        this.capacity -= 1
    }

    private spawn_check(): number {

        if (this.capacity == 0) { return 0 }

        //if player close enough and on ground craete or move a person 
        if (PLAYER.space_pos.y == 0) {

            //check distance
            let distance = calculate_distance(PLAYER.space_pos, this.space_pos)

            if (distance < 80) {

                //check if person already exists
                let person_exists: boolean = false

                for (let obj of this.parent.scene_children[2]) {
                    if (obj instanceof Person) { person_exists = true }
                }

                //create new person if not
                if (!person_exists) {
                    this.spawn_person()
                }
            }
        }
    }

    override draw(ctx: CanvasRenderingContext2D): void {

        this.spawn_check()

        ctx.beginPath()
        ctx.drawImage(this.texture, this.to_draw_frame, 0, this.single_texture_width, this.texture.height, this.screen_pos.x - 8, this.screen_pos.y - 8, this.single_texture_width, this.texture.height)
        ctx.stroke()
    }
}

class Wave extends Decoration {
    animation_frame: number
    constructor(position: pos3D, texture: HTMLImageElement, single_texture_width: number) {
        super(position, texture, true, single_texture_width)
        this.animation_frame = Math.floor(Math.random() * this.texture.width)
    }

    override draw(ctx: CanvasRenderingContext2D) {

        this.animation_frame += 0.25
        if (this.animation_frame + this.single_texture_width > this.texture.width) { this.animation_frame = 0 }

        ctx.beginPath()
        ctx.drawImage(this.texture, this.animation_frame, 0, this.single_texture_width, this.texture.height, this.screen_pos.x - 8, this.screen_pos.y - 8, this.single_texture_width, this.texture.height)
        ctx.stroke()

    }
}

class Person extends Entity {

    bunker_pos: pos3D

    constructor(position: pos3D, texture: HTMLImageElement, bunker_pos: pos3D) {

        super(position, new Image(), new Image(), new Image())

        this.texture = texture
        this.name = 'PERSON'
        this.mind = new Mind(this, "reach")
        this.mind.aim = false
        this.mind.max_speed = 1
        this.mind.desired_point = PLAYER.space_pos
        this.animation_frame = 0
        this.bunker_pos = bunker_pos

    }

    check() {

        let distance = calculate_distance(PLAYER.space_pos, this.bunker_pos)

        if (PLAYER.space_pos.y != 0 || distance > 80) {
            this.mind.task = 'dummy'
            this.texture = TEXTURES.person_waiting
        }
        else if (this.mind.task == 'dummy' && distance <= 80) {
            this.mind.task = "reach"
            this.mind.desired_point = PLAYER.space_pos
            this.texture = TEXTURES.person_walking
        }

        this.animation_frame += 0.15
        if (this.animation_frame > this.texture.width / 10) {
            this.animation_frame = 0
        }

        if (this.space_pos.x == PLAYER.space_pos.x && this.space_pos.y == PLAYER.space_pos.y && this.space_pos.z == PLAYER.space_pos.z) {
            this.kill(2)
            person_collected()
        }

    }

    override draw(ctx: CanvasRenderingContext2D): void {

        this.mind.think()
        this.check()
        this.translate_self()

        ctx.beginPath()
        ctx.drawImage(this.texture, Math.floor(this.animation_frame) * 10, 0, 10, 8, this.screen_pos.x - 8, this.screen_pos.y - 8, 10, 8)
        ctx.stroke()

    }
}

class Plane extends Decoration {

    vertezies: [pos3D, pos3D, pos3D, pos3D]
    color: string

    constructor(position: pos3D, vertezies: [pos3D, pos3D, pos3D, pos3D], color: string) {
        super(position, new Image(), false, 0)

        this.color = color
        this.vertezies = vertezies

    }

    override draw(ctx: CanvasRenderingContext2D) {

        let to_draw = [
            this.translate_pos(this.vertezies[0], this.parent.renderer_xpos),
            this.translate_pos(this.vertezies[1], this.parent.renderer_xpos),
            this.translate_pos(this.vertezies[2], this.parent.renderer_xpos),
            this.translate_pos(this.vertezies[3], this.parent.renderer_xpos)
        ]

        ctx.beginPath()
        ctx.fillStyle = this.color
        ctx.moveTo(to_draw[0].x, to_draw[0].y)
        ctx.lineTo(to_draw[2].x, to_draw[2].y)
        ctx.lineTo(to_draw[3].x, to_draw[3].y)
        ctx.lineTo(to_draw[1].x, to_draw[1].y)
        ctx.fill()
    }

}

class BiomesTransition extends Decoration {

    vertezies: [pos2D, pos2D, pos2D, pos2D]
    color: string

    constructor(position: pos3D, color: string, parent: View) {
        super(position, new Image(), false, 0)

        this.parent = parent
        this.color = color

    }

    override draw(ctx: CanvasRenderingContext2D) {

        this.translate_self()
        this.vertezies = [
            this.translate_pos({ x: this.space_pos.x + CHUNK_WIDTH, y: 0, z: this.space_pos.z - CHUNK_HEIGHT }, this.parent.renderer_xpos),
            this.translate_pos({ x: this.space_pos.x + CHUNK_WIDTH, y: 0, z: this.space_pos.z + CHUNK_HEIGHT }, this.parent.renderer_xpos),
            this.translate_pos({ x: this.space_pos.x + CHUNK_WIDTH * 8, y: 0, z: this.space_pos.z - CHUNK_HEIGHT }, this.parent.renderer_xpos),
            this.translate_pos({ x: this.space_pos.x + CHUNK_WIDTH * 8, y: 0, z: this.space_pos.z + CHUNK_HEIGHT }, this.parent.renderer_xpos)
        ]

        ctx.beginPath()
        ctx.moveTo(this.vertezies[0].x, this.vertezies[0].y)
        ctx.lineTo(this.vertezies[2].x, this.vertezies[2].y)
        ctx.lineTo(this.vertezies[3].x, this.vertezies[3].y)
        ctx.lineTo(this.vertezies[1].x, this.vertezies[1].y)
        ctx.fillStyle = this.color
        ctx.fill()

    }


}

class Chunk extends Object {

    children: Array<Object>

    constructor(position: pos3D, parent: View, generation: () => Array<Decoration>) {
        super(position)

        this.children = new Array()
        this.parent = parent
        this.children = generation()

        for (let child of this.children) {
            if (child instanceof Plane) {
                child.vertezies[0].x += this.space_pos.x
                child.vertezies[1].x += this.space_pos.x
                child.vertezies[2].x += this.space_pos.x
                child.vertezies[3].x += this.space_pos.x
            }
            child.space_pos.x += this.space_pos.x
            if (child instanceof Bunker) {
                child.spawn_person()
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {

        for (let obj of this.children) {
            obj.translate_self()
            obj.draw(ctx)
        }
    }
}

export { CHUNK_WIDTH, CHUNK_HEIGHT, Chunk, Bunker, Decoration, BiomesTransition, Plane, Wave }