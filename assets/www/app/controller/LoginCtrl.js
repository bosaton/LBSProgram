Ext.define("testS.controller.LoginCtrl", {
    extend : 'Ext.app.Controller',
    alias : "LoginCtrl",
    requires: [
               'Ext.MessageBox',
               'Ext.data.Store',
               'Ext.data.JsonP',
               'Ext.dataview.List',
               'testS.view.Main',
           ],
    config : {
        control : {
            '#btnLogin' : {
                tap : "loginFn",
            },
            '#fgtPswImg' :{
                tap: 'fgtPsw'
            },
            '#usrRgstImg' :{
                tap: 'usrRgst'
            }
        },
        refs : {
            txtUserId : "textfield[id=userIdLogin]",
            txtPsw : "textfield[id=pwdLogin]",
        }
    },

    usrRgst: function(){
        Global.bottomView.setActiveItem(2);
    },

    
    loginFn : function() {
        Ext.Viewport.mask();
        Ext.Viewport.setMasked({
            xtype : 'loadmask',
            message : "用户登录中..."
        });
        var userId = this.getTxtUserId().getValue();
        var password = this.getTxtPsw().getValue();
        Global.userId=userId;
        if (Ext.isEmpty(userId)) {
            alert("登录用户名不能为空");
            Ext.Viewport.unmask();
            return;
        }
        if (Ext.isEmpty(password)) {
            alert("登录密码不能为空");
            Ext.Viewport.unmask();
            return;
        }
        var control = this;
        
        if(Ext.isEmpty(Global.socket)){
            alert('与服务器建立连接失败');
            return;
        }
        
        Global.socket.emit('Login',JSON.stringify({
            userId: userId,
            password: password,
        }));
    },
        
    
    reqGroupList: function(){
            Ext.data.JsonP.request({
                url : Global.serverAddr+':'+Global.nodejsPort + "/ReqSubGroupList",
                callbackKey : 'callback',
                params : {
                    userId : Global.userId,
                },
                timeout: 30000,
                scope: this,
                callback: function(success,result){
                    if(success){
                        console.log('request group list success ');
                        Global.groups = result.groups;
                    }else{
                        alert("jsonp request group list error");
                    }
                },
        })
    },
    
    
    createOverlay : function(control, text) {
        var showOverlay = Ext.Viewport.add({
            xtype : "panel",
            left : 0,
            top : 0,
            hideOnMaskTap : true,
            modal : true,
            hidden : true,
            centered : true,
            html : text
        });
        showOverlay.showBy(control);
    },

});


