function zeroPad(num, places) {
  var zero = places - num.toString().length + 1;
  return Array(+(zero > 0 && zero)).join("0") + num;
}

$(document).ready(function(){
	var popup;
	var clock;

	var totalMinutes = 0;
	var totalSeconds = 0;

	var poiAccepted = 0;
	var poiRejected = 0;

	var minutesLeft = 7;
	var secondsLeft = 0;

	var millisec = 0;
	var seconds = 0;
	var minutes = 0;

	var graceSeconds = 15;

	var extraMinutes = 0;
	var extraSeconds = 0;

	var poi = 15;

	var poiCD = 10;

	var paused = false;
	var timer;
	var graceTimer;
	var extraTimer;
	var poiTimer;
	var poiCDTimer;

	var bell = new buzz.sound( "assets/audio/bell", {
	    formats: [ "wav", "mp3"]
	});

	$('#btn-launchTimer').on('click', function(){
		popup = window.open("timer.html","Timer","width=800,height=600");
	});

	/*Main Timer*/
	$('#btn-startTimer').on('click', function(){
		$(this).prop('disabled', true);
		setTimeout(startTimer(), 1000);			
	});

	$('#btn-pauseTimer').on('click', function(){
		if($(this).html() == 'Pause'){
			pauseTimer();
			$(this).html('Resume');
		} else {
			resumeTimer();
			$(this).html('Pause');
		}		
	});

	/*Set buttons*/

	$('#btn-setHeader').on('click', function(){
		//set proposition and speaker only
	});

	$('#btn-setTimer').on('click', function(){
		//set timers only
	});

	$('#btn-setEverything').on('click', function(){
		//set everything
	});

	/*!--Set buttons*/

	$('#btn-resetTimer').on('click', function(){
		resetTimer();
		$('#btn-pauseTimer').html('Pause');
		$('#btn-startTimer').prop('disabled', false);
	});

	/*POI Timer*/
	$('#btn-resetPOITimer').on('click', function(){
		resetPOITimer();
	});

	/*POI Counter*/

	$('#btn-poiAccept-plus').on('click', function(e){
		e.preventDefault();
		plusOne($('#poi-accepted'));
	});

	$('#btn-poiReject-plus').on('click', function(e){
		e.preventDefault();
		plusOne($('#poi-rejected'));
	});

	$('#btn-poiReject-reset').on('click', function(e){
		e.preventDefault();
		reset($('#poi-accepted'));
		reset($('#poi-rejected'));
	});

	$('#btn-launchTimer').trigger('click');

	function computeTotalTime() {
		totalMinutes = minutes + extraMinutes;
		totalSeconds = seconds + extraSeconds + (15 - graceSeconds);

		while(totalSeconds > 59) {
			totalSeconds -= 60;
			totalMinutes++;
		}

		console.log('Seconds: ' + zeroPad(seconds, 2) + " Extra:" + zeroPad(extraSeconds, 2) + " Grace: " + zeroPad((15 - graceSeconds), 2));
		console.log('Total time - '+ zeroPad(totalMinutes, 2) + ":" + zeroPad(totalSeconds, 2));
	}

	function computeTime() {
		//console.log(paused);
		if (!paused){
			if(secondsLeft == 0 && minutesLeft == 0) {
				//seconds++;
				secondsLeft = 0;
				minutesLeft = 0;
				console.log('Stop Main timer');
				clearInterval(timer);
				console.log('Start grace timer');
				startGrace();
			} else {
				seconds++;
				if(secondsLeft == 0){
					secondsLeft = 59;
					minutesLeft--;
				} else {
					secondsLeft--;
				}
			}

			if (seconds > 59){
				seconds = 0;
				minutes += 1;
			}			
		}		
		display();
	}

	function startGrace(){

		$(popup.document).contents().find('#time-left').addClass('hidden');
		$(popup.document).contents().find('#grace-period').removeClass('hidden');

		graceSeconds --;
		graceTimer = setInterval(function(){			
			if(!paused){
				if(graceSeconds > 0){
					graceSeconds--;
					display();
				} else {					
					clearInterval(graceTimer);
					console.log('Start Extra timer');
					startExtra();
				}
			}
		}, 1000);
	}

	function startExtra(){

		$(popup.document).contents().find('#grace-period').addClass('hidden');
		$(popup.document).contents().find('#extra-time').removeClass('hidden');

		extraTimer = setInterval(function() {
			if(!paused){
				if(extraSeconds > 59){
					extraSeconds = 0;
					extraMinutes++;
					display();
				} else {
					extraSeconds++;
					display();
				}
			}
		}, 1000);
	}

	function startTimer() {		
		timer = setInterval(function(){ computeTime(); }, 1000);
	}

	function startPOITimer() {
		$(popup.document).contents().find('#poiTimer').removeClass('hidden');
	 	$(popup.document).contents().find('#poiCooldown').addClass('hidden');

		$('#btn-poiReject-plus').prop('disabled', true);
		$('#btn-poiAccept-plus').prop('disabled', true);		
		poiTimer = setInterval(function(){
			if(poi > 0){
				poi--;	
			} else {				
				clearInterval(poiTimer);
				startPOICooldown();
				poi = 15;
			}
			display();
		}, 1000);
	}

	function resetPOITimer() {
		clearInterval(poiTimer);
		startPOICooldown();
		poi = 15;
		display();
	}

	function startPOICooldown() {
		$(popup.document).contents().find('#poiTimer').addClass('hidden');
	 	$(popup.document).contents().find('#poiCooldown').removeClass('hidden');

		poiCDTimer = setInterval(function(){
			if(poiCD > 0){
				poiCD--;	
			} else {
				clearInterval(poiCDTimer);
				$('#btn-poiReject-plus').prop('disabled', false);
				$('#btn-poiAccept-plus').prop('disabled', false);

				$(popup.document).contents().find('#poiTimer').addClass('hidden');
	 			$(popup.document).contents().find('#poiCooldown').addClass('hidden');

				poiCD = 10;
				$(popup.document).contents().find('#display-yield').addClass('hidden');
			}
			display();
		}, 1000);
	}

	function pauseTimer() {
		paused = true;
	}

	function resumeTimer(){
		paused = false;
	}
	
	function resetTimer() {
		clearInterval(timer);
		clearInterval(extraTimer);
		clearInterval(graceTimer);
		clearInterval(poiTimer);
		seconds = 0;
		minutes = 0;
		minutesLeft = 7;
	 	secondsLeft = 0;
	 	extraSeconds = 0;
	 	extraMinutes = 0;
	 	paused = false;	 	

	 	$(popup.document).contents().find('#poiTimer').addClass('hidden');
	 	$(popup.document).contents().find('#poiCooldown').addClass('hidden');
	 	$(popup.document).contents().find('#time-left').removeClass('hidden');
		$(popup.document).contents().find('#grace-period').addClass('hidden');
		$(popup.document).contents().find('#extra-time').addClass('hidden');

	 	changeStatus(0);

	 	display();
	}

	function display() {
		computeTotalTime();

		if(minutes == 1 && seconds == 0){
			changeStatus(2);
			bell.play();
		} else if(minutes == 6 && seconds == 0){
			changeStatus(3);
			bell.play();
		} else if(minutes == 7 && seconds == 0){
			changeStatus(4);
		} else {
			changeStatus(1);
		}

		dminutes = zeroPad(totalMinutes, 2);
		dseconds = zeroPad(totalSeconds, 2);

		dminutesLeft = zeroPad(minutesLeft, 2);
		dsecondsLeft = zeroPad(secondsLeft, 2);

		$('.consumed #minutes').html(dminutes);
		$('.consumed #seconds').html(dseconds);

		$('.left #minutes').html(dminutesLeft);
		$('.left #seconds').html(dsecondsLeft);

		$('.grace #seconds').html(zeroPad(graceSeconds, 2));

		$('.extra #minutes').html(zeroPad(extraMinutes, 2));
		$('.extra #seconds').html(zeroPad(extraSeconds, 2));

		$('.poi #seconds').html(zeroPad(poi, 2));

		$('.poiCD #seconds').html(zeroPad(poiCD, 2));

		$(popup.document).contents().find('.consumed #minutes').html(dminutes);
		$(popup.document).contents().find('.consumed #seconds').html(dseconds);

		$(popup.document).contents().find('.left #minutes').html(dminutesLeft);
		$(popup.document).contents().find('.left #seconds').html(dsecondsLeft);

		$(popup.document).contents().find('.grace #seconds').html(zeroPad(graceSeconds, 2));

		$(popup.document).contents().find('.poiCD #seconds').html(zeroPad(poiCD, 2));

		$(popup.document).contents().find('.extra #minutes').html(zeroPad(extraMinutes, 2));
		$(popup.document).contents().find('.extra #seconds').html(zeroPad(extraSeconds, 2));

		$(popup.document).contents().find('.poi #seconds').html(zeroPad(poi, 2));

		$(popup.document).contents().find('#name').html($('#name').val());
		$(popup.document).contents().find('#proposition').html($('#proposition').val());
	}

	function changeStatus(status){ //0-reset; 1-running; 2-end one minute; 3-end 6 minutes; 4-timer ends; 5-POI;
		//console.log('Status changed.');
		var statusClass;

		switch(status) {
			case 0:
				$(popup.document).contents().find('body').removeClass();
				statusClass = '';
				break;
		    case 1:
		        statusClass = 'timer-running';
		        break;
		    case 2:
		        statusClass = 'timer-endOneMinute';
		        break;
		    case 3:
		        statusClass = 'timer-endSixMinutes';
		        break;
		    case 4:
		        statusClass = 'timer-end';
		        break;
		    case 5:
		        statusClass = 'timer-poi';
		        break;
		    default:
		        statusClass = 'timer-running';
		}

		$(popup.document).contents().find('body').addClass(statusClass);
	}

	function plusOne(element) {
		var current = element.html();

		$('#btn-poiReject-plus').prop('disabled', true);
		$('#btn-poiAccept-plus').prop('disabled', true);

		if(current == "Yield!") {
			current = 0;
			$(popup.document).contents().find('#display-yield').toggleClass('hidden');
		}

		current++;

		if(element.attr('id') == 'poi-rejected') {
			if(current == 4) {
				//yield
				current = "Yield!";
				startPOITimer();
				$(popup.document).contents().find('#display-yield').toggleClass('hidden');
			} else {
				poiRejected = current;
				startPOICooldown();	
			}			
		} else {
			poiRejected = 0;
			poiAccepted = current;
			startPOITimer();
		}

		$(popup.document).contents().find('#poi-accepted').val(poiAccepted);
		$(popup.document).contents().find('#poi-rejected').val(poiRejected);

		element.html(current);
	}

	function reset(element) {
		element.html(0);
		$(popup.document).contents().find('#display-yield').addClass('hidden');
	}
});