/**
 * 
 */

Ext.define("testS.controller.PersonalSettingCtrl", {
    extend : 'Ext.app.Controller',
    alias : "PersonalSettingCtrl",
    requires: [
               'Ext.MessageBox',
           ],
    config : {
        refs : {
            userNameUpdateFld:'#userNameUpdateFld',
            userNameUpdateBtn:'#userNameUpdateBtn',
            userPswUpdateFld:'#userPswUpdateFld',
            userPswUpdateBtn:'#userPswUpdateBtn',
            userEmailUpdateFld:'#userEmailUpdateFld',
            userEmailUpdateBtn:'#userEmailUpdateBtn',
            getIconBtn:'#getIconBtn',
            uploadIconBtn:'#uploadIconBtn',
        },
        
        control : {
            userNameUpdateBtn:{
                tap : "userNameUpdate",
            },
            userPswUpdateBtn:{
                tap: "userPswUpdate",
            },
            userEmailUpdateBtn:{
                tap:"userEmailUpdate"
            },
            getIconBtn : {
                tap : "getIcon",
            },
            uploadIconBtn:{
                tap : "uploadIcon",
            }
        },
    },
    
    //修改用户名,jsonp提交
    userNameUpdate: function(){
        Ext.Viewport.mask();
        Ext.Viewport.setMasked({
            xtype : 'loadmask',
            message : "新用户名提交中..."
        });
        var userName = this.getUserNameUpdateFld().getValue();
        if (Ext.isEmpty(usrName)) {
            alert("提交用户名不能为空");
            Ext.Viewport.unmask();
            return;
        }
        var control = this;
        
        Global.socket.emit('ChangeInfo',JSON.stringify({
            type: userName,
            userId: Global.userId,
            userName: userName,
        }));
    },
    
    //修改用户用户密码,jsonp提交
    userPswUpdate: function(){
        Ext.Viewport.mask();
        Ext.Viewport.setMasked({
            xtype : 'loadmask',
            message : "新密码提交中..."
        });
        var usrPsw = this.getUserPswUpdateFld().getValue();
        if (Ext.isEmpty(usrPsw)) {
            alert("提交密码不能为空");
            Ext.Viewport.unmask();
            return;
        }
        var control = this;
        Global.socket.emit('ChangeInfo',JSON.stringify({
            type: password,
            userId: Global.userId,
            password: usrPsw,
        }));
    },
    
    userEmailUpdateBtn:function(){
        Ext.Viewport.mask();
        Ext.Viewport.setMasked({
            xtype : 'loadmask',
            message : "新邮箱提交中..."
        });
        var usrEmail = this.getUserEmailUpdateFld().getValue();
        if (Ext.isEmpty(usrEmail)) {
            alert("提交邮箱不能为空");
            Ext.Viewport.unmask();
            return;
        }
        var control = this;
        Global.socket.emit('ChangeInfo',JSON.stringify({
            type: email,
            userId: Global.userId,
            email: usrEmail,
        }));
    },
    
    getIcon: function(){
        navigator.camera.getPicture(onGetIconSuccess,onGetIconFail,{
            quality:50,
            destinationType:Camera.DestinationType.FILE_URI,
            sourceType:Camera.PictureSourceType.PHOTOLIBRARY,
            targetWidth:300,
            targetHeight:400
        });
        function onGetIconSuccess(iconURI){
            var icon = Ext.getCmp('icon');
            icon.setSrc(iconURI);
            Global.iconURI = iconURI;
        };
        function onGetIconFail(msg){
            var icon = Ext.getCmp('icon');
            icon.setHtml('get photo failure');
        };
    },

    
    uploadIcon: function(){
        var options = new FileUploadOptions();
        options.fileKey="humanPhoto";
       
        options.fileName=Global.iconURI.substring(Global.iconURI.lastIndexOf('/')+1, Global.iconURI.lastIndexOf('?'));
        options.mimeType="image/jpeg";
        options.chunkedMode = false;
         
        var params = new Object();
        params.value1 = "hvalue1";
        params.value2 = Global.userId;
        options.params = params;
         
        var ft = new FileTransfer();
        ft.upload(Global.iconURI, 
                encodeURI(Global.serverAddr+':'+Global.nodejsPort+"/iconSummit"), 
                function(res){
                    console.log("responseCode: " + res.responseCode+"response: " + res.response+"resbytesent: "+res.bytesSent);
                    
//                    Global.iconUrlAtServer = Global.serverAddr+"/upload/"+res.response+"/"+Global.userId+".jpg";
                }, 
                function(err){
                    if(err.code ==FileTransferError.FILE_NOT_FOUND_ERR){
                        alert("上传错误，未找到图像文件");
                    }else if(err.code = FileTransferError.INVALID_URL_ER){
                        alert("上传错误，服务器地址无效");
                    }else{
                        alert("上传错误，连接失败");
                    }
                }, 
                options
        );
    },
    
});