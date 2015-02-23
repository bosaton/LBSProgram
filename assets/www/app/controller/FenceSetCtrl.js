/**
 * 
 */

Ext.define("testS.controller.FenceSetCtrl", {
    extend : 'Ext.app.Controller',
    alias : "FenceSetCtrl",
    requires: [
               'Ext.data.Store',
               'Ext.field.Select',
           ],
    config : {
        refs : {

            newFenceBtn:'#newFenceBtn',
            delFenceBtn:'#delFenceBtn',
            
            subTypeFence: '#subTypeFence',
            subListFence: '#subListFence', 
            fenceList:'#fenceList',
            
        },
        
        control : {
            newFenceBtn:{
                tap : 'newFence',
            },
            delFenceBtn : {
                tap : "delFence",
            },
            subTypeFence:{
                change: 'changeListType',
            },
            subListFence:{
                select:'getSubList',
            },
            fenceList:{
                select:'getFenceList',
            }
        },
    },
    
    
    newFence : function(){
        var fenceMap= Ext.getCmp('fenceMap').getMap();
        Global.drawingManager.setMap(fenceMap);
        
        var subTypeFence = this.getSubTypeFence().getValue();
        console.log('subTypeFence:'+subTypeFence);
        var subListFence = Global.temp;
        Global.temp = null;
        var fenceName = null;
        if(Ext.isEmpty(subListFence)){
            alert('请先选中用户或群组');
        }else{
            Ext.Msg.prompt("添加围栏", "请输入围栏名称:", function(btn,txt){
                if(btn == "ok"){ 
//                    console.log(txt);
                    fenceName = txt;
                } 
            },this, false, ""); 
            
            // drawingManager库加载后，用户绘制图形，系统对event进行分析
            google.maps.event.addListener(Global.drawingManager,'overlaycomplete',function(event) {
                if(confirm('围栏设置完成？')){
                    if (event.type == google.maps.drawing.OverlayType.CIRCLE) {
                        var radius = event.overlay.getRadius();
                        var circleCenter = event.overlay.getCenter();
                        //console.log(subTypeFence+subListFence);
                        Global.socket.emit('AddFence',JSON.stringify({
                            userId: Global.userId,
                            dstType:subTypeFence,
                            dstId: subListFence,
                            fenceContent:{
                                type:'circle',
                                name:fenceName,
                                radius: radius,
                                circleCenter: circleCenter,
                            }
                        }));
                    }
                    //围栏设置完成后取消地图上drawing库的图标显示
                    Global.drawingManager.setMap(null);
                }else{//删除围栏
                    event.overlay.setMap(null);
                }
            });//end google.maps.event.addListener
        }
    },
    
    changeListType: function(){
//        console.log('in select field');
        if(Ext.getCmp('subTypeFence').getValue()=='user'){
            //load data to user list
            var groupJson  = {items:[]},
            tempJson = {},
            userStore = Ext.create('testS.store.UserLists');
            for(var i=0;i<Global.subUserJson.subUser.length;i++){
                tempJson.renderText = Global.subUserJson.subUser[i].userName + '(' + Global.subUserJson.subUser[i].userId + ')';
                groupJson.items.push(tempJson);
            }
            userStore.setData(groupJson.items);
            var subUserList= Ext.getCmp('subListFence');
            subUserList.setStore(userStore);
        }else{
            //load data to group list
            var groupJson = {items:[]},
                tempJson = {},
                groupStore = Ext.create('testS.store.GroupLists');
            for(var i=0;i<Global.subGroupJson.subGroup.length;i++){
                tempJson.renderText = Global.subGroupJson.subGroup[i].groupName + '(' + Global.subGroupJson.subGroup[i].groupId + ')';
                groupJson.items.push(tempJson);
            }
            groupStore.setData(groupJson.items);
            var subGroupList= Ext.getCmp('subListFence');
            subGroupList.setStore(groupStore);
        }
    },
    
    // tap the sub user/group list
    getSubList: function(view, record){
        
        console.log('--before getting int to sublist-');
        console.log(Global.subUserJson.subUser);
        var id= record.get('renderText').substring(record.get('renderText').indexOf('(')+1,record.get('renderText').length-1);
        Global.temp = id;
        
        if(Ext.getCmp('subTypeFence').getValue() == 'user'){
            var userJson = {items:[]},
                tempJson = {},
                userStore = Ext.create('testS.store.FenceLists');
            for(var i=0;i<Global.subUserJson.subUser.length;i++){
                if(Global.subUserJson.subUser[i].userId ==  id){
                    console.log(i+ '-'+id);
                    if(Global.subUserJson.subUser[i].fence != undefined){
                        for(var j=0;j<Global.subUserJson.subUser[i].fence.length;j++ ){
                            tempJson.renderText = Global.subUserJson.subUser[i].fence[j].name;
                            userJson.items.push(tempJson);
                        }       
                    }
                    break; 
                }
            }
            userStore.setData(userJson.items);
            var subUserList= Ext.getCmp('fenceList');
            subUserList.setStore(userStore);

        }else if(Ext.getCmp('subTypeFence').getValue() == 'group'){
            var groupJson = {items:[]},
                tempJson = {},
                groupStore = Ext.create('testS.store.FenceLists');
            for(var i=0;i<Global.subGroupJson.subGroup.length;i++){
                if(Global.subGroupJson.subGroup[i].groupId ==  id){
                    if(Global.subGroupJson.subGroup[i].fence != undefined){
                        for(var j=0;j<Global.subGroupJson.subGroup[i].fence.length;j++ ){
                            tempJson.renderText = Global.subGroupJson.subGroup[i].fence[j].name;
                            groupJson.items.push(tempJson);
                        }       
                    }
                    break; 
                }
            }
            groupStore.setData(groupJson.items);
            var subGroupList= Ext.getCmp('fenceList');
            subGroupList.setStore(groupStore);
        }
    },

    //tap the fence list
    getFenceList: function(view, record){
//        console.log(Global.subUserJson.subUser);
        for(var i=0;i<Global.subUserJson.subUser.length;i++){
            if(Global.subUserJson.subUser[i].fence != undefined){
                for(var j=0;j<Global.subUserJson.subUser[i].fence.length;j++ ){
                    if(Global.subUserJson.subUser[i].fence[j].name == record.get('renderText')){
                        var fenceMap= Ext.getCmp('fenceMap').getMap();
                        var center =  new google.maps.LatLng(Global.subUserJson.subUser[i].fence[j].center.k, Global.subUserJson.subUser[i].fence[j].center.A);
                        var circleOptions ={
                            fillColor : '#C4E1FF',
                            fillOpacity : 0.5,
                            strokeWeight : 1,
                            clickable : false,
                            editable : true,
                            zIndex : 1,
                            map: fenceMap,
                            center: center,
                            radius: Global.subUserJson.subUser[i].fence[j].radius,
                        };
                        var cityCircle = new google.maps.Circle(circleOptions);
                        fenceMap.setCenter(center);
//                        console.log('--in circle getfencelist');
                    }
                }       
            }
        }
    }
    
});




