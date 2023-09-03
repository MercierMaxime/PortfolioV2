import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './index.css'

import mitt from 'mitt';
  // Import the functions you need from the SDKs you need
  
  // somecomponent.js
  
  import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";  // Initialize Firebase

  // TODO: Add SDKs for Firebase products that you want to use

  // https://firebase.google.com/docs/web/setup#available-libraries


  // Your web app's Firebase configuration

  const firebaseConfig = {
    apiKey: "AIzaSyDxlvUHnKBsGUujrWjgySvN5rx5bwdDubY",
    authDomain: "portfolio-ea56c.firebaseapp.com",
    projectId: "portfolio-ea56c",
    storageBucket: "portfolio-ea56c.appspot.com",
    messagingSenderId: "908343946737",
    appId: "1:908343946737:web:82a4e883e08c1acb35e850"
  };


  // Initialize Firebase

  const appFirebase = initializeApp(firebaseConfig);


  const app = createApp(App)
  
  
  export const emitter = mitt();
  app.config.globalProperties.emitter = emitter;
  
  
 
  app.use(router)
  
  app.mount('#app')