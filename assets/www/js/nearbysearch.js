var service;
var listArray=[];
var markers=[];

function srchNearbyStore(){
	nearbySearch(['store']);
}
function srchNearbyRestaurant(){
	nearbySearch(['restaurant']);
}
function srchNearbyBank(){
	nearbySearch(['bank']);
}
function srchNearbyAtm(){
	nearbySearch(['atm']);
}
function srchNearbyHospital(){
	nearbySearch(['hospital']);
}
function srchNearbyPark(){
	nearbySearch(['park']);
}

function nearbySearch(reqTypes){
	//首先清除上次查询显示的结果
	listArray=[];
	$("#nearbySrchResult").empty();
	//基于地图中心，在周围500米的范围内查询商店、银行等
	var request = {
		    location: global.map.getCenter(),
		    radius: '500',
		    types: reqTypes,
	};
	service = new google.maps.places.PlacesService(global.map);
	service.search(request, callback);
}

//results为google.maps.places.PlaceResult类型的对象数组
function callback(results, status) {
	
	if (status == google.maps.places.PlacesServiceStatus.OK) {
	    for (var i = 0; i < results.length; i++) {
	      var place = results[i];
	      listArray[i]=results[i];
	      addToListview(listArray[i]);
	      createMarkerInfo(results[i]);
	    }
	}
	
	var markerclusterer = new MarkerClusterer(global.map, markers);
	//$.mobile.changePage('#nearbySrchResultPage');
	$.mobile.changePage('#homePage');
	//listview完成更新后必须刷新一下
	//$("#nearbySrchResult").listview("refresh");		
}

function addToListview(content){
	$("#nearbySrchResult").append("<li><a href='#'>"+content.vicinity+"   "+content.name+"</a></li>");
}

function createMarkerInfo(placeResult){
    var marker;
    var infoWindow=new google.maps.InfoWindow();
    marker= new google.maps.Marker({
        position: placeResult.geometry.location,
        map: global.map,
        title:placeResult.vicinity+"  "+placeResult.name,
    });
    google.maps.event.addListener(marker, 'click', function(){
    	//var content=placeResult.vicinity+"  "+placeResult.name+"<a href='#'>导向</a>";
        var content = '<div id="info">' +
	        '<a href="#locDescriptionPage">'+placeResult.name +
	        '('+ placeResult.vicinity + ')</a>' +
	        '<button id="test" onClick="direct('+
	        placeResult.geometry.location.lat() +
	        ','+placeResult.geometry.location.lng() +
	        ')">我要去</button>'+
	        '</div>';
        infoWindow.setContent(content);
        infoWindow.open(global.map, marker);
    });
    

    //每个marker添加到markers数组，供MarkerClusterer构造函数调用
    markers.push(marker);
}

//用户点击了marker上“我要去”之后，从myLocation找路到那个marker
function direct(lat,lng){
	var directionsService = new google.maps.DirectionsService();
	global.directionsDisplay = new google.maps.DirectionsRenderer();
	//清空前一次查询输出结果
	global.directionsDisplay.setMap(null);
	
	//设置结果输出地图
	global.directionsDisplay.setMap(global.map);
	var request = {
			origin : global.map.getCenter(),
			destination : new google.maps.LatLng(lat,lng),
			travelMode : google.maps.DirectionsTravelMode.DRIVING,
	};
	directionsService.route(request, function(response, status) {
			if (status == google.maps.DirectionsStatus.OK) {
				global.directionsDisplay.setDirections(response);
			}else if(status == google.maps.DirectionsStatus.NOT_FOUND){
				alert("地图上找不到您填写的地址。");
			}else{
				alert("两地之间无可达路径。");
			}
	});
}
