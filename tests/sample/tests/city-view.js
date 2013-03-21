define(["mobileui/ui/navigator-card-view",
        "mobileui/ui/list-view",
        "mobileui/views/gesture-detector",
        "mobileui/views/layout-params",
        "mobileui/views/gesture-view",
        "mobileui/utils/transform",
        "mobileui/utils/momentum",
        "app"],
    function(NavigatorCardView, ListView, GestureDetector, LayoutParams, GestureView, Transform, Momentum, app) {

    var CityLabels = [
        {
            label: "Mood",
            className: "js-mood-item-view"
        },
        {
            label: "Location",
            className: "js-location-item-view"
        },
        {
            label: "Search",
            className: "js-search-item-view"
        }
    ];

    var ItemView = GestureView.extend({
        initialize: function() {
            ItemView.__super__.initialize.call(this);
            this.on("tapend", this._onTapEnd, this)
                .on("tapstart", this._onTapStart, this)
                .on("touchdragstart", this._onDragStart, this)
                .on("touchdragmove", this._onDragMove, this)
                .on("touchdragend", this._onDragEnd, this);
            this.setHorizontalLayout();
            this.listenTo(this.model, "change:label", this._onLabelChanged);
            this.$labelEl = $("<div />").addClass("js-city-item-view-label");
            this._dragStartValue = 0;
            this._momentum = new Momentum().setDuration(100);
        },

        render: function() {
            ItemView.__super__.render.call(this);
            this.$el.addClass("js-city-item-view")
                .addClass(this.model.get("className"))
                .append(this.$labelEl);
            this._onLabelChanged();
            return this;
        },

        _onLabelChanged: function() {
            this.$labelEl.text(this.model.get("label"));
        },

        _onTapStart: function() {
            app.mainView.navigatorView().prepareNextCard(app.mainView.lookupCard("Mood View"));
            // this.animation().start().get("slide").chain().opacity(200, 0.5);
        },

        _onDragStart: function() {
            this._momentum.reset();
            var translate = this.transform().get("translate");
            this._dragStartValue = this._verticalLayout ? 
                translate.x() : translate.y();
            this.animation().removeAll();
        },

        _onDragMove: function(transform) {
            var translate = this.transform().get("translate");
            var value;
            if (this._verticalLayout) {
                value = Math.max(0, this._dragStartValue + transform.dragX);
                translate.setX(value);
            } else {
                value = Math.max(0, this._dragStartValue + transform.dragY);
                translate.setY(value);
            }
            this._momentum.injectValue(value);
        },

        _revert: function() {
            var self = this,
                transform = new Transform();
            this.animation().start().get("slide-transform")
                .chain()
                .transform(100, transform)
                .callback(function() {
                    app.mainView.navigatorView().revertNextCard();
                });
            this.animation().get("slide")
                .chain()
                .opacity(100, 1);
        },

        _onDragEnd: function() {
            if (this._momentum.compute() < (this._verticalLayout ? this.bounds().width() : this.bounds().height()) / 3)
                return this._revert();
            var self = this,
                transform = new Transform();
            if (this._verticalLayout)
                transform.translate(this.bounds().width(), 0);
            else
                transform.translate(0, this.bounds().height());
            this.animation().start().get("slide-transform")
                .chain()
                .transform(200, transform)
                .callback(function() {
                    self.transform().clear();
                    self._onTap();
                });
            this.animation().get("slide")
                .chain()
                .opacity(200, 0);
        },

        _onTap: function() {
            this.animation().get("slide").removeAll();
            this.setOpacity(1);
            app.mainView.navigatorView().commitNextCard();
        },

        respondsToTouchGesture: function(gesture) {
            if (gesture.type != GestureDetector.GestureType.DRAG)
                return false;
            return (this._verticalLayout && gesture.scrollX) ||
                (!this._verticalLayout && gesture.scrollY);
        },

        setVerticalLayout: function() {
            this._verticalLayout = true;
            this.setParams(new LayoutParams().fillParentHeight().matchParentWidth());
        },

        setHorizontalLayout: function() {
            this._verticalLayout = false;
            this.setParams(new LayoutParams().fillParentWidth().matchParentHeight());
        }
    });

    var CityView = NavigatorCardView.extend({

        initialize: function(options) {
            CityView.__super__.initialize.call(this);
            this.model = new Backbone.Collection();
            this.model.add(_.map(CityLabels, function(item) {
                return new Backbone.Model(item);
            }));
            this._listView = new ListView().matchParentSize()
                .setItemRendererFactory(this._onItemRendererFactory.bind(this))
                .setCollection(this.model)
                .setScrollDirection("none");
            this._listView.contentView().matchParentSize();
            this.append(this._listView.render());
            this._useVerticalLayout = null;
        },

        render: function() {
            this.$el.addClass("js-city-view");
            return CityView.__super__.render.call(this);
        },

        _onItemRendererFactory: function(model) {
            return new ItemView({model: model}).render();
        },

        setUseVerticalLayout: function(useVerticalLayout) {
            if (this._useVerticalLayout == useVerticalLayout)
                return;
            if (useVerticalLayout)
                this.setVerticalLayout();
            else
                this.setHorizontalLayout();
        },

        layout: function() {
            this.layoutBounds();
            var shouldUseVerticalLayout = this.bounds().width() < 550;
            this.setUseVerticalLayout(shouldUseVerticalLayout);
            CityView.__super__.layout.call(this);
        },

        setVerticalLayout: function() {
            this._useVerticalLayout = true;
            var self = this;
            this.model.each(function(model) {
                var view = self._listView.itemView(model);
                if (!view)
                    return;
                view.setVerticalLayout();
            });
            this._listView.contentView().setLayout("vertical");
        },

        setHorizontalLayout: function() {
            this._useVerticalLayout = false;
            var self = this;
            this.model.each(function(model) {
                var view = self._listView.itemView(model);
                if (!view)
                    return;
                view.setHorizontalLayout();
            });
            this._listView.contentView().setLayout("horizontal");
        }

    });

    return {
        label: "City View",
        view: CityView
    };

});