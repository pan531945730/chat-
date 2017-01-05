;
$(function () {
    var chat = function (op) {
        var self = this;
        var defaults = {
            win: $('.chatBox'),
            close: $('.close-btn'),
            index: 0, //用户索引值
            name: '', //用户姓名,
            fromAppkey: '',//用户fromAppkey,
            nameHtml: $(".talkTo"),
            userWin: $('.chat03-content'), //成员列表窗口
            chatWin: $(".chat01-content"), //聊天窗口
            textarea: $("#textarea"),
            JIM: new JMessage(),
            userArr: [], //成员数组
            blinkNum: 0,
            title: document.title
        };
        this.ops = $.extend(defaults, op);
        self.init();
    }
    chat.prototype.init = function () {
        var self = this;

        Date.prototype.toHyphenDateString = function () {
            var year = this.getFullYear();
            var month = this.getMonth() + 1;
            var date = this.getDate();
            if (month < 10) {
                month = "0" + month;
            }
            if (date < 10) {
                date = "0" + date;
            }
            var hours = this.getHours();
            var mins = this.getMinutes();
            var second = this.getSeconds();
            return year + "-" + month + "-" + date + " " + hours + ":" + mins + ":" + second;
        };
        self.ops.JIM.init({
            "appkey": self.ops.appkey, //开发者在极光平台注册的IM应用appkey
            "random_str": self.ops.randomStr, //20-36长度的随机字符串, 作为签名加salt使用
            "signature": self.ops.signature, //当前时间戳
            "timestamp": self.ops.timestamp //  签名
        }).onSuccess(function (data) {

            self.ops.JIM.login({
                'username': self.ops.username,
                'password': self.ops.password
            }).onSuccess(function (data) {

                console.log('login suc');
            }).onAck(function (data) {

                console.log(data);
            }).onFail(function (data) {

                console.log('fail');
            });

        }).onFail(function (data) {
            // do something
            console.log('onfail');
        });

        //消息监听
        self.ops.JIM.onMsgReceive(function (data) {
            console.log(data);
            self.blinkStop();
            self.blinkBegin();
            $.each(data.messages, function (i, v) {
                if (self.ops.userArr.indexOf(v.content.from_id) >= 0) {
                    $('.message-box[data-id="' + v.content.from_id + '"]').append(self.userTep(v.content));

                    if (!$('.person[data-id="' + v.content.from_id + '"]').hasClass('choosed')) {
                        $('.person[data-id="' + v.content.from_id + '"]').find('label').addClass('news');
                    }

                } else {
                    self.ops.userWin.find('ul').append(self.addUserPeople(v.content));
                    self.ops.chatWin.append(self.addUserWindow(v.content));
                    $('.message-box[data-id="' + v.content.from_id + '"]').append(self.userTep(v.content));

                    //当是第一名成员时
                    if (self.ops.userArr.length == 0) {
                        $('.person[data-id="' + v.content.from_id + '"]').addClass('choosed');
                        $('.person[data-id="' + v.content.from_id + '"]').find('label').removeClass('news');
                        $('.message-box[data-id="' + v.content.from_id + '"]').show();
                        self.ops.index = v.content.from_id;
                        self.ops.name = v.content.from_name;
                        self.ops.fromAppkey = v.content.from_appkey;
                        self.ops.nameHtml.text(self.ops.name);
                    }

                    self.ops.userArr.push(v.content.from_id);
                }
            })
            self.ops.chatWin.scrollTop($('.message-box[data-id="' + self.ops.index + '"]').height());

        });

        //成员列表hover交互
        self.ops.userWin.on('mouseover', 'li', function () {
            $(this).addClass("hover").siblings().removeClass("hover");
        });
        self.ops.userWin.on('mouseout', 'li', function () {
            $(this).removeClass("hover").siblings().removeClass("hover")
        });

        //双击成员列表交互
        self.ops.userWin.on('dblclick', 'li', function () {
            self.ops.index = $(this).attr('data-id');
            self.ops.fromAppkey = $(this).attr('data-from');
            self.ops.name = $(this).find(".person-name").text();
            self.ops.chatWin.scrollTop(0);
            $(this).addClass("choosed").siblings().removeClass("choosed");
            $(this).find('label').removeClass('news');
            self.ops.nameHtml.text(self.ops.name);
            $('.message-box[data-id="' + self.ops.index + '"]').show().siblings().hide();
        })

        //关闭窗口
        self.ops.close.on('click', function () {
            self.ops.win.hide();
        })

        //点击发送
        $('.send-btn').click(function () {
            self.sendFn();
        })

        //回车发送
        document.onkeydown = function (a) {
            var b = document.all ? window.event : a;
            return 13 == b.keyCode ? (self.sendFn(), !1) : void 0
        }

    }
    //新消息title闪烁
    chat.prototype.blinkBegin = function () {
        var self = this;
        var a = 0;
        if (-1 == document.title.indexOf("【")) {
            self.ops.blinkNum = setInterval(function () {
                a++;
                3 == a && (a = 1);
                1 == a && (document.title = "【　　　】" + self.ops.title);
                2 == a && (document.title = "【新消息】" + self.ops.title);
            }, 500);
        }
    }
    //新消息title停止闪烁
    chat.prototype.blinkStop = function () {
        var self = this;
        clearInterval(self.ops.blinkNum);
        document.title = self.ops.title;
    }
    //用户问题内容模板
    chat.prototype.userTep = function (v) {
        var self = this;
        var html = '',
            fromTime = new Date(v.create_time).toHyphenDateString();
        html += "<div class='message'>";
        html += "<div class='user-time'><span>" + fromTime + "</span></div>";
        html += "<div class='user-logo'><img src='/Areas/JIM_Service/Content/img/head/2017.jpg'/></div>";
        html += "<div class='wrap-text'>" + v.msg_body.text + "</div>";
        html += "</div>";
        return html;
    }
    //新增用户列表模板
    chat.prototype.addUserPeople = function (v) {
        var self = this;
        var html = '';
        html += '<li class="person" data-id="' + v.from_id + '" data-from="' + v.from_appkey + '">';
        html += '<div class="person-box"><img src="/Areas/JIM_Service/Content/img/head/2017.jpg"><label class="news"></label></div>';
        html += '<p class="person-name">' + v.from_name + '</p></li>';
        return html;
    }
    //新增用户聊天窗口
    chat.prototype.addUserWindow = function (v) {
        var self = this;
        var html = '';
        html += '<div class="message-box" data-id="' + v.from_id + '"></div';
        return html;
    }
    //客服回复问题模板
    chat.prototype.reply = function (v) {
        var self = this;
        var html = '',
            replyTime = new Date(v.create_time).toHyphenDateString();
        html += "<div class='message me'>";
        html += "<div class='user-time'><span>" + replyTime + "</span></div>";
        html += "<div class='user-logo'><img src='/Areas/JIM_Service/Content/img/head/2015.jpg'/></div>";
        html += "<div class='wrap-text'>" + v.msg_body.text + "</div>";
        html += "</div>";
        return html;
    }
    //发送方法
    chat.prototype.sendFn = function () {
        var self = this,
            replymsg = self.ops.textarea.val();
        if (null != replymsg && '' != replymsg) {
            if (self.ops.name == '') {
                alert('当前没有成员');
                return;
            }
            self.ops.JIM.sendSingleMsg({
                'target_username': self.ops.index,
                'appkey' : self.ops.fromAppkey,
                'content': replymsg
            }).onSuccess(function (data, msg) {
                // do something
                console.log(msg);
                self.blinkStop();
                $('.message-box[data-id="' + self.ops.index + '"]').append(self.reply(msg.content));
                self.ops.chatWin.scrollTop($('.message-box[data-id="' + self.ops.index + '"]').height());
                self.ops.textarea.val("");
            }).onFail(function (data) {
                // do something
                console.log('fail');
            });

        } else {
            alert("请输入聊天内容!");
        }
    }
    var paras;
    var outData = {
        data: {},
        url: '/JIM_Service/ajax/JIMInit',
        sucFun: function (jdata) {
            if (jdata.S == 1) {
                var ajaxData = JSON.parse(jdata.D);
                paras = {
                    appkey: ajaxData.appkey,
                    randomStr: ajaxData.random_str,
                    signature: hex_md5(ajaxData.signature),
                    timestamp: ajaxData.timestamp,
                    username: ajaxData.username,
                    password: ajaxData.password,
                }
                var chatInit = new chat(paras);
                return;
            } else {

                return false;
            }
        }
    }
    window.postAjax(outData);

});