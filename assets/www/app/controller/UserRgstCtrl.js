/**
 * 
 */
Ext.define("testS.controller.UserRgstCtrl", {
    extend : 'Ext.app.Controller',
    alias : 'UserRgstCtrl',
    requires: [
               'Ext.MessageBox',
               'Ext.data.Store',
               'Ext.data.JsonP'
           ],
    config : {
        control : {
            '#btnUsrRgst' : {
                tap : "usrRgstSmt",
            }
        },
        refs : {
            txtUsrName : "textfield[id=usrNameRgst]",
            txtPsw : "passwordfield[id=usrPswdRgst]",
            txtPswRe : "passwordfield[id=usrPwdReRgst]",
            txtEmail : "emailfield[id=emailRgst]",
        }
    },

    
    usrRgstSmt : function() {
        Ext.Viewport.mask();
        Ext.Viewport.setMasked({
            xtype : 'loadmask',
            message : "用户注册中..."
        });
        var userName = this.getTxtUsrName().getValue();
        var psw = this.getTxtPsw().getValue();
        var pswRe = this.getTxtPswRe().getValue();
        var email = this.getTxtEmail().getValue();
        if (Ext.isEmpty(userName)) {
            this.createOverlay(this.getTxtUserName(), "登录用户名不能为空");
            Ext.Viewport.unmask();
            return;
        }
        if (Ext.isEmpty(psw)) {
            this.createOverlay(this.getTxtPsw(), "登录密码不能为空");
            Ext.Viewport.unmask();
            return;
        }
        if (Ext.isEmpty(pswRe)) {
            this.createOverlay(this.getTxtPsw(), "登录密码不能为空");
            Ext.Viewport.unmask();
            return;
        }
        if (pswRe !== psw) {
            this.createOverlay(this.getTxtPsw(), "两次输入密码不同");
            Ext.Viewport.unmask();
            return;
        }
        if (Ext.isEmpty(email)) {
            this.createOverlay(this.getTxtPsw(), "Email不能为空");
            Ext.Viewport.unmask();
            return;
        }
        var control = this;
        
        Global.socket.emit('UserRgst',JSON.stringify({
            userName: userName,
            password: psw,
            email: email,
        }));
    },
    
});