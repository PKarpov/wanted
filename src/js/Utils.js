import {Sprite, utils} from "pixi.js";

export default class Utils {

    static shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    static newSprite(id, x0, y0, ax, ay, sx = 1, sy = 1) {
        const sprite = new Sprite(utils.TextureCache[id]);
        sprite.anchor.set(ax, ay);
        sprite.position.set(x0, y0);
        sprite.scale.set(sx, sy);
        return sprite;
    }

}
