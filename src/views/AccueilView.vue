<script>
import card from "../components/icones/card.vue"
import Rechercher from "../components/icones/Rechercher.vue"
import Modification from "../components/icones/Modification.vue"
import Supprimer from "../components/icones/Supprimer.vue"
import Header from '../components/Header.vue';
import Footer from '../components/Footer.vue';
import BoutonImage from '../components/icones/modifierListe/BoutonImage.vue';
import Creation from "../components/icones/modifierListe/creation.vue";

// Bibliothèque Firestore : import des fonctions
import { 
    getFirestore, 
    collection, 
    doc,
    query,
    where,
    getDocs, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    onSnapshot } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js'
import { getStorage, ref, getDownloadURL, uploadString } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-storage.js";
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js'
import { emitter } from '../main.js'

import { RouterLink } from "vue-router";
export default {
    data(){ // Données de la vue
            return{  
              audioSrc: '../assets/Mercier.mp3',   
                nom:null, // Pour la création d'un nouveau pays
                listeProjetSynchro:[], // Liste des pays synchronisée - collection pays de Firebase
                filter:'',
                user:{              // User connecté
        email:null,
        password:null
      },
      userInfo:null,      // Informations complémentaires user connecté
      name:"Vidéo",       // Titre de l'application ou nom du user
      isAdmin:false       // Si l'utilisateur est ou non administrateur
            }
        },
        computed:{
            orderByName:function(){
                return this.listeProjetSynchro.sort(function(a, b){
                  if(a.Nom < b.Nom)  return -1;
                  if(a.Nom > b.Nom)  return 1;
                  return 0
                })
            },
            filterByName:function(){
                if(this.filter.length > 0){
                    let filter = this.filter.toLowerCase();
                    return this.orderByName.filter(function(Projet){
                        return Projet.Nom.toLowerCase().includes(filter);
                    })
                }else{
                    return this.orderByName;
                }
            }
        },
        mounted(){ // Montage de la vue

          this.$refs.audioPlayer.volume = 0.5; // Réglez le volume comme vous le souhaitez

            // Appel de la liste des pays synchronisée
            this.getProjetSynchro();
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
        methods: {
          
              async getProjetSynchro(){
                // Obtenir Firestore
                const firestore = getFirestore();
                // Base de données (collection)  document pays
                const dbProjet= collection(firestore, "Projet");
                // Liste des pays synchronisée
                const query = await onSnapshot(dbProjet, (snapshot) =>{
                    //  Récupération des résultats dans listePaysSynchro
                    // On utilse map pour récupérer l'intégralité des données renvoyées
                    // on identifie clairement le id du document
                    // les rest parameters permet de préciser la récupération de toute la partie data
                    this.listeProjetSynchro = snapshot.docs.map(doc => ({id:doc.id, ...doc.data()}));
                    this.listeProjetSynchro.forEach(function(Projet){
                      const storage = getStorage();
                      const spaceRef = ref(storage, 'ApercuProjet/'+Projet.photo);
                      getDownloadURL(spaceRef)
                      .then((url) => {
                        Projet.photo = url;
                      })
                      .catch((error) =>{
                        console.log('erreur downloadUrl', error)
                      })
                    }) 
                })
            },
            async createProjet(){
                // Obtenir Firestore
                const firestore = getFirestore();
                // Base de données (collection)  document pays
                const dbProjet= collection(firestore, "Projet");
                // On passe en paramètre format json
                // Les champs à mettre à jour
                // Sauf le id qui est créé automatiquement
                const docRef = await addDoc(dbProjet,{
                    nom: this.nom,
                    description: this.description,
                    photo: this.photo
                })
                console.log('document créé avec le id : ', docRef.id);
             },
            async updateProjet(Projet){
                // Obtenir Firestore
                const firestore = getFirestore();
                // Base de données (collection)  document pays
                // Reference du pays à modifier
                const docRef = doc(firestore, "Projet", Projet.id);
                // On passe en paramètre format json
                // Les champs à mettre à jour
                await updateDoc(docRef, {
                    nom: Projet.nom
                }) 
             },
            async deleteProjet(Projet){
                // Obtenir Firestore
                const firestore = getFirestore();
                // Base de données (collection)  document pays
                // Reference du pays à supprimer
                const docRef = doc(firestore, "Projet", Projet.id);
                // Suppression du pays référencé
                await deleteDoc(docRef);
             },
async createProjet(){
            const storage = getStorage();
            const refStorage = ref(storage, 'Projet/'+this.Projet.photo);
            await uploadString(refStorage, this.imageData, 'data_url').then((snapshot) => {
                console.log('Uploaded a base64 string');
                const db = getFirestore();
                const docRef = addDoc(collection(db, 'Projet'), this.Projet);
            });
            this.$router.push('/projets')
        },
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
  name: "App",
  components: { card, Rechercher, Modification, Supprimer, Header, Footer, BoutonImage, Creation, RouterLink },
};
</script>

<style>
  .welcome{
    @apply relative text-slate-300 
  }
  .welcome::before{
    @apply content-['Portfolio']
    absolute text-Blanc border-r-2 border-Blanc 
    overflow-hidden animate-animate 
  }

  .container {
  overflow: hidden;
  display: flex;
}
.txt {
  white-space: nowrap;
  animation: scrollTxt 10s linear infinite;
}

@keyframes scrollTxt {
  0%{
    transform: translate(-10%, 0);
  }
  100% {
    transform: translate(10%, 0);
  }
}
</style>

<template>
<div class="text-white bg-black font-meduim">
  <Header/>
  <div>
    <audio ref="audioPlayer" autoplay>
      <source :src="audioSrc" type="audio/mpeg">
      Your browser does not support the audio element.
    </audio>
  </div>
  <h1 class=" text-Blanc font-bold text-center pt-80 text-3xl md:text-4xl lg:text-4xl xl:text-4xl">Portfolio</h1>
  <h2 class="animate__animated animate__backInLeft text-center lg:ml-96 xl:ml-96 font-semibold text-2xl md:text-3xl lg:text-3xl xl:text-3xl rounded-lg">Maxime Mercier</h2>
    <div class="grid grid-cols-2 space-x-4 mt-60">
      <h3 class="text-left ml-5 font-bold sm:text-sm md:text-base lg:text-xl xl:text-xl">2024</h3>
      <div class="grid grid-cols-2">
        <h3 class="text-right ml-5 font-bold sm:text-sm md:text-base lg:text-lg xl:text-xl">Contact :</h3>
        <a href="mailto:maximemercier163@gmail.com" class="text-left ml-2 hover:underline sm:text-sm md:text-base lg:text-lg xl:text-xl">maximemercier163@gmail.com</a>
      </div>
    </div>

    <h2 id="presentation" class="mt-60 ml-10 md:ml-20 lg:ml-20 xl:ml-20 font-bold text-2xl md:text-3xl lg:text-3xl xl:text-3xl">Présentation</h2>


    <div class="grid grid-flow-row-dense grid-cols-[repeat(auto-fit,minmax(350px,2fr))] pb-10">
      <div class="grid grid-rows-2 justify-center mt-36">
        <img class="row-span-3 flex w-2/3 md:w-2/3 lg:w-max xl:w-max" src='../assets/Moi.svg' alt="">
          <div class="mt-20 pl-5">
            <button class="w-2/3 md:w-2/3 lg:w-80 xl:w-80  rounded-lg border-Blanc border-4 h-16 font-bold text-xl hover:bg-Blanc hover:text-black"><a href="https://drive.google.com/file/d/1RPlIEtmLBcvUMeT3t4RCRd0Zmvw_tLCp/view?usp=sharing" target="_blank">Voir mon CV</a></button>
          </div>
      </div>
      <div class="grid grid-rows-5 grid-flow-row mr-5">
        <h3 class="mt-12 ml-5  lg:mt-20 xl:mt-20 lg:text-lg xl:text-xl">Étudiant en 3e année au sein du département MMI de Montbéliard, je me spécialise dans la Communication Web et l'Expérience Utilisateur (UX).</h3>
        <h3 class="pt-5 ml-5 mb-0 sm:mt-5 md:mt-3 lg:text-lg xl:text-xl">Mon domaine d'expertise s'étend à la conception de stratégies de communication, visant à optimiser le référencement des sites dont j'ai la charge.</h3>
        <h3 class="ml-5 mt-3 font-bold lg:text-lg xl:text-xl">Grâce à cela, j'ai pu apporter des soltions adaptées et innovantes à mes projets.</h3>
        <h3 class="ml-5 lg:text-lg xl:text-xl">Ayant donc d’ores et déjà réaliser des projets collectifs, il m’est désormais naturel de communiquer de façon efficace et régulière avec mes collaborateurs ainsi qu’avec le commanditaire du projet.</h3>
        <h3 class="ml-5 lg:text-lg xl:text-xl">Je m'investis également dans la création de maquettes graphiques, ainsi que dans l'intégration de sites Web responsives, aussi bien statiques que dynamiques. Mon approche créative et technique se conjugue pour donner vie à des projets web esthétiques et fonctionnels.</h3>
      </div>
    </div>

    <h2 id="competences" class="mt-60 ml-10 md:ml-20 lg:ml-20 xl:ml-20 font-bold text-2xl md:text-3xl lg:text-3xl xl:text-3xl">Mes compétences</h2>

    <div class="py-36 px-20">
      <h2 class="rounded-lg border-Blanc text-center text-Noir bg-Blanc justify-center border-8 font-bold text-xl py-1 relative flex flex-grow flex-col items-center self-stretch">Communication Web</h2>
    </div>

    <div class="grid grid-flow-row-dense grid-cols-[repeat(auto-fit,minmax(350px,2fr))] pb-10">
      <div class="relative m-auto flex w-4/5 flex-col items-center justify-center pb-10">
        <div class="relative flex flex-grow flex-col items-center justify-center gap-2.5 self-stretch bg-Noir border-8 border-Blanc py-5">
          <h3 class="flex-shrink-0 flex-grow-0 self-stretch text-center font-bold text-Blanc text-xl">Communication Social Media</h3>
        </div>
        <div class="pt-5">
          <div class="container relative flex flex-grow flex-col items-center justify-center gap-2.5 self-stretch bg-Blanc px-10 py-2">
            <h4 class="flex-shrink-0 flex-grow-0 self-stretch text-center font-bold text-Noir text-xs md:text-sm lg:text-base xl:text-base">Gestion des publications - Modérations de la communauté</h4>
          </div>
        </div>
      </div>
      <div class="relative m-auto flex w-4/5 flex-col items-center justify-center pb-10">
        <div class="relative flex flex-grow flex-col items-center justify-center gap-2.5 self-stretch bg-Noir border-8 border-Blanc py-5">
          <h3 class=" flex-shrink-0 flex-grow-0 self-stretch text-center font-bold text-xl text-Blanc">Stratégie de communication</h3>
        </div>
        <div class="pt-5">
          <div class="container relative flex flex-grow flex-col items-center justify-center gap-2.5 self-stretch bg-Blanc px-10 py-2">
            <h4 class="flex-shrink-0 flex-grow-0 self-stretch text-center font-bold text-Noir text-xs md:text-sm lg:text-base xl:text-base">Optimiser la mise en avant des projets pour le grand public</h4>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-flow-row-dense grid-cols-[repeat(auto-fit,minmax(350px,2fr))]">
      <div class="relative m-auto flex w-4/5 flex-col items-center justify-center pb-10">
        <div class="relative flex flex-grow flex-col items-center justify-center gap-2.5 self-stretch bg-Noir border-8 border-Blanc py-5">
          <h3 class="flex-shrink-0 flex-grow-0 self-stretch text-center font-bold text-Blanc text-xl">Elaboration de Référencement SEO</h3>
        </div>
        <div class="pt-5">
          <div class="container relative flex flex-grow flex-col items-center justify-center gap-2.5 self-stretch bg-Blanc px-10 py-2">
            <h4 class="flex-shrink-0 flex-grow-0 self-stretch text-center font-bold text-Noir text-xs md:text-sm lg:text-base xl:text-base">Optimisation pour les moteurs de recherche</h4>
          </div>
        </div>
      </div>
      <div class="relative m-auto flex w-4/5 flex-col items-center justify-center pb-10">
        <div class="relative flex flex-grow flex-col items-center justify-center gap-2.5 self-stretch bg-Noir border-8 border-Blanc py-5">
          <h3 class="flex-shrink-0 flex-grow-0 self-stretch text-center font-bold text-xl text-Blanc">Structuration de projets</h3>
        </div>
        <div class="pt-5">
          <div class="container relative flex flex-grow flex-col items-center justify-center gap-2.5 self-stretch bg-Blanc px-10 py-2">
            <h4 class="flex-shrink-0 flex-grow-0 self-stretch text-center font-bold text-Noir text-xs md:text-sm lg:text-base xl:text-base">Gestion des tâches - Échanges avec le commanditaire</h4>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-flow-row-dense grid-cols-[repeat(auto-fit,minmax(350px,2fr))]">
      <div class="relative m-auto flex w-4/5 flex-col items-center justify-center pb-10">
        <div class="relative flex flex-grow flex-col items-center justify-center gap-2.5 self-stretch bg-Noir border-8 border-Blanc py-5">
          <h3 class="flex-shrink-0 flex-grow-0 self-stretch text-center font-bold text-Blanc text-xl">Confection de cahier des charges</h3>
        </div>
        <div class="pt-5">
          <div class="container relative flex flex-grow flex-col items-center justify-center gap-2.5 self-stretch bg-Blanc px-10 py-2">
            <h4 class="flex-shrink-0 flex-grow-0 self-stretch text-center font-bold text-Noir text-xs md:text-sm lg:text-base xl:text-base">Expliquer et Argumenter sur le potentiel des projets aux clients</h4>
          </div>
        </div>
      </div>
      <div class="relative m-auto flex w-4/5 flex-col items-center justify-center pb-10">
        <div class="relative flex flex-grow flex-col items-center justify-center gap-2.5 self-stretch bg-Noir border-8 border-Blanc py-5">
          <h3 class="flex-shrink-0 flex-grow-0 self-stretch text-center font-bold text-Blanc text-xl">Veille informatique</h3>
        </div>
        <div class="pt-5">
          <div class="container relative flex flex-grow flex-col items-center justify-center gap-2.5 self-stretch bg-Blanc px-10 py-2">
            <h4 class="flex-shrink-0 flex-grow-0 self-stretch text-center font-bold text-Noir text-xs md:text-sm lg:text-base xl:text-base">Consultation des tendances du web, Comprendre les nouveaux besoins des utilisateurs</h4>
          </div>
        </div>
      </div>
    </div>

    <div class="relative m-auto flex w-2/5 flex-col items-center justify-center pb-10">
        <div class="relative flex flex-grow flex-col items-center justify-center gap-2.5 self-stretch bg-Noir border-8 border-Blanc py-5">
          <h3 class="flex-shrink-0 flex-grow-0 self-stretch text-center font-bold text-xl text-Blanc">Utilisation d'outils collaboratifs</h3>
        </div>
        <div class="pt-5 flex items-center justify-center w-1/6 md:w-1/12 lg:w-1/12 xl:w-1/12 space-x-5">
          <img src="../assets/Logo_drive.png" alt="">
          <img src="../assets/Logo_docs.png" alt="">
          <img src="../assets/Logo_slides.png" alt="">
          <img src="../assets/Logo_sheets.png" alt="">
          <img src="../assets/Logo_forms.png" alt="">
        </div>
        <div class="pt-5">
          <div class="container relative flex flex-grow flex-col items-center justify-center gap-2.5 self-stretch bg-Blanc px-10 py-2">
            <h4 class="tflex-shrink-0 flex-grow-0 self-stretch text-center font-bold text-Noir text-xs md:text-sm lg:text-base xl:text-base">Google Drive, Docs, Slides, Sheets, Forms</h4>
          </div>
        </div>
      </div>
    

    <div class="py-36 px-20">
      <h2 class="rounded-lg border-Blanc text-Noir text-center bg-Blanc justify-center border-8 font-bold text-xl py-1 relative flex flex-grow flex-col items-center self-stretch">Design Graphique</h2>
    </div>

    <div class="grid grid-flow-row-dense grid-cols-[repeat(auto-fit,minmax(350px,2fr))] pb-10">
      <div class="relative m-auto flex w-4/5 flex-col items-center justify-center pb-10">
        <div class="relative flex flex-grow flex-col items-center justify-center gap-2.5 self-stretch bg-Noir border-8 border-double border-Blanc py-5">
          <h3 class="flex-shrink-0 flex-grow-0 self-stretch text-center font-bold text-Blanc text-xl">Création de maquettes</h3>
        </div>
        <div class="pt-5 flex items-center justify-center w-1/6 md:w-1/12 lg:w-1/12 xl:w-1/12 space-x-5">
          <img src="../assets/Logo_Figma.png" alt="">
        </div>
        <div class="pt-5">
          <div class="container relative flex flex-grow flex-col items-center justify-center gap-2.5 self-stretch bg-Blanc px-10 py-2">
            <h4 class="flex-shrink-0 flex-grow-0 self-stretch text-center font-bold text-Noir text-xs md:text-sm lg:text-base xl:text-base">Donner un aperçu du futur site, présentation pour les clients</h4>
          </div>
        </div>
      </div>
      <div class="relative m-auto flex w-4/5 flex-col items-center justify-center pb-10">
        <div class="relative flex flex-grow flex-col items-center justify-center gap-2.5 self-stretch bg-Noir border-8 border-double border-Blanc py-5">
          <h3 class="flex-shrink-0 flex-grow-0 self-stretch text-center font-bold text-xl text-Blanc">Réalisations audiovisuelles</h3>
        </div>
        <div class="pt-5 flex items-center justify-center w-1/6 md:w-1/12 lg:w-1/12 xl:w-1/12 space-x-5">
          <img src="../assets/Logo_OBS.png" alt="">
          <img src="../assets/Logo_DaVinci.png" alt="">
        </div>
        <div class="pt-5">
          <div class="container relative flex flex-grow flex-col items-center justify-center gap-2.5 self-stretch bg-Blanc px-10 py-2">
            <h4 class="flex-shrink-0 flex-grow-0 self-stretch text-center font-bold text-Noir text-xs md:text-sm lg:text-base xl:text-base">Réalisation de vidéos avec gestion images et son / Montage vidéo</h4>
          </div>
        </div>
      </div>
    </div>
      <div class="relative m-auto flex w-2/5 flex-col items-center justify-center pb-10">
        <div class="relative flex flex-grow flex-col items-center justify-center gap-2.5 self-stretch bg-Noir border-8 border-double border-Blanc py-5">
          <h3 class="flex-shrink-0 flex-grow-0 self-stretch text-center font-bold text-Blanc text-xl">Réalisations de contenus visuels</h3>
        </div>
        <div class="pt-5 flex items-center justify-center w-1/6 md:w-1/12 lg:w-1/12 xl:w-1/12 space-x-5">
          <img src="../assets/Logo_photoshop.png" alt="">
          <img src="../assets/Logo_illustrator.png" alt="">
          <img src="../assets/Logo_indesign.png" alt="">
        </div>
        <div class="pt-5">
          <div class="container relative flex flex-grow flex-col items-center justify-center gap-2.5 self-stretch bg-Blanc px-10 py-2">
            <h4 class="flex-shrink-0 flex-grow-0 self-stretch text-center font-bold text-Noir text-xs md:text-sm lg:text-base xl:text-base">Elaboration de logos, affiches...</h4>
          </div>
        </div>
      </div>

      <div class="py-36 px-20">
        <h2 class="rounded-lg text-center border-Blanc text-Noir bg-Blanc justify-center border-8 font-bold text-xl py-1 relative flex flex-grow flex-col items-center self-stretch">Développement Web</h2>
      </div>

    <div class="grid grid-flow-row-dense grid-cols-[repeat(auto-fit,minmax(350px,2fr))] pb-10">
      <div class="relative m-auto flex w-4/5 flex-col items-center justify-center pb-10">
        <div class="relative flex flex-grow flex-col items-center justify-center gap-2.5 self-stretch bg-Noir border-8 border-dashed border-Blanc py-5">
          <h3 class="flex-shrink-0 flex-grow-0 self-stretch text-center font-bold text-Blanc text-xl">Intégration de sites Web</h3>
        </div>
        <div class="pt-5 flex items-center justify-center w-1/6 md:w-1/12 lg:w-1/12 xl:w-1/12 space-x-5">
          <img src="../assets/Logo_html.png" alt="">
          <img src="../assets/Logo_css.png" alt="">
          <img src="../assets/Logo_vue.png" alt="">
          <img src="../assets/Logo_typescript.png" alt="">
        </div>
        <div class="pt-5">
          <div class="container relative flex flex-grow flex-col items-center justify-center gap-2.5 self-stretch bg-Blanc px-10 py-2">
            <h4 class="flex-shrink-0 flex-grow-0 self-stretch text-center font-bold text-Noir text-xs md:text-sm lg:text-base xl:text-base">Langages utilisés : HTML/CSS, VueJS, TypeScript</h4>
          </div>
        </div>
      </div>
      <div class="relative m-auto flex w-4/5 flex-col items-center justify-center pb-10">
        <div class="relative flex flex-grow flex-col items-center justify-center gap-2.5 self-stretch bg-Noir border-8 border-dashed border-Blanc py-5">
          <h3 class="flex-shrink-0 flex-grow-0 self-stretch text-center font-bold text-xl text-Blanc">Utilisation de logiciels OpenSource</h3>
        </div>
        <div class="pt-5 flex items-center justify-center w-1/6 md:w-1/12 lg:w-1/12 xl:w-1/12 space-x-5">
          <img src="../assets/Logo_VSCode.png" alt="">
          <img src="../assets/Logo_Wordpress.png" alt="">
          <img src="../assets/Logo_Github.svg" alt="">
          <img src="../assets/Logo_Supabase.png" alt="">
          <img src="../assets/Logo_Firebase.png" alt="">
        </div>
        <div class="pt-5">
          <div class="container relative flex flex-grow flex-col items-center justify-center gap-2.5 self-stretch bg-Blanc px-10 py-2">
            <h4 class="flex-shrink-0 flex-grow-0 self-stretch text-center font-bold text-Noir text-xs md:text-sm lg:text-base xl:text-base">Visual Studio Code, Wordpress, Github, Supabase, Firebase</h4>
          </div>
        </div>
      </div>
    </div>

    <h2 id="creations" class="mt-60 mb-20 ml-10 md:ml-20 lg:ml-20 xl:ml-20 font-bold text-2xl md:text-3xl lg:text-3xl xl:text-3xl">Mes créations</h2>
    <RouterLink v-if="isAdmin" to="createProjet">
      <div class="py-5 px-20">
        <p class="rounded-lg text-center border-Blanc text-Noir bg-Blanc justify-center border-8 font-bold text-xl py-1 relative flex flex-grow flex-col items-center self-stretch">Ajouter un projet</p>
      </div>
      </RouterLink>
    <div>
        <div v-for="Projet in listeProjetSynchro" :key="Projet.id">
            <card
                :nom="Projet.nom"
                :description="Projet.description"
                :descriptionitalique="Projet.descriptionitalique"
                :photo="Projet.photo"
                :id="Projet.id" />
        </div>
    </div>

    <!-- <div class="grid grid-flow-row-dense grid-cols-[repeat(auto-fit,minmax(350px,2fr))] pb-10">
      <a href="https://tiktak.mercier-maxime.com" target="_blank"><div class="relative m-auto flex w-4/5 flex-col items-center justify-center pb-10 h-60 md:h-72 lg:h-96 xl:h-96">
        <div class="relative flex flex-grow flex-col items-center justify-center gap-2.5 self-stretch border-8 rounded-lg border-Blanc py-5 group">
          <img src="../assets/tik_tak.png" alt="" class="absolute w-full h-full z-0 opacity-0 group-hover:opacity-30 duration-1000 ">
          <div class="z-10 flex justify-center  ">
            <img class="w-1/3 md:w-1/3 lg:w-2/3 xl:w-2/3" src="../assets/Logo_Tik_Tak.svg" alt="">
          </div>
        </div>
      </div>
    </a>     
    <div class="relative m-auto flex w-2/5 flex-col items-center justify-center pb-10">
      <h3 class="font-sublima text-center text-base lg:text-lg xl:text-xl">Site ayant pour thème, la création, la modification ainsi que la suppression de montres entièrement personnalisables</h3> 
      <h4 class="font-sublima mt-5 text-center text-sm lg:text-sm xl:text-base"><i>(Gestion des données avec Supabase)</i></h4>   
      </div>
    </div>

    <div class="grid grid-flow-row-dense grid-cols-[repeat(auto-fit,minmax(350px,2fr))] pb-10">
      <a href="https://aidealareussite.fr" target="_blank"><div class="relative m-auto flex w-4/5 flex-col items-center justify-center pb-10 h-60 md:h-72 lg:h-96 xl:h-96">
        <div class="relative flex flex-grow flex-col items-center justify-center gap-2.5 self-stretch border-8 rounded-lg border-Blanc py-5 group">
          <h3 class="z-10 flex-shrink-0 flex-grow-0 self-stretch text-center font-bold text-Blanc text-lg md:text-xl lg:text-2xl xl:text-2xl">Aide à la réussite</h3>
          <img src="../assets/aide_a_la_reussite.png" alt="" class="absolute w-full h-full z-0 opacity-0 group-hover:opacity-30 duration-1000 ">
          <div class="z-10 flex justify-center">
            <img class="pt-10 w-1/3 md:w-1/3 lg:w-2/3 xl:w-2/3" src="../assets/Logo_Aide_reussite.svg" alt="">
          </div>
        </div>
      </div>
    </a>     
    <div class="relative m-auto flex w-2/5 flex-col items-center justify-center pb-10">
      <h3 class="font-sublima text-center text-base lg:text-lg xl:text-xl">Projet collectif réalisé afin de convenir à un programme d'accompagnement d'étudiants en difficulté scolaire.</h3> 
      <h4 class="font-sublima mt-5 text-center text-sm lg:text-sm xl:text-base"><i>(Réalisation de la communication et SEO)</i></h4>      
      </div>
    </div>
    
    <div class="grid grid-flow-row-dense grid-cols-[repeat(auto-fit,minmax(350px,2fr))] pb-10">
      <a href="https://honeyst.mercier-maxime.com" target="_blank"><div class="relative m-auto flex w-4/5 flex-col items-center justify-center pb-10 h-60 md:h-72 lg:h-96 xl:h-96">
        <div class="relative flex flex-grow flex-col items-center justify-center gap-2.5 self-stretch border-8 rounded-lg border-Blanc py-5 group">
          <img src="../assets/honeyst.png" alt="" class="absolute w-full h-full z-0 opacity-0 group-hover:opacity-30 duration-1000 ">
          <div class="z-10 flex justify-center">
            <img class="w-1/3 md:w-1/3 lg:w-2/3 xl:w-2/3" src="../assets/Logo_Honeyst.jpg" alt="">
          </div>
        </div>
      </div>
    </a>     
    <div class="relative m-auto flex w-2/5 flex-col items-center justify-center pb-10">
      <h3 class="font-sublima text-center text-base lg:text-lg xl:text-xl">Site e-commerce permettant la consultation ainsi que l'achat des produits disponibles dans la boutique.</h3>   
      <h4 class="font-sublima mt-5 text-center text-sm lg:text-sm xl:text-base"><i>(Réalisé avec WordPress et plugin WooCommerce)</i></h4>       
      </div>
    </div>

    <div class="grid grid-flow-row-dense grid-cols-[repeat(auto-fit,minmax(350px,2fr))] pb-10">
      <a href="https://youtu.be/E6jd8HnmbCE" target="_blank"><div class="relative m-auto flex w-4/5 flex-col items-center justify-center pb-10 h-60 md:h-72 lg:h-96 xl:h-96">
        <div class="relative flex flex-grow flex-col items-center justify-center gap-2.5 self-stretch border-8 rounded-lg border-Blanc py-5 group">
            <video src="../assets/extrait_interview.mp4" alt="" class="absolute w-full h-full z-0 opacity-0 group-hover:opacity-30 duration-1000"></video>
          <img class="w-1/5" src="../assets/icone_lecture.svg" alt="">
        </div>
      </div>
    </a>     
    <div class="relative m-auto flex w-2/5 flex-col items-center justify-center pb-10">
      <h3 class="font-sublima text-center text-base lg:text-lg xl:text-xl">Interview d'un ancien étudiant MMI (ex-SRC), concernant son parcours universitaire ainsi que professionnel.</h3>    
      <h4 class="font-sublima mt-5 text-center text-sm lg:text-sm xl:text-base"><i>(Capture vidéo effectué avec OBS Studio / Montage vidéo réalisé avec DaVinci Resolve)</i></h4>
      </div>
    </div> -->

    <h2 class="mt-60 ml-10 md:ml-20 lg:ml-20 xl:ml-20 font-bold text-2xl md:text-3xl lg:text-3xl xl:text-3xl">Me contacter</h2>

    <div class="flex justify-center mt-20 mb-32">
      <form class="w-full items-start justify-center max-w-sm md:max-w-lg xl:w-max-2xl xl:max-w-3xl">
        <div class="flex justify-center border-b border-Blanc py-2">
          <input class="appearance-none bg-transparent border-none w-full text-Blanc mr-3 py-1 px-2 leading-tight focus:outline-none" type="text" placeholder="Nom" aria-label="Nom" v-model="from_name">
        </div>
        <div class="flex justify-center border-b pt-16 border-Blanc py-2">
          <input class="appearance-none bg-transparent border-none w-full text-Blanc mr-3 py-1 px-2 leading-tight focus:outline-none" type="text" placeholder="Adresse mail" aria-label="Adresse mail" v-model="email_id">
        </div>
        <div class="flex justify-center border-b pt-16 border-Blanc py-2">
          <input class="appearance-none bg-transparent border-none w-full text-Blanc mr-3 py-1 px-2 leading-tight focus:outline-none" type="text" placeholder="Message" aria-label="Message" v-model="message">
        </div>
      </form>
    </div>

    <div class="my-20 mr-48 text-right">
      <button class="w-2/3 md:w-2/3 lg:w-80 xl:w-80 rounded-lg border-Blanc border-4 h-16 font-bold text-xl hover:bg-Blanc hover:text-black" @click.prevent="sendMail">Envoyer</button>
    </div>

  <Footer/>
</div>
</template>