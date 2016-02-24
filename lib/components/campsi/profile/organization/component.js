var Campsi = require('campsi');
module.exports = Campsi.extend('form', 'campsi/profile/organization', function () {

    return {
        getDefaultOptions: function () {
            return {
                fields: [{
                    type: "text",
                    name: "name",
                    label: "company name",
                    help: "the name of the company that will be invoiced"
                }, {
                    type: "text",
                    name: "phone",
                    label: "phone"
                }, {
                    type: "text",
                    name: "vatNumber",
                    label: "V.A.T. number"
                }, {
                    type: "form",
                    name: "address",
                    label: "billing address",
                    fields: [{
                        type: "text",
                        name: "line1",
                        label: "line1"
                    }, {
                        type: "text",
                        name: "line2",
                        label: "line2"
                    }, {
                        type: "text",
                        name: "line3",
                        label: "line3"
                    }, {
                        type: "text",
                        name: "postCode",
                        label: "postCode"
                    }, {
                        type: "text",
                        name: "region",
                        label: "region"
                    }, {
                        type: "text",
                        name: "city",
                        label: "city"
                    }, {
                        type: "text",
                        name: "country",
                        label: "country"
                    }]
                }]
            }
        }
    }
});