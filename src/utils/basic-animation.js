define(["mobileui/utils/animation", "require",
        "mobileui/utils/timing-functions"], function(Animation, require, TimingFunctions) {

    var BasicAnimationState = function(time) {
        this.startTime = time;
        this.playDuration = 0;
        this.percent = 0;
        this.started = true;
    };

    var BasicAnimation = function(name) {
        Animation.call(this, name);
        this._duration = -1;
        this._next = null;
        this._timingFunction = TimingFunctions.linear;
    };

    _.extend(BasicAnimation.prototype, Backbone.Events, {
        compute: function(state, view) {
            var animationState = state.get(this._id);
            if (!animationState) {
                animationState = new BasicAnimationState(state.time);
                state.set(this._id, animationState);
                this._internalStart(state, view, animationState);
                this.trigger("start");
            }
            animationState.playDuration = state.time - animationState.startTime;
            if (this._duration >= 0) {
                animationState.percent = this._duration ? animationState.playDuration / this._duration : 1;
                if (animationState.percent >= 1) {
                    animationState.timingFunctionPercent = 1;
                    animationState.percent = 1;
                    state.remove(this._id);
                    animationState.started = false;
                } else {
                    animationState.timingFunctionPercent = this._timingFunction(animationState.percent, this._duration);
                }
            }
            this._internalCompute(state, view, animationState);
            if (!animationState.started)
                this.trigger("stop");
        },

        setTimingFunction: function(value) {
            if (_.isString(value))
                value = TimingFunctions[value];
            this._timingFunction = value;
            return this;
        },

        _internalStart: function(state, view, animationState) {
        },

        _internalCompute: function(state, view, animationState) {
            if (animationState.started)
                state.requestTimer(this._duration - animationState.playDuration);
        },

        setDuration: function(duration) {
            this._duration = duration;
            return this;
        },

        duration: function() {
            return this._duration;
        },

        setNext: function(nextAnimation) {
            this._next = nextAnimation;
            return this;
        },

        next: function() {
            return this._next;
        },

        wait: function(duration) {
            return this.setNext(new BasicAnimation("wait " + duration).setDuration(duration)).next();
        },

        log: function(message) {
            return this.setNext(new BasicAnimation("log " + message).setDuration(0).on("stop", function() {
                console.log("animation: ", message);
            })).next();
        },

        callback: function(callback) {
            return this.setNext(new BasicAnimation("callback").setDuration(0).on("stop", callback)).next();
        },

        transform: function(duration, startTransform, endTransform) {
            if (!endTransform) {
                endTransform = startTransform;
                startTransform = null;
            }
            var TransformAnimation = require("mobileui/utils/transform-animation");
            var transformAnimation = new TransformAnimation("transform");
            transformAnimation.getTransform().take(endTransform);
            if (startTransform)
                transformAnimation.startTransform().take(startTransform);
            return this.setNext(transformAnimation.setDuration(duration)).next();
        },

        opacity: function(duration, startOpacity, endOpacity) {
            if (endOpacity === undefined) {
                endOpacity = startOpacity;
                startOpacity = null;
            }
            var OpacityAnimation = require("mobileui/utils/opacity-animation");
            var opacityAnimation = new OpacityAnimation("opacity");
            opacityAnimation.setOpacity(endOpacity);
            if (startOpacity !== null)
                opacityAnimation.setStartOpacity(startOpacity);
            return this.setNext(opacityAnimation.setDuration(duration)).next();
        }
    });

    return BasicAnimation;
});