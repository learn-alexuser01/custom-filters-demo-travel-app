/*
 * Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

define(["mobileui/views/content-view",
        "mobileui/views/scroll-view",
        "mobileui/views/layout-view",
        "mobileui/views/layer-view",
        "views/app-card-view",
        "data/locations",
        "app"],
    function(ContentView,
            ScrollView,
            LayoutView,
            LayerView,
            AppCardView,
            LocationLabels,
            app) {

    var imagePaddingHeight = 50;

    var LocationView = AppCardView.extend({
        initialize: function(options) {
            LocationView.__super__.initialize.call(this);

            this._scrollView = new ScrollView().setScrollDirection("vertical");
            this._scrollView.matchParentSize();
            this.append(this._scrollView.render());

            this._contentView = new LayoutView().setLayout("vertical");
            this._contentView.ensureParams().matchParentWidth().matchChildrenHeight();
            this._contentView.margin().setTop(imagePaddingHeight);
            this._scrollView.setContentView(this._contentView.render());

            this._labelView = new ContentView()
                .addClass("js-location-view-label");
            this._labelView.ensureParams().matchParentWidth().matchHeightOf(this._scrollView);
            this._contentView.append(this._labelView.render());

            if (options && options.path) {
                var decodedPath = decodeURIComponent(options.path);
                this.model = LocationLabels.find(function(item) {
                    return item.get("label") == decodedPath;
                });
            }
            if (!this.model)
                this.model = LocationLabels.first();
            this._labelView.setTextContent(this.model.get("label"));

            // Append the picture view first, so that it displays under
            // the content of our card when it is scrolled.
            this._pictureScrollView = new ScrollView().setScrollDirection("horizontal");
            this._pictureScrollView.ensureParams().matchParentWidth();
            this._pictureScrollView.bounds().setHeight(imagePaddingHeight);
            this._scrollView.before(this._pictureScrollView.render(), this._contentView);

            this._pictureView =  new LayoutView().setLayout("horizontal");
            this._pictureView.ensureParams().matchChildrenWidth().matchParentHeight();
            this._pictureScrollView.setContentView(this._pictureView.render());

            var colors = ["DeepSkyBlue", "PaleVioletRed", "MediumSlateBlue", "DarkSeaGreen", "BurlyWood"];
            for (var i = 0; i < colors.length; ++i) {
                var picture = new LayerView();
                picture.ensureParams().matchWidthOf(this._pictureScrollView).matchParentHeight();
                picture.$el.css("background-color", colors[i]);
                this._pictureView.append(picture.render());
            }
        },

        render: function() {
            this.$el.addClass("js-location-view");

            return LocationView.__super__.render.call(this);
        },

        url: function() {
            return "card/" + encodeURIComponent("Location View") + "/" + encodeURIComponent(this.model.get("label"));
        }
    });

    return {
        label: "Location View",
        view: LocationView
    };

});