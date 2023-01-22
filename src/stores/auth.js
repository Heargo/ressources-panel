import { defineStore } from 'pinia'
import { Client, Account, ID } from "appwrite";

export const useAuth = defineStore('auth', {
    state: () => {
        return {
          client:null,
          account:null,
          IsConnected:JSON.parse(localStorage.getItem('isConnected')) || false,
          token:localStorage.getItem('jwt-token') || null,
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

          if(this.token != null)
          {
            console.log("there is a token in local storage")
            this.client.setJWT(this.token);
          }
          else
          {
            localStorage.removeItem('isConnected')
            this.IsConnected = false;
          }
          console.log("Client setup","IsConnected: " , this.IsConnected,"Token: ", this.token)
        },
        async CreateAccount(email,password)
        {
          const account = new Account(this.client);
          var response;
          try{
            await account.create(ID.unique(),email,password)
            response = "Login successful";
          }catch(error){
            response = error.message;
          }
          return response;
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
          this.CheckConnection();
          return response;
        },
        async CheckConnection() {
          if(this.account == null){
            this.IsConnected = false;
            localStorage.removeItem('isConnected')
            localStorage.removeItem('jwt-token')
          }
          try {
              const session = await this.account.get();
              if (session) {
                  this.IsConnected = true;
                  localStorage.setItem('isConnected', 'true')
                  var jwt = await this.account.createJWT();
                  localStorage.setItem('jwt-token', jwt)
                  console.log("JWT: ", jwt)
              }
          } catch (error) {
              //console.log(error)
              this.IsConnected = false;
              localStorage.removeItem('isConnected')
              localStorage.removeItem('jwt-token')
          }
          console.log("IsConnected: " + this.IsConnected)
      }
      }
})