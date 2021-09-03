import { Container, Application, utils, Sprite } from 'pixi.js';
import Game from "./js/Game";

export default class Main {
	constructor() {
		Main.width = 800;
		Main.height = 800;
		Main.tick = 'tick';
		Main.click = 'click';
        Main.observer = new utils.EventEmitter();
        const app = new Application({width: Main.width, height: Main.height, backgroundColor: 0x000000});
		document.body.appendChild(app.view);
		document.addEventListener('click', this.clickListener.bind(this));
		app.ticker.add(this.update, this);
		this.main = app.stage.addChild(new Container());
		this.main.position.set(Main.width * 0.5, Main.height * 0.5);
		this.game = this.main.addChild(new Game());
	}

	clickListener(e) {
		const xy = this.main.toLocal({x: e.layerX, y: e.layerY});
	}

	update(dt) {
	}

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

new Main();
