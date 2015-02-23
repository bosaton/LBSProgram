//<debug>
Ext.Loader.setPath({
    'Ext': 'touch/src',
    'testS': 'app'
});
//</debug>

var Global = {
        serverAddr : "http://192.168.1.4",
        nodejsPort: 8000,
        httpPort: 80,
        //pubInterval: 20000,
        loadingText : '努力加载中...',
        loadMoreText : "加载更多信息...",
        submitText : "数据提交中...",
        width : "100%",
        height : "100%",
        socket: null,
        map: null,
        //initialPos:null,
        marker: null,
        userId: null,
        userIdToName: new Array(),
        groupIdToName: new Array(),
        userIdToInfoWindow: new Array(),
        userIdToMarker:new Array(),
        subGroupJson: null,
        subUserJson: null,
        iconURI: null,
        iconUrlAtServer: null,
        bottomView: null,           //the only lowest view
        drawingManager: null,
        temp:null,
    };


Ext.application({
    name: 'testS',

    requires: [
        'Ext.MessageBox',
        'Ext.NavigationView'
    ],
    
    stores :['UserLists','GroupLists'],
    views: ['BottomView','Main','Login','SettingView','PubSubView','UsrRgst','PersonalSetting','MessageView','FenceSettingView'],
    controllers : ['LoginCtrl','SettingCtrl','UserRgstCtrl','PubSubCtrl','PersonalSettingCtrl','FenceSetCtrl','MessageCtrl'],


    icon: {
        '57': 'resources/icons/Icon.png',
        '72': 'resources/icons/Icon~ipad.png',
        '114': 'resources/icons/Icon@2x.png',
        '144': 'resources/icons/Icon~ipad@2x.png'
    },

    isIconPrecomposed: true,

    startupImage: {
        '320x460': 'resources/startup/320x460.jpg',
        '640x920': 'resources/startup/640x920.png',
        '768x1004': 'resources/startup/768x1004.png',
        '748x1024': 'resources/startup/748x1024.png',
        '1536x2008': 'resources/startup/1536x2008.png',
        '1496x2048': 'resources/startup/1496x2048.png'
    },

    
    launch: function() {
        
        //切换到登录页面时，预设上次最后登录的用户名和密码
//        Ext.Viewport.onAfter('add', function(){
//            var userId = window.localStorage.key(0);
//            if(!Ext.isEmpty(userId)){
//                Ext.getCmp('userIdLogin').setValue(userId);
//                Ext.getCmp('pwdLogin').setValue(window.localStorage.getItem(userId));
//            }
//        });
        
        Global.bottomView = Ext.create('testS.view.BottomView');
        Ext.Viewport.add(Global.bottomView);
        Global.bottomView.setActiveItem(0);
        
        document.addEventListener("deviceready",onDeviceReady,false);
        function onDeviceReady(){
            //创建一个本软件专用文件夹
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fs){
                    fs.root.getDirectory("lbsprogram", {create:true},  
                        function(fileEntry){},  
                        function(err){  console.log("创建文件夹lbsprogram失败："+ err.code);});  
                    fs.root.getDirectory("lbsprogram/icons", {create:true},  
                        function(fileEntry){},  
                        function(err){  console.log("创建文件夹lbsprogram/icons失败"+ err.code);});  
                },
                function(){
                    alert("获取文件系统失败！");
                }
            ); 
            
            if(navigator.connection.type != Connection.NONE){
                initSocketio();
            }else{
                console.log('offline');
            }
            
            
            
            //处理android手机上硬件返回按钮
            document.addEventListener("backbutton",function(){
                //console.log(Ext.Viewport.getActiveItem());
                //navigator.app.backHistory();
                Ext.Msg.confirm("Confirmation", "确认退出？", function(btn){
                    if(btn =='yes'){
//                        console.log(Global.socket);
                        Global.socket.disconnect();
//                        setTimeout('navigator.app.exitApp()',1000*1);
                        navigator.app.exitApp();
                    }else{
                    }
                });
            },false);
        };
        
        //加载google.maps.drawing库，暂不显示绘图面板，留待用户启动电子围栏功能时显示
        Global.drawingManager = new google.maps.drawing.DrawingManager({
            //drawingMode: google.maps.drawing.OverlayType.MARKER,
            drawingControl : true,
            drawingControlOptions : {
                position : google.maps.ControlPosition.TOP_LEFT ,
                drawingModes : [ 
                        //google.maps.drawing.OverlayType.MARKER,
                        google.maps.drawing.OverlayType.CIRCLE,
//                        google.maps.drawing.OverlayType.POLYGON,
//                        google.maps.drawing.OverlayType.RECTANGLE 
                        ]
            },
            circleOptions : {
                fillColor : '#C4E1FF',
                fillOpacity : 1,
                strokeWeight : 3,
                clickable : false,
                editable : true,
                zIndex : 1
            }
        });
        
    },

    onUpdated: function() {
        Ext.Msg.confirm(
            "Application Update",
            "This application has just successfully been updated to the latest version. Reload now?",
            function(buttonId) {
                if (buttonId === 'yes') {
                    window.location.reload();
                }
            }
        );
    },
    
    
});


/* **********************
 * 初始化与服务器的连接，建立监听
 ***********************/
function initSocketio(){
    Global.socket = new io.connect(Global.serverAddr+':'+Global.nodejsPort);
    Global.marker = new Array();
    
    Global.socket.on('connect', function(){
        console.log("remote socketio server connected");
    });
    
    Global.socket.on("disconnect", function(){ 
        console.log("disconnected"); 
    });
    
    Global.socket.on('Login',function(data){
        Ext.Viewport.unmask();
        var parsed=JSON.parse(data);
        Global.userIdToName[Global.userId]=parsed.userName;
        if(parsed.content == 'loginOk'){
//            console.log('loginok');
            Global.bottomView.setActiveItem(1);
            
            //subGroup/channel
            Global.socket.emit('ReqSubGroupList',JSON.stringify({
                userId:Global.userId,
            }));
            
            //subUser
            Global.socket.emit('ReqSubUserList',JSON.stringify({
                userId:Global.userId,
            }));
            
//            window.localStorage.setItem(Global.userId, parsed.psw);

        }else{
            alert('用户名或密码错误');
        }
    });
    
    Global.socket.on('UserRgst',function(data){
        Ext.Viewport.unmask();
        var parsed=JSON.parse(data);
        if(parsed.content == 'rgstOk'){
            alert('您申请的编号是'+parsed.userId);
        }else{
            alert('连接错误');
        }
    });
    
    Global.socket.on('ChangeInfo',function(data){
        var parsed=JSON.parse(data);
        switch(parsed.type){
            case 'userName' :
                if(parsed.content=='changeOk' )
                    alert('修改用户名成功');
                break;
            case 'password':
                if(parsed.content=='changeOk' )
                    alert('修改密码成功');
                break;
            case 'email':
                if(parsed.content=='changeOk' )
                    alert('修改邮箱成功');
                break;
        }
    });
    
    Global.socket.on('CreateGroup',function(data){
        console.log('in create group '+data);
        Ext.Viewport.unmask();
        var parsed=JSON.parse(data);
        if(parsed.content == 'CreateGroupOk')
            alert('您创建的群组号为:'+parsed.groupId);
    });
    
    Global.socket.on('JoinGroup',function(data){
        Ext.Viewport.unmask();
        var parsed=JSON.parse(data);
        if(parsed.content == 'joinOk')
            alert('您加入了群组:'+parsed.groupId);
        else
            alert('群组验证密码错误');
    });
    
    Global.socket.on('QuitGroup',function(data){
        var parsed=JSON.parse(data);
        if(parsed.content == 'quitGrpOk')
            alert('退出群组成功');
    });
    
    Global.socket.on('SubUserReq',function(data){
        var parsed=JSON.parse(data);
        Ext.Msg.confirm("Confirmation", "用户("+parsed.userName+")请求订阅您的位置，是否同意？", function(btn){
            if(btn =='yes'){
                Global.socket.emit('SubUserReply',JSON.stringify({
                    userId: parsed.userId,
                    subId : parsed.subId,
                    subName: parsed.subName,
                    content:'subUserOk',
                }));
            }else{
                Global.socket.emit('SubUserReply',JSON.stringify({
                    userId: parsed.userId,
                    subId : parsed.subId,
                    subName: parsed.subName,
                    content:'subUserFail',
                }));
            }
        });
    });
    
    Global.socket.on('SubUserReply',function(data){
        Ext.Viewport.unmask();
        var parsed=JSON.parse(data);
        if(parsed.content == 'subUserOk'){
            alert('订阅('+parsed.subName+')用户成功');
        }else if(parsed.content=='userNotFound'){
            alert('无此用户');
        }else if(parsed.content=='userOffline'){
            alert('用户不在线');
        }
    });
    
    Global.socket.on('QuitUserSub',function(data){
        var parsed=JSON.parse(data);
        if(parsed.content == 'quitUserSubOk')
            alert('退出用户成功');
    });
    
    Global.socket.on('ReqSubGroupList',function(data){
        //console.log('--subgroujson: Global.subGroupJson');
        //console.log(data);
        //var parsed=eval ("(" + data + ")");
        Global.subGroupJson = JSON.parse(data);
        //console.log(Global.subGroupJson);
        for(var i=0;i<Global.subGroupJson.subGroup.length;i++){
            Global.groupIdToName[ Global.subGroupJson.subGroup[i].groupId] = Global.subGroupJson.subGroup[i].groupName;
        }
    });
    
    Global.socket.on('ReqSubUserList',function(data){
        Global.subUserJson = JSON.parse(data);
        for(var i=0;i<Global.subUserJson.subUser.length;i++){
            Global.userIdToName[ Global.subUserJson.subUser[i].userId] = Global.subUserJson.subUser[i].userName;
        }
    });
    
    Global.socket.on('AddFenceReply',function(data){
        var parsed=JSON.parse(data);
        if(parsed.content == 'AddFenceOk')
            alert('添加围栏成功');
    });
    
    Global.socket.on("message", function(data){ 
//        console.log('in message: '+ data);
        var parsed=JSON.parse(data);
        switch (parsed.type) {
           //接受服务器端pub其他用户的消息
           case 'pubPosToChannel':
           case 'pubPosToUser':
              console.log("--user: "+ parsed.content.userId+" published his position--");
              if(Global.userIdToMarker[parsed.content.userId] != undefined){
                    Global.userIdToMarker[parsed.content.userId].setMap(null);
              }
              Global.userIdToMarker[parsed.content.userId]= new MarkerWithLabel({
                    position: new google.maps.LatLng(parsed.content.latitude,parsed.content.longitude),
//                    map: Global.map,
                    icon:'resources\\icons\\background.png',
                    labelContent: Global.userIdToName[parsed.content.userId],
              });
              if(parsed.content.userId==Global.userId) break;
              
              //先判断本地文件夹有无此图片,如果没有，就查找服务器有无该图片,如服务器也没有则设置文字型图片
              window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem){ 
                  fileSystem.root.getFile("lbsprogram/icons/"+parsed.content.userId+'.png', {create:false}, function(fileEntry){  
                      //有该图片，直接显示
                      console.log(parsed.content.userId+'.png found locally');
                      Global.userIdToMarker[parsed.content.userId].setIcon('lbsprogram/icons/'+parsed.content.userId+'.png');
                   },function(){  
                      //没该图片，就查找服务器有无该图片,如服务器也没有则设置文字型图片
                      console.log(parsed.content.userId+'.png not found locally,apply to server');  
                      var fileTransfer = new FileTransfer();
                      var uri =  Global.serverAddr+':'+Global.httpPort + '/upload/'+ parsed.content.userId+'.png' ; 
                      var filePath = "lbsprogram/icons/"+parsed.content.userId+".png";
                      fileTransfer.download(
                             encodeURI(uri),
                             filePath,
                             function(entry) {
                                 console.log("image have been downloaded into: " + filePath);
                                 Global.userIdToMarker[parsed.content.userId].setIcon("lbsprogram/icons/"+parsed.content.userId+'.png');
                             },             
                             function(error) {
                                 console.log("download image error, code:"+error.code+ ",creating character icon" );
                             }
                       );
                   });   
              });
              
              var infowindow = new google.maps.InfoWindow({
                  content: '<div><a>历史 </a><a>绘图</a></div>',
              });

              google.maps.event.addListener(Global.userIdToMarker[parsed.content.userId], 'click', function() {
                  infowindow.open(Global.map,Global.userIdToMarker[parsed.content.userId]);
              });
              
              
              Global.userIdToMarker[parsed.content.userId].setMap(Global.map);
              break;
              
           case 'pubMsgToChannel':
               if(parsed.srcUser == Global.userId) break;
               var msgPanel = Ext.getCmp('msgPanel');
               var hisMsg = msgPanel.getHtml()== null ? '':msgPanel.getHtml();
               var newMsg = '<i>用户</i>'+'<font color="#FF7F00" size=4 face="黑体">['
                           + parsed.srcUserName +'] </font> '
                           +'<i>对群</i>'
                           + '<font color="#FF7F00" size=4 face="黑体"> ['
                           +Global.groupIdToName[parsed.channel]+' ]</font> '
                           +'<i>说:'+parsed.timestamp.substr(10)+'</i><br/>'
                           + '<b>'+parsed.msg + '</b><br/>';
               console.log('received msg:'+parsed.msg);
               msgPanel.setHtml(hisMsg + newMsg);
           case 'pubMsgToUser':
              if(parsed.srcUser == Global.userId) break;
              var msgPanel = Ext.getCmp('msgPanel');
              var hisMsg = msgPanel.getHtml()== null ? '':msgPanel.getHtml();
              var newMsg = '<i>用户</i>'+'<font color="#FF7F00" size=4 face="黑体">['
                          + parsed.srcUserName +'] </font> '
                          +'<i>对</i>'
                          + '<font color="#FF7F00" size=4 face="黑体"> [我 ]</font> '
                          +'<i>说:'+parsed.timestamp.substr(10)+'</i><br/>'
                          + '<b>'+parsed.msg + '</b><br/>';
              console.log('received msg:'+parsed.msg);
              msgPanel.setHtml(hisMsg + newMsg);
              //console.log(newMsg);
               break;
           default:
              console.log('--Global.socket.switch.default--');
              break;
         }
    }); //Global.socket.on("message")
    
    
////  //测试android待机时pub位置，良好
//  window.setInterval(function(){
//      console.log('in window .setinterval');
//           
//      if(!Ext.isEmpty(Global.subUserJson)){
//          var temp = Global.subUserJson.content.items;
//          var subUserList = new Array();
//          for(var i=0; i<temp.length; i++){
//              subUserList[i]= temp[i].renderText.substring(temp[i].renderText.lastIndexOf('(')+1,temp[i].renderText.length-1);
//              Global.socket.send(JSON.stringify({
//                  type:"pubToUser",
//                  dstUser:subUserList[i],
//                  content:{
//                      userId:Global.userId,
//                      latitude:24.800438,
//                      longitude:-118.55568,
//                  }
//              }));
//          }
//      }
//      
//      if(!Ext.isEmpty(Global.subGroupJson)){
//          var temp = Global.subGroupJson.content.items;
//          var subGroupList = new Array();
//          for(var i=0; i<temp.length; i++){
//              subGroupList[i]= temp[i].renderText.substring(temp[i].renderText.lastIndexOf('(')+1,temp[i].renderText.length-1);
//              Global.socket.send(JSON.stringify({
//                  type:"pubToChannel",
//                  channel:subGroupList[i],
//                  content:{
//                      userId:Global.userId,
//                      latitude:24.800438,
//                      longitude:-118.55568,
//                  }
//              }));
//          }
//      }
//      
//      
//      
//       },20000); //3 minutes
    
    
    navigator.geolocation.watchPosition(function(pos){
        console.log('-now publish position-');
        if(!Ext.isEmpty(Global.subUserJson)){
            var temp = Global.subUserJson.subUser;
            for(var i=0; i<temp.length; i++){
                Global.socket.send(JSON.stringify({
                    type:"pubPosToUser",
                    dstUser:temp[i].userId,
                    content:{
                        userId:Global.userId,
                        latitude:pos.coords.latitude,
                        longitude:pos.coords.longitude,
                    }
                }));
            }
        }
        
        if(!Ext.isEmpty(Global.subGroupJson)){
            var temp = Global.subGroupJson.subGroup;
            for(var i=0; i<temp.length; i++){
                Global.socket.send(JSON.stringify({
                    type:"pubPosToChannel",
                    channel:temp[i].groupId,
                    content:{
                        userId:Global.userId,
                        latitude:pos.coords.latitude,
                        longitude:pos.coords.longitude,
                    }
                }));
            }
        }
      },function(){
        alert('获取位置信息失败');
      },{
          maximumAge:200000,
      }
   );
    
}

