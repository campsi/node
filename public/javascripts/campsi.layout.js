function hola(state) {
    var $panels = $('.panel'),
        activePanels = [],
        activatedPanels = 0,
        offset = 0;

    if (state.indexOf('+') > -1) {
        activePanels = state.split('+').map(function (panel) {
            var width, panelId;

            if (panel.indexOf(':') > -1) {
                var components = panel.split(':');
                panelId = components[0];
                width = components[1];
            } else {
                panelId = panel;
                width = 50;
            }

            return {
                id: panelId,
                width: width
            }
        });
    } else {
        activePanels = [{id: state, width: 100}];
    }

    function getActivePanel(panelId) {
        var activePanel = false;
        $(activePanels).each(function (i, panel) {
            if (panelId == panel.id) {
                activePanel = panel;
            }
        });
        return activePanel;
    }


    $panels.each(function (i, el) {

        var $panel = $(el),
            panelId = $panel.attr('id'),
            activePanel = getActivePanel(panelId);

        if (activePanel !== false) {
            $panel.hide();
            $panel.css({width: activePanel.width + '%'});
            $panel.show();

            $panel.addClass('active').removeClass('next prev');
            $panel.css({
                left: offset + '%'
            });

            offset += parseInt(activePanel.width);
            activatedPanels++;

        } else {
            $panel.removeClass('active');
            if (activatedPanels === activePanels.length) {

                $panel.removeClass('prev');
                $panel.addClass('next');
                $panel.css({left:'100%', right: ''});
            } else {
                $panel.addClass('prev');
                $panel.removeClass('next');
                $panel.css({left:'', right: '100%'});
            }
        }
    });

}
$("[data-state]").click(function () {
    hola($(this).data('state'));
});