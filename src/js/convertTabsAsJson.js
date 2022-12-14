
export function cleanUpJSON(json) {

     //explore json an remove all typeCode and guid properties
    DeleteUselessProperties(json,["typeCode","guid","index","type","id"]);
    let blackList = ["Bookmarks Menu","Other Bookmarks","Mobile Bookmarks","Tools","toolbar"];
    ApplyParentsFolderNameAsTag(json,[],"title",blackList)
    RenameProperties(json,{"uri":"url","title":"name","iconUri":"iconUrl"});
    json = FlattenTree(json);
    GenerateIds(json);
    AddNewProperties(json);

    return json;
}

export function removeInvalid(json) {

    if (json.length == 0) return false;

    for(let i=0;i<json.length;i++)
    {
        let item = json[i];
        if (IsValidBookmark(item))
        {
            json.splice(i,1);
        } 
    }
    return json;
}

export function IsValidBookmark(b) {
    console.log("checking item " + b)
    let minimumKeys=["name","url","tags","visitCount","lastVisitTime","id","dateAdded","lastModified"];
    for(let k of minimumKeys)
    {
        if (b[k] == undefined)
        {
            console.log("invalid json: missing property " + k + " in item " + b.name);
            return false;
        } 
    }
    return true;
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

function ApplyParentsFolderNameAsTag(json,tags,propertyName,blackList) {
    //apply tags
    json["tags"]= tags.slice();

    for (var key in json) {
        //update tags with current parent name
        if (key == propertyName && json.children != undefined && !blackList.includes(json[key] )) {
            tags.push(json[key]);
        }
        if (typeof json[key] == "object" && key!="tags") {            
            //explore children
            ApplyParentsFolderNameAsTag(json[key],tags.slice(),propertyName,blackList);
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

function GenerateIds(json) {
    for(let i=0;i<json.length;i++)
    {
        //id is the hash of url 
        let str = json[i].url;
        if(str == undefined) continue;
        let hash = hashCode(str);
        json[i].id = hash;
    }
}

function AddNewProperties(json) {
    for(let i=0;i<json.length;i++)
    {
        json[i].visitCount = 0;
        json[i].lastVisitTime = Date.now();
    }
}

//got from https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
export function hashCode(str) {
    var hash = 0,
      i, chr;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
      chr = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }
