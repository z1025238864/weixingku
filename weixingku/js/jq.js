
(function(window,document,undefined){
    if(!document.getElementsByClassName){
        //将undefined 取反，能进来的一定是IE低版本。
        document.getElementsByClassName = function(eleClasssName){
            var aEle = document.getElementsByTagName('*'),//通配符获取所有标签名
                reg  = new RegExp("\\b"+ClassName+"\\B"),
                arrEle = [];
                
                for (var i = 0, len =  aEle.length; i < len; i++) {
                    if(reg.test(aEle[i].className)){
                        arrEle.push(aEle[i])//为true时表示当前元素符合条件，放入数组
                    }
                    
                }
                return arrEle;
        }
    }

    //去空格
    if(!String.prototype.trim){
        String.prototype.trim = function(){
            return this.replace(/(^\s+)|(\s+$)/g,'')
        }
    }

    //阻止默认行为的兼容
    if(!Event.prototype.preventDefault){
        //低版本ie
        Event.prototype.preventDefault = function(){
            window.event.returnValue = false;//阻止默认行为
        }
    }
    //阻止冒泡的兼容
    if(!Event.prototype.stopPropagation){
        //低版本ie
        Event.prototype.stopPropagation = function(){
            window.event.cancleBubble = true;//阻止默认行为
        }
    }
    
    //将添加到dom身上的事件存储起来的方法
    function _addEventFn(data){
        /* dom 节点 type事件数组 fn事件函数*/
        //之前从未绑定过任何事件
        if(typeof data.dom.events === 'undefined'){
            data.dom.events = {};
        }
        //之前没有绑定过同类型事件
        if(typeof data.dom.events[data.type[0]] === 'undefined'){
            data.dom.events[data.type[0]] = {};
            data.dom.events[data.type[0]].anonymous = [];
            //判断初始情况。给对应的值，方便后续的存储    
        }
        //判断有没有自定义事件的名字 存事件函数
        if(data.type[1] === undefined){
            //如果没有就存储到anonymous属性对应的数组中
            data.dom.events[data.type[0]].anonymous.push(data.fn)
        }else{
            data.dom.events[data.type[0]][data.type[1]] = data.fn
        }


    }
    
    //兼容removeEventListener
    function _removeEvent(dom,type,fn,bool){
        if(dom.removeEventListener){
            dom.removeEventListener(type,fn,!!bool)
            
        }else{
            dom.detachEvent("on" + type,fn)
            
        }
    }

    //工具类
    function dudu(selector){
        return new dudu.prototype.init(selector)
    }

    dudu.prototype = {
        constructor : dudu,
        init : function (selector){
            /* 初始化获取元素/包装元素，返回对象*/
            var arr = null,
                obj = {
                    id: function (select) {
                        var dom = document.getElementById(select.slice(1))
                        
                        return dom === null ? [] : [dom];
                    },
                    className: function (select) {
                        return document.getElementsByClassName(select.slice(1))
                    },
                    tag: function (select) {
                        return document.getElementsByTagName(select)
                    },
                    html: function (select) {
                        //创建元素
                        var div = document.body.innerHTML = document.createElement('div')
                        div.innerHTML = select
                        return div.children

                    },
                    css3: function (select) {
                        return document.querySelectorAll(select)
                    }
                };
            //判断参数
            if (typeof selector === 'string') {
                //进来的是选择条件
                selector = selector.trim();//去掉首尾空格
                function isSelector(str) {
                    //str就是选择条件的字符串
                    if (/^</.test(str)) {
                        //以尖括号开头的一定是创建标签
                        return 'html'
                    } else if (/[+~>\s]/.test(str)) {
                        //css3选择器
                        return 'css3';
                    } else if (/^\./.test(str)) {
                        //单个类名获取
                        return 'className';
                    } else if (/^\#/.test(str)) {
                        return 'id';
                    } else if (/^\w+$/.test(str)) {
                        return 'tag';
                    }

                } 
                  
                arr = obj[isSelector(selector)](selector);
               
               
            } else if (typeof selector === 'object') {
                //进来的就是节点
                arr = [selector];
            }

            // for(let i = 0, len = arr.length;i < len ;i++){
            //     this[i] = arr[i];
            // }
            dudu.each(arr,function(v,i){
                this[i] = v
                //修改this为实例对象
              
                
            }, this)
            this.length = arr.length;
        },
        on : function(eventType,fn){
            if(typeof eventType !== "string")return;
            var arr = eventType.trim().split(/\s+/);
            for(var i = 0, len = this.length; i < len; i++){
                (function(i,that){
                    //that当前jq对象中的元素
                    for(var j = 0,len = arr.length; j < len; j ++){
                        var type = arr[j].split(/\./),
                            eventFnName = null;
                        if(type[0] === "mousewheel"){
                            //需要判断火狐及其其他浏览器的事件
                            function _eventWheelFn(e){
                                e = e || window.event;
                                //对方向值做处理，正数：往上往外，负数：往下，往内
                                var dir = e.wheelDelta / 120 || -e.detail / 3;
                                fn.call(that,e,dir) === false && e.preventDefault();
                            }
                            type[0] = (that.onmousewheel === null ) ? 'mousewheel' : 'DOMMouseScroll';
                            
                            eventFnName = _eventWheelFn;
                            // that.addEventListener ? dom.addEventrListener(type[0],fn) :
                            // that.attachEvent('on' + type[0], fn);
                           
                            

                        }else{
                            //真正的事件函数
                            function _eventFn(e){
                                e = e || window.event;
                                // if(fn.call(that, e) === false){
                                //     e.preventDefault()
                                // }
                                fn.call(that,e) === false && e.preventDefault();
                            }

                            eventFnName = _eventFn;

                            // that.addEventListener ?
                            // that.addEventListener(type[0],_eventFn,false) :
                            // that.attachEvent('on' + type[0],_eventFn);
                        }
                        that.addEventListener ?
                        that.addEventListener(type[0],eventFnName,false) :
                        that.attachEvent('on' + type[0],eventFnName);

                        //存储对应的事件函数
                        _addEventFn({
                            dom:that,
                            type:type,
                            fn:eventFnName
                        })

                    }
                }(i,this[i]));
            }
            return this

        },
        off : function(eventType){
            if(typeof eventType === 'undefined'){
                //解绑所有事件
                dudu.each(this,function(v){
                    //当前进来的元素
                    for (var key1 in v.events) {
                        //key事件类型的名字 
                        for (var key2 in v.events[key1]) {
                            //事件类型对象中的自定义的名字
                            if(dudu.type(v.events[key1][key2]) === 'function'){
                                //给自定义名字的事件的函数解绑
                                _removeEvent(v,key1,v.events[key1][key2],false)
                            }else{
                                //给anonymous数组中函数解绑  
                                var len = v.events[key1].anonymous.length;
                                for(var j = 0;j < len;j ++){
                                    _removeEvent(v,key1,v.events[key1].anonymous[j],false)
                                }
                               
                            }
                            
                        }
                        
                    }
                    v.events = {};//清空events中所有数据
                });
            }else if(typeof eventType === 'string'){
                var arr=eventType.trim().split(/\s+/);
                if( arr.toString === "" )return 
                //对事件名数组的循环
                for( var i =0,len=arr.length; i < len; i++){
                    var type = arr[i].split(/\./)
                    //遍历实例对象，取到元素，解绑元素身上对应的事件
                    dudu.each(this,function(v){
                        //判断是否是火狐，修改对应事件名
                        if( type[0] ==="mousewheel"){
                            //判断滚动事件是否在火狐或者其他主流浏览器执行
                            type[0] = (v.onmousewheel === null) ? "mousewheel" : "DOMmousesheel"
                        }
                        if(type.length > 1){
                            //解绑自定义名的事件函数
                            _removeEvent(v,type[0],v.events[type[0]][type[1]],false)
                            delete v.events[ type[0] ][type[1]];
                        }else{
                            //解绑对应事件的所有匿名事件
                            for( var j = 0, len =  v.events[type[0]].anonymous.length; j < len; j++){
                                _removeEvent(v,type[0],v.events[type[0]].anonymous[j],false)

                            }
                            //解绑该事件类型中有名的
                            for( var k in  v.events[type[0]]){
                                if( !v.events[type[0]][k] instanceof Array ){
                                    //自定义名字的事件属性值
                                    _removeEvent(v,type[0],v.events[type[0]][k],false)
                                }
                            }
                            delete v.events[type[0]];
                        }
                    }) 

                }
            }
        },
          //设置或者获取元素的文本信息
        html : function (str){
            if(dudu.type(str) === 'undefined'){
                //是获取文本内容
                var val = this[0].innerHTML;
                return val;
            }else{
                //是设置文本内容
                dudu.each(this,function(v){
                    v.innerHTML = str;
                });
                return this;
            }
        },
        //设置或者获取元素的文本信息 innerText
        text : function (str){
            if(dudu.type(str) === 'undefined'){
                //获取第0个文本
                var val = this[0].innerText;
                return val;
            }else if( dudu.type(str) === "string" ){
                //是设置文本内容
                dudu.each(this,function(v){
                    v.innerText = str;
                });
                return this;
            }
        },
        //获取元素的value值
        val : function(str){
            if ( dudu.type === "undefined" ){
                //获取元素的值
                return this[0].value
                // try {
                //     var val = this[0].value
                // } catch{
                //     throw Error("只有表单元素才有vaule属性，请检查val()前的对象是否是表单元素")
                // }
            }else{
                dudu.each(this,function(v){
                    v.value = str;
                });
                return this;
            }
        },
        //通过下标返回一个jq对象
        eq : function( n ){
            var len = this.length
            if( n>= len || n<0 ){
                throw Error("下标越界，请检查eq内参数")
            }
            return new this.init(this[n])
        },
        //类名添加
        addClass : function(cName){
            if( typeof cName === "string" ){
                var arrName = cName.trim().split(/\s+/);
                if( arrName.toString === '' )return this;
                dudu.each(this,function(v){
                    //得到类名集合的数组
                    var arrEleClass = v.className.trim().split(/\s+/).concat(arrName);
                    for( var i = 0; i < arrEleClass.length;i++ ){
                        for( var j = arrEleClass.length -1 ;j > i; j--){
                            if( arrEleClass[i] === arrEleClass[j] ){
                                arrEleClass.splice(j,1)
                            }
                        }
                    }
                    v.className = arrEleClass.join(" ");
                })                
            }
            return this
        },
        //类名移除
        removeClass : function(cName){
            if( typeof cName === "undefined" ){
                dudu.each(this, function(v){
                    v.className = ""
                })
                return this;
            }else if( typeof cName === "string" ){
                //要移除类名的数组
                var arrName = cName.trim().split(/\s+/);
                if( arrName.toString === "" ) return;
                //移除对应的类名
                dudu.each(this, function(v){
                    //元素自身的类名
                    var arrEleClass = v.className.trim().split(/\s+/);
                    for( var i = 0,len = arrName.length; i < len;i++ ){
                        //对元素已经存在的类名进行遍历删除
                        for( var j = arrEleClass.length - 1; j >= 0; j-- ){
                            if( arrName[ i ] ===  arrEleClass[j]){
                                arrEleClass.splice(j, 1)
                            }
                        }
                    }
                    // console.log( arrEleClass )
                    v.className = arrEleClass.join(" ");
                })
                return this
            }
        },
        //判断类名是否存在 ，返回布尔值
        hasClass : function( cName ){
            var isClass = false;
            dudu.each( this,function( v ){
                cName = cName.trim();
                var reg = new RegExp( "\\b" + cName +"\\b")
                if( reg.test( v.className ) ){
                    isClass = true; //有类名设置为true
                    return false //结束当前循环
                }
            })
            return isClass
        }, 
        //判断类名是否存在 如果存在就删除 ，不存在就添加
        toggleClass : function( cName ){
            // var that = this
            dudu.each( this,function( v,i ){
                var that = dudu( v );
                if( that.hasClass( cName ) ){
                    that.removeClass( cName )
                }else{
                    that.addClass( cName )
                }
            })
            return this
        },
        //利用静态方法实现Each
        each : function( fn ){
            dudu.each( this,function( v,i,arr ){
                var bool = fn.call( v, v, i, arr )
                if( bool !=="undefined" ){
                    return bool
                }
            } )
        },
        //获取、设置css样式
        css : function( arg1,arg2 ){
            var type = dudu.type( arg1 );
            if( type === "string" ){
                if( !!arg2 ){
                    //存在第二个参数就设置
                    unit = "";
                    if( /width|height|top|bottom|left|right|fontSize/i.test(arg1) ){
                        !isNaN( arg2 / 1 ) && (unit = "px")
                    }
                    this.each( function(){
                        this.style[ arg1 ] = arg2 + unit
                    } )
                    return this;
                }else{
                    //不存在第二个参数就获取
                    if( window.getComputedStyle ){
                        return  getComputedStyle( this[0] )[arg1];
                    }else{ 
                        return this[0].currentStyle[arg1]
                    }

                }

            }else if( type === "object" ){
                //传进来的事对象
                for( var key in arg1 ){
                    this.css( key,arg1[key] )
                }
                return this;
            }
        },
        //操作自定义标签属性
        attr :  function( arg1,arg2 ){
            var type = dudu.type( arg1 );
            if( type === "string" ){
                if( !!arg2 ){
                    //存在第二个参数就设置
                    
                    this.each( function(){
                        this.setAttribute( arg1,arg2 )
                    } )
                    return this;
                }else{
                    //不存在第二个参数就获取
                   
                        return this[0].getAttribute( arg1 )
                }
            }else if( type === "object" ){
                //传进来的事对象
                for( var key in arg1 ){
                    this.attr( key,arg1[key] )
                }
                return this;
            }
        },
        //操作合法标签属性，在操控是布尔值的属性时，能正确返回布尔值
        prop : function( arg1,arg2 ){
            var type = dudu.type( arg1 );
            if( type === "string" ){
                if( !!arg2 ){
                    //存在第二个参数就设置
                    this.each( function(){
                        this[arg1] = arg2
                    } )
                    return this;
                }else{
                    //不存在第二个参数就获取
                        return this[0][arg1]
                }
            }else if( type === "object" ){
                //传进来的事对象
                for( var key in arg1 ){
                    this.prop( key,arg1[key] )
                }
                return this;
            }

        },
        //移除自定义属性
        removeAttr : function( str ){
            if( dudu.type( str ) === "undefined" ) return this;
            var arr = str.trim().split( /\s+/ );
            this.each( function( v ){
                dudu.each( arr, function( attr ){
                    v.removeAttribute(attr)
                } )
            } ) 
        },
        appendTo : function( select ){
            /**
             * jq
             * 节点
             * css选择器
             * **/
            var that = this;//子元素的jq对象
            //想得到一个包含select的对象，要可遍历
            if( !(select instanceof dudu) ){
                select = dudu( select ) //包装为jq对象
            }
            select.each( function(){//遍历父jq
                var fragment = document.createDocumentFragment();//文档碎片
                that.each( function(){//遍历子jq
                    var node = this.cloneNode( true )

                    //将被复制元素的事件拿过来也复制
                    for( var key1 in this.events ){
                        //key1 事件类型名字
                        for( var key2 in this.events[key1] ){
                            //遍历事件类型下有名的和无名的事件函数 
                            //key2是有名的和无名的anonymous
                            if( key2 === "anonymous" ){
                                //遍历匿名函数的数组进行绑定
                                dudu.each( this.events[key1][key2],function(){
                                    console.log( this )
                                    dudu(node).on( key1, this )
                                } )

                            }else{
                                //有名函数进行绑定
                                dudu( node ).on( key1 + "." + key2, this.events[key1][key2])
                            }
                            
                        }
                    }

                    fragment.appendChild( node )//文当碎片接收复制的子节点
                    //移除本身节点
                    this.parentNode && this.parentNode.removeChild( this )
                } )
                this.appendChild( fragment ) //父元素接受子元素
            } )
            return this
        },
        //添加节点
        append : function( select ){
            if( !select ) return;
            if( select instanceof dudu ){
                select = dudu( select ) //包装为jq对象
                select.appendTo( this )
            }else{
                //传进来的是字符串或者节点
                dudu( select ).appendTo( this )
            }
            return this;
        },
        //移除节点
        remove : function( select ){
            var type = dudu.type( select );
            if( type === "undefined" ){
                //移除所有节点
                this.each( function(){
                    this.innerHTML = ""
                } )
            }else if( select instanceof dudu ){
                //是jq对象
                this.each( function( v ){
                    select.each( function(){
                        this.parentNode === v && v.removeChild( this )
                    } )
                } )
            }else if( type === "undefined" ){
                var jq = dudu( select );
                this.each( function( v ){
                    jq.each( function(){
                        this.parentNode === v && v.removeChild( this )
                    } )
                } )
            }
        }
    };
    //设置init的原型等于duud的原型
    dudu.prototype.init.prototype = dudu.prototype;

    //静态方法 
    //遍历
    dudu.each = function(obj,fn,that){
        /*遍历对象 回调函数 可选参数 */
        for(var i = 0,len = obj.length; i < len; i++){
            var boo1 = fn.call(that || obj[i], obj[i], i, obj);

            if(boo1 === false){
                break;
            }else if(boo1 === true){
                continue;
            }
            /* false:结束整个循环 ，true跳出本次for循环 */
        }

    };
    dudu.type = function(obj){
        var toString = Object.prototype.toString,
            type ={
                "undefined" : "undefined",
                "number" : "number",
                "string" : "string",
                "boolean" : "boolean",
                "[object RegExp]" : "regexp",
                "[object Null]" : "null",
                "[object Array]" : "array",
                "[object Date]" : "date",
                "[object Function]" : "function",
                "[objecr Math]" : "math"
            };
            return type[typeof obj] || type[toString.call(obj)] || (obj ? "object" : "null");
            //type[typeof {}] object
            //object {} null
    };

    window.$ = dudu
}(window,document,undefined));