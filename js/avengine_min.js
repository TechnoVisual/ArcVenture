function AVLog(t){console.log(t)}function loadJSON(t,e){var a=new XMLHttpRequest;a.overrideMimeType("application/json"),a.open("GET",t,!0),a.onreadystatechange=function(){4==a.readyState&&"200"==a.status&&e(a.responseText)},a.send(null)}function clearScreen(t){AVCanvasContext.fillStyle=t,AVCanvasContext.fillRect(0,0,AVCanvas.width,AVCanvas.height)}function AVCanvasClick(t){cLeft=AVCanvas.offsetLeft,cTop=AVCanvas.offsetTop,AVLog("Canvas clicked: x:"+(t.pageX-cLeft)+" y:"+(t.pageY-cTop)),AVClickEvent={x:t.pageX-cLeft,y:t.pageY-cTop}}function AVInit(){AVLog("Initialising AVEngine."),AVCanvas=document.getElementById("AVEngine"),AVCanvasContext=AVCanvas.getContext("2d"),AVloadImages("data/images_0.json"),AVloadMenus("data/menus.json"),AVloadMaps("data/maps.json"),AVCanvas.addEventListener("click",AVCanvasClick,!1)}function AVMainLoop(){switch(AVLog("AVMainLoop: Stage:"+AVStage),AVStage){case"logo":cw=drawLogo(),AVLoop=setInterval(checkContinue,200,cw);break;case"main menu":AVSetMenu("Main")}}function AVWaitForImages(){c=0;for(var t in AVImageData)1==AVImageData[t].loaded&&c++;c==AVImageData.imageCount&&null!=AVMenuData&&null!=AVMapData&&(AVLog("Initial data loaded - passing to AVMainLoop."),clearInterval(AVLoop),AVMainLoop())}function AVloadImages(t){loadJSON(t,loadImagesCallback)}function AVloadMenus(t){loadJSON(t,loadMenusCallback)}function AVloadMaps(t){loadJSON(t,loadMapsCallback)}function loadImagesCallback(t){if(imgJson=JSON.parse(t),imagelist=imgJson.images,imagelist.length>0)for(i=0;i<imagelist.length;i++)img=[],img.name=imagelist[i].name,img.image=new Image,img.image.src=imagelist[i].path,img.loaded=!1,img.image.onload=function(){AVSetImageLoaded(this.src)},AVImageData[imagelist[i].name]=img;AVImageData.imageCount=imagelist.length,AVLog("Got image list - waiting for loaded signal."),AVLoop=setInterval(AVWaitForImages,100)}function loadMenusCallback(t){AVMenuData=JSON.parse(t)}function loadMapsCallback(t){AVMapData=JSON.parse(t)}function AVSetImageLoaded(t){for(var e in AVImageData)AVImageData[e].image&&AVImageData[e].image.src==t&&(AVImageData[e].loaded=!0)}function drawLogo(){return clearScreen(),AVCanvasContext.drawImage(AVImageData.logo.image,AVWidth/2-229,AVHeight/2-180),cw=drawButton("Continue",AVWidth/2,AVHeight/2+200),cw}function checkContinue(t){null!=AVClickEvent&&AVClickEvent.x>AVWidth/2-t/2&&AVClickEvent.x<AVWidth/2+t/2&&AVClickEvent.y>AVHeight/2+200&&AVClickEvent.y<AVHeight/2+232&&(AVStage="main menu",AVClickEvent=null,clearInterval(AVLoop),AVMainLoop())}function AVSetMenu(t){AVLog("AVSetMenu: "+t),AVCurrentMenu=findMenu(t),drawMenu(AVCurrentMenu),AVLoop=setInterval(checkMenu,200)}function checkMenu(){if(thisMenu=AVCurrentMenu,thisClick=null,null!=AVClickEvent)for(var t in thisMenu.items)mn=thisMenu.items[t],AVClickEvent.x>mn.bx&&AVClickEvent.x<mn.bx+mn.bw&&AVClickEvent.y>mn.by&&AVClickEvent.y<mn.by+mn.bh&&(thisClick=mn);if(null!=thisClick){AVClickEvent=null,AVLog("Menu item clicked: "+thisClick.text),clearInterval(AVLoop);var e=window[thisClick.link];e()}}function drawMenu(t){AVLog("drawMenu: Menu Name:"+t.name);var e=AVCanvasContext;clearScreen(t.background);for(var a in t.items)mi=t.items[a],"centre"==mi.x?x=AVWidth/2:x=mi.x,e.font=AVMenuText,textWidth=e.measureText(mi.text).width,setMenuButtonBox(mi,x-textWidth/2-10,mi.y,textWidth+20,32),drawButton(t.items[a].text,x,t.items[a].y)}function setMenuButtonBox(t,e,a,n,i){t.bx=e,t.by=a,t.bw=n,t.bh=i}function findMenu(t){for(var e in AVMenuData.menus)if(AVMenuData.menus[e].name==t)return AVMenuData.menus[e]}function isoTest(){AVLoop=setInterval(isoLoop,40)}function isoLoop(){var t=AVCanvasContext;clearScreen("#000000"),t.font=AVMenuText,t.fillStyle="#ffffff",t.fillText("Isometric Test",AVWidth/2-80,40);var e,a,n=findMap("map1"),i=n.data,o=new Date,l=1e3/(o-AVlastLoop);for(AVlastLoop=o,e=0;10>e;e++)for(a=0;10>a;a++)1==i[10*e+a]&&t.drawImage(AVImageData.map1.image,AVWidth/2-32-32*e+32*a,80+16*a+16*e);drawFPS(parseInt(l))}function drawFPS(t){var e=AVCanvasContext;e.font=AVMenuText,e.fillStyle="#ffffff",e.fillText("fps:"+t,5,32)}function drawIsoMap(t,e,a,n,i){}function findMap(t){for(var e in AVMapData.isomaps)if(AVMapData.isomaps[e].name==t)return AVMapData.isomaps[e]}function drawButtonBox(t,e,a,n,i){t.strokeStyle="#ffffff",t.lineWidth=2,t.beginPath(),t.moveTo(e+n,a),t.lineTo(e,a),t.lineTo(e,a+32),t.stroke(),t.strokeStyle="#333333",t.beginPath(),t.moveTo(e,a+32),t.lineTo(e+n,a+32),t.lineTo(e+n,a),t.stroke(),t.fillStyle="#666666",t.fillRect(e,a,n,i)}function drawButton(t,e,a){var n=AVCanvasContext;return n.font=AVMenuText,textWidth=n.measureText(t).width,halfWidth=textWidth/2+10,drawButtonBox(n,e-halfWidth,a,textWidth+20,32),n.fillStyle="#000000",n.fillText(t,e-halfWidth+10,a+25),n.fillStyle="#ffffff",n.fillText(t,e-halfWidth+9,a+24),textWidth}function drawCentreText(t,e){var a=AVCanvasContext;textWidth=a.measureText(t).width,halfWidth=textWidth/2,a.fillStyle="#000000",a.fillText(t,AVWidth/2-halfWidth+1,e+1),a.fillStyle="#ffffff",a.fillText(t,AVWidth/2-halfWidth,e)}var AVWidth=800,AVHeight=600,AVCanvas,AVCanvasContext,AVImageData=[],AVMenuData=null,AVMapData=null,AVLoop,AVStage="logo",AVExit=!1,AVClickEvent=null,AVCurrentMenu=null,AVMenuText="24px Arial",AVCurrentMapX=5,AVCurrentMapY=5,AVCurrentMap=null,AVCurrentMapView=0,AVlastLoop=new Date;