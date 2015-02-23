/**
 * 
 */
Ext.define("testS.view.PersonalSetting", {
    extend : 'Ext.Container',
    xtype : "PersonalSetting",
    requires: [
               'Ext.data.proxy.JsonP',
               'Ext.dataview.List',
           ],
    
    config:{
    	autoDestroy: false,
    	align: 'center',
        items:[{
            xtype : 'fieldset',
            title:'个人资料修改',
            items:[{
                xtype: 'panel',
                layout:{
                    type:'hbox',
                    align: 'right',
                },
                items:[{
                    xtype : 'textfield',
                    id:'userNameUpdateFld',
                    label: '更改用户名:',
                    placeHolder : '新用户名', 
                    labelWidth: '50%',
                    flex:5,
                },{
                    id : "userNameUpdateBtn",
                    xtype:'button',
                    text:'提交',
                    flex:1,
                }]
                       
            }, {
                xtype: 'panel',
                layout:{
                    type:'hbox',
                    align: 'right',
                },
                items:[{
                    xtype : 'textfield',
                    id:'userPswUpdateFld',
                    label: '更改密码:',
                    placeHolder : '新密码', 
                    labelWidth: '50%',
                    flex:5,
                },{
                    id : "userPswUpdateBtn",
                    xtype:'button',
                    text:'提交',
                    flex:1,
                }]
                       
            }, {
                xtype: 'panel',
                layout:{
                    type:'hbox',
                    align: 'right',
                },
                items:[{
                    xtype : 'textfield',
                    id:'userEmailUpdateFld',
                    label: '更改邮箱:',
                    placeHolder : '新邮箱', 
                    labelWidth: '50%',
                    flex:5,
                },{
                    id : "userEmailUpdateBtn",
                    xtype:'button',
                    text:'提交',
                    flex:1,
                }]
                       
            }]
        },{
                xtype:'button',
                id:'getIconBtn',
                text: '获取头像',
                width:200,
            },{
                xtype:'image',
                id:'icon',
                height: '30%',
                src:'resources/icons/nopic.png',
                width:'30%',
            },{
                xtype:'button',
                id:'uploadIconBtn',
                text: '设置头像',
                width:200,
            }]
    }
});