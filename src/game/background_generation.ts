import { CHUNK_WIDTH, CHUNK_HEIGHT, Plane, Wave } from "../engine/background_objects"
import { TEXTURES } from "./assets"
import { Decoration, Bunker } from "../engine/background_objects"
import View from "../engine/view"

let LAST_BUNKER: number = 0

const cacti = {
    texture: TEXTURES.cactus,
    texture_dimensions: { x: 8, y: 8 },
    animated: false,
    density: 24
}

const bushes = {
    texture: TEXTURES.bush,
    texture_dimensions: { x: 8, y: 8 },
    animated: false,
    density: 24
}

const stones = {
    texture: TEXTURES.desert_stones,
    texture_dimensions: { x: 8, y: 512 },
    animated: false,
    density: 32
}

const dirt = {
    texture: TEXTURES.dirt,
    texture_dimensions: { x: 8, y: 512 },
    animated: false,
    density: 128
}

const desert_bunkers = {
    texture: TEXTURES.desert_bunker,
    texture_dimensions: { x: 32, y: 16 },
    animated: false,
    density: 1
}
const meadow_bunkers = {
    texture: TEXTURES.meadow_bunker,
    texture_dimensions: { x: 32, y: 16 },
    animated: false,
    density: 1
}


const generate_desert_background = (rail_end: boolean, draw_road: boolean, view: View): Array<Decoration> => {//generate stones

    let chunk_children: Array<Decoration> = new Array();

    LAST_BUNKER++
    if (LAST_BUNKER > 16) { LAST_BUNKER = 0 }

    //generate stones
    for (let i = 0; i < CHUNK_WIDTH / stones.texture_dimensions.x; i++) {
        let z_noise = Math.random() * 10
        let stone = new Decoration(
            {
                x: (i * stones.texture_dimensions.x),
                y: -100,
                z: z_noise
            },
            stones.texture,
            stones.animated,
            stones.texture_dimensions.x
        )
        stone.parent = view
        chunk_children.push(stone)
        stone = new Decoration(
            {
                x: (i * stones.texture_dimensions.x) + (2 * CHUNK_WIDTH),
                y: -100,
                z: (-stones.texture_dimensions.y / 2) + z_noise
            },
            stones.texture,
            stones.animated,
            stones.texture_dimensions.x
        )
        stone.parent = view
        chunk_children.push(stone)
    }

    //generate cactuses
    for (let i = 0; i < (draw_road ? cacti.density : 64); i++) {
        let cactus = new Decoration(
            {
                x: Math.floor(Math.random() * CHUNK_WIDTH),
                y: 0,
                z: Math.floor(Math.random() * CHUNK_HEIGHT * 1.5) - CHUNK_HEIGHT / 1.25
            },
            cacti.texture,
            cacti.animated,
            cacti.texture_dimensions.x
        )

        if (draw_road && Math.abs(cactus.space_pos.z) > 20 || !draw_road) {
            view.killer_positions.push(cactus.space_pos)
            cactus.parent = view
            chunk_children.push(cactus)
        }
    }

    //generate bunker
    if (LAST_BUNKER == 16) {
        let spawn_bunker = Math.floor(Math.random() * 1)

        if (spawn_bunker == 0) {
            let bunker = new Bunker(
                {
                    x: Math.floor(Math.random() * CHUNK_WIDTH),
                    y: 0,
                    z: Math.floor(Math.random() * CHUNK_HEIGHT / 2) - CHUNK_HEIGHT / 4
                },
                desert_bunkers.texture,
                desert_bunkers.texture_dimensions.x
            )

            if (draw_road && Math.abs(bunker.space_pos.z) > 20 || !draw_road) {
                bunker.parent = view
                chunk_children.push(bunker)
            }
        }
    }

    //generate pumps
    let chances = Math.floor(Math.random() * 3)
    if (chances == 0) {
        let pump = new Decoration(
            {
                x: Math.floor(Math.random() * CHUNK_WIDTH),
                y: 0,
                z: Math.floor(Math.random() * CHUNK_HEIGHT / 2) - CHUNK_HEIGHT / 4
            },
            TEXTURES.pump, true, 32
        )

        if (draw_road && Math.abs(pump.space_pos.z) > 20 || !draw_road) {
            view.killer_positions.push(pump.space_pos)
            pump.parent = view
            chunk_children.push(pump)
        }
    }

    //rails generate
    if (draw_road) {
        let rails_txt = TEXTURES.rails
        for (let i = 0; i < CHUNK_WIDTH / rails_txt.width; i++) {

            let rails = new Decoration({
                x: i * rails_txt.width,
                y: 0,
                z: 0
            }, rails_txt, false, rails_txt.width)
            rails.parent = view
            chunk_children.push(rails)
        }

        let pole = new Decoration({ x: 0, y: 0, z: -20 }, TEXTURES.pole, false, TEXTURES.pole.width)
        pole.parent = view
        chunk_children.push(pole)
    }

    if (rail_end) {
        let railend = new Decoration({ x: 8, y: 0, z: 2 }, TEXTURES.rail_end, false, TEXTURES.rail_end.width)
        railend.parent = view
        chunk_children.push(railend)
    }

    return chunk_children

}

let background_green_plane: Plane

const generate_meadow_background = (view: View, starting_chunk: boolean) => {

    let chunk_children = new Array()
    let reserved_x = null

    LAST_BUNKER++
    if (LAST_BUNKER > 16) { LAST_BUNKER = 0 }

    // //if first of type
    if (starting_chunk) {
        let piece_of_dirt = new Decoration(
            {
                x: (stones.texture_dimensions.x),
                y: -100,
                z: 0
            },
            dirt.texture,
            dirt.animated,
            dirt.texture_dimensions.x
        )
        piece_of_dirt.parent = view
        chunk_children.push(piece_of_dirt)
        let piece_of_dirt2 = new Decoration(
            {
                x: (-2 * stones.texture_dimensions.x),
                y: -100,
                z: (-stones.texture_dimensions.y / 2)
            },
            dirt.texture,
            dirt.animated,
            dirt.texture_dimensions.x
        )
        piece_of_dirt2.parent = view
        chunk_children.push(piece_of_dirt2)
    }

    if (background_green_plane instanceof Plane) {
        background_green_plane.space_pos.x += 128
        background_green_plane.translate_self()
    }

    //generate dirt
    for (let i = 0; i < CHUNK_WIDTH / dirt.texture_dimensions.x; i++) {
        let z_noise = Math.random() * 10
        let piece_of_dirt = new Decoration(
            {
                x: (i * stones.texture_dimensions.x),
                y: -100,
                z: z_noise
            },
            dirt.texture,
            dirt.animated,
            dirt.texture_dimensions.x
        )
        piece_of_dirt.parent = view
        chunk_children.push(piece_of_dirt)
        let piece_of_dirt2 = new Decoration(
            {
                x: (i * stones.texture_dimensions.x) + (2 * CHUNK_WIDTH),
                y: -100,
                z: (-stones.texture_dimensions.y / 2) + z_noise
            },
            dirt.texture,
            dirt.animated,
            dirt.texture_dimensions.x
        )
        piece_of_dirt2.parent = view
        chunk_children.push(piece_of_dirt2)
    }

    //generate additional roads
    let skew_road_generate = Math.floor(Math.random() * 3)
    if (skew_road_generate == 0) {
        let x = Math.floor(Math.random() * CHUNK_WIDTH / 2) + 30
        reserved_x = x
        let direction = Math.floor(Math.random() * 2 - 1) == 0 ? 1 : -1
        let checked_z = Math.floor(Math.random() * 5 + 6)
        for (let z = 1; z < CHUNK_WIDTH / 4; z++) {
            if (z == checked_z) {
                let chances: number = Math.floor(Math.random() * 4)
                if (chances == 0) {
                    let ruin = new Decoration({ x: x + 2, y: 0, z: 8 * (z + 1) * direction }, Math.floor(Math.random() * 2) == 0 ? TEXTURES.ruin1 : TEXTURES.ruin2, false, 32)
                    ruin.parent = view
                    chunk_children.push(ruin)
                    break;
                }
            }
            let position = { x: x, y: 0, z: 8 * z * direction }
            let road_skew = new Decoration(position, TEXTURES.road_skew, false, 16)
            road_skew.parent = view
            chunk_children.push(road_skew)
        }
    }

    //generate road
    let road_txt = TEXTURES.road
    for (let i = starting_chunk ? 2 : 0; i < CHUNK_WIDTH / road_txt.width; i++) {

        let road = new Decoration({
            x: i * road_txt.width,
            y: 0,
            z: 0
        }, road_txt, false, road_txt.width)
        road.parent = view
        chunk_children.push(road)
    }

    //generate bushes
    for (let i = 0; i < cacti.density; i++) {
        let bush = new Decoration(
            {
                x: Math.floor(Math.random() * CHUNK_WIDTH),
                y: 0,
                z: Math.floor(Math.random() * CHUNK_HEIGHT * 1.5) - CHUNK_HEIGHT / 1.25
            },
            bushes.texture,
            bushes.animated,
            bushes.texture_dimensions.x
        )

        let distance_from_reserved_x = Math.abs(bush.space_pos.x - reserved_x)

        if (Math.abs(bush.space_pos.z) > 20 && distance_from_reserved_x > 20) {
            view.killer_positions.push(bush.space_pos)
            bush.parent = view
            chunk_children.push(bush)
        }
    }

    //generate bunker
    if (LAST_BUNKER == 16) {
        let spawn_bunker = Math.floor(Math.random() * 1)

        if (spawn_bunker == 0) {
            let bunker = new Bunker(
                {
                    x: Math.floor(Math.random() * CHUNK_WIDTH),
                    y: 0,
                    z: Math.floor(Math.random() * CHUNK_HEIGHT / 2) - CHUNK_HEIGHT / 4
                },
                meadow_bunkers.texture,
                meadow_bunkers.texture_dimensions.x
            )

            let distance_from_reserved_x = Math.abs(bunker.space_pos.x - reserved_x)

            if (Math.abs(bunker.space_pos.z) > 20 && distance_from_reserved_x > 20) {
                bunker.parent = view
                chunk_children.push(bunker)
            }
        }
    }

    if (starting_chunk) {
        for (let z = -CHUNK_HEIGHT / 2; z < CHUNK_HEIGHT / 4; z++) {
            let position = { x: 24, y: 0, z: 8 * z }
            let road_skew = new Decoration(position, TEXTURES.road_skew, false, 16)
            road_skew.parent = view
            chunk_children.push(road_skew)
        }
    }

    return chunk_children
}

const generate_ocean_background = (view: View) => {
    let chunk_children: Array<Decoration> = new Array()

    for (let i = 0; i < 32; i++) {
        let wave = new Wave(
            { x: Math.floor(Math.random() * CHUNK_WIDTH), y: 0, z: Math.floor(Math.random() * CHUNK_HEIGHT * 2 - CHUNK_HEIGHT) }, TEXTURES.wave, Math.floor(Math.random() * 32 + 8)
        )
        wave.parent = view
        chunk_children.push(wave)
    }

    return chunk_children
}

export { generate_desert_background, generate_meadow_background, generate_ocean_background }