'use strict';

var express = require('express');
var router = express.Router();
var config = require('../../config');
var stripe = require('stripe')(config.stripe.secretKey);
var Project = require('../../models/project');

var processStripeEvent = function (err, event) {
    if (err) {
        console.error(err);
        return;
    }

    if (event.type === 'customer.subscription.deleted') {
        var subscription = event.data.object;
        Project.findByCustomerId(subscription.customer, function (err, project) {
            if (err || project === null) {
                console.error('unable to find customer', subscription.customer);
                return;
            }
            project.markModified('billing');
            project.billing.customerDetails.subscriptions.data[0] = subscription;
            project.save(function (err, modified) {
                if (err) {
                    console.error(err);
                } else {
                    console.info(modified.billing.customerDetails.subscriptions.data);
                }
            });
        });
    }
};

router.post('/events', function (req, res) {


    console.info("received webhook", req.body);

    // return 200 OK to notify Stripe we received the webhook
    res.status(200).send();

    if (req.body.id === 'evt_00000000000000') {
        return processStripeEvent(null, req.body);
    }
    stripe.events.retrieve(req.body.id, processStripeEvent);

});

module.exports = router;