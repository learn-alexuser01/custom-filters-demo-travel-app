define([
        './Shader',
        'mout/object/mixIn'
    ], function(Shader, mixIn){

        function Tear(params){
            _super.constructor.call(this, DEFAULT_OPTS, mixIn({}, DEFAULT_PARAMS, params), getStyle);
        }

        var _super = Shader.prototype;
        var _p = Tear.prototype = new Shader();
        _p.constructor = Tear;

        var DEFAULT_OPTS = {
            blendMode: 'overlay source-atop',
            fragUrl: 'assets/shaders/tear.frag',
            vertUrl: 'assets/shaders/tear.vert',
            detached: true,
            segX: 1,
            segY: 1
        };

        var DEFAULT_PARAMS = {
            distance: 0,
            lightIntensity: .5,
            padding: 20,
            margin: 20,
            down: 0,
            isVertical: 0
        };

        function getStyle(opts) {
            var params = this.params;
            var segRatio =  1 / (params.isVertical ? this._opts.segY : this._opts.segX) / params.padding;
            return this.header +
            ', distance ' + (params.distance / (params.isVertical ? params.height : params.width)).toFixed(6) +
            ', lightIntensity ' + params.lightIntensity.toFixed(6) +
            ', padding ' + (params.padding * segRatio).toFixed(6) +
            ', margin ' + (params.margin * segRatio).toFixed(6) +
            ', isVertical ' + (params.isVertical ? 1 : 0) +
            ')';
        }

        _p.getStyle = getStyle;

        return Tear;

    }
);