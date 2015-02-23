/*全局对象，逐步添加完善
 * global.map				地图对象
 * global.drawingManager    绘图库
 * global.fence				围栏
 * global.fenceType			围栏类型，包括圆、多边形和矩形三类
 * global.curPosition		当前位置
 * global.socket			与node连接的全局socketio对象
 * global.families			用户订阅了哪些群组
 * global.familyName		用户订阅群组的名称
 * global.userNo			用户编号
 * global.marker			地图marker
 * 
 */

var global={};

function init(){
	if(!window.device){
		    $(document).ready(onDeviceReady);
		    console.log('===>> window.device');
	}else{
		    document.addEventListener("deviceready", onDeviceReady, true);
		    console.log('===>> document.addEventListener');
	}
	//document.addEventListener("deviceready",onDeviceReady);
}

function onDeviceReady(){
	//similar to document.ready(function(){})		
	$(function(){  
		
		//初始化地图
		var options ={
				zoom: 15,
				mapTypeId: google.maps.MapTypeId.ROADMAP,
				disableDoubleClickZoom : true,
		};
		global.map=new google.maps.Map(document.getElementById("map_canvas"),options);
		if(navigator.geolocation){
			navigator.geolocation.getCurrentPosition(onSuccess,onError);
		}else{
			console.log("您的浏览器不支持HTML5 geoLocation");
		}
		function onSuccess(pos){
			console.log("getCurrentPosition success");
			global.curPosition= new google.maps.LatLng(pos.coords.latitude,pos.coords.longitude);
			global.map.setCenter(global.curPosition);
		}
		function onError(err){
			console.log("getCurrentPosition error "+err);
			global.map.setCenter(new google.maps.LatLng(24.8646,118.6654));
		}
		
		//加载google.maps.drawing库，暂不显示绘图面板，留待用户启动电子围栏功能时显示
		global.drawingManager = new google.maps.drawing.DrawingManager({
			//drawingMode: google.maps.drawing.OverlayType.MARKER,
			drawingControl : true,
			drawingControlOptions : {
				position : google.maps.ControlPosition.TOP_LEFT ,
				drawingModes : [ 
				        //google.maps.drawing.OverlayType.MARKER,
						google.maps.drawing.OverlayType.CIRCLE,
						google.maps.drawing.OverlayType.POLYGON,
						google.maps.drawing.OverlayType.RECTANGLE ]
			},
			circleOptions : {
				fillColor : '#ffff00',
				fillOpacity : 1,
				strokeWeight : 5,
				clickable : false,
				editable : true,
				zIndex : 1
			}
		});
		//开始时取消地图库显示
		global.drawingManager.setMap(null);
		
		initConnect();
	});	//end ready()
}//end onDeviceReady()  phoneGap



/* **********************
 * 初始化与服务器的连接，建立监听
 ***********************/
function initConnect(){
	global.socket = new io.connect("http://192.168.1.2:8080");
	global.marker = new Array();
	global.socket.on('connect', function(){
		console.log("connected");
	});
	global.socket.on("disconnect", function(){ 
		console.log("disconnected"); 
	});
	
	global.socket.on("message", function(data){ 
		console.log("received message: " + data);
		var parsed=JSON.parse(data);
		switch (parsed.type) {
			//接受服务器端pub的消息
           case 'publish':
        	  //console.log("received "+ parsed.content.userNo+" publish--");
        	  if(global.marker[parsed.content.userNo] != undefined){
					global.marker[parsed.content.userNo].setMap(null);
        	  }
    	 	  var tempMarker= new google.maps.Marker({
        	        position: new google.maps.LatLng(parsed.content.latitude,parsed.content.longitude),
        	        map: global.map,
        	        title: "--id: "+parsed.content.userNo
        	  });
    	 	  
        	  global.marker[parsed.content.userNo] = tempMarker;
              break;
              
           case 'userRegOk':
        	   global.userNo= parsed.userNo;
           	   alert("您的个人编号："+parsed.userNo);
               break;    
               
           case 'loginOK':
           	   console.log("loginOK");
           	   $.mobile.changePage('#mainPage');
	           //打开程序后及时请求订阅的群组列表
	           global.socket.send(JSON.stringify({
	           		type:"requestFamilyList",
	           		userNo:global.userNo
	           }));
               break;
               
           case 'loginError':
           	   alert("loginError");
               break;
               
           case 'accFmyPswErr':
        	   alert("群组密码错误，请重新输入！");
        	   break;
        	   
           case 'familyRegOk':
           	   alert("您创建的群组号码："+parsed.familyNo);
               break; 
               
           case 'reqGroupList':
        	   console.log("--reqGroupList: "+parsed.family);
        	   if(parsed.family == "") break;
        	   global.families = parsed.family.split(";");
        	   global.familyName = parsed.familyName.split(";");
        	   for(var i=0;i<global.families.length;i++){
        		   console.log("您订阅了群组"+global.families[i]+"---"+global.familyName[i]);
        	   }
	           //用匿名函数解决setInterval()不能传递函数参数的问题
	           window.setInterval(function(){
	           			pubPosition(global.families);
	           		},100000); //3 minutes
	           renderFamilyList();
               break; 
               
           case 'error':
			  $("div#output").append("error is :"+parsed.content);
              break;
           default:
              $("div#output").append('Unknown message type ' + parsed.type);
              break;
         }
	}); //global.socket.on("message")
}




/* **********************
 * 向订阅的所有频道共享自身位置
 ***********************/
function pubPosition(families){
	for(var i=0;i<families.length;i++){
		global.socket.send(JSON.stringify({
			type:"publish",
			channel:families[i],
			content:{
					 userNo:global.userNo,
					 latitude:"24.874699",
				     longitude:"118.675464"
			}
		}));
	}
}//end pubPosition()


/* **********************
 * 订阅频道
 ***********************/
function subFamilies(){
	var familyNo= $("#familyNo").val();
	var familyPsw= $("#familyPsw").val();
	if(familyNo==""){
		alert("请输入群组编号");
	}else{
		global.socket.send(JSON.stringify({
			type:"subscribe",
			userNo:global.userNo,
			channel:familyNo,
			accessPsw:familyPsw
		}));
	}
}//end subFamilies()


/* **********************
 * 取消对某个频道的订阅
 ***********************/
function unSubFamilies(){
	var delFamilies = new Array();
	for(var i=0;i<global.families.length;i++){
		if($("#familiListBox-"+i).attr("checked")=="checked")
		delFamilies.push(global.families[i]);
	}
	console.log("you unsubscribe the family:"+delFamilies.join(";"));
	global.socket.send(JSON.stringify({
		type:"unsubscribe",
		userNo:global.userNo,
		channel:delFamilies.join(";")
	}));
}//end subFamilies()


/* **********************
 * 用户注册
 ***********************/
function userRegister(){
	var userName= $("#regName").val();
	var password = $("#regPassword").val();
	var passwordr = $("#regPasswordr").val();
	var email = $("#regEmail").val();
	
	if(password!==passwordr)
		alert("两次输入密码不一样");
	else{
		global.socket.send(JSON.stringify({
			type:"userRegister",
			userName:userName,
			password:password,
			email:email
		}));
	}
}//end userRegister()


/* **********************
 * 群组(频道)注册
 ***********************/
function familyRegister(){
	var familyName= $("#regFamilyName").val();
	var accessPsw= $("#accessPsw").val();
	
	if(familyName == ""){
		alert("请输入群组名称！");
		return;
	}
	if(familyName.indexOf(";") != -1){
		alert("群组名称中不得包含分号！");
		return;
	}
		
	
	if($("#accessModePsw").attr("checked")== "checked"){
		if(accessPsw == ""){
			alert("密码不得为空！");
			return;
		}
		
		global.socket.send(JSON.stringify({
			type:"familyRegister",
			familyName:familyName,
			accessMode:"psw",
			accessPsw:accessPsw
		}));	
		
	}else{
		
	}

}


/* **********************
 * 用户登录
 ***********************/
function userLogin(){
	global.userNo= $("#logUserNo").val();
	var password = $("#logPassword").val();
	global.socket.send(JSON.stringify({
		type:"login",
		userNo:global.userNo,
		password:password
	}));
}//end userLogin()


/* **********************
 * 订阅管理中呈现用户已经订阅的群组列表
 ***********************/
function renderFamilyList(){
		var str="";
		for(var i=0;i<global.families.length;i++){
			str = str + '<input type="checkbox" '+ '" id="familiListBox-'+ i +'" class="custom" />	<label for="familiListBox-'+ i +'">'
				  + global.familyName[i] + ' ('+global.families[i]+ ')</label>';
		}
		console.log(str);
		$("#familyListField").html(str);
		//$("#familyListField").refresh();
}//end renderFamilyList()