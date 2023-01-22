import { defineStore } from 'pinia'
import jsonContent from '@/js/content.json'
import Fuse from 'fuse.js'
import { hashCode, IsValidBookmark } from '@/js/convertTabsAsJson'
import { Client, Account } from "appwrite";
//.setJWT(localStorage.getItem('jwt') || null) //WTF


// useStore could be anything like useUser, useCart 
// the first argument is a unique id of the store across your application
export const useStore = defineStore('main', {
    state: () => {
        return {
          //load from local storage
          content: null,
          editMode: false,
          lastCloudSync: null,
          account:null,
          client:null,
          JWT:localStorage.getItem('jwt') || null,
          lastJWTUpdate: null,
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
        SetupClient()
        {
          this.client = new Client();
          this.client
          .setEndpoint('https://appwrite.vps.heargo.dev/v1') // Your API Endpoint
          .setProject('63cc2fa2677d376a81ea') // Your project ID
          ;
        },
        async Login(email,password)
        {
          this.account = new Account(this.client);
          var response;
          try{
            await this.account.createEmailSession(email,password);
            response = "Login successful";
          }catch(error){
            response = error.message;
          }
          return response;
        },
        IsConnected() {
          const promise = this.account.getSessions();
          return promise.then(() => {

            localStorage.setItem('isConnected', 'true')
            return true;
          }, () => {
            localStorage.removeItem('isConnected')
            return false;
          }
          );
        },
        toggleEditMode()
        {
          this.editMode = !this.editMode;
        },
        LoadContent()
        {
          //let content = localStorage.getItem('content') || jsonContent;
          if(localStorage.getItem('content') == null)
          {
            localStorage.setItem('content', JSON.stringify(jsonContent));
            this.content = jsonContent;
          }else{
            this.content = JSON.parse(localStorage.getItem('content'));
          }

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
              || name == "" || url == "" || description == "" || tags == "") {
            return "Please fill all fields";
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
          if(b.bookmarks.length != 0)
          {
            this.content.push(b.bookmarks[0]);
            localStorage.setItem('content', JSON.stringify(this.content));
          }
          else
            feedback = "Bookmark already exists";
          return feedback;
        },
        DeleteBookmark(id)
        {
          let index = this.content.findIndex(x => x.id == id);
          this.content.splice(index,1);
          localStorage.setItem('content', JSON.stringify(this.content));
        },
        UpdateBookmark(id, updateContent)
        {
          let index = this.content.findIndex(x => x.id == id);
          for(let key in updateContent){
            this.content[index][key] = updateContent[key];
          }
          localStorage.setItem('content', JSON.stringify(this.content));
        },
        IncrementVisitCount(id)
        {
          let index = this.content.findIndex(x => x.id == id);
          //visit count
          this.content[index].visitCount++;

          //last visit
          this.content[index].lastVisitTime = Date.now();
          localStorage.setItem('content', JSON.stringify(this.content));
        },
        GetMostVisited(n)
        {
          let mostVisited = this.content.sort((a,b) => b.visitCount - a.visitCount).slice(0,n);
          //get first n on most visited where visit count > 0
          mostVisited = mostVisited.filter(x => x.visitCount > 0);
          return mostVisited;
        },
        AddListOfBookmarks(bookmarks)
        {
          let feedback; 
          try{

            //remove duplicates from bookmarks
            let data= this.RemoveDuplicates(bookmarks)
            bookmarks = data.bookmarks;
            this.content = this.content.concat(bookmarks);
            localStorage.setItem('content', JSON.stringify(this.content));
            feedback = "Success to import "+bookmarks.length +" bookmarks. "+data.feedback;
          }
          catch(e)
          {
            feedback = "Failed to import "+bookmarks.length +" bookmarks";
          }

          return feedback
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
          this.content = jsonContent;
          localStorage.setItem('content', JSON.stringify(jsonContent));
        },
        ImportSave(json)
        {
          let feedback = "Success to import bookmarks";
          //if json is valid
          if(this.IsValidJson(json))
          {
            this.content = json;
            localStorage.setItem('content', JSON.stringify(this.content));
          }else{
            feedback = "Failed to import bookmarks";
          }
          return feedback;
        },
        ExportSave()
        {
          //download json file
          console.log(this.content)
          let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.content));
          console.log(dataStr)
          var link = document.createElement("a");

          link.setAttribute("href", dataStr);
          link.setAttribute("download", "bookmarks.json");
          link.click();

          link.remove();
          
        },
        IsValidJson(json)
        {
          if (json == null || json == undefined || !Array.isArray(json)) return false;
          //check if every element in the list has the minimum required fields
          let isValid = true;
          for(let i = 0; i < json.length; i++)
          {
            let b = json[i];
            console.log("is it valid bookmark?",b)
            if(!IsValidBookmark(b))
            {
              console.log("invalid bookmark",b)
              isValid = false;
              break;
            }
          }
          return isValid;
        }

      }
})