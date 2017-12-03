/*jshint esversion: 6, laxcomma: true, asi: true*/
const Store = require('electron-store')

module.exports = {
    
    message: function(mess) {

        const Message = require('electron-notify');
        const path = require('path');

        Message.setConfig({
            appIcon: path.join(`${__dirname}/img/icon.png`),
            displayTime: 6000
        });
        Message.notify({
            title: mess.head,
            text: mess.body
        });

        return true;
    },

    storeFeed: (rss) => {
        //return new Promise((resolve, reject) => {
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
            }
            else {
                audio.feeds.push(rss)
                store.set('audio', audio)
            }

            console.dir(audio)
        //})
    },

    getFeedByName : (name) => {
        return new Promise((resolve, reject) => {
            const store = new Store()
            const audio = store.get('audio')
            const feed = audio.feeds.filter(x => x.title === name)
            resolve(feed[0])
        })
    },

    getAllAudio : () => {
        return new Promise((resolve, reject) => {
            const store = new Store()
            const audio = store.get('audio')
            resolve(audio)
        })
    }
}