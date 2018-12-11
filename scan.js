window.onload =  function() {
    /* Ask for "environnement" (rear) camera if available (mobile), will fallback to only available otherwise (desktop).
     * User will be prompted if (s)he allows camera to be started */
    //navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false }).then(function(stream) {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment", width: 320, height: 240 }, audio: false }).then(function(stream) {
	var video = document.getElementById("video-preview");
	video.srcObject = stream;
	video.setAttribute("playsinline", true); /* otherwise iOS safari starts fullscreen */
	video.play();
	setTimeout(tick, 100); /* We launch the tick function 100ms later (see next step) */
    }).catch(function(err) {
	console.log(err); /* User probably refused to grant access*/
    });
};


function toBW(context, contrast=30) {
    var imgd = context.getImageData(0, 0, context.width, context.height);
    var pix = imgd.data;
    contrast = (contrast/100) + 1;  //convert to decimal & shift range: [0..2]
    var intercept = 128 * (1 - contrast);
    for (var i = 0, n = pix.length; i < n; i += 4) {
	//var grayscale = pix[i ] * .3 + pix[i+1] * .59 + pix[i+2] * .11;
	var grayscale = pix[i] + pix[i+1] + pix[i+2]; //pp: this ensures whites are whiteeee instead of grayscale
	pix[i ] = grayscale *2 ; // red
	pix[i+1] = grayscale *2 ; // green
	pix[i+2] = grayscale *2 ; // blue
	// alpha
	pix[i] = pix[i]*contrast + intercept;
        pix[i+1] = pix[i+1]*contrast + intercept;
        pix[i+2] = pix[i+2]*contrast + intercept;
    }
    context.putImageData(imgd, 0, 0);
}

function tick() {
    var video                   = document.getElementById("video-preview");
    var qrCanvasElement         = document.getElementById("qr-canvas");
    var qrCanvas                = qrCanvasElement.getContext("2d");
    var width, height;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
	//qrCanvasElement.height  = 200;
	//qrCanvasElement.width   = 200;
	//qrCanvas.drawImage(video, 60, 20, 200, 200, 0, 0, 200, 200);
	
	//qrCanvasElement.height  = video.videoHeight;
	//qrCanvasElement.width   = video.videoWidth;
	//qrCanvas.drawImage(video, 0, 0, qrCanvasElement.width, qrCanvasElement.height);
	
	//qrCanvasElement.height  = video.videoHeight + 40;
	//qrCanvasElement.width   = video.videoWidth + 40;
	//qrCanvas.height  = video.videoHeight + 40;
	//qrCanvas.width   = video.videoWidth + 40;
	//qrCanvas.fillStyle = "white";
	//qrCanvas.fillRect(0, 0, qrCanvas.width, qrCanvas.height);
	//qrCanvas.drawImage(video, 20, 20, video.videoWidth, video.videoHeight);
	//toBW(qrCanvas);
	//
	
	
	qrCanvasElement.height  = 200;
	qrCanvasElement.width   = 200;
	qrCanvas.height  = 200;
	qrCanvas.width   = 200;
	qrCanvas.fillStyle = "white";
	qrCanvas.fillRect(0, 0, 200, 200);
	var cropSize = 160;
	var sX = (video.videoWidth - cropSize) / 2;
	var sY = (video.videoHeight - cropSize) / 2;
	qrCanvas.drawImage(video, sX, sY, cropSize, cropSize, 20, 20, cropSize, cropSize);
	toBW(qrCanvas);
	try {
	    var result = qrcode.decode();
	    if(result.indexOf("st-itch.com") !== -1) {
		var splitURL = result.split("m/");
		if(splitURL.length > 1) {
		    window.location.href = "https://st-itch.com/" + splitURL[1];
		    //alert("https://st-itch.com/" + splitURL[1]);
		} else {
		    console.log("Invalid QR code");
		}
	    } else {
		console.log("Sorry, this is only for st-itch.com");
	    }

	    /* Video can now be stopped */
	    video.pause();
	    video.src = "";
	    video.srcObject.getVideoTracks().forEach(track => track.stop());

	    /* Display Canvas and hide video stream */
	    qrCanvasElement.classList.remove("hidden");
	    video.classList.add("hidden");
	} catch(e) {
	    /* No Op */
	}
    }

    /* If no QR could be decoded from image copied in canvas */
    if (!video.classList.contains("hidden"))
	setTimeout(tick, 100);
}
