/**
 * 
 */
Ext.define("testS.view.FenceSettingView", {
    extend : 'Ext.Container',
    xtype : "FenceSettingView",
    requires: [
               'Ext.dataview.List',
           ],
    config:{
        items:[{
          xtype:'panel',
          height:'50%',
          layout : {
              type : 'hbox',
              align : 'left'
          },
          items:[{
                xtype: 'panel',
                flex:1,
                items:[{
                    xtype: 'selectfield',
                    id:'subTypeFence',
                    label: '类型',
                    options: [
                              {text: '群组', value: 'group'},
                              {text: '用户',  value: 'user'},
                    ],
                },{
                    xtype: 'list',
                    id: 'subListFence',
                    height: '100px',
                    style:{
                        background:'#FF0000',
                    },
                    margin: '0 2 0 2',
                    itemTpl: '<div>{renderText}</div>'
                }]
            },{
                xtype: 'panel',
                flex:1,
                items:[{
                    xtype:'panel',
                    html: '围栏列表',
                    margin : '5 0 5 0',
                },{
                    xtype: 'list',
                    id: 'fenceList',
                    height: '120px',
                    style:{
                        background:'#EAC100',
                    },
                    margin: '0 2 0 2',
                    itemTpl: '<div>{renderText}</div>'
                    
                },{
                    xtype:'panel',
                    margin : '8 0 5 0',
                    layout : {
                        type : 'hbox',
                        pack : 'center',
                        align: 'stretch'
                    },
                    items:[{
                        xtype:'button',
                        id:'newFenceBtn',
                        text: '新增',
                      },{
                        xtype:'button',
                        text: '删除',
                        id:'delFenceBtn',
                    }]
                }]
          }]
          
        },{
            xtype:'map',
            id:'fenceMap',
            useCurrentLocation: false,
            margin: '0 4 0 4',
            height: '50%',
            mapOptions : {
                center : new google.maps.LatLng(24.874,118.675),
                zoom : 12,
                mapTypeId : google.maps.MapTypeId.ROADMAP,
                navigationControl: true,
                navigationControlOptions: {
                    style: google.maps.NavigationControlStyle.DEFAULT
                }
            },
        }]
    }
});