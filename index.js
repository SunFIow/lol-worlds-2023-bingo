const GRID_SIZE = 5;

let dragged;

const response = await fetch('settings.json');
const events_raw = await response.json();
events_raw.unshift('None');
console.log('events_raw', events_raw);
const events = events_raw.map((event, id) => ({ id: id, name: event }));
console.log('events', events);

document.querySelector('#bOpen').onclick = () => {
	domtoimage
		.toBlob(document.querySelector('.bingo'))
		.then(function (blob) {
			console.log(blob);
			const blobUrl = URL.createObjectURL(blob);
			console.log(blobUrl);
			window.open(blobUrl, '_blank');
			window.URL.revokeObjectURL(blobUrl);
		})
		.catch(function (error) {
			console.error('oops, something went wrong!', error);
		});
};

document.querySelector('#bDownload').onclick = () => {
	domtoimage
		.toBlob(document.querySelector('.bingo'))
		.then(function (blob) {
			console.log(blob);
			const blobUrl = URL.createObjectURL(blob);
			console.log(blobUrl);
			const link = document.createElement('a');
			link.href = blobUrl;
			link.download = 'bingo.png';
			link.click();
			window.URL.revokeObjectURL(blobUrl);
		})
		.catch(function (error) {
			console.error('oops, something went wrong!', error);
		});
};

const cells = document.querySelectorAll('.cell');
for (let index = 0; index < cells.length; index++) {
	const cell = cells[index];
	cell.draggable = true;

	cell.addEventListener('dragstart', () => (dragged = events[cell.id]));

	cell.addEventListener('dragover', event => event.preventDefault());

	cell.addEventListener('drop', () => {
		if (dragged == null || cell.id == dragged.id) return;
		editCell(index, events[dragged.id]);
		updateSetting();
		dragged = null;
	});

	cell.addEventListener('click', () => toggleCell(index));
}

const selector = document.querySelector('#selector');
for (const event of events) {
	let div = document.createElement('div');
	div.textContent = event.name;
	div.draggable = true;
	div.addEventListener('dragstart', () => (dragged = event));
	selector.append(div);
	event.div = div;
}

let setting = localStorage.getItem('localSetting') ?? '';
importSetting(setting, events);
updateSetting();

document.querySelector('#bImport').onclick = () => {
	const setting = document.querySelector('#setting input').value;
	importSetting(setting, events);
	updateSetting();
};

document.querySelector('#bClear').onclick = () => {
	for (let index = 0; index < cells.length; index++) editCell(index, events[0]);
	updateSetting();
};

function toggleCell(index) {
	const cell = cells[index];
	if (cell.id == 0) return;

	cell.classList.toggle('checked');
	events[cell.id].checked = cell.classList.contains('checked');

	for (const cell of cells) cell.classList.remove('won');
	checkRowWin();
	checkColWin();
	checkTLDRWin();
	checkDLTRWin();
}

function checkRowWin() {
	for (let y = 0; y < GRID_SIZE; y++) {
		let won = true;
		for (let x = 0; x < GRID_SIZE; x++) {
			const cell = cells[GRID_SIZE * y + x];
			if (!cell.classList.contains('checked')) {
				won = false;
				break;
			}
		}
		if (won)
			for (let x = 0; x < GRID_SIZE; x++) {
				const cell = cells[GRID_SIZE * y + x];
				cell.classList.add('won');
			}
	}
}
function checkColWin() {
	for (let x = 0; x < GRID_SIZE; x++) {
		let won = true;
		for (let y = 0; y < GRID_SIZE; y++) {
			const cell = cells[GRID_SIZE * y + x];
			if (!cell.classList.contains('checked')) {
				won = false;
				break;
			}
		}
		if (won)
			for (let y = 0; y < GRID_SIZE; y++) {
				const cell = cells[GRID_SIZE * y + x];
				cell.classList.add('won');
			}
	}
}
function checkTLDRWin() {
	let won = true;
	for (let x = 0; x < GRID_SIZE; x++) {
		const cell = cells[GRID_SIZE * x + x];
		if (!cell.classList.contains('checked')) {
			won = false;
			break;
		}
	}
	if (won)
		for (let x = 0; x < GRID_SIZE; x++) {
			const cell = cells[GRID_SIZE * x + x];
			cell.classList.add('won');
		}
}
function checkDLTRWin() {
	let won = true;
	for (let x = 0; x < GRID_SIZE; x++) {
		const cell = cells[GRID_SIZE * (GRID_SIZE - 1 - x) + x];
		if (!cell.classList.contains('checked')) {
			won = false;
			break;
		}
	}
	if (won)
		for (let x = 0; x < GRID_SIZE; x++) {
			const cell = cells[GRID_SIZE * (GRID_SIZE - 1 - x) + x];
			cell.classList.add('won');
		}
}

function importSetting(setting, events) {
	const ids = setting.split(';');

	for (let index = 0; index < cells.length; index++) {
		const event = events[ids[index]] ?? events[0];
		editCell(index, event);
	}
}

function updateSetting() {
	console.log('updateSetting');
	let setting = '';
	for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
		if (i > 0) setting += ';';
		setting += cells[i].id;
	}
	document.querySelector('#setting input').value = setting;
	localStorage.setItem('localSetting', setting);
}

function editCell(index, event) {
	console.log(event, event.checked);
	const cell = cells[index];

	if (event.div.classList.contains('used')) {
		for (let index = 0; index < cells.length; index++) {
			if (cells[index].id == dragged.id) editCell(index, events[0]);
		}
	}
	if (event.id != 0) event.div.classList.add('used');
	if (cell.id != 0) events[cell.id].div.classList.remove('used');

	cell.textContent = event.name;
	cell.id = event.id;
	if (event.id != 0) {
		cell.classList.add('filled');
		if (event.checked) cell.classList.add('checked');
		else cell.classList.remove('checked');
	} else {
		cell.classList.remove('filled');
		cell.classList.remove('checked');
	}
}
