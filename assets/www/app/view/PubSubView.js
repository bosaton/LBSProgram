/**
 * 
 */
Ext.define("testS.view.PubSubView", {
    extend : 'Ext.Container',
    xtype : "PubSubView",
    requires: [
               'Ext.dataview.List',
           ],
    
    config:{
    	align: 'center',
        items:[{
            xtype: 'panel',
            html: '您订阅的用户：',
            margin : '5 0 5 10',
        },
        {
            xtype: 'list',
            id: 'subUserList',
            height: '35%',
            style:{
                background:'#E1DAFC',
            },
            margin: '0 8 0 8',
            itemTpl: '<div>{renderText}</div>'
        },{
            xtype: 'panel',
            html: '<h1>您订阅的群组：</h1>',
            margin : '5 0 5 10',
        },
        {
            xtype: 'list',
            id: 'subGroupList',
            height: '35%',
            style:{
                background:'#E1DAFC',
            },
            margin: '0 8 0 8',
            itemTpl: '<div>{renderText}</div>'
        },{
            xtype:'panel',
            margin : '10 0 5 0',
            layout : {
                type : 'hbox',
                pack : 'center',
                align: 'stretch'
            },
            items:[{
                xtype:'button',
                id:'createGroupBtn',
                text: '创建群组',
//                width:'40%',
              },{
                xtype:'button',
                id:'newSubBtn',
                text: '新增订阅',
//                width:'40%',
            }]
        }]
    }
});