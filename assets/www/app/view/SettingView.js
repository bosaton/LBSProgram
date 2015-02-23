/**
 * 
 */
Ext.define("testS.view.SettingView", {
    extend : 'Ext.navigation.View',
    xtype : 'SettingView',

    config:{
        items:[{
            xtype: 'list',
            id : 'SettingList',
            store: {
                fields: ['name'],
                data: [
                    {name: '个人设置'},
                    {name: '订阅管理'},
                    {name: '发布管理'},
                    {name: '围栏设置'}
                ]
            },
            itemTpl: '<div>{name}</div>',
        }]
    }
    
});