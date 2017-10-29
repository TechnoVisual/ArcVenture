// ArcVenture Engine Code
// (c) Mark Vanstone 2017
//

// Global Variables
var AVCanvas, AVCanvasContext;
var AVImageData =[];
var AVMenuData = null;
var AVMapData = null;
var AVLoop;
var AVStage="logo";
var AVExit=false;
var AVClickEvent = null;
var AVCurrentMenu = null;
var AVMenuText = "24px Arial";
var AVCurrentMapX = 5;
var AVCurrentMapY = 5;
var AVCurrentMap = null;
var AVCurrentMapView = 0;
// 

function AVLog(msg){
	console.log(msg);
}
 
function AVInit(){
	// Initialise the game
	AVLog("Initialising AVEngine.");
	AVCanvas = document.getElementById('AVEngine');
	AVCanvasContext = AVCanvas.getContext('2d');
	AVloadImages("data/images_0.json");
	AVloadMenus("data/menus.json");
	AVloadMaps("data/maps.json");
	AVCanvas.addEventListener('click', AVCanvasClick, false);
}

function AVMainLoop(){
		AVLog("AVMainLoop: Stage:"+AVStage);
		switch(AVStage){
			case "logo" : 
				drawLogo();
				AVLoop = setInterval(checkContinue,200);
				break;
			case "main menu":
				AVSetMenu("Main");
				break;
		}
}

function AVWaitForImages(){
	c=0;
	for (var i in AVImageData) {
		if(AVImageData[i]["loaded"] == true) c++;
	}
	if(c == AVImageData['imageCount'] && AVMenuData != null && AVMapData != null){
		AVLog("Initial data loaded - passing to AVMainLoop.");
		clearInterval(AVLoop);
		AVMainLoop();
	}
}

function AVloadImages(path){
	loadJSON(path, loadImagesCallback);
}

function AVloadMenus(path){
	loadJSON(path, loadMenusCallback);
}

function AVloadMaps(path){
	loadJSON(path, loadMapsCallback);
}

function loadImagesCallback(response){
	imgJson = JSON.parse(response);
	imagelist = imgJson.images;
	if(imagelist.length > 0){
		for(i=0;i<imagelist.length;i++){
			img = [];
			img["name"] = imagelist[i].name;
			img["image"] = new Image();
			img["image"].src = imagelist[i].path;
			img["loaded"] = false;
			img["image"].onload = function() {
				AVSetImageLoaded(this.src);
			}
			AVImageData[imagelist[i].name] = img;
		}
	}
	AVImageData['imageCount'] = imagelist.length;
	AVLog("Got image list - waiting for loaded signal.");
	AVLoop = setInterval(AVWaitForImages, 100);
} 

function loadMenusCallback(response){
	AVMenuData = JSON.parse(response);
}

function loadMapsCallback(response){
	AVMapData = JSON.parse(response);
}

function AVSetImageLoaded(src){
	for(var i in AVImageData){
		if(AVImageData[i]["image"]){
			if(AVImageData[i]["image"]["src"] == src) AVImageData[i]["loaded"] = true ;
		}
	}
}

function AVSetMenu(mName){
	AVLog("AVSetMenu: "+mName);
	AVCurrentMenu = findMenu(mName);
	drawMenu(AVCurrentMenu);
	AVLoop = setInterval(checkMenu,200);
}

function checkMenu(){
	thisMenu = AVCurrentMenu;
	thisClick = null;
	if(AVClickEvent != null){
		for(var m in thisMenu["items"]){
			mn = thisMenu["items"][m];
			if(AVClickEvent.x > mn["bx"] && AVClickEvent.x < mn["bx"]+mn["bw"] && AVClickEvent.y > mn["by"] && AVClickEvent.y < mn["by"]+mn["bh"]){
				thisClick = mn;
			}
		}
	}
	if(thisClick != null){
		AVClickEvent = null;
		AVLog("Menu item clicked: "+thisClick["text"]);
		clearInterval(AVLoop);
		var fn = window[thisClick["link"]];
		fn();
	}
}

function isoTest(){
	AVLoop = setInterval(isoLoop,100);
}

function mapMaker(){
	drawMapMakerUi();
	AVLoop = setInterval(mapMakerLoop,100);
}

function isoLoop(){
	var ctx = AVCanvasContext;
	clearScreen("#000000");
	ctx.font = AVMenuText;
	ctx.fillStyle = "#ffffff";
	ctx.fillText("Isometric Test",240,40);
	var x,y;
	var md = findMap("map1");
	var mdval = md["data"];
	for(x=0;x<10;x++){
		for(y=0;y<10;y++){
			if(mdval[(x*10)+y] == 1){
				ctx.drawImage(AVImageData['map1'].image, 288-(x*32)+(y*32), 80+(y*16)+(x*16));
			}
		}
	}
}

//// Map Functions
//---------------------

function mapMakerLoop(){
	var ctx = AVCanvasContext;
	var scale = 0.5;
	clearScreen("#000000");
	ctx.font = AVMenuText;
	drawCentreText("ArcVenture Map Maker",40);
	if(AVCurrentMapView == 0){
		drawOverheadMap(0,50,AVCurrentMapX,AVCurrentMapY,scale);
	}else{
		drawIsoMap(320,50,AVCurrentMapX,AVCurrentMapY,scale);
	}
}

function drawMapMakerUi(){
	tools = "<input id='overheadMap' type='button' value='Overhead View'><input id='isoMap' type='button' value='Isometric View'><br>";
	tools += "Map Width: <input id='mapWidth' type='text' size=5><input id='updateWidth' type='button' value='Update'> Map Height: <input id='mapHeight' type='text' size=5><input id='updateHeight' type='button' value='Update'>";
	$("#toolboxcontainer").html(tools); 
}

function drawOverheadMap(sx,sy,mx,my,sc){
	var ctx = AVCanvasContext;
	
}

function drawIsoMap(sx,sy,mx,my,sc){
	var ctx = AVCanvasContext;
}


function drawMenu(thisMenu){
	AVLog("drawMenu: Menu Name:"+thisMenu["name"]);
	var ctx = AVCanvasContext;
	clearScreen(thisMenu["background"]);
	for(var m in thisMenu["items"]){
		mi = thisMenu["items"][m];
		if(mi["x"] == "centre"){
			x = 320;
		}else{
			x = mi["x"];
		}
		ctx.font = AVMenuText;
		textWidth = ctx.measureText(mi["text"]).width;
		setMenuButtonBox(mi,x-(textWidth/2)-10,mi["y"],textWidth+20,32);
		drawButton(thisMenu["items"][m]["text"],x,thisMenu["items"][m]["y"]);
	}
}

function setMenuButtonBox(m,x,y,w,h){
	m["bx"] = x;
	m["by"] = y;
	m["bw"] = w;
	m["bh"] = h;
}

function findMap(mName){
	for(var m in AVMapData["isomaps"]){
		if(AVMapData["isomaps"][m]["name"] == mName){
			return AVMapData["isomaps"][m];
		}
	}
}

function findMenu(mName){
	for(var m in AVMenuData["menus"]){
		if(AVMenuData["menus"][m]["name"] == mName){
			return AVMenuData["menus"][m];
		}
	}
}

function loadJSON(path, callback) {   
    var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
		xobj.open('GET', path, true); // Replace 'my_data' with the path to your file
		xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
          }
    };
    xobj.send(null);  
 }
 
 function clearScreen(col){
	AVCanvasContext.fillStyle = col;
	AVCanvasContext.fillRect(0, 0, AVCanvas.width, AVCanvas.height); 
 }

function drawLogo(){
	// Draw Elements to the screen
	clearScreen();
	AVCanvasContext.drawImage(AVImageData['logo'].image, 90, 30);
	drawButton("Continue", 320,410);
}

function drawButtonBox(ctx,x,y,w,h){
	ctx.strokeStyle = "#ffffff";
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(x+w,y);
	ctx.lineTo(x,y);
	ctx.lineTo(x,y+32);
	ctx.stroke();
	ctx.strokeStyle = "#333333";
	ctx.beginPath();
	ctx.moveTo(x,y+32);
	ctx.lineTo(x+w,y+32);
	ctx.lineTo(x+w,y);
	ctx.stroke();
	ctx.fillStyle = "#666666";
	ctx.fillRect(x,y,w,h);
}

function drawButton(text,x,y){
	var ctx = AVCanvasContext;
	ctx.font = AVMenuText;
	textWidth = ctx.measureText(text).width;
	halfWidth = (textWidth/2)+10;
	drawButtonBox(ctx,x-halfWidth,y,textWidth+20,32);
	ctx.fillStyle = "#000000";
	ctx.fillText(text,x-halfWidth+10,y+25);
	ctx.fillStyle = "#ffffff";
	ctx.fillText(text,x-halfWidth+9,y+24);
}

function drawCentreText(text,y){
	var ctx = AVCanvasContext;
	textWidth = ctx.measureText(text).width;
	halfWidth = (textWidth/2);
	ctx.fillStyle = "#000000";
	ctx.fillText(text,320-halfWidth+1,y+1);
	ctx.fillStyle = "#ffffff";
	ctx.fillText(text,320-halfWidth,y);
}

function AVCanvasClick(event){
	cLeft = AVCanvas.offsetLeft,
    cTop = AVCanvas.offsetTop,
	AVLog("Canvas clicked: x:"+(event.pageX - cLeft)+" y:"+(event.pageY - cTop));
	AVClickEvent = {x:(event.pageX - cLeft), y:(event.pageY - cTop)};
}

function checkContinue(){
	if(AVClickEvent != null){
		if(AVClickEvent.x >250 && AVClickEvent.x < 376 && AVClickEvent.y >410 && AVClickEvent.y < 442){
			AVStage="main menu";
			AVClickEvent = null;
			clearInterval(AVLoop);
			AVMainLoop();
		}
	}
}

function AVMainMenu(){
	clearScreen();
	
}

