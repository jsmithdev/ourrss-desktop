/*jshint esversion: 6, laxcomma: true, asi: true*/
'use strict()'
const electron = require('electron');
const path = require('path');
const ipc = require('electron').ipcMain;
const Store = require('electron-store')

const Util = require('./ourrss-util')
const getFeed = require('./rss-to-json');

const app = electron.app;

const getRSS = (feed) => 
	new Promise((res, rej) =>
		getFeed.load(feed, (e, rss) => e ? rej(e) : res(rss)));


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
		width: 1000,
		height: 900,
		frame: false,
		resizable: true,
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

ipc.on('message', (event, mess) => Util.message(mess))

ipc.on('getFeed', function (event, url) {

	getRSS(url).then(rss => {

		rss.feed = url

		event.sender.send('getFeedRes', rss)

		if (rss.image) {

			Util.message(({
				head: 'Feed Fetched',
				body: `${rss.title}`
			}))

			const store = new Store()

			if (!store.get('audio')) {
				const audio = {}
				audio.feeds = []
				store.set('audio', audio)
			}

			const audio = store.get('audio')

			if (audio.feeds.length) {

				for (let i = audio.feeds.length - 1; i--;) {
					console.log(audio.feeds[i].title, ' VS ', rss.title)
					if (audio.feeds[i].title === rss.title) {
						console.log('b4 ', audio.feeds.length)
						audio.feeds.splice(i, 1)
						console.log('after ', audio.feeds.length)

					}
				}

				audio.feeds.push(rss)

				store.set('audio', audio)

			} else {

				audio.feeds.push(rss)
				store.set('audio', audio)
			}


		}
	}).catch(e => message(e))
});

/* 
TODOs
	Feature: impliment customized dialogs via https://electronjs.org/docs/api/dialog
*/
