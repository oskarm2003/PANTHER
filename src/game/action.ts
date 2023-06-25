import { Entity, Explosion } from '../engine/entities_objects'
import { PLAYER, SPEED, VIEW, CANVAS } from './main'
import { TEXTURES, THEME } from './assets'
import { ENEMIES_TEXTURES } from './main'
import { generate_desert_background, generate_meadow_background, generate_ocean_background } from './background_generation'
import { BiomesTransition, CHUNK_WIDTH } from '../engine/background_objects'
import { blackout, get_radar_positions, handle_control_panel } from './control_panel'
import { PHONE_MOTION, phone_movement } from './platform'

let reviving: number = 100
export let ALLOW_MOVEMENT: boolean = true
let LIVES: number = 5
let PEOPLE_COLLECTED: number = 0
let GENERATION_STEPS: number = 0
let MESSAGE: string = 'rescue mission engaged'
let MSG_TIME: number = 80

export const person_collected = () => {
    PEOPLE_COLLECTED++
    set_message('survivor rescued', 30)
}

//set message
export const set_message = (msg: string, time: number) => {
    MESSAGE = msg
    MSG_TIME = time
}

//generates new enemies wave
const new_wave = (type: 'alpha' | 'beta' | 'gamma' | 'delta' | 'epsilon') => {

    let skins = [
        ENEMIES_TEXTURES[Math.floor(Math.random() * ENEMIES_TEXTURES.length)], ENEMIES_TEXTURES[Math.floor(Math.random() * ENEMIES_TEXTURES.length)]
    ]

    set_message(type + ' wave engaged', 50)
    let enemies: Array<Entity> = new Array()
    let quantity = 0
    let inteligence: Array<'roam' | 'mimic' | 'kamikaze'> = new Array()
    switch (type) {
        case 'alpha': quantity = 1; inteligence = ['roam']; break;
        case 'beta': quantity = 2; inteligence = ['roam']; break;
        case 'gamma': quantity = 3; inteligence = ['roam', 'kamikaze']; break;
        case 'delta': quantity = 4; inteligence = ['roam', 'kamikaze', 'mimic']; break;
        case 'epsilon': quantity = 5; inteligence = ['roam', 'kamikaze', 'mimic']; break;
        default: break;
    }

    for (let i = 0; i < quantity; i++) {
        let skin_index = Math.floor(Math.random() * skins.length)
        let enemy = new Entity({ x: PLAYER.space_pos.x + 256, y: Math.floor(Math.random() * 20) + 30, z: -30 + i * 10 }, skins[skin_index][1], TEXTURES.enemy_shadow, TEXTURES.enemy_projectile, undefined, skins[skin_index][0])
        enemy.set_intelligence(...inteligence)
        enemy.mind.distance_from_player = Math.ceil(3 / (Math.ceil(PLAYER.space_pos.x / 5000)))
        enemies.push(enemy)
    }

    VIEW.add_entity(...enemies)
}

//handling keys
let PRESSED: string = ''

document.onkeydown = (e): number => {

    if (!ALLOW_MOVEMENT) { return 0 }

    if (!PRESSED.includes(e.code)) {
        PRESSED += e.code
        if (e.code == 'Escape') {
            pause()
        }
        if (e.code == 'Space') {
            start_game()
        }
    }
}

document.onkeyup = (e) => {

    PRESSED = PRESSED.replace(e.code, '')
}

window.onclick = () => {
    console.log('hey');

    if (PHONE_MOTION.isMobile) {
        start_game()
    }
}

//starting game
const start_game = () => {
    try {
        document.body.requestFullscreen()
    } catch (error) {
        console.log('element could not enter fullscreen');
    }
    THEME.play()
    let startscreen: HTMLDivElement = document.getElementById('start-screen') as HTMLDivElement
    if (startscreen) {
        PRESSED = ''
        startscreen.remove()
        VIEW.render(render_action)

        let generation = () => {
            return generate_desert_background(false, true, VIEW)
        }

        VIEW.set_background('#552500', generation)
        CANVAS.style.imageRendering = 'pixelated'

    }
}

//pausing
const pause = () => {

    let prompt = document.getElementById('pause')

    if (prompt == null) {
        THEME.pause()
        VIEW.stop_render()
        let pause = document.createElement('p')
        pause.id = 'pause'
        pause.innerHTML = 'PAUSED'
        document.body.append(pause)
    } else {
        THEME.play()
        prompt.remove()
        VIEW.render(render_action)
    }

}

//handle player dying
const player_death = (reviving: number): number => {

    if (PLAYER.space_pos.y > 10) { PLAYER.move(0, -1, 0) }
    else if (PLAYER.space_pos.y < 10) { PLAYER.move(0, 10 - PLAYER.space_pos.y, 0) }
    PRESSED = ''

    for (let el of VIEW.scene_children[1]) {
        if (el instanceof Explosion) {
            if (el.victims[0] == 'PLAYER' || el.victims[1] == 'PLAYER') {
                el.space_pos = PLAYER.space_pos
            }
        }
    }

    switch (reviving) {
        case 100:
            PLAYER.dead = true
            LIVES -= 1
            ALLOW_MOVEMENT = false
            break;
        case 50:
            VIEW.add_entity(PLAYER)
            PLAYER.texture = TEXTURES.explosion_shadow
            break;
        case 20:
            PLAYER.texture = TEXTURES.player
            ALLOW_MOVEMENT = true
            break;
        case 0:
            reviving = 101
            PLAYER.dead = false
        default:
            break;
    }

    reviving -= 1

    return reviving

}

//moves all enemies out of screen
const enemies_escape = (): void => {

    for (let entity of VIEW.scene_children[1]) {
        if (entity.name.includes('ENEMY')) {
            entity.move_out()
        }
    }

}

const render_action = (): void => {

    handle_control_panel(MESSAGE, PEOPLE_COLLECTED * 500 + PLAYER.murders * 600, PEOPLE_COLLECTED, LIVES, get_radar_positions(VIEW.scene_children[1], VIEW.renderer_xpos))

    let movement: [number, number, number] = [0, 0, 0]
    if (PLAYER.dead) { reviving = player_death(reviving) }

    //KEYS HANDLING
    if (PHONE_MOTION.isMobile) { movement = phone_movement() }

    //movement
    if (PLAYER.space_pos.y != 0) {
        if (PRESSED.includes('KeyD') && PLAYER.space_pos.z < 64) {
            movement[2] = 4
        }
        else if (PRESSED.includes('KeyA') && PLAYER.space_pos.z > -64) {
            movement[2] = -4
        }
    }
    if (PRESSED.includes('KeyS')) {
        if (PLAYER.space_pos.y >= 0 && PLAYER.space_pos.y < 48) {
            movement[1] = 2
        }
    }
    else if (PRESSED.includes('KeyW')) {
        if (PLAYER.space_pos.y > 0 && PLAYER.space_pos.y <= 48) {
            movement[1] = -2
        }
    }

    //shooting
    if (PRESSED.includes('Space')) {
        PRESSED = PRESSED.replace('Space', '')
        PLAYER.fire(true)
    }

    movement[0] = Math.floor(PLAYER.space_pos.y * SPEED / 16)

    if (movement[0] != 0 || movement[1] != 0 || movement[2] != 0) {
        PLAYER.move(movement[0], movement[1], movement[2])
        VIEW.move_rendering_space(movement[0])
    }

    //zoom out
    if (PRESSED.includes('KeyZ')) {
        if (PRESSED.includes('KeyO')) {
            CANVAS.width = 1152
            CANVAS.height = 690
        }
        else if (PRESSED.includes('KeyI')) {
            CANVAS.width = 384
            CANVAS.height = 230
        }
    }

    //change background
    if (PLAYER.space_pos.x > 8000 && PLAYER.space_pos.x < 8000 + CHUNK_WIDTH) {
        if (GENERATION_STEPS == 0) {
            VIEW.background_generation = () => { return generate_desert_background(true, false, VIEW) }
            GENERATION_STEPS++
        }
    }
    if (PLAYER.space_pos.x > 8000 + CHUNK_WIDTH && PLAYER.space_pos.x < 8000 + 2 * CHUNK_WIDTH) {
        if (GENERATION_STEPS == 1) {
            VIEW.background_generation = () => { return generate_desert_background(false, false, VIEW) }
            GENERATION_STEPS++
        }
    }
    if (PLAYER.space_pos.x > 12000 + CHUNK_WIDTH && PLAYER.space_pos.x < 12000 + 2 * CHUNK_WIDTH) {
        if (GENERATION_STEPS == 2) {
            let transition = new BiomesTransition({ x: VIEW.scene_children[0][VIEW.scene_children[0].length - 1].space_pos.x, y: 0, z: 0 }, '#00651a', VIEW)
            VIEW.scene_children[0].push(transition)
            VIEW.background_generation = () => { return generate_meadow_background(VIEW, true) }
            GENERATION_STEPS++
        }
    }
    if (PLAYER.space_pos.x > 12100 + CHUNK_WIDTH && PLAYER.space_pos.x < 12100 + 2 * CHUNK_WIDTH) {
        if (GENERATION_STEPS == 3) {
            VIEW.background_generation = () => { return generate_meadow_background(VIEW, false) }
            GENERATION_STEPS++
        }
    }
    if (PLAYER.space_pos.x > 12800 + CHUNK_WIDTH && PLAYER.space_pos.x < 12800 + 2 * CHUNK_WIDTH) {
        if (GENERATION_STEPS == 4) {
            VIEW.background_color = '#00651a'
            GENERATION_STEPS++
        }
    }
    if (PLAYER.space_pos.x > 24000 + CHUNK_WIDTH && PLAYER.space_pos.x < 24000 + 2 * CHUNK_WIDTH) {
        if (GENERATION_STEPS == 5) {
            let transition = new BiomesTransition({ x: VIEW.scene_children[0][VIEW.scene_children[0].length - 1].space_pos.x, y: 0, z: 0 }, '#163cf5', VIEW)
            VIEW.scene_children[0].push(transition)
            VIEW.background_generation = () => { return generate_ocean_background(VIEW) }
            GENERATION_STEPS++
        }
    }
    if (PLAYER.space_pos.x > 24700 + CHUNK_WIDTH && PLAYER.space_pos.x < 24700 + 2 * CHUNK_WIDTH) {
        if (GENERATION_STEPS == 6) {
            VIEW.background_color = '#163cf5'
        }
    }

    if (MSG_TIME > 0) { MSG_TIME-- }
    if (MSG_TIME == 0) { MESSAGE = '' }

    let current_wave: 'alpha' | 'beta' | 'gamma' | 'delta' | 'epsilon' = 'beta'
    if (PLAYER.space_pos.x > 5000) {
        current_wave = 'gamma'
    }
    if (PLAYER.space_pos.x > 7500) {
        current_wave = 'delta'
    }
    if (PLAYER.space_pos.x > 10000) {
        current_wave = 'epsilon'
    }

    if (VIEW.total_loops == 100) { new_wave('alpha') }
    if (VIEW.total_loops % 1024 == 0) { enemies_escape() }
    if (VIEW.total_loops % 1096 == 0) { new_wave(current_wave) }

    if (LIVES == 0) {
        THEME.pause()
        set_message('dead', 100)
        VIEW.stop_render()
        let ctx = CANVAS.getContext('2d')

        let dead = async () => {
            await wait(100)
            for (let i = 0; i < 32; i++) {
                await wait(10)
                ctx.fillStyle = '#000000'
                ctx.fillRect(0, i * (CANVAS.height / 32), CANVAS.width, CANVAS.height / 32)
            }
            blackout()
            await wait(200)
            let final_msg = 'Your final score was ' + (PEOPLE_COLLECTED * 500 + PLAYER.murders * 600)
            document.getElementById('end').innerHTML = 'GAMEOVER<br/>' + final_msg
        }
        dead()
    }

}

let wait = async (time: number) => {
    return new Promise((resolve) => {
        setTimeout(() => { resolve(true) }, time)
    })
}

export default render_action