var util = require("util"),
    http = require("http"),
    url = require("url"),
    path = require("path"),
    io = require("socket.io"),
    fs = require("fs"),
    qs  = require('querystring'),
    formidable = require('formidable'),
    redis = require('redis'),
    redisTmpClient = '';

/* **********************
 * 创建http服务器，也可以不用node做http服务器（担心兼容性问题），只用它做socketio服务器
 ***********************/
var server = http.createServer(function(request, response) {

    var uri = url.parse(request.url).pathname;
    var filename = path.join(process.cwd(), uri);
    path.exists(filename, function(exists) {
    	if(!exists) {
    		response.writeHeader(404, {"Content-Type": "text/plain"});
    		response.write("404 Not Found\n");
    		response.end();
    		return;
    	}
		//binary or utf-8
    	fs.readFile(filename, "binary", function(err, file) {
    		if(err) {
    			response.writeHeader(500, {"Content-Type": "text/plain"});
    			response.write(err + "\n");
    			response.end();
    			return;
    		}

    		response.writeHeader(200);
    		response.write(file, "binary");
    		response.end();
    	});
    });
    
  	var redisPubClient =redis.createClient();
	console.log("in servr");
	

  	/* **********************
	   * 用户登录
	   **********************/
    if(uri === "/Login11") {
        var formData = '',
        		userInfo = '';
        request.on("data", function (data) {
            formData += data;
        });
        request.on("end", function () {

            userInfo = qs.parse(formData);
            console.log(userInfo.toString());
					  redisPubClient.hget("per:"+userInfo.userId,"password",function(err, reply){
				    	if(reply == userInfo.psw){
				    		console.log("----user:"+userInfo.userId+" logged in----");
				    		response.end("yes");
	
						  }else{
						  	console.log("----per:"+userInfo.userId+"logged error----");
						  	response.end("no");
						  }
					 });
        });
    }
    
     /* **********************
	   * 用户登录
	   ***********************/
    if(uri === "/Login") {
    		console.log("in incomingform ...");
    		var form = new formidable.IncomingForm();

    		form.parse(request, function(error, fields, files) { 
				    console.log("---"+fields[0]+"--"+ fields[1]); 
						console.log(util.inspect({fields: fields, files: files}));
				    response.end("ok"); 
				  }
			 ); 
    }
    
  
  
	  /* **********************
	   * 用户提交图片，服务器进行存储
	   * 在程序当前目录下创建upload目录，以下通过日期组织
	   ***********************/
    if(uri === "/imgSummit") {
    		var form = new formidable.IncomingForm();
    		var date = new Date();
    		var dirName = date.getFullYear().toString()+date.getMonth()+date.getDate();
				fs.exists("upload/"+dirName, function (exists) {
				  if(!exists){
				  		fs.mkdirSync("upload/"+dirName);
				  }
				});
    		form.uploadDir = "tmp";
    		form.parse(request, function(error, fields, files) { 
				    console.log("---"+fields.value2+" summitting his photo...."); 
				    //console.log(files); 
				    redisTmpClient.hset("per:"+fields.value2,"image","upload/"+dirName+"/"+fields.value2+".jpg");
				    try{
				    	fs.renameSync(files.humanPhoto.path, "upload/"+dirName+"/"+fields.value2+".jpg"); 		//windows路径 
				    }catch(e){
				    	console.log("--in imageSummit,renameSync exception: "+e);
				    }
				    
				    response.writeHead(200, {"Content-Type": "text/html"}); 
				    response.write(dirName.toString()); 
				    //console.log(dirName.toString());
				    response.end(); 
				  }
			 ); 
    }
 
});
server.listen(8000);
util.puts("Nodejs Server running at http://localhost:8000/");


/* **********************
 * 创建socketio监听
 ***********************/
var socket = io.listen(server);
socket.on("connection", function(sckioClient) {
	console.log("----one socketio client connected----");
	
	//浏览器连接到node server时，node server操作redis,创建两个client，
	//一个用于pub，一个用于sub，主要是解决sub模式下的连接不能pub的问题
	var redisSubClient =redis.createClient();
	var redisPubClient =redis.createClient();
	redisTmpClient = redisPubClient;					//供图片上传时用,有隐患
	redisSubClient.on("error", function (err) {
	    console.log("redis error :" + err);
	});
	redisPubClient.on("error", function (err) {
	    console.log("redis error :" + err);
	});
	

	sckioClient.on("message", function(data) {
		var parsed=JSON.parse(data);
		switch (parsed.type) {
			
		/* **********************
 		* 浏览器端sub自身家庭群组
 		***********************/
		case 'subscribe':
			redisPubClient.hget("fmy:"+parsed.channel,"accessPsw",function(err, reply){
					if(reply == parsed.accessPsw){     //群组密码验证成功
							redisSubClient.subscribe(parsed.channel);
							redisPubClient.hget("per:"+parsed.userId,"group",function(err, reply){
								//console.log("----user subscribe server reply: " + reply);
								if(reply == undefined){
									redisPubClient.hset("per:"+parsed.userId,"group",parsed.channel);
								}else{
									var group = reply.split(";");
									for(var i=0;i<group.length;i++){
										if(parsed.channel == group[i]){
											console.log("----user "+parsed.userId+" subscribed existing channel "+ parsed.channel+" , error---- ");
											return;
										}
									}
									redisPubClient.hset("per:"+parsed.userId,"group",reply+";"+parsed.channel, function (err, res) {
										replyGroupList(redisPubClient,redisSubClient,sckioClient,parsed.userId);}
									);
								}
							});
					}else{
							sckioClient.send(JSON.stringify({
								type:"accFmyPswErr"
						  }));    
					}
			});
		

			console.log("----user:"+parsed.userId+" subscribed channel " + parsed.channel);
			break;
			
		//用户注册	
		case 'userRegister':
	    //console.log("---user register--- " +parsed.userName + "  "+parsed.password+"  "+parsed.email);
	    redisPubClient.incr("NoOfUsers");
	    
	    redisPubClient.get("NoOfUsers",function (err, reply){
				var userId = parseInt(reply)+1000;
				console.log("---user register--- " +parsed.userName+ "  "+userId+"  "+parsed.password+"  "+parsed.email);
				redisPubClient.hset("per:"+userId,"userName",parsed.userName);
		    redisPubClient.hset("per:"+userId,"password",parsed.password);
		    redisPubClient.hset("per:"+userId,"image",0);
		    redisPubClient.hset("per:"+userId,"email",parsed.email);
				sckioClient.send(JSON.stringify({
					type:"userRegOk",
					userId:userId
			  }));    
			});
			break;
		
		
			
		/* **********************
 		 * 向redis服务器退订某个频道
 		 ***********************/
		case 'unsubscribe':
			var delGroups= parsed.channel.split(";");
			for(var i=0;i<delGroups.length;i++){
				redisSubClient.unsubscribe(delGroups[i]);
			}

			redisPubClient.hget("per:"+parsed.userId,"group",function(err, reply){
				 //console.log("----user unsubscribe " + reply.replace(parsed.channel+";",";"));
				  var group = reply.split(";");
					for(var j=0;j<delGroups.length;j++){
						for(var k=0;k<group.length;k++){
							if(delGroups[j] == group[k]){
								group.splice(k,1);
							}
						}
					}
					redisPubClient.hset("per:"+parsed.userId,"group",group.join(";"),function (err, res) {
						replyGroupList(redisPubClient,redisSubClient,sckioClient,parsed.userId);}
					);
			});
			console.log("----user:"+parsed.userId+ " unsubscribed channel " + parsed.channel);
			break;
			
		/* **********************
 		 * 接受浏览器的pub请求，向redis服务器的某个频道发布信息
 		 ***********************/
		case 'publish':
			redisPubClient.publish(parsed.channel, JSON
					.stringify(parsed.content));
			console.log("----user: "+parsed.content.userId+" published his location to channel: " + parsed.channel);
			break;
			
			
		//用户登录
		case 'login':
	    redisPubClient.hget("per:"+parsed.userId,"password",function(err, reply){
	    	if(reply == parsed.password){
	    		console.log("----user:"+parsed.userId+" logged in----");
			    sckioClient.send(JSON.stringify({
			    	type:"loginOK",
			    	content:"test"
			    }));
			  }else{
			  	console.log("----per:"+parsed.userId+"logged error----");
			  	sckioClient.send(JSON.stringify({
			    	type:"loginError",
			    	content:"test"
			    }));
			  }
			});
			break;
			
		//群组注册	
		case 'groupRegister':
	    redisPubClient.incr("NoOfGroups"); //群组总数加1
			redisPubClient.get("NoOfGroups",function (err, reply){
				var groupId = parseInt(reply)+1000;
				console.log("---group " +parsed.groupName+ " register; groupId: " +groupId);
				redisPubClient.hset("fmy:"+groupId,"groupName",parsed.groupName);
				redisPubClient.hset("fmy:"+groupId,"accessMode",parsed.accessMode);
				redisPubClient.hset("fmy:"+groupId,"accessPsw",parsed.accessPsw);
				sckioClient.send(JSON.stringify({
					type:"groupRegOk",
					groupId:groupId
			  }));    
			});
			break;
			
		case 'requestGroupList':
				replyGroupList(redisPubClient,redisSubClient,sckioClient,parsed.userId);
			break;
			
		case 'error':
			$("div#output").append("error...");
			break;
			
		default:
			//$("div#output").append("Unknown message type: ");
			break;
		}
	});//end sckioClient.on("message")

	/* **********************
   * 浏览器客户端连接断开时释放redis client
   ***********************/
	sckioClient.on("disconnect", function() {
		redisSubClient.end();
		redisPubClient.end();
		console.log("----some client disconnected----");
	});
	
	
	/* **********************
   * 接受redis服务器pub的消息，即别人分享的位置信息
   ***********************/
	redisSubClient.on("message", function (channel, message) {
	    var parsed=JSON.parse(message);
	    console.log("----now "+parsed.userId+" publish to channel-" +channel+"---"+parsed.latitude + "  "+parsed.longitude);
	    sckioClient.send(JSON.stringify({
	    	type:"publish",
	    	channel: channel,
	    	content:{
	    		userId:parsed.userId,
	    		latitude:parsed.latitude,
	    		longitude: parsed.longitude,
	    		imageUrl:parsed.imageUrl
	    	}
	    }));
	}); //redisSubClient.on("message")
	
});


 /***********************
	* 类型：处理客户端对用户已订阅群组的请求
	* 功能：接受客户端的请求后，服务器获取订阅的群组列表，发送给客户端，同时在redis数据库上执行订阅操作
	***********************/
function replyGroupList(redisPubClient,redisSubClient,sckioClient,userId){
				redisPubClient.hget("per:"+userId,"group",function(err, replyFmyNo){
					var group,loopNo;
					if(replyFmyNo != undefined) {
						group= replyFmyNo.split(";");
						loopNo = group.length;
					}else return;
					var groupName = new Array();
					
					loop();
					
					function loop(){
						redisPubClient.hget("fmy:"+group[loopNo-1] ,"groupName",function(err, reply){
							groupName.push(reply);
							loopNo--;
							if(loopNo ==0){
								//console.log("-===groupName.join()===-"+groupName.reverse().join(";"));
								sckioClient.send(JSON.stringify({
									type:"replyGroupList",
									group:replyFmyNo,
									groupName:groupName.reverse().join(";")
								}));
								
								for(var i=0;i<group.length;i++){
									redisSubClient.subscribe(group[i]);
								}
							} 
							else loop();
						});
				}
			});
}