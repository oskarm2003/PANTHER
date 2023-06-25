import { pos3D, PLAYER } from "./globals"
import { Entity } from "./entities_objects"
import { TEXTURES } from "../game/assets"
import { VIEW } from "../game/main"

export type ENEMY_CAPABILITIES = 'mimic' | 'flank' | 'escape' | 'kamikaze' | 'roam' | 'reach' | 'dummy'

class Mind {

    vessel: Entity

    capabilities: Array<ENEMY_CAPABILITIES>
    task: ENEMY_CAPABILITIES

    private last_pos: pos3D
    private last_moves: [pos3D, pos3D, pos3D]
    desired_point: pos3D
    current_move: pos3D

    aim: boolean
    accelerate: boolean
    align_height: boolean
    keep_distance: boolean

    speed: number
    max_speed: number
    acceleration: number
    bend: number
    kill_attempts: number
    distance_from_player: number
    last_shot: number

    constructor(vessel: Entity, ...capabilities: Array<ENEMY_CAPABILITIES>) {

        this.vessel = vessel
        this.last_pos = { x: 0, y: 0, z: 0 }
        this.last_moves = [{ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }]
        this.desired_point = this.vessel.space_pos
        this.bend = 0
        this.distance_from_player = 0

        this.capabilities = capabilities
        this.task = this.new_task()

        this.accelerate = false
        this.aim = true
        this.align_height = false
        this.keep_distance = false

        this.last_shot = 0
        this.speed = 1
        this.max_speed = 3
        this.acceleration = 1.1
        this.kill_attempts = 0
    }

    //randomly draws new action
    private new_task(): ENEMY_CAPABILITIES {

        if (this.capabilities.length == 1) {
            return this.capabilities[0]
        }

        let new_task = this.capabilities[Math.floor(Math.random() * this.capabilities.length)]
        while (new_task == this.task) {
            new_task = this.capabilities[Math.floor(Math.random() * this.capabilities.length)]
        }

        return new_task
    }

    //checks if vessel should bend
    private check_bend() {

        if (this.last_moves[1].z * this.last_moves[0].z < -5 && this.last_moves[0].z < 0) {
            this.vessel.texture = this.vessel.bend_texture
            this.bend = 10
        }
    }

    //update last moves array
    private update_last_move(move: pos3D) {

        this.last_moves[2] = this.last_moves[1]
        this.last_moves[1] = this.last_moves[0]
        this.last_moves[0] = move

    }

    //moving entity back from the player
    private withdraw() {

        if (this.vessel.space_pos.x - 196 < PLAYER.space_pos.x) {
            this.current_move.x += 196 / (this.vessel.space_pos.x - PLAYER.space_pos.x)
        }

    }

    //adjust entity height by the plyer position
    private adjust_height() {
        this.current_move.y = -Math.sign(this.vessel.space_pos.y - PLAYER.space_pos.y)
    }

    //makes an entity roam randomly
    private roam() {

        this.accelerate = true
        this.aim = true

        const change_desired_point = () => {
            this.desired_point = {
                x: Math.floor((Math.random() * 128) + PLAYER.space_pos.x + this.distance_from_player * 64),
                y: Math.floor(Math.random() * 48),
                z: Math.floor((Math.random() * 150) - 75)
            }
        }
        if (this.desired_point.x < this.vessel.parent.renderer_xpos) { change_desired_point() }

        let distance = Math.sqrt(Math.pow(this.desired_point.x - this.vessel.space_pos.x, 2) + Math.pow(this.desired_point.y - this.vessel.space_pos.y, 2) + Math.pow(this.desired_point.z - this.vessel.space_pos.z, 2))

        if (distance > 50) {
            this.move_to_point(this.desired_point)
        }
        else {
            this.speed = 1
            change_desired_point()
        }

    }

    //moves the entity to the player position
    private kamikaze() {

        this.max_speed = 3
        this.accelerate = true
        this.aim = false

        if (this.vessel.space_pos.x < PLAYER.space_pos.x) {
            this.aim = true
        }

        if (Math.floor(this.vessel.space_pos.z / 16) != Math.floor(PLAYER.space_pos.z / 16) ||
            Math.floor(this.vessel.space_pos.y / 1) != Math.floor(PLAYER.space_pos.y / 1)
        ) {

            this.desired_point = {
                x: PLAYER.space_pos.x - 30,
                y: PLAYER.space_pos.y,
                z: PLAYER.space_pos.z
            }
        }

        if (this.vessel.space_pos.x != this.desired_point.x ||
            this.vessel.space_pos.y != this.desired_point.y ||
            this.vessel.space_pos.z != this.desired_point.z) {
            this.move_to_point(this.desired_point)
        }
        else {
            this.desired_point = {
                x: PLAYER.space_pos.x - 30,
                y: PLAYER.space_pos.y,
                z: PLAYER.space_pos.z
            }
        }
    }

    //mimics player behavior
    private mimic() {

        this.keep_distance = true
        this.align_height = true
        this.accelerate = true
        this.aim = true
        this.max_speed = 2

        let move: pos3D = { x: 0, y: 0, z: 0 }
        let distance = this.vessel.space_pos.z - PLAYER.space_pos.z

        move.z = Math.floor(-distance / 20)
        this.current_move.z += move.z

    }

    //moves the entity to desired position
    private move_to_point(point: pos3D): void {

        let pos: pos3D = this.vessel.space_pos

        let distance = Math.sqrt(Math.pow(point.x - pos.x, 2) + Math.pow(point.z - pos.z, 2))

        if (distance < 10 && this.vessel.name != 'PERSON') {
            this.accelerate = false
            this.speed = this.speed / this.acceleration
        }

        let direction = [
            Math.floor(Math.sign(point.x - pos.x) * this.speed),
            Math.floor(Math.sign(point.y - pos.y)),
            Math.floor(Math.sign(point.z - pos.z) * this.speed)
        ]

        this.current_move.x += direction[0]
        this.current_move.y += direction[1]
        this.current_move.z += direction[2]

    }

    //default entity thinking process
    think() {

        this.current_move = { x: 0, y: 0, z: 0 }

        //task menement
        if (this.kill_attempts > 8) {
            this.task = this.new_task()
            this.kill_attempts = 0
        }

        //handle bending
        if (this.bend > 0) {
            this.bend -= 1
            if (this.bend == 0) {
                this.vessel.texture = this.vessel.normal_texture
            }
        }
        else {
            this.check_bend()
        }

        //managing speed
        if (this.speed > this.max_speed) {
            this.accelerate = false
            this.speed = this.max_speed
        }

        //aim handling
        if (this.aim && !PLAYER.dead) {
            if (PLAYER.space_pos.z == this.vessel.space_pos.z) {
                this.vessel.fire()
                this.kill_attempts++
                this.last_shot = Math.floor(Date.now() / 1000)
            }
            if (Math.floor(Date.now() / 1000) - this.last_shot > 20) {
                this.vessel.fire()
                this.kill_attempts++
                this.last_shot = Math.floor(Date.now() / 1000)
            }
        }

        //acceleration
        if (this.accelerate) {
            this.speed *= this.acceleration
        }

        //keep distance from the player
        if (this.keep_distance) {
            this.withdraw()
        }

        //adjust height
        if (this.align_height) {
            this.adjust_height()
        }

        //thinking process
        switch (this.task) {
            case 'reach':
                this.aim = false
                this.keep_distance = false
                this.move_to_point(this.desired_point)
                break;
            case 'roam':
                this.roam()
                break;

            case 'kamikaze':
                this.kamikaze()
                break;
            case 'mimic':
                this.mimic()
                break;
            default:
                break;
        }

        //moving
        this.vessel.move(this.current_move.x, this.current_move.y, this.current_move.z)
        this.update_last_move(this.current_move)

    }

}

export default Mind