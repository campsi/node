var Campsi = require('campsi-core');
var $ = require('cheerio-or-jquery');
var moment = require('moment');

Campsi.extend('campsi/dashboard/widget', 'campsi/dashboard/widget/activity', function ($super) {
    return {
        getDefaultOptions: function () {
            return {
                header: {
                    text: 'Activity feed'
                }
            }
        },

        init: function (next) {
            var instance = this;
            $super.init.call(instance, function () {
                instance.nodes.table = $('<table><tbody></tbody></table>');
                instance.nodes.content.append(instance.nodes.table);
                next();
            });
        },

        getNodePaths: function () {
            return {
                table: 'table'
            }
        },

        attachEvents: function () {
            this.reload();
        },

        reload: function () {
            var instance = this;
            $.getJSON('/api/v1/me/events', function (events) {
                instance.setValue(events);
            });
        },

        valueDidChange: function (next) {
            if (typeof this.value.length === 'undefined') {
                return next();
            }

            var instance = this;
            this.nodes.table.find('tbody').empty();
            this.value.forEach(function (event) {
                instance.nodes.table.append(instance.createEvent(event));
            });

            next();
        },

        createEvent: function (event) {
            var $row = $('<tr>');
            var projectURI;
            var collectionURI;

            var cells = Array(6).fill('<td></td>');

            cells[0] = this.createCell('date', moment(event.date).fromNow());
            cells[1] = this.createCell('user', event.data.user.nickname);
            cells[2] = this.createCell('action', event.event);

            if (event.data.project) {
                projectURI = '/projects/';
                projectURI += event.data.project.identifier || event.data.project._id;
                cells[3] = this.createCell('project', event.data.project.title, projectURI);
                if (event.data.collection) {
                    collectionURI = projectURI + '/collections/';
                    collectionURI += event.data.collection.identifier || event.data.collection._id;
                    cells[4] = this.createCell('collection', event.data.collection.name, collectionURI + '/admin');
                    if (event.data.entry || event.data.draft) {
                        var uri = collectionURI;
                        if (event.data.entry) {
                            uri += '/entries/' + event.data.entry;
                        } else {
                            uri += '/draft/' + event.data.draft;
                        }
                        cells[5] = this.createCell('item', "voir", uri);
                    }
                }
            }

            $row.append(cells);

            return $row;

        },

        createCell: function (className, value, href) {
            var $cell = $('<td>').addClass(className);
            if (href) {
                $cell.append($('<a>').attr('href', href).text(value));
            } else {
                $cell.text(value);
            }
            return $cell;
        },

        serializeValue: function () {
            return [];
        }
    }
});
