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
            threshold: 0.4,
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
          return res
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
        }
      }
})