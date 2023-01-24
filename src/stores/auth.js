import { defineStore } from 'pinia'
import { Client, Account, ID } from "appwrite";

export const useAuth = defineStore('auth', {
    state: () => {
        return {
          client:null,
          account:null,
          accountInfo:null,
          IsConnected:JSON.parse(localStorage.getItem('isConnected')) || false,
          autoSave:JSON.parse(localStorage.getItem('autoSave')) || false,
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

          this.account = new Account(this.client);
          this.CheckConnection();
        },
        async CreateAccount(email,password)
        {
          const account = new Account(this.client);
          let response;
          let type;
          try{
            await account.create(ID.unique(),email,password)
            response = "The account has been created";
            type = "success";
          }catch(error){
            response = error.message;
            type = "error";
          }
          return {value:response,type:type};
        },
        async Login(email,password)
        {
          this.account = new Account(this.client);
          var response;
          var type;
          try{
            await this.account.createEmailSession(email,password);
            response = "Logged in";
            type = "success";
          }catch(error){
            response = error.message;
            type = "error";
          }
          this.CheckConnection();
          return {value:response,type:type};
        },
        async Logout() {
          try {
              await this.account.deleteSessions();
              this.IsConnected = false;
              this.accountInfo = null;
          } catch (error) {
              console.log(error)
          }
        },
        async CheckConnection() {
          if(this.account == null){
            this.IsConnected = false;
          }
          try {
              const session = await this.account.get();
              if (session) {
                  this.IsConnected = true;
                  this.accountInfo = session;
              }
          } catch (error) {
              console.log("Not connected")
              this.IsConnected = false;
          }
      },
      DeleteAccount(){
        //TODO
      },
      SetAutoSave(value){
        this.autoSave = value;
        localStorage.setItem('autoSave',value);
      }
      }
})