module.exports = function () {
    $(document).on('focusout', function (e) {
        requestAnimationFrame(function () {
            $('.vmax').each(function (i, el) {
                el.scrollTop = 0;
            });
            $('#app > .panels')[0].scrollLeft = 0;
        })
    }).on('dblclick', '.component.campsi_collection-designer_field header', function () {
        $(this).closest('.component').toggleClass('closed')
    }).on('click', '#code-editor-container button.validate', function () {
        codeEditor.changeHandler(codeEditor.instance.getValue());
        codeEditor.close();
    }).on('click', '#code-editor-container button.close', codeEditor.close);

    $('.cell.scroll').on('scroll', function () {
        $(this).closest('.panel').toggleClass('scroll', (this.scrollTop > 0));
    });

    $('.login').click(signin);
};