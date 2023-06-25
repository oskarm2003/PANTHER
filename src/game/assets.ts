//TEXTURES images
const TEXTURES = {
    player: new Image(),
    player_shadow: new Image(),
    player_projectile: new Image(),
    enemy_green: new Image(),
    enemy_bend_green: new Image(),
    enemy_purple: new Image(),
    enemy_bend_purple: new Image(),
    enemy_violet: new Image(),
    enemy_bend_violet: new Image(),
    enemy_red: new Image(),
    enemy_bend_red: new Image(),
    enemy_yellow: new Image(),
    enemy_bend_yellow: new Image(),
    enemy_pink: new Image(),
    enemy_bend_pink: new Image(),
    enemy_shadow: new Image(),
    enemy_projectile: new Image(),
    explosion: new Image(),
    explosion_shadow: new Image(),
    cactus: new Image(),
    desert_stones: new Image(),
    desert_bunker: new Image(),
    person_waiting: new Image(),
    person_walking: new Image(),
    rails: new Image(),
    pole: new Image(),
    pump: new Image(),
    rail_end: new Image(),
    bush: new Image(),
    dirt: new Image(),
    meadow_bunker: new Image(),
    road: new Image(),
    road_skew: new Image(),
    ruin1: new Image(),
    ruin2: new Image(),
    wave: new Image(),
    control_panel: new Image()
}

const THEME = new Audio('./assets/audio/main.mp3')
THEME.volume = 0.2
THEME.addEventListener("canplaythrough", (event) => {
    THEME.play();
});

//asign src to each image in TEXTURES
for (const [key, value] of Object.entries(TEXTURES)) {
    value.src = './assets/spritesheets/' + key + '.png'
}

// const FONT = new FontFace('ATARI', 'url(../assets/fonts/atari.ttf)')

export { TEXTURES, THEME }