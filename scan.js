window.onload =  function() {
    /* Ask for "environnement" (rear) camera if available (mobile), will fallback to only available otherwise (desktop).
     * User will be prompted if (s)he allows camera to be started */
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

function tick() {
    var video                   = document.getElementById("video-preview");
    var qrCanvasElement         = document.getElementById("qr-canvas");
    var qrCanvas                = qrCanvasElement.getContext("2d");
    var width, height;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
	qrCanvasElement.height  = 200;
	qrCanvasElement.width   = 200;
	qrCanvas.drawImage(video, 60, 20, 200, 200, 0, 0, 200, 200);
	try {
	    var result = qrcode.decode();
	    if(result.indexOf("st-itch.com") !== -1) {
		var splitURL = result.split("m/");
		if(splitURL.length > 1) {
		    window.location.href = "https://st-itch.com/" + splitURL[1];
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
