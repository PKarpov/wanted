import {Texture, Container, Sprite, Loader, utils, Graphics} from 'pixi.js';
import Utils from "./Utils";

export default class Options extends Sprite{
    constructor(id) {
        super(Texture.EMPTY);
        this.textures = [];
        this.anchor.x = 0.5;
        const nn = 7;
        for (let i = 0; i < nn; i++) {
            this.textures.push(utils.TextureCache[id + "_" + i]);
        }
        Utils.shuffle(this.textures);
        this.second = this.addChild(new Sprite(Texture.EMPTY));
        this.second.anchor.x = 0.5;
        this.getNeighbors(0);
        this.on('pointerdown', this.pointerTap, this)
            .on('pointerup', this.pointerTap, this)
            .on('pointerupoutside', this.pointerTap, this)
            .interactive = true;
    }

    pointerTap (e) {
        // if (e && e.data && e.data.originalEvent && e.data.originalEvent.touches && e.data.originalEvent.touches.length > 1) return;
        if (e.type === "pointerdown") {
            if(this.drag) return;
            // this.xy_old = e.data.global;
            this.old_x = e.data.global.x;
            this.old = Math.sign(0);
            this.on("pointermove", this.pointerMove, this);
            this.drag = true;
        } else {
            if (this.fly || this.x === 0) return;
            this.fly = true;
            this.off("pointermove", this.pointerMove, this);
            let xx;
            let dd = 500;
            if (Math.abs(this.x) < 70) {
                xx = 0;
                dd = 100;
            } else {
                const nn = Math.sign(this.x)
                xx = nn * 300;
                this.id = nn > 0 ? this.left : this.right;
            }
            new TWEEN.Tween(this)
                .to({x:xx}, dd)
                .onComplete((o)=>{
                    this.getNeighbors(this.id);
                })
                .easing(TWEEN.Easing.Cubic.Out)
                .start();
        }
    };

    getNeighbors(id) {
        this.texture = this.textures[id];
        this.x = 0;
        this.second.texture = Texture.EMPTY;
        this.id = id;
        this.right = id > 0 ? id - 1 : this.textures.length - 1;
        this.left = ++id < this.textures.length ? id : 0;
        this.drag = false;
        this.fly = false;
    }

    pointerMove (e) {
        this.x = e.data.global.x - this.old_x;
        const n = Math.sign(this.x);
        if (Math.abs(this.x)>70) {
            this.pointerTap({type: 'pointerup'}, true);
        }
        if (n != this.old) {
            if (n > 0) {
                this.second.texture = this.textures[this.left];
                this.second.x = -300;
            } else if (n < 0) {
                this.second.texture = this.textures[this.right];
                this.second.x = 300;
            }
            this.old = n;
        }
    }

}
