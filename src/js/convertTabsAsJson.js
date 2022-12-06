export function cleanUpJSON(json) {

     //explore json an remove all typeCode and guid properties
    DeleteUselessProperties(json,["typeCode","guid","index","type","id"]);
    ApplyParentsFolderNameAsTag(json,[],"title")
    RenameProperties(json,{"uri":"url","title":"name"});
    json = FlattenTree(json);

    return json;
}

function DeleteUselessProperties(json,propertiesToDelete) {
   
    for (var key in json) {
        if (propertiesToDelete.includes(key)) {
            delete json[key];
        }
        if (typeof json[key] == "object") {
            DeleteUselessProperties(json[key],propertiesToDelete);
        }
    }
}

export function RenameProperties(json,propertiesToRename) {
   
    for (var key in json) {
        if (propertiesToRename[key] != undefined) {
            json[propertiesToRename[key]] = json[key];
            delete json[key];
        }
        if (typeof json[key] == "object") {
            RenameProperties(json[key],propertiesToRename);
        }
    }
}

function ApplyParentsFolderNameAsTag(json,tags,propertyName) {
    //apply tags
    json["tags"]= tags.slice();

    for (var key in json) {
        //update tags with current parent name
        if (key == propertyName && json.children != undefined) {
            tags.push(json[key]);
        }
        if (typeof json[key] == "object" && key!="tags") {            
            //explore children
            ApplyParentsFolderNameAsTag(json[key],tags.slice(),propertyName);
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