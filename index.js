/*jshint esversion: 6, laxcomma: true, asi: true*/
'use strict ';

const electron = require('electron');
const Promise = require('promise');
const path = require('path');
const ipc = require('electron').ipcMain;
const Util = require('./ourrss-util')
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
		icon: path.join(`${__dirname}/img/icon.png`)
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


ipc.on('message', function (event, mess) {
	const mail = Util.message(mess)
	event.sender.send('mailSent', mail)
});

ipc.on('getFeed', function (event, url) {

	getRSS(url).then(x => {
		if(x.image){
			Util.message('Got Feed! Yasss')
			event.sender.send('getFeedRes', x)
		}
	}).catch(e => message(e))
});



/* 
const getFeed = () => {

	console.log(`get feed renderer...`);

	const url = document.getElementById('url').value;

	if (!url) {
		console.error('No URL provided')
		return false;
	}

	console.log(`Getting feed: ${url}`);
	ipc.send('getFeed', url);
	ipc.once('getFeedRes', function (event, rss) {

		console.log(`Got Feed!`);
		console.dir(rss)

		const store = new Store();

		if (!store.get('audio')) {
			const audio = {}
			audio.feeds = []
			store.set('audio', audio)
		}

		const audio = store.get('audio')

		if (audio.feeds.length) {

			for (let i = audio.feeds.length - 1; i--;) {
				console.log(audio.feeds[i].title, ' VS ', rss.title)
				if (audio.feeds[i].title == rss.title || audio.feeds[i].title == 'Hound Tall') {
					console.log('b4 ', audio.feeds.length)
					audio.feeds.splice(i, 1);
					console.log('after ', audio.feeds.length)

				}
			}

			audio.feeds.push(rss)

			store.set('audio', audio)
		} else {
			audio.feeds.push(rss)
			store.set('audio', audio)
		}

		console.dir(audio)



		// store.get('unicorn')

		// // Use dot-notation to access nested properties
		// store.set('foo.bar', true);
		// console.log(store.get('foo'));

		// store.delete('unicorn');
		// console.log(store.get('unicorn'));
	})
}
 */