import Object from "./base_object"
import { generate_id, pos2D, pos3D } from "./globals"
import Mind from "./AI"
import { TEXTURES } from "../game/assets"
import { ENEMY_CAPABILITIES } from "./AI"
import { PLAYER } from "./globals"
import { SPEED } from "../game/main"

class Entity extends Object {

    texture: HTMLImageElement
    bend_texture: HTMLImageElement
    normal_texture: HTMLImageElement
    shadow_texture: HTMLImageElement
    projectile_texture: HTMLImageElement
    private cooldown: number
    protected animation_frame: number
    mind: Mind
    dead: boolean
    murders: number

    constructor(position: pos3D, texture: HTMLImageElement, shadowTexture: HTMLImageElement, projectileTexture: HTMLImageElement, name?: string, bend_texture?: HTMLImageElement) {
        super(position)

        if (name) {
            this.name = name
        } else {
            this.name = 'ENEMY' + generate_id(4)
        }

        if (bend_texture) {
            this.bend_texture = bend_texture
            this.normal_texture = texture
        }

        this.texture = texture
        this.shadow_texture = shadowTexture
        this.projectile_texture = projectileTexture

        this.dead = false

        this.cooldown = 0
        this.animation_frame = 0
        this.murders = 0

    }

    //makes an entity intelligent
    set_intelligence(...args: Array<ENEMY_CAPABILITIES>) {

        this.mind = new Mind(this, ...args)

    }

    //creates and gives movement to a projectile
    fire(friendly?: true): number | void {

        if (this.cooldown != 0) { return 0 }

        let speed = -10
        if (friendly) {
            speed *= -1
        }

        let proj_pos: pos3D = {
            x: this.space_pos.x,
            y: this.space_pos.y,
            z: this.space_pos.z
        }

        let destination = {
            x: PLAYER.space_pos.x,
            y: PLAYER.space_pos.y,
            z: PLAYER.space_pos.z
        }
        if (friendly) {
            destination.x += 500
        }

        this.parent.add_projectile(
            new Projectile(proj_pos, this, this.projectile_texture, speed, destination)
        )

        this.cooldown = 24

    }

    //moves an entity out of screen
    move_out() {

        this.mind.task = 'reach'
        this.mind.speed = 3
        this.mind.desired_point = { x: this.space_pos.x - 500, y: this.space_pos.y, z: this.space_pos.z + (Math.random() * 2 - 1) * 30 }

    }

    //moves an object by desired position
    move(x: number, y: number, z: number): void {

        this.space_pos = {
            x: this.space_pos.x + x,
            y: this.space_pos.y + y,
            z: this.space_pos.z + z
        }

        if (y < 0 && this.space_pos.y < 1) {
            this.space_pos.y = 0
        }

        if (this.name != 'PERSON') {
            this.collision_check()
        }
        this.translate_self()
    }

    protected collision_check() {

        let forgive: number = 6

        //background elements collision
        if (this.space_pos.y == 0) {
            for (let el of this.parent.killer_positions) {
                if (el.x < this.space_pos.x + forgive && el.x > this.space_pos.x - forgive && el.z < this.space_pos.z + forgive && el.z > this.space_pos.z - forgive) {
                    if (this.name == 'PROJECTILE') { return 0 }
                    if (this.name == 'PLAYER') { this.dead = true }
                    this.kill(1)
                    this.parent.add_entity(new Explosion(this.space_pos, TEXTURES.explosion, TEXTURES.explosion_shadow, ['', this.name]))
                }
            }
        }

        //only if not player
        if (this.name == 'PLAYER') { return 0 }

        forgive = 12

        for (let obj of this.parent.scene_children[1]) {

            //position check
            if (this.space_pos.x < obj.space_pos.x + forgive && this.space_pos.x > obj.space_pos.x - forgive) {
                if (this.space_pos.y < obj.space_pos.y + forgive && this.space_pos.y > obj.space_pos.y - forgive) {
                    if (this.space_pos.z < obj.space_pos.z + forgive && this.space_pos.z > obj.space_pos.z - forgive) {


                        if (obj.name != this.name && obj.name != 'EXPLOSION' && obj.name != 'PERSON') {
                            if (this.name.includes('ENEMY') && obj.name.includes('ENEMY')) { return 0 }

                            if (this.name == 'PLAYER' && this.dead || obj.name == 'PLAYER' && obj.dead) { return 0 }

                            //shooter escape
                            if (this instanceof Projectile) {
                                if (this.shooter.name == obj.name) { return 0 }
                                if (this.shooter.name != 'PLAYER') {
                                    this.shooter.move_out()
                                }
                                this.shooter.murders++
                            }

                            if (obj.name == 'PLAYER' || this.name == 'PLAYER') {
                                PLAYER.dead = true
                            }

                            this.parent.add_entity(new Explosion(obj.space_pos, TEXTURES.explosion, TEXTURES.explosion_shadow, [obj.name, this.name]))
                            obj.kill(1)
                            this.kill(1)
                            this.kill(2)
                        }
                    }
                }
            }
        }

    }

    //draws an object and makes the next move (if mind declared)
    override draw(ctx: CanvasRenderingContext2D): void {

        if (this.cooldown > 0) { this.cooldown-- }

        //draw axes if enabled
        if (this.show_axes) { this.draw_axes(ctx) }

        //think if inteligent
        if (this.mind) { this.mind.think() }

        ctx.beginPath()
        ctx.drawImage(this.texture, Math.floor(this.animation_frame) * 16, 0, 16, 8, this.screen_pos.x - 8, this.screen_pos.y - 8, 16, 8)
        ctx.stroke()

        this.animation_frame += 0.15
        if (this.name == 'PLAYER' && this.dead == true) {
            this.animation_frame += 0.60
        }
        if (this.animation_frame > this.texture.width / 16) { this.animation_frame = 0 }

    }

    draw_shadow(ctx: CanvasRenderingContext2D) {

        let frame = 0
        if (this.shadow_texture.width > 16) {
            frame = Math.floor(this.animation_frame) * 16
        }

        ctx.beginPath()
        ctx.drawImage(this.shadow_texture, frame, 0, 16, 8, this.screen_pos.x - 8, this.screen_pos.y + this.space_pos.y - 4, 18, 8)
        ctx.stroke()

    }
}

class Projectile extends Entity {

    speed: number
    time_to_live: number
    destination: pos3D
    mv_vector: pos3D
    shooter: Entity

    constructor(postition: pos3D, shooter: Entity, texture: HTMLImageElement, speed: number, destination: pos3D) {
        super(postition, texture, new Image(), new Image())

        this.name = 'PROJECTILE'
        this.shooter = shooter
        this.speed = speed
        this.time_to_live = 128
        this.destination = destination

        this.mv_vector = {
            x: Math.sign(this.destination.x - this.space_pos.x) * 8,
            y: 0,
            z: Math.sign(this.destination.z - this.space_pos.z) * 8
        }

    }

    //projectile move
    override move() {

        this.time_to_live--

        if (this.time_to_live == 0) {
            this.kill(2)
        }

        this.space_pos = {
            x: this.space_pos.x + this.mv_vector.x * SPEED,
            y: this.space_pos.y + this.mv_vector.y,
            z: this.space_pos.z + this.mv_vector.z
        }

        this.collision_check()
        this.translate_self()

    }
}

class Explosion extends Entity {

    victims: Array<string>

    constructor(position: pos3D, texture: HTMLImageElement, shadow_texture: HTMLImageElement, victims: Array<string>) {
        super(position, texture, shadow_texture, new Image())

        this.name = 'EXPLOSION'
        this.victims = victims

    }

    override draw(ctx: CanvasRenderingContext2D): void {

        ctx.beginPath()
        ctx.drawImage(this.texture, Math.floor(this.animation_frame) * 16, 0, 16, 8, this.screen_pos.x - 8, this.screen_pos.y - 8, 18, 10)
        ctx.stroke()

        this.animation_frame += 0.4
        if (this.animation_frame > this.texture.width / 16) {
            this.kill(1)
        }

    }
}

export { Entity, Projectile, Explosion }