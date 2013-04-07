define([
        'config',
        'jquery',
        './AbstractSection',
        'hbs!templates/sections/mood',
        'inputController',
        'sectionController',
        'locationController',
        'widgets/FoldListItem',
        'mout/function/bind',
        'stageReference'
    ], function(config, $, AbstractSection, template, inputController, sectionController, locationController, FoldListItem, bind, stageReference){

        function MoodSection(){
            _super.constructor.call(this, 'mood', template);

            this.init();
            this._initVariables();
            this._initEvents();

        }

        var _super = AbstractSection.prototype;
        var _p = MoodSection.prototype = new AbstractSection();
        _p.constructor = MoodSection;

        var _transform3DStyle = config.transform3DStyle;
        var _filterStyle = config.filterStyle;

        var SHADER_PADDING = 40;

        function _initVariables(){
            var self = this;
            var i, len;

            // create a map table for nodeId = nodeName
            var itemData = this.data.items;
            var nodeNames = this.nodeNames = {};
            for(i = 0, len = itemData.length; i < len; i++) {
                nodeNames[itemData[i].id] = itemData[i].name;
            }

            this.moveContainers = this.container.find('.move-container');
            this.topContainer = this.moveContainers.filter('.top');
            this.bottomContainer = this.moveContainers.filter('.bottom');

            this.items = this.container.find('.mood-item');
            this.items.each(function(){
                this.foldListItem = new FoldListItem(this, _onItemPeek, _onItemOpen, SHADER_PADDING);
                inputController.add(this, 'click', bind(_onItemOpen, this.foldListItem));
                $(this).find('.num').html(locationController.getMatched('mood', $(this).data('id')).length);
            });
        }

        function _initEvents(){
        }

        function _onItemPeek(){
            sectionController.appearTarget(this.$elem.data('link'));
        }

        function _onItemOpen(){
            sectionController.goTo(this.$elem.data('link'));
        }

        function _addToMoveContainers(index){
            var items = this.items;
            for(var i = 0, len = items.length; i < len; i++) {
                if(i < index) {
                    // add to the top container;
                    this.topContainer.append(items[i]);
                } else if(i > index) {
                    // add to the bottom container;
                    this.bottomContainer.append(items[i]);
                }
            }
        }

        function _removeFromMoveContainers(index){
            this.items.detach();
            this.topContainer.after(this.items);
        }

        function show(currentNodes, previousSection, previousNodes){
            var self = this;
            this.container.show();
            stageReference.onResize.add(_onResize, this);
            this._onResize();
            if(previousNodes.length < 2) {
                self._setShown();
                this.items.each(function(i){
                    this.foldListItem.resetShader();
                });
            } else {
                var foundTarget;
                var nextNode = previousNodes[2];
                var foundId = this.items.length;
                while(foundId--) if($(foundTarget = this.items[foundId]).data('link').split('/')[2] === nextNode) break;
                var moveDistance = (this.items.length / 2 + Math.abs(this.items.length / 2 - (foundId+ 1))) * this.items.height();
                this._addToMoveContainers(foundId);
                foundTarget.foldListItem.updateSize();
                foundTarget.foldListItem.setTo(-stageReference.stageWidth * 1.2, stageReference.stageWidth);
                setTimeout(function(){
                    foundTarget.foldListItem.easeTo(0, stageReference.stageWidth, .5);
                }, 300);
                this.topContainer[0].style[_transform3DStyle] = 'translate3d(0,' + (- moveDistance) +  'px,0)';
                this.bottomContainer[0].style[_transform3DStyle] = 'translate3d(0,' + moveDistance +  'px,0)';
                EKTweener.to(this.moveContainers, .5, {transform3d: 'translate3d(0,0,0)', ease: 'easeOutSine'});
                setTimeout(function(){
                    self._removeFromMoveContainers();
                    self._setShown();
                }, 800);
            }
        }

        function hide(currentSection, currentNodes){
            var self = this;
            stageReference.onResize.remove(_onResize, this);
            if(currentNodes.length < 2) {
                self._setHidden();
            } else {
                var foundTarget;
                var nextNode = currentNodes[2];
                var foundId = this.items.length;
                while(foundId--) if($(foundTarget = this.items[foundId]).data('link').split('/')[2] === nextNode) break;
                var moveDistance = (this.items.length / 2 + Math.abs(this.items.length / 2 - (foundId+ 1))) * this.items.height();
                this._addToMoveContainers(foundId);
                foundTarget.foldListItem.updateSize();
                foundTarget.foldListItem.easeTo(-stageReference.stageWidth * 1.2, stageReference.stageWidth, .5);
                EKTweener.to(this.topContainer, .5, {delay: .3, transform3d: 'translate3d(0,' + (- moveDistance) +  'px,0)', ease: 'easeInSine'});
                EKTweener.to(this.bottomContainer, .5, {delay: .3, transform3d: 'translate3d(0,' + moveDistance +  'px,0)', ease: 'easeInSine'});
                setTimeout(function(){
                    self._removeFromMoveContainers();
                    //TODO add reset here
                    self._setHidden();
                }, 800);
            }
        }

        function getNodeName(nodeId){
            return this.nodeNames[nodeId];
        }

        function _onResize(){
            this.items.height(Math.ceil(this.container.height()/ this.items.length));
        }

        _p._initVariables = _initVariables;
        _p._initEvents = _initEvents;
        _p.show = show;
        _p.hide = hide;
        _p.getNodeName = getNodeName;
        _p._onResize = _onResize;

        _p._addToMoveContainers = _addToMoveContainers;
        _p._removeFromMoveContainers = _removeFromMoveContainers;



        return MoodSection;
    }
)
