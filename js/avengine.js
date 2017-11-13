// ArcVenture Engine Code
// (c) Mark Vanstone 2017
//

// Global Variables
var AVWidth = 800;
var AVHeight = 600;
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
var AVCurrentMapX = 0;
var AVCurrentMapY = 0;
var AVCurrentMapMX = 0;
var AVCurrentMapMY = 0;
var AVCurrentDir = 0;
var AVCurrentMap = null;
var AVCurrentMapView = 0;
var AVlastLoop = new Date;
var AVPlayerX = 10;
var AVPlayerY = 10;
// 

// --------------------------------------
// Utility Functions
// --------------------------------------

function AVLog(msg){
	console.log(msg);
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
 
 function AVCanvasClick(event){
	cLeft = AVCanvas.offsetLeft,
    cTop = AVCanvas.offsetTop,
	AVLog("Canvas clicked: x:"+(event.pageX - cLeft)+" y:"+(event.pageY - cTop));
	AVClickEvent = {x:(event.pageX - cLeft), y:(event.pageY - cTop)};
}

// key presses
// ------------------------------------------

document.onkeydown = function(e) {
	
	/*
    switch (e.keyCode) {
        case 37:
            if(AVCurrentMapX > 0) AVCurrentMapX -= 1;
            break;
        case 38:
            if(AVCurrentMapY > 0) AVCurrentMapY -= 1;
            break;
        case 39:
            AVCurrentMapX += 1;
            break;
        case 40:
            AVCurrentMapY += 1;
            break;
    }
	*/
	switch (e.keyCode) {
        case 37:
            if(AVCurrentMapX > 0) AVCurrentDir = 1;
            break;
        case 38:
            if(AVCurrentMapY > 0) AVCurrentDir = 2;
            break;
        case 39:
            AVCurrentDir = 3;
            break;
        case 40:
            AVCurrentDir = 4;
            break;
    }
};

// ----------------------------------------
// Setup Functions
// ----------------------------------------

function AVInit(){
	// Initialise the game
	AVLog("Initialising AVEngine.");
	AVCanvas = document.getElementById('AVEngine');
	AVCanvasContext = AVCanvas.getContext('2d');
	AVloadImages("data/images_0.json");
	AVloadMenus("data/menus.json");
	AVloadMaps("data/testmap2.json");
	AVCanvas.addEventListener('click', AVCanvasClick, false);
}

function AVMainLoop(){
		AVLog("AVMainLoop: Stage:"+AVStage);
		switch(AVStage){
			case "logo" : 
				cw = drawLogo();
				AVLoop = setInterval(checkContinue,200,cw);
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
			img["width"] = imagelist[i].width;
			img["height"] = imagelist[i].height;
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

function drawLogo(){
	// Draw Elements to the screen
	clearScreen();
	AVCanvasContext.drawImage(AVImageData['logo'].image, (AVWidth/2)-229, (AVHeight/2)-180);
	cw = drawButton("Continue", AVWidth/2,(AVHeight/2)+200);
	return cw;
}

function checkContinue(cw){
	if(AVClickEvent != null){
		if(AVClickEvent.x >(AVWidth/2)-(cw/2) && AVClickEvent.x < (AVWidth/2)+(cw/2) && AVClickEvent.y >(AVHeight/2)+200 && AVClickEvent.y < (AVHeight/2)+232){
			AVStage="main menu";
			AVClickEvent = null;
			clearInterval(AVLoop);
			AVMainLoop();
		}
	}
}

// -----------------------------------
// Menu Functions 
// -----------------------------------

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

function drawMenu(thisMenu){
	AVLog("drawMenu: Menu Name:"+thisMenu["name"]);
	var ctx = AVCanvasContext;
	clearScreen(thisMenu["background"]);
	for(var m in thisMenu["items"]){
		mi = thisMenu["items"][m];
		if(mi["x"] == "centre"){
			x = AVWidth/2;
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

function findMenu(mName){
	for(var m in AVMenuData["menus"]){
		if(AVMenuData["menus"][m]["name"] == mName){
			return AVMenuData["menus"][m];
		}
	}
}


// --------------------------------------------
// Map Drawing Functions
// --------------------------------------------

function isoTest(){
	AVLoop = setInterval(isoLoop,40);
}

function isoLoop(){
	var ctx = AVCanvasContext;
	//clearScreen("#000000");
	var x,y;
	var md = AVMapData;
	var mdval = md["layers"][0]["data"];
	var mapW = parseInt(md["layers"][0]["width"]);
	var mapH = parseInt(md["layers"][0]["height"]);
	//console.log(mapW);
	var thisLoop = new Date;
    var fps = 1000 / (thisLoop - AVlastLoop);
    AVlastLoop = thisLoop;
	for(x=0;x<40;x++){
		for(y=0;y<40;y++){
			
			mdpos = ((AVCurrentMapY*mapW)+AVCurrentMapX)+((y*mapW))+x;
			if(mdval[mdpos] != 0){
				h = AVImageData['map'+mdval[mdpos]].height;
				sx = (AVWidth/2)-32-(y*32)+(x*32)-AVCurrentMapMX+(AVCurrentMapMY*2);
				sy = -130+(x*16)+(y*16)-(AVCurrentMapMX/2)-AVCurrentMapMY -h;
				//console.log(x+","+y);
				if(sx>-64 && sx<AVWidth && (sy+h)>50 && (sy+h)<AVHeight-50){
					ctx.drawImage(AVImageData['map'+mdval[mdpos]].image, sx, sy);
				}
				if(x == 13 && y == 13){
					sy = -130+(x*16)+(y*16)-(AVCurrentMapMX/2)-AVCurrentMapMY - AVImageData['player1'].height;
					ctx.drawImage(AVImageData['player1'].image, sx, sy);
				}
			}
			
		}
	}
	ctx.drawImage(AVImageData['mapmask'].image,0, 0);
	drawFPS(parseInt(fps));
	ctx.font = AVMenuText;
	ctx.fillStyle = "#ffffff";
	ctx.fillText("Isometric Test",(AVWidth/2)-80,32);
	// update movement
	switch (AVCurrentDir) {
		case 1:
            AVCurrentMapMX -= 4;
			if(AVCurrentMapMX == -32) {
				AVCurrentMapX -=1;
				AVCurrentMapMX = 0;
				AVCurrentDir = 0;
			}
            break;
        case 2:
            AVCurrentMapMY -= 2;
			if(AVCurrentMapMY == -16) {
				AVCurrentMapY -=1;
				AVCurrentMapMY = 0;
				AVCurrentDir = 0;
			}
            break;
        case 3:
			AVCurrentMapMX += 4;
			if(AVCurrentMapMX == 32) {
				AVCurrentMapX +=1;
				AVCurrentMapMX = 0;
				AVCurrentDir = 0;
			}
            break;
        case 4:
            AVCurrentMapMY += 2;
			if(AVCurrentMapMY == 16) {
				AVCurrentMapY +=1;
				AVCurrentMapMY = 0;
				AVCurrentDir = 0;
			}
            break;
	}
}

function drawFPS(fps){
	var ctx = AVCanvasContext;
	ctx.font = AVMenuText;
	ctx.fillStyle = "#ffffff";
	ctx.fillText("fps:"+fps,15,32);
}

function drawIsoMap(sx,sy,mx,my,sc){
	var ctx = AVCanvasContext;
}


function findMap(mName){
	for(var m in AVMapData["isomaps"]){
		if(AVMapData["isomaps"][m]["name"] == mName){
			return AVMapData["isomaps"][m];
		}
	}
}

// ----------------------------------------
// Buttons and Text Functions
// ----------------------------------------

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
	return textWidth;
}

function drawCentreText(text,y){
	var ctx = AVCanvasContext;
	textWidth = ctx.measureText(text).width;
	halfWidth = (textWidth/2);
	ctx.fillStyle = "#000000";
	ctx.fillText(text,(AVWidth/2)-halfWidth+1,y+1);
	ctx.fillStyle = "#ffffff";
	ctx.fillText(text,(AVWidth/2)-halfWidth,y);
}



