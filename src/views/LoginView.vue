<template>
    <div>
        <RouterLink to="./">
        <div class=" flex justify-center  ">
            <img src="../../src/assets/Logo_petit.svg" alt="">
    </div>
        </RouterLink>
        <div class=" px-5 grid grid-cols-1 lg:grid-cols-2 gap-20 relative ">
            <div>
                <form class="grid grid-cols-[minmax(max-content,8rem)_minmax(10rem,35rem)] gap-1" @submit.prevent="onCnx">
                <fieldset class="contents">
                  <legend class="my-1 border-b-2 col-span-full text-black font-museomoderno textresponsive effet-shadowblanc pb-7">Se connecter</legend>
                  <label  class="text-black font-museomoderno textresponsive" >Email :</label>
                  <input type="email" class="rounded-sm border-2 text-black p-1"  v-model="user.email" requiblue>
                  <label  class="text-black font-museomoderno textresponsive" >Password : </label>
                  <input class="rounded-sm border-2 text-black mb-10 p-1" type="password" v-model="user.password" requiblue/>
                  
                      <button class="w-full text-center py-2 bg-blue-700 rounded-sm mt-5 text-white font-museomoderno textresponsive effet-shadowblanc p-5 " type="submit">Se Connecter</button>
                      <button class="w-full text-center py-2 bg-blue-700 rounded-sm mt-5 text-white font-museomoderno textresponsive effet-shadowblanc p-5" type="button" @click="onDcnx()">Se Déconnecter</button>
                  
                      <p class="w-full text-center py-3 bg-yellow-100 rounded-sm mt-5 text-black">{{message}}</p>

                </fieldset>
                </form>
            </div>
        
    
        </div>
         
    
    
    </div>
    
    
    </template>
    
<script>
import {emitter} from '../main.js'
import { 
    getFirestore,   // Obtenir le Firestore
    collection,     // Utiliser une collection de documents
    doc,            // Obtenir un document par son id
    getDocs,        // Obtenir la liste des documents d'une collection
    getDoc,
    addDoc,         // Ajouter un document à une collection
    updateDoc,      // Mettre à jour un document dans une collection
    deleteDoc,      // Supprimer un document d'une collection
    onSnapshot,     // Demander une liste de documents d'une collection, en les synchronisant
    query,          // Permet d'effectuer des requêtes sur Firestore
    orderBy         // Permet de demander le tri d'une requête query
    } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js'
import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword 
} from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js'
export default {
    data() {
        return {
            user: {
                login: "",
                email: "",
                password: "",
            },
            password2: "",
            message: "Vous êtes bien connecté",
            type: "password"
        };
    },
    mounted() {
        this.message = "Utilisateur pas connecté";
    },
    methods: {
        onCnx() {
            signInWithEmailAndPassword(getAuth(), this.user.email, this.user.password)
                .then((response) => {
                this.user = response.user;
                console.log("user", this.user);
                emitter.emit("connectUser", { user: this.user });
                this.message = "Bienvenue  " + this.user.email;
            })
                .catch((error) => {
                console.log("erreur connexion", error);
                this.message = "erreur d'authentification";
            });
        },
        onDcnx() {
            signOut(getAuth())
                .then(response => {
                this.message = "User non connecté";
                this.user = {
                    email: null,
                    password: null
                };
                emitter.emit("deConnectUser", { user: this.user });
            })
                .catch(error => {
                console.log("erreur deconnexion", error);
            });
        },
        onCreate() {
            if (this.user.password === this.password2) {
                createUserWithEmailAndPassword(getAuth(), this.user.email, this.user.password)
                    .then((response) => {
                    // Signed in 
                    const user = response.user;
                    // ...
                })
                    .catch((error) => {
                    console.log("erreur création", error);
                    this.message = "erreur de création";
                    // ..
                });
                this.onCnx();
                onAuthStateChanged(getAuth(), (user) => {
                    if (user) {
                        const uid = user.uid;
                        const firestore = getFirestore();
                        const dbUser = collection(firestore, "users");
                        const docRef = addDoc(dbUser, {
                            uid: uid,
                            admin: false,
                            login: this.user.login
                        });
                        console.log("document créé avec le id : ", docRef.id);
                    }
                    else {
                        console.log("user pas connecter");
                    }
                });
            }
            else {
                this.message = "password pas cohérent";
                console.log("mdp mauvais");
            }
        },
    },
    components: {  }
}
</script>

<style>
</style>