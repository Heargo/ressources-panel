import { defineStore } from 'pinia'
import jsonContent from '@/js/content.json'
import Fuse from 'fuse.js'
import { hashCode } from '@/js/convertTabsAsJson'

// useStore could be anything like useUser, useCart 
// the first argument is a unique id of the store across your application
export const useStore = defineStore('main', {
    state: () => {
        return {
          //load from local storage
          content: null,
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
        AddBookmark(name, url,iconUrl, tags)
        {
          let bookmark = {
            name: name,
            id:hashCode(name+url),
            dateAdded: Date.now(),
            lastModified: Date.now(),
            iconUrl: iconUrl,
            url: url,
            tags: tags
          }
          this.content.push(bookmark);
          localStorage.setItem('content', JSON.stringify(this.content));
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
          console.log("increment visit count",id,this.content[index])
          //visit count
          this.content[index].visitCount++;

          //last visit
          this.content[index].lastVisitTime = Date.now();
          console.log("increment visit count done",id,this.content[index])
          localStorage.setItem('content', JSON.stringify(this.content));
        },
        GetMostVisited(n)
        {
          let mostVisited = this.content.sort((a,b) => b.visitCount - a.visitCount).slice(0,n);
          //get first n on most visited where visit count > 0
          mostVisited = mostVisited.filter(x => x.visitCount > 0);
          console.log(mostVisited)
          return mostVisited;
        }

      }
})