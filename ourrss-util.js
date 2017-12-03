/*jshint esversion: 6, laxcomma: true, asi: true*/
const fs = require('fs')
const Store = require('electron-store')
const getFeed = require('rss-to-json');
const getRSS = (feed) => new Promise((res, rej) =>
    getFeed.load(feed, (e, rss) => e ? rej(e) : res(rss)));

module.exports = {


    getRSS : (feed) => new Promise((res, rej) =>
        getFeed.load(feed, (e, rss) => e ? rej(e) : res(rss))),

    message: (mess) => {

        const Message = require('electron-notify');
        const path = require('path');

        Message.setConfig({
            appIcon: path.join(`${__dirname}/img/icon.png`),
            displayTime: 5000
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

    getFeedByName: (name) => {
        return new Promise((resolve, reject) => {
            const store = new Store()
            const audio = store.get('audio')
            const feed = audio.feeds.filter(x => x.title === name)
            resolve(feed[0])
        })
    },

    getAllAudio: () => {
        return new Promise((resolve, reject) => {
            const store = new Store()
            const audio = store.get('audio')
            resolve(audio)
        })
    },

    exportFeeds: (dir) => {
        console.log('dir: ')
        console.dir(dir)
        return new Promise((resolve, reject) => {
            const store = new Store()
            const audio = store.get('audio')

            const json = audio.feeds.reduce((acc, cur, i) => {
                acc[i] = cur.feed;
                return acc;
            }, {});

            fs.writeFile(`${dir}\\OurrssExport.json`, JSON.stringify(json), (err) =>
                err ? reject(err) : resolve('The file has been saved!'))
        })
    },

    importFeeds: (file) => {
        return new Promise((resolve, reject) => {

            console.log('Import in todo stage: ', file)
            const test = []
            const store = new Store()

            const a = {}
            a.feeds = []
            store.set('audio', a)
            
            const audio = store.get('audio')

            const read = (x) => new Promise((res, rej) => 
                fs.readFile(file, (err, data) => err ? rej(err) : res(data)))


            read(file).then(x => {
                const obj = JSON.parse(x)
                const arr = Object.values(obj)
                const length = arr.length
                let n = 0
                arr.map(feed => {
                    const y = getRSS(feed)
                        .then(x => {
                            n++
                            x.feed = feed
                            audio.feeds.push(x)
                            if(n === length){
                                store.set('audio', audio)
                                resolve(true)
                            }
                        })
                        .catch(x => reject(x))
                })
            })
        })
    }
}