Ext.define('testS.view.Main', {
    extend: 'Ext.tab.Panel',
    xtype: 'Main',
    id:'mainView',
    title:'main',
    requires: [
        'Ext.Map',
    ],
    config: {
        tabBarPosition: 'bottom',

        items: [
                {
        		id: 'mapCanvas',
                title: '首页',
                iconCls: 'home',
                xtype:'map',
                useCurrentLocation: false,
                mapOptions : {
                    center : new google.maps.LatLng(24.874,118.675),
                    zoom : 12,
                    mapTypeId : google.maps.MapTypeId.ROADMAP,
                    navigationControl: true,
                    navigationControlOptions: {
                        style: google.maps.NavigationControlStyle.DEFAULT
                    }
                },
                listeners:{
                    maprender: function(extMap,eOpts ){
                        Ext.Viewport.mask();
                        Ext.Viewport.setMasked({
                            xtype : 'loadmask',
                            message : "获取位置中..."
                        });
                        
                        Global.map= extMap.getMap();
//                        console.log('map rendered');
//                        console.log(extMap);
//                        console.log(Global.map);
                        
                        navigator.geolocation.getCurrentPosition(function(pos){
                            Ext.Viewport.unmask();
                            console.log('obtained current position'+pos.coords.latitude+'-'+pos.coords.longitude);
                            Global.initialPos = new google.maps.LatLng(pos.coords.latitude,pos.coords.longitude);
//                            setTimeout(function(){
//                                    Global.map= Ext.getCmp('mapCanvas').getMap();
//                                    console.log(Global.map);
//                                    
//                            },2000);
                            Global.map.setCenter(Global.initialPos);
                            var selfMarker= new MarkerWithLabel({
                                position: Global.initialPos,
                                icon:'resources\\icons\\me.png',
                                labelContent: Global.userIdToName[Global.userId],
                            });
                            selfMarker.setMap(Global.map);
//                            console.log('self geolocation succedd');
                            
                        },function(err){
                            Ext.Viewport.unmask();
                            alert(err.code+' 获取当前位置失败');
                        });
                        
                    }
                },
                
            },
            {
                title:'设置',
                iconCls: 'settings',
                xclass: 'testS.view.SettingView',
            },
            {
                title:'消息',
                iconCls: 'info',
                xclass: 'testS.view.MessageView',
            },
        ]
    }
});
