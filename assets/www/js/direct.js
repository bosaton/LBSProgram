//下面两个对象定义在计算函数外，确保只在文件包含的时候定义一次,
//从而不会重复定义新的对象，实现程序的整个生命周期只有一个此类对象
var directionsService = new google.maps.DirectionsService();
global.directionsDisplay = new google.maps.DirectionsRenderer();

function calcRoute() {

	//清空前一次查询输出结果
	global.directionsDisplay.setMap(null);
	global.directionsDisplay.setPanel(null);
	
	//设置结果输出地图和面板
	global.directionsDisplay.setMap(global.map);
	global.directionsDisplay.setPanel(document.getElementById("directionsPanel"));

	//start end可以是地名也可以是经纬度
	var start = document.getElementById("from").value;
	var end =   document.getElementById("destiny").value;
	
	var travelMode;
	if($("#travelMode").val()=="driving"){
		travelMode=google.maps.DirectionsTravelMode.DRIVING;
	}else if($("#travelMode").val()=="bicycling"){
		travelMode=google.maps.DirectionsTravelMode.BICYCLING;
	}else if($("#travelMode").val()=="transit"){
		travelMode=google.maps.DirectionsTravelMode.TRANSIT;
	}else if($("#travelMode").val()=="walking"){
		travelMode=google.maps.DirectionsTravelMode.WALKING;
	}
	var request = {
		origin : start,
		destination : end,
		travelMode : travelMode
	};
	directionsService.route(request, function(response, status) {
		if (status == google.maps.DirectionsStatus.OK) {
			global.directionsDisplay.setDirections(response);
		}else if(status == google.maps.DirectionsStatus.NOT_FOUND){
			$("#directionsPanel").text("地图上找不到您填写的地址。");
		}else{
			$("#directionsPanel").text("两地之间无可达路径。");
		}
	});
}