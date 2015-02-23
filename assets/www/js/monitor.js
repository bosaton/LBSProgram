function startSetFence() {
	//点击“设置围栏”按钮后在地图上显示drawing库图标
	global.drawingManager.setMap(global.map);

	// drawingManager库加载后，用户绘制图形，系统对event进行分析
	google.maps.event.addListener(global.drawingManager,'overlaycomplete',function(event) {
						if(confirm('围栏设置完成？')){
							if (event.type == google.maps.drawing.OverlayType.CIRCLE) {
								// var radius = event.overlay.getRadius();
								global.fence = event.overlay;
								global.fenceType='circle';
							} else if (event.type == google.maps.drawing.OverlayType.POLYGON) {
								global.fence = event.overlay;
								global.fenceType='polygon';
							} else if (event.type == google.maps.drawing.OverlayType.RECTANGLE) {
								global.fence = event.overlay;
								global.fenceType='rectangle';
							} else if (event.type == google.maps.drawing.OverlayType.MARKER) {
								if (global.fence !== undefined) {
									if (!containsLatlng(global.fence, event.overlay
											.getPosition(),global.fenceType)) {
										alert("outside of the fence");
									}
								}
							}
							
							//围栏设置完成后取消地图上drawing库的图标显示
							global.drawingManager.setMap(null);
							
							//event.overlay.addEventListener();
							
						}else{//删除围栏
							event.overlay.setMap(null);
						}
						

					});//end google.maps.event.addListener
}//end function startSetFence()



//判断一个点是否在电子围栏中
function containsLatlng(fence,latLng,fenceType){
	if(fenceType=='circle'){
		return inCircle(fence,latLng);
	}else if(fenceType=='polygon'){
		return inPolygon(fence,latLng);
	}else if(fenceType=='rectangle'){
		return inRectangle(fence,latLng);
	}
}//end function containsLatlng()

function inCircle(circle,latLng){
	return circle.getBounds().contains(latLng);
}

//判断一个点是否在一个多边形中，修改自gmaps库
function inPolygon(polygon,latLng){
    var inPoly = false;

    var numPaths = polygon.getPaths().getLength();
    for (var p = 0; p < numPaths; p++) {
      var path = polygon.getPaths().getAt(p);
      var numPoints = path.getLength();
      var j = numPoints - 1;

      for (var i = 0; i < numPoints; i++) {
        var vertex1 = path.getAt(i);
        var vertex2 = path.getAt(j);
        if (vertex1.lng() < latLng.lng() && vertex2.lng() >= latLng.lng() || vertex2.lng() < latLng.lng() && vertex1.lng() >= latLng.lng()) {
          if (vertex1.lat() + (latLng.lng() - vertex1.lng()) / (vertex2.lng() - vertex1.lng()) * (vertex2.lat() - vertex1.lat()) < latLng.lat()) {
            inPoly = !inPoly;
          }
        }
        j = i;
      }
    }
    return inPoly;
}// end inPolygon();

function inRectangle(rectangle,latLng){
	return rectangle.getBounds().contains(latLng);
}