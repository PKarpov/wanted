import {Texture, Container, Sprite, Loader, utils, Graphics} from 'pixi.js';
import Main from "../Main";

export default class Options extends Sprite{
    constructor(id) {
        super(Texture.EMPTY);
        this.textures = [];
        this.anchor.x = 0.5;
        const nn = 7;
        for (let i = 0; i < nn; i++) {
            this.textures.push(utils.TextureCache[id + "_" + i]);
        }
        Main.shuffle(this.textures);
        this.texture = this.textures[0];
    }
}
