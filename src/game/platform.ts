import { ALLOW_MOVEMENT } from "./action";
import { PLAYER } from "./main";

interface rotation { a: number, b: number, g: number }

interface motion {
    isMobile: boolean,
    orientation: string,
    rotations: rotation
    clicked: boolean,
    starting_rotation: rotation
}

export const PHONE_MOTION: motion = {
    isMobile: false,
    orientation: 'horizontal',
    rotations: { a: 0, b: 0, g: 0 },
    clicked: false,
    starting_rotation: { a: 0, b: 0, g: 0 }
}

export const set_platform = () => {

    const device = navigator.userAgent
    const regx = /android|iphone|kindle|ipad/i;
    const isMobile = regx.test(device)

    if (isMobile) {
        PHONE_MOTION.isMobile = true
        window.addEventListener('deviceorientation', manage_orientation);
        window.addEventListener('touchstart', () => { PHONE_MOTION.clicked = true })
        try {
            document.getElementById('start-screen').innerHTML = '<h1>PANTHER</h1><p style="margin-bottom:30%">by Oskar Marciniak<br/>use horizontal mode for the best experience<br/>click anywhere to continue</br>sound will play</br>IOS not supported</p>'
        } catch (error) {
            console.log('error');
        }
    }
}

const manage_orientation = (event: DeviceOrientationEvent) => {

    if (PHONE_MOTION.starting_rotation.a == 0 && PHONE_MOTION.starting_rotation.b == 0
        || Math.abs(PHONE_MOTION.starting_rotation.a - PHONE_MOTION.rotations.a) > 30
        || Math.abs(PHONE_MOTION.starting_rotation.b - PHONE_MOTION.rotations.b) > 30
        || Math.abs(PHONE_MOTION.starting_rotation.g - PHONE_MOTION.rotations.g) > 30) {
        PHONE_MOTION.starting_rotation = {
            a: event.alpha,
            b: event.beta,
            g: event.gamma
        }
    }

    PHONE_MOTION.rotations = {
        a: event.alpha,
        b: event.beta,
        g: event.gamma
    }

}

export const phone_movement = (): [number, number, number] => {

    if (!ALLOW_MOVEMENT) { return [0, 0, 0] }

    let y = Math.floor((PHONE_MOTION.starting_rotation.g - PHONE_MOTION.rotations.g) / 5) - 1
    let z = -Math.floor((PHONE_MOTION.starting_rotation.b - PHONE_MOTION.rotations.b) / 5)

    if (y < -3) { y = -3 }
    if (y > 3) { y = 3 }
    if (z < -3) { z = -3 }
    if (z > 3) { z = 3 }

    let movement: [number, number, number] = [
        0,
        y,
        z
    ]

    if (Math.abs(PLAYER.space_pos.z + movement[2]) > 64 || PLAYER.space_pos.y == 0) { movement[2] = 0 }
    if (PLAYER.space_pos.y + movement[1] > 48 || PLAYER.space_pos.y + movement[1] < 0) { movement[1] = 0 }

    if (PHONE_MOTION.clicked) {
        PLAYER.fire(true)
        PHONE_MOTION.clicked = false
    }

    return movement

}