/**
 * 
 */

Ext.define("testS.controller.PubSubCtrl", {
    extend : 'Ext.app.Controller',
    alias : "PubSubCtrl",
    requires: [
               'Ext.MessageBox',
               'Ext.data.Store',
               'Ext.data.JsonP',
               'Ext.field.Select',
           ],
    config : {
        refs : {

            subUserList:'#subUserList',
            subGroupList:'#subGroupList',
            
            createGroupBtn: '#createGroupBtn',
            grpNameCreate: '#grpNameCreate', 
            grpPswCreate: '#grpPswCreate',
            crtGrpSummitBtn:'#crtGrpSummitBtn',
            
            newSubBtn:'#newSubBtn',
            grpIdJoin : '#grpIdJoin',
            grpPswJoin: '#grpPswJoin',
            subType:'#subType',
            newSubSummitBtn:'#newSubSummitBtn',
        },
        
        control : {
            createGroupBtn:{
                tap : 'createGroupOverlay',
            },
            newSubBtn : {
                tap : "newSubOverlay",
            },
            subUserList : {
                select : "listSubUser",
            },
            subGroupList : {
                select : "listSubGroup",
            },
            crtGrpSummitBtn : {
                tap:'crtGrpSummit',
            },
            newSubSummitBtn: {
                tap:'newSubSummit',
            }
        },
    },
    
    
    createGroupOverlay : function(){
        Ext.Viewport.add({
            xtype: 'panel',
            modal: true,
            hideOnMaskTap: true,
            centered: true,
            width: Ext.os.deviceType == 'Phone' ? 280 : 400,
            height: Ext.os.deviceType == 'Phone' ? 270 : 400,
            styleHtmlContent: true,
            items: [
                {
                    docked: 'top',
                    xtype: 'toolbar',
                    title: '创建群组'
                },{
                  id : "grpNameCreate",
                  xtype : 'textfield',
                  label: '群组名称',
                  placeHolder : '请输入名称', 
                  labelWidth: '50%',
                  required : true,
                  clearIcon : false,
                },{
                    id : "grpPswCreate",
                    xtype : 'textfield',
                    label: '验证密码',
                    placeHolder : '请输入密码', 
                    labelWidth: '50%',
                    required : true,
                    clearIcon : false,
                },{
                  xtype:'button',
                  id:'crtGrpSummitBtn',
                  text: '提交创建',
                  width:200,
              },
            ],
            scrollable: true
        });
    },
    
    
    newSubOverlay : function(){
        Ext.Viewport.add({
            xtype: 'panel',
            modal: true,
            hideOnMaskTap: true,
            centered: true,
            width: Ext.os.deviceType == 'Phone' ? 280 : 400,
            height: Ext.os.deviceType == 'Phone' ? 270 : 400,
            styleHtmlContent: true,
            items: [
                {
                    docked: 'top',
                    xtype: 'toolbar',
                    title: '新增订阅'
                },{
                  id : "grpIdJoin",
                  xtype : 'textfield',
                  label: '订阅账号',
                  placeHolder : '请输入账号', 
                  labelWidth: '50%',
                  required : true,
                  clearIcon : false,
                },{
                    id : "grpPswJoin",
                    xtype : 'textfield',
                    label: '验证密码',
                    placeHolder : '订阅用户无需输入密码', 
                    labelWidth: '50%',
                    required : true,
                    clearIcon : false,
                },
                {
                    xtype: 'selectfield',
                    id:'subType',
                    label: '订阅类型',
                    options: [
                              {text: '群组', value: 'group'},
                              {text: '用户',  value: 'user'},
                    ],
                    listeners:{
                        change: function(){
//                            console.log('in select field');
                            if(Ext.getCmp('subType').getValue()=='user'){
                                Ext.getCmp('grpPswJoin').disable();
                            }else{
                                Ext.getCmp('grpPswJoin').enable();
                            }
                        }
                    }
                },{
                  xtype:'button',
                  id:'newSubSummitBtn',
                  text: '提交订阅',
                  width:200,
              }
            ],
            scrollable: true
        });
    },
    
    
    crtGrpSummit: function(){
        Ext.Viewport.mask();
        Ext.Viewport.setMasked({
            xtype : 'loadmask',
            message : "创建群组中..."
        });
        var groupName = this.getGrpNameCreate().getValue();
        var grpPswCreate = this.getGrpPswCreate().getValue();
        if (Ext.isEmpty(groupName)) {
            alert( "群组名不能为空或带有小括号");
            Ext.Viewport.unmask();
            return;
        }
        
        Global.socket.emit('CreateGroup',JSON.stringify({
            groupName : groupName,
            grpPswCreate: grpPswCreate
        }));
    },
    
    
    newSubSummit: function(){
        var subId = this.getGrpIdJoin().getValue();
        var subType = this.getSubType().getValue();
        if (Ext.isEmpty(subType)) {
            alert( "订阅类型不能为空");
            return;
        }
        
        if(subType=='group'){
              Ext.Viewport.mask();
              Ext.Viewport.setMasked({
                  xtype : 'loadmask',
                  message : "加入群组中..."
              });
            var grpPswJoin = this.getGrpPswJoin().getValue();
            
            Global.socket.emit('JoinGroup',JSON.stringify({
                userId: Global.userId,
                grpIdJoin : subId,
                grpPswJoin: grpPswJoin
            }));
            
        }else{       //订阅用户
            Ext.Viewport.mask();
            Ext.Viewport.setMasked({
                xtype : 'loadmask',
                message : "订阅用户中..."
            });
            
            Global.socket.emit('SubUserReq',JSON.stringify({
                userId: Global.userId,
                subId : subId,
            }));
        }
    },

    
    listSubUser: function(view, record){
        var userIdQuit= record.get('renderText').substring(record.get('renderText').indexOf('(')+1,record.get('renderText').length-1);
        console.log(userIdQuit);
        Ext.Msg.confirm("Confirmation", "确认取消对此用户的订阅？", function(btn){
            if(btn =='yes'){
                Global.socket.emit('QuitUserSub',JSON.stringify({
                    userId: Global.userId,
                    userIdQuit : userIdQuit,
                }));
            }else{}
        });
    },
    
    
    listSubGroup: function(view, record){
//        alert(record.get('renderText'));
        var grpIdQuit= record.get('renderText').substring(record.get('renderText').indexOf('(')+1,record.get('renderText').length-1);
        Ext.Msg.confirm("Confirmation", "确认取消对此群组的订阅？", function(btn){
            if(btn =='yes'){
                Global.socket.emit('QuitGroup',JSON.stringify({
                    userId: Global.userId,
                    grpIdQuit : grpIdQuit,
                }));
            }else{}
        });
    },
});

function popPrompt(text){
    Ext.Viewport.add({
        xtype: 'panel',
        modal: true,
        hideOnMaskTap: true,
        width: Ext.os.deviceType == 'Phone' ? 280 : 400,
        height: Ext.os.deviceType == 'Phone' ? 30 : 40,
        styleHtmlContent: true,
        html: text,
    });
}


