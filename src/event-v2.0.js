/**
 * @description Event静态对象
 * @since 在v1.0基础上增加了 mouseenter & mouseleave 事件
 * @return {Object}
 * @version 2.0
 * @author 阿虫
 */
var EVENT = (function(){

    var Handler = {};
    
    // 比较两个节点的关系
    var elContains = function(target, related){
        try {
            return target.contains ? target != related && target.contains(related) : !!(target.compareDocumentPosition(related) & 16);
        } 
        catch (e) {
        }
    };
    // W3C浏览器
    if (document.addEventListener) {
    	/**
    	 * @description 添加事件监听
    	 * @param {Object} dom对象
    	 * @param {String} 事件名称
    	 * @param {Function} 事件监听函数
    	 * @example EVENT.add(element, "click", func);
    	 */
        Handler.add = function(element, eventType, handler){
            var addEvt = function(e){
                var targetEl = e.currentTarget, relatedEl = e.relatedTarget;
                
                if (!elContains(targetEl, relatedEl) && targetEl != relatedEl) {
                    var el = e.currentTarget;
                    if (Function.prototype.call) {
                        handler.call(el, e);
                    } else {
                        el._currentHandler = handler;
                        el._currentHandler(e);
                        el._currentHandler(null);
                    }
                }
            };
            // 为非IE添加 mouseenter & mouseleave 事件
            if (eventType == "mouseenter" || eventType == "mouseleave") {
                eventType = (eventType == "mouseenter") ? "mouseover" : "mouseout";
                element.addEventListener(eventType, addEvt, false);
            } else {
                element.addEventListener(eventType, handler, false);
            }
        };
        /**
    	 * @description 移除事件监听
    	 * @param {Object} dom对象
    	 * @param {String} 事件名称
    	 * @param {Function} 事件监听函数
    	 * @example EVENT.remove(element, "click", func);
    	 */
        Handler.remove = function(element, eventType, handler){
            element.removeEventListener(eventType, handler, false);
        };
        
    }
    // IE浏览器
    else if (document.attachEvent) {
        Handler.add = function(element, eventType, handler){
            if (Handler._find(element, eventType, handler) != -1) {
                return;
            }
            
            var wrappedHandler = function(e){
                if (!e) e = window.event;
                
                var event = {
                    _event: e,
                    type: e.type,
                    target: e.srcElement,
                    currentTarget: element,
                    relatedTarget: e.fromElement ? e.fromElement : e.toElement,
                    eventPhase: (e.srcElement == element) ? 2 : 3,
                    
                    clientX: e.clientX,
                    clientY: e.clientY,
                    screenX: e.screenX,
                    screenY: e.screenY,
                    
                    altKey: e.altKey,
                    ctrlKey: e.ctrlKey,
                    shiftKey: e.shiftKey,
                    charCode: e.keyCode,
                    stopPropagation: function(){
                        this._event.cancelBubble = true;
                    },
                    preventDefault: function(){
                        this._event.returnValue = false;
                    }
                };
                
                if (Function.prototype.call) {
                    handler.call(element, event);
                } else {
                    element._currentHandler = handler;
                    element._currentHandler(event);
                    element._currentHandler(null);
                }
            };
            
            element.attachEvent("on" + eventType, wrappedHandler);
            
            var h = {
                element: element,
                eventType: eventType,
                handler: handler,
                wrappedHandler: wrappedHandler
            };
            
            var d = element.document || element;
            var w = d.parentWindow;
            var id = Handler._uid();
            // 保存所有的事件监听
            if (!w._allHandlers) w._allHandlers = {};
            w._allHandlers[id] = h;
            // 保存dom元素上所有的事件监听
            if (!element._handlers) element._handlers = [];
            
            element._handlers.push(id);
            
            if (!w._onunloadHandlerRegistered) {
                w._onunloadHandlerRegistered = true;
                w.attachEvent("onunload", Handler._removeAllHandlers);
            }
        };
        
        Handler.remove = function(element, eventType, handler){
            var i = Handler._find(element, eventType, handler);
            if (i == -1) return;
            var d = element.document || element;
            var w = d.parentWindow;
            var handlerId = element._handlers[i];
            var h = w._allHandlers[handlerId];
            element.detachEvent("on" + eventType, h.wrappedHandler);
            element._handlers.splice(i, 1);
            delete w._allHandlers[handlerId];
        };
        
        Handler._find = function(element, eventType, handler){
            var handlers = element._handlers;
            if (!handlers) return -1;
            var d = element.document || element;
            var w = d.parentWindow;
            
            for (var i = handlers.length - 1; i >= 0; i--) {
                var handlerId = handlers[i];
                var h = w._allHandlers[handlerId];
                if (h.eventType == eventType && h.handler == handler) 
                    return i;
            }
            
            return -1;
        };
        
        Handler._removeAllHandlers = function(){
            var w = this;
            for (id in w._allHandlers) {
                var h = w._allHandlers[id];
                h.element.detachEvent("on" + h.eventType, h.wrappedHandler);
                delete w._allHandlers[id];
            }
        };
        
        Handler._counter = 0;
        Handler._uid = function(){
            return "h" + Handler._counter++;
        };
    }
    
   	return Handler;
    
})();
