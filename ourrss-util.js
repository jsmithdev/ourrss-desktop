/*jshint esversion: 6, laxcomma: true, asi: true*/
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
    }


}