import {Texture, Container, Sprite, Loader, utils, Graphics} from 'pixi.js';
import Options from './Options';
import Main from "../Main";

export default class Game extends Container{
    constructor() {
        super();
        this.y = -Main.height * 0.5;
        Loader.shared.add('hero', './assets/texture.json')
            .load(() => {
                this.ready = true;
                this.addChild(Main.newSprite('lamp', 0,0,0.5, 0));
                this.addChild(Main.newSprite('wall', 0,200,0.5, 0));
                this.addChild(Main.newSprite('wanted', 0,100,0.5, 0.5));

                let aa = "abcd".split("");
                this.options = [];
                let y0 = 200;
                while (aa.length){
                    const opt = this.addChild(new Options(aa.shift()));
                    this.options.push(opt);
                    y0 += 72;
                    opt.y = y0;
                }
            })
        // this.anchor.set(0.5);
        // this.position.set(100, Main.height * 0.5);
    }

    goTo(xy) {
        if (!this.ready) return;
    }
}
