import { defineStore } from 'pinia'
import jsonContent from '@/js/content.json'
import Fuse from 'fuse.js'
import { hashCode, IsValidBookmark } from '@/js/convertTabsAsJson'
import { Storage, ID, Permission, Role  } from "appwrite";

// useStore could be anything like useUser, useCart 
// the first argument is a unique id of the store across your application
export const useStore = defineStore('main', {
    state: () => {
        return {
          //load from local storage
          content: null,
          editMode: false,
          toast: null,
          lastCloudSync: localStorage.getItem('lastCloudSave') || null,
          lastLocalSave: localStorage.getItem('lastLocalSave') || null,
          searchOptions:{
            shouldSort: true,
            threshold: 0.2,
            includeScore: true,
            keys: [
                "name",
                "url",
                "tags"
            ]
        }
        }
      },
      actions: {
        toggleEditMode()
        {
          this.editMode = !this.editMode;
          this.toast.Show("Edit mode "+(this.editMode ? "enabled" : "disabled"),"warning")
        },
        SetContent(newContent)
        {
          console.log("setting content to ",newContent) 
          this.content = newContent;
          localStorage.setItem('content', JSON.stringify(newContent));
          this.lastLocalSave = new Date();
          localStorage.setItem('lastLocalSave', this.lastLocalSave);
        },
        async LoadContent(client)
        {
          var message;
          //get content from appwrite
          try{

            let files = await this.ListFiles(client);
            let file = files[0]
            let storage = new Storage(client);

            //get file url
            const result = storage.getFileView('63cdc26fcca5b0af2dbd', file.$id);

            //get the content of the file
            let response = await fetch(result,{credentials:"include"});
            let json = await response.json();
            this.SetContent(json)
            
            this.lastCloudSync = new Date();
            localStorage.setItem('lastCloudSync', this.lastCloudSync);
            message = "Content loaded from server"

          }
          //if not possible get localstorage instead
          catch(error){
            if(localStorage.getItem('content') == null)
            {
              this.SetContent(jsonContent)
              message = "Welcome ! Content loaded from default content"
            }else{
              this.SetContent(JSON.parse(localStorage.getItem('content')))
              message = "Content loaded from local storage"
            }
            
          }
          this.toast.Show(message,"success")
        },
        async SaveContent(userID,client)
        {
          var response;
          var type;
          try{
            let files = await this.ListFiles(client);
            if(files.length == 0)
            {
              this.UploadToCloud(userID,client,ID.unique())
              response = "Content saved";
            }
            else
            {
              await this.DeleteCloudContent(client,files[0].$id)
              await this.UploadToCloud(userID,client,ID.unique())
              response = "Content syncronized";
            }
            type = "success"
          }
          catch(error){
            response = error.message;
            type = "error"
          }
          return {value:response,type:type};
        },
        async UpdateFile(client,id)
        {
          console.log("Updating content")
          let storage = new Storage(client);
          await storage.updateFile('63cdc26fcca5b0af2dbd', id);
        },
        async UploadToCloud(userID,client,id)
        {
          console.log("Uploading content")
          //create a file to upload. Contains the content
          let file = new File([JSON.stringify(this.content)], userID+"-favorites.json", {type: "application/json"});
          //upload the file
          const storage = new Storage(client);
          var response;
          try{
            await storage.createFile('63cdc26fcca5b0af2dbd', id, file,[
              Permission.delete(Role.user(userID)),
              Permission.read(Role.user(userID)),
              Permission.update(Role.user(userID))
            ]);
            response = "Content uploaded";
          }
          catch(error){
            response = error.message;
            console.log(error)
            this.toast.Show(response,"error")
          }
          return response;
        },
        async DeleteCloudContent(client)
        {
          console.log("Deleting content")
          //create a file to upload. Contains the content
          const storage = new Storage(client);
          var response;
          try{
            let files = await this.ListFiles(client);
            console.log("files",files)
            console.log("deleting file "+files[0].$id)
            await storage.deleteFile('63cdc26fcca5b0af2dbd', files[0].$id);
            response = true;    
          }
          catch(error){
            response =false;
            console.log(error)
          }
          return response;
        },
        async ListFiles(client)
        {
          const storage = new Storage(client);
          var response;
          try{
            response = await storage.listFiles('63cdc26fcca5b0af2dbd');
            response = response.files;
          }
          catch(error){
            response = [];
            console.log(error)
          }
          return response;
        },
        search(query) {
          const fuse = new Fuse(this.content, this.searchOptions);
          let res = fuse.search(query);
          let info = "Found " + res.length + " results for '" + query + "'";

          return {results:res,infos:info};
        },
        AddBookmark(data)
        {
          let {name, url, description, tags} = data;
          if (name == null || url == null || description == null || tags == null
              || name == "" || url == "" || description == "" || tags == "")
          {
            this.toast.Show("Please fill all fields","warning")
            return;
          }

          let bookmark = {
            name: name,
            id:hashCode(url),
            dateAdded: Date.now(),
            lastModified: Date.now(),
            visitCount : 0,
            lastVisitTime: Date.now(),
            iconUrl: "",
            description: description,
            url: url,
            tags: tags.split(',')
          }
          console.log(bookmark)
          let b = this.RemoveDuplicates([bookmark]);
          let feedback = "Bookmark added";
          let importance = "success"
          if(b.bookmarks.length != 0)
          {
            this.content.push(b.bookmarks[0]);
            this.SetContent(this.content)
          }
          else{
            feedback = "Bookmark already exists";
            importance="error"
          }
          
          this.toast.Show(feedback,importance)
        },
        DeleteBookmark(id)
        {
          let index = this.content.findIndex(x => x.id == id);
          this.content.splice(index,1);
          this.SetContent(this.content)
        },
        UpdateBookmark(id, updateContent)
        {
          let index = this.content.findIndex(x => x.id == id);
          for(let key in updateContent){
            this.content[index][key] = updateContent[key];
          }
          this.SetContent(this.content)
        },
        IncrementVisitCount(id)
        {
          let index = this.content.findIndex(x => x.id == id);
          //visit count
          this.content[index].visitCount++;

          //last visit
          this.content[index].lastVisitTime = Date.now();
          this.SetContent(this.content)
        },
        GetMostVisited(n)
        {
          if(this.content ==null) return [];
          let mostVisited = this.content.sort((a,b) => b.visitCount - a.visitCount).slice(0,n);
          //get first n on most visited where visit count > 0
          mostVisited = mostVisited.filter(x => x.visitCount > 0);
          return mostVisited;
        },
        AddListOfBookmarks(bookmarks)
        {
          let feedback; 
          let importance;
          try{

            //remove duplicates from bookmarks
            let data= this.RemoveDuplicates(bookmarks)
            bookmarks = data.bookmarks;
            this.content = this.content.concat(bookmarks);
            this.SetContent(this.content)
            feedback = "Success to import "+bookmarks.length +" bookmarks. "+data.feedback;
            importance = "success"
          }
          catch(e)
          {
            feedback = "Failed to import "+bookmarks.length +" bookmarks";
            importance = "error"
          }

          this.toast.Show(feedback,importance)
        },
        RemoveDuplicates(bookmark)
        {
          let filteredBookmark = [];
          for(let i = 0; i < bookmark.length; i++)
          {
            let b = bookmark[i];
            let index = this.content.findIndex(x => x.id === b.id);
            if(index == -1)
            {
              filteredBookmark.push(b);
            }
          }
          return {bookmarks:filteredBookmark,feedback:"Removed "+(bookmark.length - filteredBookmark.length)+" duplicates."};
        },
        ResetContent()
        {
          this.SetContent(jsonContent)
          this.toast.Show("Bookmarks reset","success")
        },
        GetDefaultContent()
        {
          return jsonContent;
        },
        ImportSave(json)
        {
          let feedback = "Success to import bookmarks";
          let importance = "success"
          //if json is valid
          if(this.IsValidJson(json))
          {
            this.content = json;
            this.SetContent(this.content)
          }else{
            feedback = "Failed to import bookmarks";
            importance = "error"
          }
          this.toast.Show(feedback,importance)
        },
        ExportSave()
        {
          //download json file
          try{

            let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.content));
            console.log(dataStr)
            var link = document.createElement("a");
            
            link.setAttribute("href", dataStr);
            link.setAttribute("download", "bookmarks.json");
            link.click();
            link.remove();
            this.toast.Show("Bookmarks exported","success")
          }
          catch(e)
          {
            this.toast.Show("Failed to export bookmarks","error")
          }
          
        },
        IsValidJson(json)
        {
          if (json == null || json == undefined || !Array.isArray(json)) return false;
          //check if every element in the list has the minimum required fields
          let isValid = true;
          for(let i = 0; i < json.length; i++)
          {
            let b = json[i];
            if(!IsValidBookmark(b))
            {
              isValid = false;
              break;
            }
          }
          return isValid;
        },
        ResetVisitCount()
        {
          for(let i = 0; i < this.content.length; i++)
          {
            this.content[i].visitCount = 0;
          }
          this.SetContent(this.content)
          this.toast.Show("Visit count reset","success")
        },
        UnsavedChanges()
        {
          //compare lastCloudSync with LastLocalSave
          if (this.lastCloudSync == null) return false;
          //I'm using 2 seconds as a threshold to avoid saving if it's only a few milliseconds difference
          let diff = Math.abs(this.lastCloudSync.getTime() - this.lastLocalSave.getTime());
          return diff > 2000;
        }

      }
})