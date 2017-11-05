/*jshint esversion: 6, laxcomma: true, asi: true*/
"use strict ";

const electron = require('electron');
const Promise = require('promise');
const path = require('path');

const ipc = require('electron').ipcMain;

const getFeed = require('rss-to-json');
const getRSS = (feed) => new Promise((res, rej) => getFeed.load(feed, (e, rss) => e ? rej(e) : res(rss)));

const app = electron.app;



// adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')();

// prevent window being garbage collected
let mainWindow;

function onClosed() {
	// dereference the window
	// for multiple windows store them in an array
	mainWindow = null;
}

function createMainWindow() {
	const win = new electron.BrowserWindow({
		width: 650,
		height: 800,
		icon: path.join(__dirname, 'img/icon.png')
	});

	win.loadURL(`file://${__dirname}/index.html`);
	win.on('closed', onClosed);

	return win;
}

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (!mainWindow) {
		mainWindow = createMainWindow();
	}
});

app.on('ready', () => {
	mainWindow = createMainWindow();

});

const message = (mess) => {

	const Message = require('electron-notify');

	Message.setConfig({
		appIcon: path.join(__dirname, 'img/icon.png'),
		displayTime: 6000
	});
	Message.notify({
		title: mess.head,
		text: mess.body
	});

	return 'sent'
}
ipc.on('message', function (event, mess) {
	const mail = message(mess)
	event.sender.send('mailSent', mail)
});



ipc.on('getFeed', function (event, url) {

	console.log(`Get feed in controller`);

	getRSS(url)
		.then(x => {
			console.log(x.image)
			if(x.image){
				message('Got Feed! Yasss')
				event.sender.send('getFeedRes', x)
			}
		})
		.catch(e => message(e))
});
