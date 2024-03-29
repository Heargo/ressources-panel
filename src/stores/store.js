import { defineStore } from "pinia";
import jsonContent from "@/js/content.json";
import Fuse from "fuse.js";
import { hashCode, IsValidBookmark } from "@/js/convertTabsAsJson";
import { Storage, ID, Permission, Role } from "appwrite";

// useStore could be anything like useUser, useCart
// the first argument is a unique id of the store across your application
export const useStore = defineStore("main", {
  state: () => {
    return {
      //load from local storage
      content: null,
      history: {}, //key is the id of the bookmark, value is {visitCount:0,lastVisitTime:date}
      editMode: false,
      toast: null,
      bucketID: "favorites",
      lastCloudSync: localStorage.getItem("lastCloudSave") || null,
      lastLocalSave: localStorage.getItem("lastLocalSave") || null,
      userTheme: localStorage.getItem("user-theme") || "dark",
      recentAddition: [],
      tldrSubject: localStorage.getItem("tldrSubject") ||"tech",
      searchOptions: {
        shouldSort: true,
        threshold: 0.2,
        includeScore: true,
        keys: ["name", "url", "tags", "description"],
      },
    };
  },
  actions: {
    setTheme(theme) {
      localStorage.setItem("user-theme", theme);
      this.userTheme = theme;
      document.documentElement.className = theme + "-theme";
    },
    switchTheme() {
      let theme = this.userTheme == "dark" ? "light" : "dark";
      this.setTheme(theme);
    },
    toggleEditMode() {
      this.editMode = !this.editMode;
      this.toast.Show(
        "Edit mode " + (this.editMode ? "enabled" : "disabled"),
        "warning"
      );
    },
    SetContent(newContent) {
      console.log("loading ", newContent);
      this.content = newContent;
      localStorage.setItem("content", JSON.stringify(newContent));
      this.lastLocalSave = new Date();
      localStorage.setItem("lastLocalSave", this.lastLocalSave);
      //load history from local storage
      this.history = JSON.parse(localStorage.getItem("history")) || {};
    },
    setSubject(subject){
      console.log("setting subject to ", subject)
      localStorage.setItem("tldrSubject", subject);
      this.tldrSubject = subject;
    },
    async LoadContent(client) {
      var message;
      //get latest content from appwrite
      try {
        let files = await this.ListFiles(client);
        let file = files[0];
        let storage = new Storage(client);

        //get file url
        const result = storage.getFileView(this.bucketID, file.$id);

        //get the content of the file
        let response = await fetch(result, { credentials: "include" });
        let json = await response.json();

        this.SetContent(json);

        this.lastCloudSync = new Date();
        localStorage.setItem("lastCloudSync", this.lastCloudSync);
        message = "Content loaded from server";
      } catch (error) {
        //if not possible get localstorage instead
        if (localStorage.getItem("content") == null) {
          this.SetContent(jsonContent);
          message = "Welcome ! Content loaded from default content";
        } else {
          this.SetContent(JSON.parse(localStorage.getItem("content")));
          message = "Content loaded from local storage";
        }
      }
      this.toast.Show(message, "success");
      this.GetRecentAddition(10);
    },
    async SaveContent(userID, client) {
      var response;
      var type;
      try {
        let files = await this.ListFiles(client);
        if (files.length == 0) {
          this.UploadToCloud(userID, client, ID.unique());
          response = "Content saved";
        } else {
          await this.DeleteCloudContent(client, files[0].$id);
          await this.UploadToCloud(userID, client, ID.unique());
          response = "Content syncronized";
        }
        type = "success";
      } catch (error) {
        response = error.message;
        type = "error";
      }
      return { value: response, type: type };
    },
    async UpdateFile(client, id) {
      console.log("Updating content");
      let storage = new Storage(client);
      await storage.updateFile(this.bucketID, id);
    },
    async UploadToCloud(userID, client, id) {
      console.log("Uploading content");
      //create a file to upload. Contains the content
      let file = new File(
        [JSON.stringify(this.content)],
        userID + "-favorites.json",
        { type: "application/json" }
      );
      //upload the file
      const storage = new Storage(client);
      var response;
      try {
        await storage.createFile(this.bucketID, id, file, [
          Permission.delete(Role.user(userID)),
          Permission.read(Role.user(userID)),
          Permission.update(Role.user(userID)),
        ]);
        response = "Content uploaded";
      } catch (error) {
        response = error.message;
        console.log(error);
        this.toast.Show(response, "error");
      }
      return response;
    },
    async DeleteCloudContent(client) {
      console.log("Deleting content");
      //create a file to upload. Contains the content
      const storage = new Storage(client);
      var response;
      try {
        let files = await this.ListFiles(client);
        console.log("files", files);
        console.log("deleting file " + files[0].$id);
        await storage.deleteFile(this.bucketID, files[0].$id);
        response = true;
      } catch (error) {
        response = false;
        console.log(error);
      }
      return response;
    },
    async ListFiles(client) {
      const storage = new Storage(client);
      var response;
      try {
        response = await storage.listFiles(this.bucketID);
        response = response.files;
      } catch (error) {
        response = [];
        console.log(error);
      }
      return response;
    },
    search(query) {
      const fuse = new Fuse(this.content, this.searchOptions);
      let res = fuse.search(query);
      let info = "Found " + res.length + " results for '" + query + "'";

      return { results: res, infos: info };
    },
    AddBookmark(data) {
      let { name, url, description, tags } = data;
      if (
        name == null ||
        url == null ||
        description == null ||
        tags == null ||
        name == "" ||
        url == "" ||
        description == "" ||
        tags == ""
      ) {
        this.toast.Show("Please fill all fields", "warning");
        return;
      }

      let bookmark = {
        name: name,
        id: hashCode(url),
        dateAdded: Date.now(),
        lastModified: Date.now(),
        visitCount: 0,
        lastVisitTime: Date.now(),
        iconUrl: "",
        description: description,
        url: url,
        tags: tags.split(","),
      };
      console.log(bookmark);
      let b = this.RemoveDuplicates([bookmark]);
      let feedback = "Bookmark added";
      let importance = "success";
      if (b.bookmarks.length != 0) {
        this.content.push(b.bookmarks[0]);
        this.SetContent(this.content);
      } else {
        feedback = "Bookmark already exists";
        importance = "error";
      }

      this.toast.Show(feedback, importance);
    },
    DeleteBookmark(id) {
      let index = this.content.findIndex((x) => x.id == id);
      this.content.splice(index, 1);
      this.SetContent(this.content);
    },
    UpdateBookmark(id, updateContent) {
      let index = this.content.findIndex((x) => x.id == id);
      for (let key in updateContent) {
        this.content[index][key] = updateContent[key];
      }
      this.SetContent(this.content);
    },
    IncrementVisitCount(id) {
      if (this.history[id] == null) {
        this.history[id] = {
          visitCount: 1,
          lastVisitTime: Date.now(),
        };
      } else {
        this.history[id].visitCount++;
        this.history[id].lastVisitTime = Date.now();
      }
      //save to local storage
      localStorage.setItem("history", JSON.stringify(this.history));
    },
    GetMostVisited(n) {
      if (this.content == null) return [];

      //sort by visit count
      let mostVisited = this.content
        .sort((a, b) => {
          let aVisitCount =
            this.history[a.id] == null ? 0 : this.history[a.id].visitCount;
          let bVisitCount =
            this.history[b.id] == null ? 0 : this.history[b.id].visitCount;
          return bVisitCount - aVisitCount;
        })
        .slice(0, n);

      //get first n on most visited where visit count > 0
      mostVisited = mostVisited.filter((x) => {
        let visitCount =
          this.history[x.id] == null ? 0 : this.history[x.id].visitCount;
        return visitCount > 0;
      });

      return mostVisited;
    },
    GetRecentAddition(n) {
      if (this.content == null) return [];
      let recentAddition = this.content
        .sort((a, b) => {
          let dateA = new Date(a.dateAdded);
          let dateB = new Date(b.dateAdded);
          return dateB - dateA;
        })
        .slice(0, n);
      console.log("done");
      this.recentAddition = recentAddition;
      return recentAddition;
    },
    AddListOfBookmarks(bookmarks) {
      let feedback;
      let importance;
      try {
        //remove duplicates from bookmarks
        let data = this.RemoveDuplicates(bookmarks);
        bookmarks = data.bookmarks;
        this.content = this.content.concat(bookmarks);
        this.SetContent(this.content);
        feedback =
          "Success to import " +
          bookmarks.length +
          " bookmarks. " +
          data.feedback;
        importance = "success";
      } catch (e) {
        feedback = "Failed to import " + bookmarks.length + " bookmarks";
        importance = "error";
      }

      this.toast.Show(feedback, importance);
    },
    RemoveDuplicates(bookmark) {
      let filteredBookmark = [];
      for (let i = 0; i < bookmark.length; i++) {
        let b = bookmark[i];
        let index = this.content.findIndex((x) => x.id === b.id);
        if (index == -1) {
          filteredBookmark.push(b);
        }
      }
      return {
        bookmarks: filteredBookmark,
        feedback:
          "Removed " +
          (bookmark.length - filteredBookmark.length) +
          " duplicates.",
      };
    },
    ResetContent() {
      this.SetContent(jsonContent);
      this.toast.Show("Bookmarks reset", "success");
    },
    GetDefaultContent() {
      return jsonContent;
    },
    ImportSave(json) {
      let feedback = "Success to import bookmarks";
      let importance = "success";
      //if json is valid
      if (this.IsValidJson(json)) {
        this.content = json;
        this.SetContent(this.content);
      } else {
        feedback = "Failed to import bookmarks";
        importance = "error";
      }
      this.toast.Show(feedback, importance);
    },
    ExportSave() {
      //download json file
      try {
        //add an empty description to each bookmark if it doesn't exist
        for (let i = 0; i < this.content.length; i++) {
          let b = this.content[i];
          if (b.description == null || b.description == undefined) {
            b.description = "";
          }
        }

        let dataStr =
          "data:text/json;charset=utf-8," +
          encodeURIComponent(JSON.stringify(this.content));
        console.log(dataStr);
        var link = document.createElement("a");

        link.setAttribute("href", dataStr);
        link.setAttribute("download", "bookmarks.json");
        link.click();
        link.remove();
        this.toast.Show("Bookmarks exported", "success");
      } catch (e) {
        this.toast.Show("Failed to export bookmarks", "error");
      }
    },
    IsValidJson(json) {
      if (json == null || json == undefined || !Array.isArray(json))
        return false;
      //check if every element in the list has the minimum required fields
      let isValid = true;
      for (let i = 0; i < json.length; i++) {
        let b = json[i];
        if (!IsValidBookmark(b)) {
          isValid = false;
          break;
        }
      }
      return isValid;
    },
    ResetVisitCount() {
      this.history = {};
      localStorage.setItem("history", JSON.stringify(this.history));
      this.toast.Show("Visit count reset", "success");
    },
    UnsavedChanges() {
      //compare lastCloudSync with LastLocalSave
      if (this.lastCloudSync == null) return false;
      //I'm using 5 seconds as a threshold to avoid saving if it's only a few milliseconds difference
      let diff = Math.abs(
        this.lastCloudSync.getTime() - this.lastLocalSave.getTime()
      );
      return diff > 5000;
    },
  },
});
