<template>
  <div ref="container">
       <div class="grid grid-flow-row-dense grid-cols-[repeat(auto-fit,minmax(350px,2fr))] pb-10">
        <RouterLink :to="{ name:'idprojet', params:{ id}}">

        <div class="relative m-auto flex w-4/5 flex-col items-center justify-center pb-10 h-60 md:h-72 lg:h-96 xl:h-96">
        <div class="relative flex flex-grow flex-col items-center justify-center gap-2.5 self-stretch border-8 rounded-lg border-Blanc py-5 group">
          <h3 class="z-10 flex-shrink-0 flex-grow-0 self-stretch text-center font-bold text-Blanc text-lg md:text-xl lg:text-2xl xl:text-2xl"> {{ nom }}</h3>
          <img :src="photo" alt="" class="rounded-xl w-1/3 absolute h-full z-0 opacity-0">
          <div class="z-10 flex justify-center  ">
            <img class="w-1/3 md:w-1/3 lg:w-2/3 xl:w-2/3" :src="photo" alt="">
          </div>
        </div>
      </div>
    </RouterLink>     
    <div class="relative m-auto flex w-2/5 flex-col items-center justify-center pb-10">
      <h3 class="font-sublima text-center text-base lg:text-lg xl:text-xl"> {{ description }}</h3>
      <h4 class="font-sublima mt-5 text-center text-sm lg:text-sm xl:text-base"><i>{{ descriptionitalique }}</i></h4>     
     </div>
    </div>

    <div class="flex justify-center gap-10 mt-1 text-blue-600">
        <RouterLink v-if="isAdmin" :to="{ name:'UpdateProjets', params:{ id}}">
              <Modification />
              </RouterLink>
        <RouterLink v-if="isAdmin" class="" :to="{ name:'DeleteProjets', params: {id}}">
            <button class="bg-red-300">
              <Supprimer />
            </button>
        </RouterLink>

    </div>
  </div>
</template>
<script>
import Modification from './Modification.vue';
import Supprimer from './Supprimer.vue';
import Apercu from './Apercu.vue';
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  where
} from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js'
import {
  getStorage,
  ref,
  getDownloadURL,
} from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-storage.js'

import { getAuth } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js'

// Import emetteur de main.js
import { emitter } from '/src/main'




export default {
    props: {
        nom: String,
        description: String,
        descriptionitalique: String,
        photo: String,
        id: String,
    },
    components: { Supprimer, Modification, Apercu },
  data() {
    return {
      menuOuvert: false,

      user:{              // User connecté
        email:null,
        password:null
      },
      userInfo:null,      // Informations complémentaires user connecté
      name:"Vidéo",       // Titre de l'application ou nom du user
      isAdmin:false       // Si l'utilisateur est ou non administrateur
    }
  },
  mounted(){
    // Vérifier si un user connecté existe déjà
    // Au lancement de l'application
    this.getUserConnect();

    // Ecoute de l'évènement de connexion
    emitter.on('connectUser', e => {
      // Récupération du user
      this.user = e.user;
//      console.log('App => Reception user connecté', this.user);
      // Recherche infos complémentaires du user
      this.getUserInfo(this.user);      
    })        
    
    // Ecoute de l'évènement de deconnexion
    emitter.on('deConnectUser', e => {
      // Récupération user 
      this.user = e.user;
//      console.log('App => Reception user deconnecté', this.user);
      // Réinitialisation infos complémentaires user
      this.userInfo   = null;
      this.name       = 'Vidéo';
      this.isAdmin    = false;
    })
  },
  methods:{
    // Obtenir les informations du user connecté
    async getUserConnect(){
      await getAuth().onAuthStateChanged(function(user) { 
        if(user) {
            // Récupération du user connecté
            this.user = user;
            // Recherche de ses infos complémentaires
            this.getUserInfo(this.user);   
        } 
      }.bind(this));
      // Noter le bind(this), cas des zones isolées
      // lors de 2 strucutres imbiquées, Vue perd la visibilité
      // des données
      // On les ré injecte par le mot-clef this
    },

    async getUserInfo(user){
      // Rechercher les informations complémentaires de l'utilisateur
      // Obtenir Firestore
      const firestore = getFirestore();
      // Base de données (collection)  document participant
      const dbUsers = collection(firestore, "users");
      // Recherche du user par son uid
      const q = query(dbUsers, where("uid", "==", user.uid));
      await onSnapshot(q, (snapshot) => {
          this.userInfo = snapshot.docs.map(doc => (
            {id:doc.id, ...doc.data()}
          ));
//          console.log("userInfo", this.userInfo);                
          // userInfo étant un tableau, onn récupère
          // ses informations dans la 1° cellule du tableau : 0
          this.name = this.userInfo[0].login;
          this.isAdmin=this.userInfo[0].admin;
          // Recherche de l'image du user sur le Storage
          const storage = getStorage();
          // Référence du fichier avec son nom
          const spaceRef = ref(storage, 'users/'+this.userInfo[0].avatar);
          getDownloadURL(spaceRef)
            .then((url) => {
              this.avatar = url;
            })
            .catch((error) =>{
              console.log('erreur downloadUrl', error);
            })
        });
      }
    } ,
}
</script>

