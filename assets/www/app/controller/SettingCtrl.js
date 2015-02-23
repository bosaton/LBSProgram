/**
 * 
 */

Ext.define("testS.controller.SettingCtrl", {
    extend : 'Ext.app.Controller',
    alias : "SettingCtrl",
    requires: [
               'Ext.MessageBox',
               'Ext.data.Store',
               'Ext.data.JsonP',
               'testS.view.PubSubView'
           ],
    config : {
        refs : {
            setting: 'SettingView',             //navigation view to push/pop
            settingList: '#SettingList',
        },

        control : {
            settingList : {
                select : "goSetting",
            }
        },
    },
    
    goSetting: function(view, record){
        if(record.get('name') === '订阅管理'){
//            console.log('in 订阅管理');
            this.pubsubview = Ext.create('testS.view.PubSubView');
            this.getSetting().push(this.pubsubview);
            
            //load data to group list
            var groupStore = Ext.create('testS.store.GroupLists');
            //var parsed = JSON.parse(Global.subGroupJson);
            var groupJson = {items:[]},
                tempJson = {};
            for(var i=0;i<Global.subGroupJson.subGroup.length;i++){
                tempJson.renderText = Global.subGroupJson.subGroup[i].groupName + '(' + Global.subGroupJson.subGroup[i].groupId + ')';
                groupJson.items.push(tempJson);
            }
//            console.log('---in setting ctrl.js---');
//            console.log(groupJson);
            groupStore.setData(groupJson.items);
            var subGroupList= Ext.getCmp('subGroupList');
            subGroupList.setStore(groupStore);
            
            //load data to user list
            var userStore = Ext.create('testS.store.UserLists');
            groupJson  = {items:[]},
            tempJson = {};
            for(var i=0;i<Global.subUserJson.subUser.length;i++){
                tempJson.renderText = Global.subUserJson.subUser[i].userName + '(' + Global.subUserJson.subUser[i].userId + ')';
                groupJson.items.push(tempJson);
            }
//            console.log(groupJson);
            userStore.setData(groupJson.items);
            var subUserList= Ext.getCmp('subUserList');
            subUserList.setStore(userStore);
            
            
        }else if(record.get('name') === '个人设置'){
            this.personalSetting = Ext.create('testS.view.PersonalSetting');
            this.getSetting().push(this.personalSetting);
            
        }else if(record.get('name') === '围栏设置'){
            this.fenceSetting = Ext.create('testS.view.FenceSettingView');
            this.getSetting().push(this.fenceSetting);

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
    }
});