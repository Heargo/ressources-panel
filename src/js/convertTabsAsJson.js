export function cleanUpJSON(json) {

     //explore json an remove all typeCode and guid properties
    deleteUselessProperties(json,["typeCode","guid","index","type","id"]);
    ApplyParentsFolderNameAsTag(json,[])
    json = FlattenTree(json);

    return json;
}

function deleteUselessProperties(json,propertiesToDelete) {
   
    for (var key in json) {
        if (propertiesToDelete.includes(key)) {
            delete json[key];
        }
        if (typeof json[key] == "object") {
            deleteUselessProperties(json[key],propertiesToDelete);
        }
    }
}

function ApplyParentsFolderNameAsTag(json,tags) {
    //apply tags
    json["tags"]= tags.slice();

    for (var key in json) {
        //update tags with current parent name
        if (key == "title" && json.children != undefined) {
            tags.push(json[key]);
        }
        if (typeof json[key] == "object" && key!="tags") {            
            //explore children
            ApplyParentsFolderNameAsTag(json[key],tags.slice());
        }
    }
   
}

function FlattenTree(json) {
    let newJson = {};
    
    //if it has children, flatten them
    if (json.children != undefined) {
        newJson = json.children.map(child => FlattenTree(child)).flat();
    }
    else {
        newJson = json;
    }
    return newJson;
}