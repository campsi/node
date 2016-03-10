module.exports = function () {
    $(document).on('focusout', function () {
        requestAnimationFrame(function () {
            $('.vmax').each(function (i, el) {
                el.scrollTop = 0;
            });
            $('#app').find('> .panels')[0].scrollLeft = 0;
        })
    }).on('dblclick', '.component.campsi_collection-designer_field header', function () {
        $(this).closest('.component').toggleClass('closed')
    });

    $('.cell.scroll').on('scroll', function () {
        $(this).closest('.panel').toggleClass('scroll', (this.scrollTop > 0));
    });

    $('.login').click(signin);
};