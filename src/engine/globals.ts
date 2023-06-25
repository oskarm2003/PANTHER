import { Entity } from "./entities_objects"

//VARS
export interface pos3D {
    x: number,
    y: number,
    z: number
}

export interface pos2D {
    x: number,
    y: number
}

export interface backgroundObject {
    texture: HTMLImageElement,
    texture_dimensions: pos2D,
    lethal: boolean,
    animated: boolean,
    density: number
}

export let PLAYER: Entity

//sets player pos
export const set_player_global = (what: Entity): void => {
    PLAYER = what
}

//function returns the best index to append
export const add_by_order = (array: Array<number>, element: number): number => {

    if (array.length == 0) {
        return 0
    }

    let index = Math.floor(array.length / 2)

    while (true) {

        if (index == array.length - 1 && array[index] <= element) { break }
        if (index == 0 && array[index] > element) { break }

        if (array[index] > element) {
            index = Math.floor(index / 2)
            continue;
        }

        if (array[index + 1] < element) {
            index += Math.ceil(index / 2)
            continue;
        }

        break;
    }

    return index
}

//generates id with given length
export const generate_id = (length: number): string => {

    const chars = 'abcdefghijklmnoprstuwvxyz0123456789'
    let output: string = ''

    for (let i = 0; i < length; i++) {
        output += chars[Math.floor(Math.random() * chars.length)]
    }

    return output

}

//calculates distance between 2 points
export const calculate_distance = (A: pos3D, B: pos3D) => {

    return Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.z - A.z, 2))

}