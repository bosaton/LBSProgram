/**
 * 
 */
Ext.define("testS.view.MessageView", {
    extend : 'Ext.Panel',
    xtype : 'MessageView',
    fullscreen : true,

    config:{
        autoDestroy: false,
        items:[{
            xtype: 'selectfield',
            id:'msgToField',
            label: '选择对象:',
            options: [
                      {text: '群组', value: 'group'},
                      {text: '用户',  value: 'user'},
            ],
        },{
            xtype:'panel',
            layout : {
                type : 'hbox',
                align : 'center'
            },
            items:[{
                id : "msgField",
                xtype : 'textfield', 
                clearIcon : false,
            },{
                xtype:'button',
                id:'msgBtn',
                text : '发送',
            }],
 
        },{
            xtype:'panel',
            id:'msgPanel',
            style:{
                background:'#E1DAFC',
            },
            layout:'fit',
            height:'80%',
            scrollable: 'vertical',  
        }]
    },
    
    listeners:{
        painted: function(){
            var msgToField = Ext.getCmp('msgToField');
            var array = new Array();
            var renderText = {};
            
            for(var i=0;i<Global.subGroupJson.subGroup.length;i++){
                renderText = {
                    text: Global.subGroupJson.subGroup[i].groupName+'[群]',
                    value: Global.subGroupJson.subGroup[i].groupId + 'g',
                };
                array.push(renderText);
            }
            
//            console.log('--in painted event of the message view');
//            console.log(array);
            
            for(var i=0;i<Global.subUserJson.subUser.length;i++){
                renderText = {
                    text: Global.subUserJson.subUser[i].userName+ '[用户]',
                    value: Global.subUserJson.subUser[i].userId + 'u',
                };
                array.push(renderText);
            }  
            msgToField.setOptions(array);
        }
    }
    
});