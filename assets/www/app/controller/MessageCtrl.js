/**
 * 
 */

Ext.define("testS.controller.MessageCtrl", {
    extend : 'Ext.app.Controller',
    alias : "MessageCtrl",
    requires: [
               'Ext.data.Store',
               'Ext.field.Select',
           ],
    config : {
        refs : {
            msgToField:'#msgToField',
            msgField:'#msgField',
            msgBtn:'#msgBtn',
            msgPanel:'#msgPanel',
        },
        
        control : {
            msgBtn:{
                tap : 'msgSend',
            },
        },
    },
    
    msgSend:function(){
        var msg = this.getMsgField().getValue();
        var msgTo = this.getMsgToField().getValue();
        var msgPanel = Ext.getCmp('msgPanel');
        var hisMsg = msgPanel.getHtml()== null ? '':msgPanel.getHtml();
        if(msgTo.charAt(msgTo.length-1) == 'g'){
            Global.socket.send(JSON.stringify({
                type:"pubMsgToChannel",
                srcUser:Global.userId,
                srcUserName:Global.userName,
                channel:msgTo.substring(0,msgTo.length-1),
                msg: msg,
            }));
            var newMsg = '<font color="#FF7F00" size=4 face="黑体"> [我] </font> '
                        +'<i> 对群   </i> '
                        +'<font color="#FF7F00" size=4 face="黑体">['
                        + Global.groupIdToName[msgTo.substring(0,msgTo.length-1)] +'] </font>'
                        + '<i>说:</i><br/>'
                        + '<b>'+msg + '</b><br/>';
            msgPanel.setHtml(hisMsg + newMsg);
        }else if(msgTo.charAt(msgTo.length-1) == 'u'){
            Global.socket.send(JSON.stringify({
                type:"pubMsgToUser",
                srcUser:Global.userId,
                srcUserName:Global.userName,
                dstUser:msgTo.substring(0,msgTo.length-1),
                msg:msg,
            }));
            
//            console.log(msgTo.length);
//            console.log(msgTo.substring(0,msgTo.length-1));
//            console.log(Global.userIdToName[msgTo.substring(0,msgTo.length-1)]);
            var newMsg = '<font color="#FF7F00" size=4 face="黑体"> [我] </font> '
                        +'<i> 对用户   </i> '
                        +'<font color="#FF7F00" size=4 face="黑体">['
                        + Global.userIdToName[msgTo.substring(0,msgTo.length-1)] 
                        +'] </font>'
                        + '<i>说:</i><br/>'
                        + '<b>'+msg + '</b><br/>';
            
//            console.log(hisMsg);
//            console.log(hisMsg+newMsg);
//            console.log(msgPanel);
            msgPanel.setHtml(hisMsg + newMsg);
        }
    },
    
    
});




