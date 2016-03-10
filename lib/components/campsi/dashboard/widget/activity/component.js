var Campsi = require('campsi-core');
var $ = require('cheerio-or-jquery');
Campsi.extend('campsi/dashboard/widget', 'campsi/dashboard/widget/activity', function () {
    return {
        getDefaultOptions: function () {
            return {
                header: {
                    text: 'Activity feed'
                }
            }
        },

        valueDidChange: function (next) {
            var instance = this;
            var lastEvents = [{
                user: {fullname: 'Romain Bessuges'},
                action: 'edited entry',
                date: '2016-03-01',
                project: {name: 'Boursorama'},
                collection: {name: 'Actualités'},
                entry: {id: '2424abe2f23'}
            }, {
                user: {fullname: 'Delphine Dorseuil'},
                action: 'published entry',
                date: '2016-02-28',
                project: {name: 'Exaprint'},
                collection: {name: 'Actualités'},
                entry: {id: '2424abe2f23'}
            }, {
                user: {fullname: 'Delphine Dorseuil'},
                action: 'edited entry',
                date: '2016-02-28',
                project: {name: 'Boursorama'},
                collection: {name: 'FAQ'},
                entry: {id: '2424abe2f23'}
            }, {
                user: {fullname: 'Romain Bessuges'},
                action: 'created collection',
                date: '2016-02-28',
                project: {name: 'Boursorama'},
                collection: {name: 'Services'},
                entry: {id: '2424abe2f23'}
            }];
            var $table = $('<table>');
            lastEvents.forEach(function (event) {
                $table.append(instance.createEvent(event));
            });
            instance.nodes.content.append($table);

            next();
        },

        createEvent: function (event) {
            var $event = $('<tr class="event">');
            $event.append($('<td>').append($('<span>').text(event.date)));
            $event.append($('<td>').append($('<a href="#">').text(event.user.fullname)));
            $event.append($('<td>').append($('<span>').text(event.action)));
            $event.append($('<td>').append($('<a href="#">').text(event.project.name)));
            $event.append($('<td>').append($('<a href="#">').text(event.collection.name)));
            //$event.append($('<span class="collection">').text(event.collection.name));
            return $event;
        }
    }
});