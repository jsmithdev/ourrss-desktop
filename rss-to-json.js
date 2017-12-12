// Original fork: https://github.com/dubyajaysmith/rss-to-json
/*jshint esversion: 6, laxcomma: true, asi: true*/
'use strict()';
const util = require('util'),
    xml2js = require('xml2js'),
    request = require('request');


module.exports = {
    load: function (url, callback) {
        const $ = this;
        request({
            url: url,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:45.0) Gecko/20100101 Firefox/45.0',
                accept: 'text/html,application/xhtml+xml'
            },
            pool: false,
            followRedirect: true

        }, function (error, response, xml) {
            if (!error && response.statusCode == 200) {
                const parser = new xml2js.Parser({ trim: false, normalize: true, mergeAttrs: true });
                parser.addListener("error", function (err) {
                    callback(err, null);
                });
                parser.parseString(xml, function (err, result) {
                    const rss = $.parser(result);
                    callback(null, rss);
                    //console.log(JSON.stringify(result.rss.channel));
                });

            } else {
                this.emit('error', new Error('Bad status code'));
            }
        });

    },
    parser: function (json) {
        let channel = json.rss.channel;
        const rss = { items: [] };
        if (util.isArray(json.rss.channel))
            channel = json.rss.channel[0];

        if (channel.title) {
            rss.title = channel.title[0];
        }
        if (channel.description) {
            rss.description = channel.description[0];
        }
        if (channel.link) {
            rss.url = channel.link[0];
        }

        if (channel["itunes:image"]) {
            rss.image = channel['itunes:image'][0].href
        }
        else if (channel.image) {
            rss.image = channel.image[0].url
        }

        if (channel["atom:link"]){
            rss.feed = channel["atom:link"].href
        }

        if (channel.item) {
            if (!util.isArray(channel.item)) {
                channel.item = [channel.item];
            }
            channel.item.forEach(function (val) {
                const obj = {};
                obj.title = !util.isNullOrUndefined(val.title) ? val.title[0] : '';
                obj.description = !util.isNullOrUndefined(val.description) ? val.description[0] : '';
                obj.url = obj.link = !util.isNullOrUndefined(val.link) ? val.link[0] : '';

                if (val.pubDate) {
                    //lets try basis js date parsing for now
                    obj.created = Date.parse(val.pubDate[0]);
                }
                if (val['media:content']) {
                    obj.media = val.media || {};
                    obj.media.content = val['media:content'];
                }
                if (val['media:thumbnail']) {
                    obj.media = val.media || {};
                    obj.media.thumbnail = val['media:thumbnail'];
                }
                if (val.enclosure) {
                    obj.enclosures = [];
                    if (!util.isArray(val.enclosure))
                        val.enclosure = [val.enclosure];
                    val.enclosure.forEach(function (enclosure) {
                        const enc = {};
                        for (let x in enclosure) {
                            enc[x] = enclosure[x][0];
                        }
                        obj.enclosures.push(enc);
                    });

                }
                rss.items.push(obj);

            });

        }
        return rss;

    },
    read: function (url, callback) {
        return this.load(url, callback);
    }

};
