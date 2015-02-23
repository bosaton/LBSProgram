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
  
	  /* **********************
	   * 用户提交图片，服务器进行存储
	   * 在程序当前目录下创建upload目录，以下通过日期组织
	   ***********************/
    if(uri === "/imgSummit") {
    		var form = new formidable.IncomingForm();
    		var date= new Date();
				fs.exists("upload/"+date.getFullYear()+date.getMonth()+date.getDate(), function (exists) {
				  if(!exists){
				  		fs.mkdirSync("upload/"+date.getFullYear()+date.getMonth()+date.getDate());
				  }
				});
    		form.uploadDir = "tmp";
    		form.parse(request, function(error, fields, files) { 
				    console.log("---"+fields.value2+" summitting his photo...."); 
				    //console.log(files); 
				    redisTmpClient.hset("per:"+fields.value2,"image","upload/"+date.getFullYear()+date.getMonth()+date.getDate()+"/"+fields.value2+".jpg");
				    try{
				    	fs.renameSync(files.humanPhoto.path, "upload/"+date.getFullYear()+date.getMonth()+date.getDate()+"/"+fields.value2+".jpg"); 		//windows路径 
				    }catch(e){
				    	console.log("--in imageSummit,renameSync exception: "+e);
				    }
				    
				    response.writeHead(200, {"Content-Type": "text/html"}); 
				    response.write("received image:<br/>"); 
				    response.end(); 
				  }); 
    }
 
});
server.listen(8080);
util.puts("Nodejs Server running at http://localhost:8080/");


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
	redisTmpClient = redisPubClient;					//供图片上传时用
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
							redisPubClient.hget("per:"+parsed.userNo,"family",function(err, reply){
								//console.log("----user subscribe server reply: " + reply);
								if(reply == undefined){
									redisPubClient.hset("per:"+parsed.userNo,"family",parsed.channel);
								}else{
									var family = reply.split(";");
									for(var i=0;i<family.length;i++){
										if(parsed.channel == family[i]){
											console.log("----user "+parsed.userNo+" subscribed existing channel "+ parsed.channel+" , error---- ");
											return;
										}
									}
									redisPubClient.hset("per:"+parsed.userNo,"family",reply+";"+parsed.channel, function (err, res) {
										replyFamilyList(redisPubClient,redisSubClient,sckioClient,parsed.userNo);}
									);
								}
							});
					}else{
							sckioClient.send(JSON.stringify({
								type:"accFmyPswErr"
						  }));    
					}
			});
		

			console.log("----user:"+parsed.userNo+" subscribed channel " + parsed.channel);
			break;
			
			
		/* **********************
 		 * 向redis服务器退订某个频道
 		 ***********************/
		case 'unsubscribe':
			var delFamilies= parsed.channel.split(";");
			for(var i=0;i<delFamilies.length;i++){
				redisSubClient.unsubscribe(delFamilies[i]);
			}

			redisPubClient.hget("per:"+parsed.userNo,"family",function(err, reply){
				 //console.log("----user unsubscribe " + reply.replace(parsed.channel+";",";"));
				  var family = reply.split(";");
					for(var j=0;j<delFamilies.length;j++){
						for(var k=0;k<family.length;k++){
							if(delFamilies[j] == family[k]){
								family.splice(k,1);
							}
						}
					}
					redisPubClient.hset("per:"+parsed.userNo,"family",family.join(";"),function (err, res) {
						replyFamilyList(redisPubClient,redisSubClient,sckioClient,parsed.userNo);}
					);
			});
			console.log("----user:"+parsed.userNo+ " unsubscribed channel " + parsed.channel);
			break;
			
		/* **********************
 		 * 接受浏览器的pub请求，向redis服务器的某个频道发布信息
 		 ***********************/
		case 'publish':
			redisPubClient.publish(parsed.channel, JSON
					.stringify(parsed.content));
			console.log("----user: "+parsed.content.userNo+" published his location to channel: " + parsed.channel);
			break;
			
		//用户注册	
		case 'userRegister':
	    //console.log("---user register--- " +parsed.userName + "  "+parsed.password+"  "+parsed.email);
	    redisPubClient.incr("NoOfUsers");
	    
	    redisPubClient.get("NoOfUsers",function (err, reply){
				var userNo = parseInt(reply)+1000;
				console.log("---user register--- " +parsed.userName+ "  "+userNo+"  "+parsed.password+"  "+parsed.email);
				redisPubClient.hset("per:"+userNo,"userName",parsed.userName);
		    redisPubClient.hset("per:"+userNo,"password",parsed.password);
		    redisPubClient.hset("per:"+userNo,"image",0);
		    redisPubClient.hset("per:"+userNo,"email",parsed.email);
				sckioClient.send(JSON.stringify({
					type:"userRegOk",
					userNo:userNo
			  }));    
			});
			break;
			
			
		//用户登录
		case 'login':
	    redisPubClient.hget("per:"+parsed.userNo,"password",function(err, reply){
	    	if(reply == parsed.password){
	    		console.log("----user:"+parsed.userNo+" logged in----");
			    sckioClient.send(JSON.stringify({
			    	type:"loginOK",
			    	content:"test"
			    }));
			  }else{
			  	console.log("----per:"+parsed.userNo+"logged error----");
			  	sckioClient.send(JSON.stringify({
			    	type:"loginError",
			    	content:"test"
			    }));
			  }
			});
			break;
			
		//群组注册	
		case 'familyRegister':
	    redisPubClient.incr("NoOfFamilies"); //群组总数加1
			redisPubClient.get("NoOfFamilies",function (err, reply){
				var familyNo = parseInt(reply)+1000;
				console.log("---family " +parsed.familyName+ " register; familyNo: " +familyNo);
				redisPubClient.hset("fmy:"+familyNo,"familyName",parsed.familyName);
				redisPubClient.hset("fmy:"+familyNo,"accessMode",parsed.accessMode);
				redisPubClient.hset("fmy:"+familyNo,"accessPsw",parsed.accessPsw);
				sckioClient.send(JSON.stringify({
					type:"familyRegOk",
					familyNo:familyNo
			  }));    
			});
			break;
			
		case 'requestFamilyList':
				replyFamilyList(redisPubClient,redisSubClient,sckioClient,parsed.userNo);
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
	    console.log("----now "+parsed.userNo+" publish to channel-" +channel+"---"+parsed.latitude + "  "+parsed.longitude);
	    sckioClient.send(JSON.stringify({
	    	type:"publish",
	    	channel: channel,
	    	content:{
	    		userNo:parsed.userNo,
	    		latitude:parsed.latitude,
	    		longitude: parsed.longitude
	    	}
	    }));
	}); //redisSubClient.on("message")
	
});


 /***********************
	* 类型：处理客户端对用户已订阅群组的请求
	* 功能：接受客户端的请求后，服务器获取订阅的群组列表，发送给客户端，同时在redis数据库上执行订阅操作
	***********************/
function replyFamilyList(redisPubClient,redisSubClient,sckioClient,userNo){
				redisPubClient.hget("per:"+userNo,"family",function(err, replyFmyNo){
					var family,loopNo;
					if(replyFmyNo != undefined) {
						family= replyFmyNo.split(";");
						loopNo = family.length;
					}else return;
					var familyName = new Array();
					
					loop();
					
					function loop(){
						redisPubClient.hget("fmy:"+family[loopNo-1] ,"familyName",function(err, reply){
							familyName.push(reply);
							loopNo--;
							if(loopNo ==0){
								//console.log("-===familyName.join()===-"+familyName.reverse().join(";"));
								sckioClient.send(JSON.stringify({
									type:"replyFamilyList",
									family:replyFmyNo,
									familyName:familyName.reverse().join(";")
								}));
								
								for(var i=0;i<family.length;i++){
									redisSubClient.subscribe(family[i]);
								}
							} 
							else loop();
						});
				}
			});
}