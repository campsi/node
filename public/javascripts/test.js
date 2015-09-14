var obj = {
    "_id": "55d24a9d7cef40e57bea0c72",
    "type": "form",
    "name": "actualites",
    "fields": [
        {
            "name": "title",
            "type": "form/text",
            "label": "Titre"
        },
        {
            "name": "content",
            "type": "form/text",
            "label": "Contenu"
        },
        {
            "name": "tags",
            "type": "form/array",
            "label": "Mots clés",
            "items": {
                "type": "form/text"
            }
        },
        {
            "name": "subform",
            "type": "form",
            "label": "Sub form",
            "fields": []
        }
    ]
};

Campsi.create('campsi/collection-designer', undefined, obj, function(comp){
   console.info(comp);
});