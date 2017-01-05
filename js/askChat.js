;
$(function(){
    //初始化接口数据
    var initDate = {
        'member' : [
            {
                'favicon' : 'img/head/2013.jpg',
                'name' : '刘秀',
                'id' : 0,
                'mesg' : '您好，请问怎么注册0000您好，请问怎么注册0000您好，请问怎么注册0000您好，请问怎么注册0000您好，请问怎么注册0000您好，请问怎么注册0000',
                'isNew' : 0, //老用户
                'isOnline' : 0, //不在线
                'time' : '2016-12-20  16:57:0'
            },
            {
                'favicon' : 'img/head/2014.jpg',
                'name' : '陈诚',
                'id' : 1,
                'mesg' : '您好，请问怎么买11111',
                'isNew' : 0, //老用户
                'isOnline' : 0, //不在线
                'time' : '2016-12-20  16:57:0'
            },
            {
                'favicon' : 'img/head/2015.jpg',
                'name' : '王旭',
                'id' : 2,
                'mesg' : '您好，请问怎么用2222',
                'isNew' : 1, //新用户
                'isOnline' : 1, //在线
                'time' : '2016-12-20  16:57:0'
            },
            {
                'favicon' : 'img/head/2016.jpg',
                'name' : '张灵',
                'id' : 3,
                'mesg' : '您好，请问怎么买3333',
                'isNew' : 1, //新用户
                'isOnline' : 1, //在线
                'time' : '2016-12-20  16:57:0'
            }
        ]
    };
    //客服回复问题数据
    var replyData = {
        'time' : '2016-12-20  16:57:0',
        'favicon' : 'img/head/2019.jpg',
        'mesg' : '稍等客服忙'
    }
    //新信息提示
    var blinkTitle = {
        show: function() {
            var a = 0,
                b = document.title,
                c;
            if (-1 == document.title.indexOf("【")){
                c = setInterval(function() {
                    a++;
                    3 == a && (a = 1);
                    1 == a && (document.title = "【　　　】" + b);
                    2 == a && (document.title = "【新消息】" + b);
                }, 500);
            } 
            return [c, b]
        },
        clear: function(a) {
            a && (clearInterval(a[0]), document.title = a[1])
        }
    }
    var chat = function(op){
        var self = this;
        var defaults = {
            win : $('.chatBox'),
            close : $('.close-btn'),
            index : 0,//用户索引值
            name : '', //用户姓名
            nameHtml : $(".talkTo"),
            userWin : $('.chat03-content'),//成员列表窗口
            chatWin : $(".chat01-content"),//聊天窗口
            textarea : $("#textarea")
        };
        this.ops = $.extend(defaults,op);
        self.init();
    }
    chat.prototype.init = function(){
        var self = this;
        self.ajaxChat();
        /*setInterval(function(){
            self.ajaxChat();
        },1000)*/

        //成员列表hover交互
        self.ops.userWin.find('li').on('mouseover',function(){
            $(this).addClass("hover").siblings().removeClass("hover");
        });
        self.ops.userWin.find('li').on('mouseout',function(){
            $(this).removeClass("hover").siblings().removeClass("hover")
        });

        //双击成员列表交互
        self.ops.userWin.find('li').on('dblclick',function(){
            self.ops.index = $(this).attr('data-id');
            self.ops.name = $(this).find(".person-name").text();
            self.ops.chatWin.scrollTop(0);
            $(this).addClass("choosed").siblings().removeClass("choosed");
            self.ops.nameHtml.text(self.ops.name);
            $('.message-box[data-id="'+self.ops.index+'"]').show().siblings().hide();
        })

        //关闭窗口
        self.ops.close.on('click',function(){
            self.ops.win.hide();
        })

        //点击发送
        $('.send-btn').click(function() {
            self.sendFn();        
        })

        //回车发送
        document.onkeydown = function(a) {
            var b = document.all ? window.event : a;
            return 13 == b.keyCode ? (self.sendFn(), !1) : void 0
        }

    }
    //用户问题内容模板
    chat.prototype.userTep = function(v){
        var self = this;
        var html = '';
        html += "<div class='message'>";
        html += "<div class='user-time'><span>" + v.time + "</span></div>";
        html += "<div class='user-logo'><img src='" + v.favicon + "'/></div>";
        html += "<div class='wrap-text'>" + v.mesg + "</div>";
        html += "</div>";
        return html;
    }
    //新增用户列表模板
    chat.prototype.addUserPeople = function(v){
        var self = this;
        var html = '',
            isOnline = v.isOnline ? 'online':'';
        html += '<li class="person" data-id="'+v.id+'">';
        html += '<div class="person-box"><img src="'+v.favicon+'"><label class="'+isOnline +'"></label></div>';
        html += '<p class="person-name">'+v.name+'</p></li>';
        return html; 
    }
    //新增用户聊天窗口
    chat.prototype.addUserWindow = function(v){
        var self = this;
        var html = '';
        html += '<div class="message-box" data-id="'+v.id+'"></div';
        return html;
    }
    //客服回复问题模板
    chat.prototype.reply = function(v){
        var self = this;
        var html = '';
        html += "<div class='message me'>";
        html += "<div class='user-time'><span>" + v.time + "</span></div>";
        html += "<div class='user-logo'><img src='" + v.favicon + "'/></div>";
        html += "<div class='wrap-text'>" + v.mesg + "</div>";
        html += "</div>";
        return html;
    }
    chat.prototype.ajaxChat = function(){
        var self = this;
        $.ajax({
            type : 'post',
            dataType : 'json',
            url : '#',
            data: null,
            beforeSend : function(){
                console.log('beforeSend');
            },
            success : function(v){
                console.log('success');
            },
            error : function(){
                self.messageTip();
                $.each(initDate.member,function(i,v){
                    if(v.isNew == 0){
                        $('.message-box[data-id="'+v.id+'"]').append(self.userTep(v));
                    }else{
                        self.ops.userWin.find('ul').append(self.addUserPeople(v));
                        self.ops.chatWin.append(self.addUserWindow(v));
                        $('.message-box[data-id="'+v.id+'"]').append(self.userTep(v));
                    }
                })
                console.log('error');
            }
        })
    },
    chat.prototype.ajaxReply = function(){
        var self = this;
        $.ajax({
            type : 'post',
            dataType : 'json',
            url : '#',
            data: null,
            beforeSend : function(){
                console.log('beforeSend');
            },
            success : function(v){
                console.log('success');
            },
            error : function(){                
                console.log('error');
                $('.message-box[data-id="'+self.ops.index+'"]').append(self.reply(replyData));
                self.ops.chatWin.scrollTop($('.message-box[data-id="'+self.ops.index+'"]').height());
                self.ops.textarea.val("");
            }
        })
    }
    chat.prototype.messageTip = function(){
        var self = this;
        var a = blinkTitle.show();
        setTimeout(function() {
            blinkTitle.clear(a)
        }, 8000)
    }
    //发送方法
    chat.prototype.sendFn = function(){
        var self = this;
        replyData.mesg = self.ops.textarea.val();
        if( null != replyData.mesg && ''!= replyData.mesg){
            self.ajaxReply();
        }else{
            alert("请输入聊天内容!");
        }
    }

    //var chatInit = new chat();
});