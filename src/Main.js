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
        TWEEN.update();
	}
}

new Main();
