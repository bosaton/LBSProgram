Ext.define("testS.view.UsrRgst", {
    extend : 'Ext.form.Panel',
    xtype : 'UsrRgst',
    id: 'UsrRgstForm',
    requires : [ 
        'Ext.form.Panel', 
        'Ext.field.Text',
        'Ext.field.Password',
        'Ext.Button',
        'Ext.Spacer',
        'Ext.form.FieldSet',
        'Ext.field.Email'
    ],
    config : {
        fullscreen : true,
        layout : {
            type : 'vbox',
            align : 'center'
        },
        items : [{
            xtype: 'toolbar',
            title: '用户注册',
            docked: 'top',
            items:[{
                xtype: 'button',
                text:'返回',
                id:'rgstBackBtn',
                ui: 'back',
                listeners:{
                    tap: function(){
                        Global.bottomView.setActiveItem(0);
                    }
                }
                }]
            },{
            xtype : "panel",
            items : [ {
                xtype : 'fieldset', 
                instructions : '请输入注册信息',
                items : [ {
                    id : "usrNameRgst",
                    xtype : 'textfield',
                    label: '名称',
                    placeHolder : '请输入名称', 
                    required : true,
                }, {
                    id : "usrPswdRgst",
                    xtype : 'passwordfield',
                    label: '密码',
                    placeHolder : '密码',
                    required : true,
                },{
                    id : "usrPwdReRgst",
                    xtype : 'passwordfield',
                    name : 'password',
                    label: '密码',
                    placeHolder : '重复密码',
                    required : true,
                },{
                    id: 'emailRgst',
                    xtype: 'emailfield',
                    name: 'rmbPsw',
                    label: '邮箱',
                    placeHolder : 'example@sina.com',
                    required : true,
                }]
            }]
        }, {
            xtype : 'button',
            text : '提交注册',
            ui : 'confirm',
            width: '150px',
            id : "btnUsrRgst",
       }
      ]
    }
});
