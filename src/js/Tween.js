/* Tween
* Обертка для TWEEN.Tween
*
*     var t = new Tween(targetObj , to , duration , config);
*
* ПРЕИМУЩЕСТВА
*
* + СИНХРОН с delta времени игры
*
* + СОБЫТИЯ: "start", "stop", "update", "complete"
*      var t = new Tween( obj, {param: 100});
*      t.on( "complete", function(){console.log("COMPLETED")} )
*
* + АВТОСТАРТ
*
* + КОРОТКАЯ запись: // default duration 1000
*     new Tween( obj, {param: 100} );
*
* + УДОБНЫЙ config:
*     new Tween( obj, {param: 100}, 1000, {
*         easing: Tween.Easing.Quadratic.Out,
*         onComplete: completeHandler
*     });
*
* + ВЛОЖЕННЫЕ свойства:
*     new Tween( sprite, {x: 500, y: 500, scale: {x: 2, y: 2}}, 1000 );
*
* + Обработка МАССИВОВ и Относительных СТРОКОВЫХ значения
*     new Tween( obj, {x: ["+100", "+0"], y: ["+0", "+100"]}, 1000);
*
* + АНИМАТОР // Старт одной анимации для разных объектов
*     var animate = Tween.animator({alpha: 0.5, scale:{x:1.2, y:1.2}}, 1000, {repeat: Infinity, yoyo: true});
*     animate(sprite1); // старт анимации
*     animate(sprite2); // старт анимации
*
* + ПОДДЕРЖКА TWEEN.Tween синтаксиса (так тоже работает)
*     new Tween(Obj).to({x: 100, y:100}, 1000)
*         .start();
*
* // DEFAULTS
* config: {
*     autoStart: true, //<< по умолчанию стартует сразу
*     repeat: 0,
*     yoyo: false,
*     onStart: null,
*     onUpdate: null,
*     onStop: null,
*     onComplete: null,
*     easing: Tween.Easing.Linear.None,
*     interpolation: Tween.Interpolation.Linear
* }
*/

/**
 * @class
 * @description Создает экземпляр Tween
 * @param {Object} targetObj объект, свойства которого изменяет Tween.
 * @param {Object} to объект со свойствами для Tween (длительность задается отдельно).
 * @param {Number} [duration=1000] время (длительность) для изменения свойств (ms) | по умолчанию: 1000.
 * @param {Object} [config] объект со параметрами Tween, такие как autoStart, onStart, onUpdate, onComplete.
 */
function Tween(targetObj, to, duration, config) {
    TWEEN.Tween.call(this,
        targetObj,
        (config && config.group) ? config.group : Tween.scope);

    this._valuesTo = {};
    this._repeatTimes = 0;

    this.eventEmitter = new PIXI.utils.EventEmitter();
    this.eventsPrepare(config);

    this._linkedTweens = (config && config.linkedTweens) ? config.linkedTweens.concat() : [];
    if (to) {
        this.to(to, duration, config);
    }

    // MIMIC NATIVE BEHAVIOR
    for (var p in config) {
        if (typeof this[p] === 'function') {
            var args = config[p];
            if (!Array.isArray(args)) {args = [args];}
            this[p].apply(this, args);
        }
    }
    if (to === undefined) {return this}

    // AUTOSTART
    if (config && config.autoStart === false) {
        return this;
    }
    this.start(Tween._gameTime);
    return this;
}
Tween.prototype = Object.create(TWEEN.Tween.prototype);

// SYNC WITH TIME DELTA
Tween.scope = new TWEEN.Group();
Tween._gameTime = TWEEN.now();

// Tween.prototype.stop = function() {
//     TWEEN.Tween.prototype.stop.call(this);
//     this.stopAllChained();
// }
// Tween.prototype.stopAllChained = function(_rootTween) {
//     _rootTween = _rootTween || this;
//
//     for (var i = 0, numChainedTweens = this._chainedTweens.length; i < numChainedTweens; i++) {
//
//         if (this._chainedTweens[i] === _rootTween){continue;}
//
//         this._chainedTweens[i].stop();
//         this._chainedTweens[i].stopAllChained(_rootTween);
//     }
// }

Tween.prototype.start = function(time) {
    // YOYO RESTART FIX
    var to = Object.create(null);
    for (var p in this._valuesTo) {
        if (typeof this._valuesTo[p] === 'object'
            && !(this._valuesTo[p] instanceof Array))
            continue;
        to[p] = this._valuesTo[p]
    }

    // REPEAT RESTART FIX
    this.repeat(this._repeatTimes);

    // STRING PROP VALUES (RELATIVE BEHAVIOR)
    if (this._object) {this.ifToStrings(this._object, to);}
    // this.to( to, this._duration );
    TWEEN.Tween.prototype.to.call(this, to, this._duration);

    time = time || Tween._gameTime;

    // LINKED TWEENS
    for (var i=0; this._linkedTweens && i<this._linkedTweens.length; i++) {
        this._linkedTweens[i].start(time);
    }
    // MAIN TWEEN
    TWEEN.Tween.prototype.start.call(this, time);
    return this;
}

Tween.prototype.to = function(to, duration, config) {

    // DEEP PROPS
    for (var p in to) {
        if (!this._object[p]) {continue}
        if (Array.isArray(to[p])) {continue}

        if (typeof to[p] === "object") {
            var _config = Object.create(null);
            if (config) {
                for (var co in config) {
                    if (co === "onStart"
                        || co === "onStop"
                        || co === "onComplete"
                        || co === "onUpdate"
                        || co === "linkedTweens") {
                        continue
                    }
                    _config[co] = config[co];
                }
            }
            _config.autoStart = false;
            this._linkedTweens.push(new Tween(this._object[p], to[p], duration, _config));
            delete to[p];
        }
    }

    // YOYO RESTART HACK (not for arrays)
    if (Object.keys(to).length) {
        this._valuesTo = Object.create(null);
        for (var p in to) {this._valuesTo[p] = to[p]}
    }

    return TWEEN.Tween.prototype.to.call(this, to, duration);
}
Tween.prototype.repeat = function(times) {
    this._repeatTimes = times;
    return TWEEN.Tween.prototype.repeat.call(this, times);
}

Tween.update = function(delta){
    Tween._gameTime = (delta>=0) ? (Tween._gameTime + delta) : TWEEN.now();
    Tween.scope.update( Tween._gameTime );
};

Tween.prototype.ifToStrings = function(targetObj, to){
    if (!targetObj) {return}
    for (var p in to) {
        if (typeof targetObj[p] !== "number") {continue}
        var _last;
        if (Array.isArray(to[p])) {
            // IF ARRAY WITH STRING
            _last = targetObj[p];
            for (var i=0; i<to[p].length; i++) {
                to[p][i] = Tween._strToNum(_last, to[p][i]);
                _last = to[p][i];
            }
        } else {
            _last = targetObj[p];
            to[p] = Tween._strToNum(_last, to[p]);
        }
    }
};
Tween._strToNum = function(base, str) {
    if (typeof str !== "string") return str;
    base = base || 0;
    if (str.charAt(0) === '+' || str.charAt(0) === '-') {
        str = base + parseFloat(str);
    } else {
        str = parseFloat(str);
    }
    return str;
}

// EVENT EMITTER MIMIC
Tween.prototype.emit = function(event, a1,a2,a3,a4,a5) {
    this.eventEmitter.emit(event, a1,a2,a3,a4,a5);
    return this;
};
Tween.prototype.on = function(event, cb, context) {
    this.eventEmitter.on(event, cb, context);
    return this;
};
Tween.prototype.once = function(event, cb, context) {
    this.eventEmitter.once(event, cb, context);
    return this;
};
Tween.prototype.off = function(event, cb, context) {
    this.eventEmitter.off(event, cb, context);
    return this;
};

// TEST
// Tween.prototype.and = function(cb, context) {
//     this.eventEmitter.on("complete", cb, context);
//     return this;
// };

Tween.prototype.eventsPrepare = function(config){
    config = config || {};
    if (!config.onStart) this.onStart();
    if (!config.onStop) this.onStop();
    if (!config.onUpdate) this.onUpdate();
    if (!config.onComplete) this.onComplete();
};
Tween.prototype.cbEventHandler = function(cb, event){
    return function(o) {
        if (event === "stop") {
            for (var i=0; this._linkedTweens && i<this._linkedTweens.length; i++) {
                this._linkedTweens[i].stop();
            }
        }
        if(cb) cb(o);
        this.eventEmitter.emit(event, o);
    }
};
Tween.prototype.onStart = function(cb){
    var handler = this.cbEventHandler(cb, "start");
    TWEEN.Tween.prototype.onStart.call(this, handler);
    return this;
};
Tween.prototype.onStop = function(cb){
    var handler = this.cbEventHandler(cb, "stop");
    TWEEN.Tween.prototype.onStop.call(this, handler);
    return this;
};
Tween.prototype.onUpdate = function(cb){
    var handler = this.cbEventHandler(cb, "update");
    TWEEN.Tween.prototype.onUpdate.call(this, handler);
    return this;
};
Tween.prototype.onComplete = function(cb){
    var handler = this.cbEventHandler(cb, "complete");
    TWEEN.Tween.prototype.onComplete.call(this, handler);
    return this;
};

/**
 * Создает функцию-аниматор.
 * @static
 * @return {Function}
 * @param {Object} to
 * @param [Number} [duration=1000]
 * @param {Object} [config]
 */
Tween.animator = function(to, duration, config){
    config = config || {};
    config.autoStart = true;
    return function (targetObj) {
        targetObj = targetObj || this;
        return new Tween(targetObj, to, duration, config);
    }
};

/** Alias
 * * @see {Tween} */
Tween.create = function(targetObj, to, duration, config) {
    return new Tween(targetObj, to, duration, config);
};

/** Aliases
 * @see {TWEEN} */
Tween.E_ = Tween.Easing = TWEEN.Easing;
Tween.I_ = Tween.Interpolation = TWEEN.Interpolation;