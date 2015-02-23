Ext.define("testS.view.Login", {
    extend : 'Ext.form.Panel',
    xtype : "Login",
    id: 'loginView',
    requires : [ 
        'Ext.form.Panel', 
        'Ext.field.Text',
        'Ext.field.Password',
        'Ext.Toolbar',
        'Ext.Button',
        'Ext.Spacer',
        'Ext.form.FieldSet',
        'Ext.Img'
    ],
    config : {
        fullscreen : true,
        layout : {
            type : 'vbox',
            align : 'center'
        },
        items : [{
            xtype: 'spacer',
            flex: 1
        }, {
            xtype : 'container', 
            flex: 1,
            html : '<i><b><h1>LBSProgram</h1></b></i>'
        }, {
            xtype : "panel",
            flex: 3,
            items : [ {
                xtype : 'fieldset', 
                instructions : '请输入系统分配的账号和密码',
                items : [ {
                    id : "userIdLogin",
                    xtype : 'textfield',
                    name : 'account',
                    label: '账号',
                    placeHolder : '请输入账号', 
                    required : true,
                    clearIcon : false,
                }, {
                    id : "pwdLogin",
                    xtype : 'passwordfield',
                    name : 'password',
                    label: '密码',
                    placeHolder : '密码',
                    required : true,
                    clearIcon : false,
                },{
                    xtype: 'checkboxfield',
                    name: 'rmbPsw',
                    label: '记住',
                    valule:'remembered',
                    checked:true,
                } ]
            }]
        }, {
            xtype : 'button',
            text : '登 录',
            ui : 'confirm',
            width: '100px',
            id : "btnLogin",
            itemId : 'btnLogin',
       },{
            xtype: 'spacer',
            flex: 1
      }, {
            xtype: 'panel',
            margin : '15 0 25 0',
            layout : {
                type : 'hbox',
                align : 'center'
            },
            items:[{
                    xtype: 'img',
                    id: 'fgtPswImg',
                    html:'忘记密码'
                  },{
                    xtype: 'panel',
                    html: '&nbsp | &nbsp'
                  },{
                    xtype: 'img',
                    id:'usrRgstImg',
                    html:'用户注册' 
                  }
            ]  
      }
      ]
    }
});
