chrome.storage.sync.get('cfg', function(storage) {
	var cfg = storage.cfg;

	var nicknameInput = $('[name="auth.nickname"]');
	$('[name="auth.remember"]').
		prop('checked', cfg.auth.remember).
		change(function () {
			var isChecked = $(this).is(':checked');
			nicknameInput.prop({
				disabled: !isChecked,
				required: isChecked
			});
			if (!isChecked) {
				nicknameInput.val('');
			}
		}).change();
	nicknameInput.val(cfg.auth.nickname);

	var urlPatternInput = $('[name="external.urlPattern"]');
	$('[name="external.isEnabled"]').
		prop('checked', cfg.external.isEnabled).
		change(function () {
			var isChecked = $(this).is(':checked');
			urlPatternInput.prop({
				disabled: !isChecked,
				required: isChecked
			});
		}).change();
	urlPatternInput.val(cfg.external.urlPattern);

	$('[name="notifications.periodInMinutes"]').val(cfg.notifications.periodInMinutes);
	$('[name="notifications.isBadgeOnClickEnabled"]').prop('checked', cfg.notifications.isBadgeOnClickEnabled);

	var voiceNameSelect = $('[name="tts.voiceName"]');
	chrome.tts.getVoices(function (voices) {
		voices.sort(function (a, b) {
			return a.voiceName.localeCompare(b.voiceName);
		});
		$.each(voices, function (_, voice) {
			voiceNameSelect.append($('<option>').text(voice.voiceName));
		});
		voiceNameSelect.val(cfg.tts.voiceName);
	});

	$('[name="tts.isEnabled"]').
		prop('checked', cfg.tts.isEnabled).
		change(function () {
			var isChecked = $(this).is(':checked');
			voiceNameSelect.prop({
				disabled: !isChecked,
				required: isChecked
			});
			$('#test-tts').prop({
				disabled: !isChecked
			});
		}).change();

	var ticksTBody = $('#ticks tbody');
	$.each(Hyperiums7.ticks, function (_, tick) {
		ticksTBody.append($('<tr>').append([
			$('<th>').text(tick.name),
			$('<td class="fixed-width">').append(
				$('<input type="checkbox">').attr('name',
					'notifications.tick.' + tick.name + '.isEnabled'
				)
			),
			$('<td class="fixed-width">').append(
				$('<input type="checkbox">').attr('name',
					'notifications.tick.' + tick.name + '.isTtsEnabled'
				)
			),
			$('<td class="fixed-width">').append(
				$('<input class="tiny-number" type="number" min="2" required>').attr('name',
					'notifications.tick.' + tick.name + '.minutesBefore'
				)
			)
		]));
	});

	$('#all-ticks-enable, #all-ticks-enable-tts').change(function () {
		var checkbox = $(this);
		var td = checkbox.closest('td, th');
		td.
			closest('table').
			find('tbody tr td:nth-child(' + (td.index() + 1) + ') input').
			prop('checked', checkbox.prop('checked'));
	});

	$('#all-ticks-minutes-before').on('keyup change', function () {
		var input = $(this);
		var td = input.closest('td, th');
		td.
			closest('table').
			find('tbody tr td:nth-child(' + (td.index() + 1) + ') input').
			val(input.val());
	});

	$('#test-tts').click(function (event) {
		var voiceName = voiceNameSelect.val();
		chrome.tts.speak(voiceName, {voiceName: voiceName});
	});

	$('#save-and-close').click(function () {
		$('form').data('close', true);
	});

	$('form').submit(function (event) {
		event.preventDefault();
		var form = $(this);
		cfg.auth.remember = $('[name="auth.remember"]').is(':checked');
		cfg.auth.nickname = $('[name="auth.nickname"]').val();
		cfg.external.isEnabled = $('[name="external.isEnabled"]').is(':checked');
		cfg.external.urlPattern = $('[name="external.urlPattern"]').val();
		cfg.notifications.periodInMinutes = parseFloat($('[name="notifications.periodInMinutes"]').val());
		cfg.notifications.isBadgeOnClickEnabled = $('[name="notifications.isBadgeOnClickEnabled"]').is(':checked');
		cfg.tts.isEnabled = $('[name="tts.isEnabled"]').is(':checked');
		cfg.tts.voiceName = $('[name="tts.voiceName"]').val();
		chrome.storage.sync.set({cfg: cfg}, function () {
			alert('Options have been saved.');
			// reload background page because of alarm setting
			chrome.runtime.getBackgroundPage(function (backgroundPage) {
			});
			if (form.data('close')) {
				window.close();
			}
		});
	});
});

