module.exports = function (app) {

    var nextLayout;

    var setNext = function (layout) {
        return function (ctx, next) {
            nextLayout = layout;
            next();
        }
    };

    var elements = {
        app: document.getElementById('app'),
        panels: document.getElementById('panels')
    };

    var classesToRemove = ['next', 'prev', 'hidden', 'main'].concat((function () {
        var i = 1;
        var classes = [];
        for (; i < 11; i++) {
            classes.push('l' + i * 10);
        }
        return classes;
    })()).join(' ');

    var resetScroll = function () {
        elements.app.scrollLeft = 0;
        elements.panels.scrollLeft = 0;
    };

    var loading = {
        show: function (ctx, next) {
            $('#loading').addClass('visible');
            $('#app').addClass('loading');
            next();
        },
        hide: function (ctx, next) {
            $('#loading').removeClass('visible');
            $('#app').removeClass('loading');
            if (next) {
                next();
            }
        }
    };

    var exec = function (ctx, next) {

        resetScroll();

        requestAnimationFrame(function () {
            var id;
            var panel;
            var $node;
            var layoutClasses;

            resetScroll();

            for (id in app.panels) {
                if (app.panels.hasOwnProperty(id)) {
                    panel = app.panels[id];
                    $node = panel.component.mountNode;

                    layoutClasses = (nextLayout && nextLayout[id]) ? nextLayout[id] : ['next'];
                    $node.removeClass(classesToRemove);

                    layoutClasses.forEach(function (cls) {
                        if (cls.substring(0, 1) === 'w') {
                            $node.removeClass('w10 w20 w30 w40 w50 w60 w70 w80 w90 w100');
                        }
                        if (cls.substring(0, 1) === 'l') {
                            $node.removeClass('l10 l20 l30 l40 l50 l60 l70 l80 l90 l100');
                        }
                    });

                    $node.addClass(layoutClasses.join(' '));
                }
            }

            resetScroll();

            next();
        });
    };


    var updateLinks = function(path){
        $('[href^="/"]').removeClass('active').filter('[href="' + path + '"]').addClass('active');
    };

    return {
        exec: exec,
        next: setNext,
        loading: loading,
        updateLinks: updateLinks,
        resetScroll: resetScroll
    }
};