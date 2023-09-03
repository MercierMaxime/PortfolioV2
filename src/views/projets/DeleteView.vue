<template>
  <h1 class="font-rajdhani mb-10 mt-20 border-b-2 text-center text-2xl">Suppression d'un projet</h1>

  <div class="relative mt-2 flex flex-col gap-20 px-5">
    <div class="">
      <p class="font-rajdhani w-full bg-blue-700 py-3 text-center text-white">
        Êtes-vous sur de vouloir supprimer ce projet ?
      </p>
    </div>
    <form @submit.prevent="DeleteProjet">
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div class="grid place-items-center">
          <img :src="photoActuelle" class="w-1/2" />
        </div>
        <div class="grid grid-cols-1 gap-14">
          <div class="flex h-10 overflow-hidden rounded-2xl text-black">
            <div class="font-rajdhani flex items-center justify-center border-[1px] bg-blue-700 px-5 text-white">Nom</div>
            <input class="font-rajdhani w-full border-2 bg-white p-5" placeholder="Nom du projet" v-model="Projet.nom" disabled >
          </div>

          <div class="flex h-12 overflow-hidden rounded-2xl text-black">
            <p class="font-rajdhani -mt-[9px] border-[1px] bg-blue-700 px-6 py-3 leading-5 text-white">Description</p>
            <input class="font-rajdhani w-full border-2 bg-white p-5" placeholder="Description du projet" v-model="Projet.description" disabled />
          </div>

          <div class="flex h-12 overflow-hidden rounded-2xl text-black">
            <p class="font-rajdhani -mt-[9px] border-[1px] bg-blue-700 px-6 py-3 leading-5 text-white">Description italique</p>
            <input class="font-rajdhani w-full border-2 bg-white p-5" placeholder="Description du projet" v-model="Projet.descriptionitalique" disabled />
          </div>

          <div class="flex h-12 overflow-hidden rounded-2xl text-black">
            <p class="font-rajdhani -mt-[9px] border-[1px] bg-blue-700 px-6 py-3 leading-5 text-white">Description détaillé</p>
            <input class="font-rajdhani w-full border-2 bg-white p-5" placeholder="Description du projet" v-model="Projet.description_detaille" disabled />
          </div>
        </div>
      </div>
      <div class="mt-14 grid w-full grid-cols-2 place-items-center">
        <button
          class="font-rajdhani mb-20 rounded-2xl bg-blue-700 py-2 px-5 text-white"
          type="button"
        >
          <RouterLink to="/projets">Annuler</RouterLink>
        </button>
        <button
          class="font-rajdhani mb-20 rounded-2xl bg-blue-700 py-2 px-5 text-white"
          type="submit"
        >
          Supprimer
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// Storage
import { getStorage, ref, getDownloadURL, uploadString, deleteObject } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-storage.js";

export default {
  name: "DeleteView",
  data() {
    return {
      Projet: {
        photo: null,
        nom: null, // son prénom
        description: null, // sa photo (nom du fichier)
        descriptionitalique: null, // sa photo (nom du fichier)
        description_detaille: null, // sa photo (nom du fichier)
      },

      refProjet: null,
      photoActuelle: null,
    };
  },
  mounted() {
    // Montage de la vue
    // Récupération du id passé en paramètre
    // On utilise le id passé par la route
    // via la variable système $route de la vue
    console.log("id Projet", this.$route.params.id);
    // Recherche  concerné
    this.getprojet(this.$route.params.id);
  },

  methods: {
    async getprojet(id) {
      // Obtenir Firestore
      const firestore = getFirestore();

      const docRef = doc(firestore, "Projet", id);

      this.refProjet = await getDoc(docRef);

      if (this.refProjet.exists()) {
        // Si oui on récupère ses données
        this.Projet = this.refProjet.data();
        // Mémorisation photoActuelle
        this.photoActuelle = this.Projet.photo;
      } else {
        // Sinon simple message d'erreur
        this.console.log("Projet inexistant");
      }
      // Obtenir le Storage
      const storage = getStorage();

      const spaceRef = ref(storage, "ApercuProjet/" + this.Projet.photo);
      // Récupération de l'url complète de l'image
      getDownloadURL(spaceRef)
        .then((url) => {
          // Mise à jour de l'image prévisualisée
          this.photoActuelle = url;
        })
        .catch((error) => {
          console.log("erreur downloadUrl", error);
        });
    },

    async DeleteProjet() {
      const firestore = getFirestore();

      await deleteDoc(doc(firestore, "Projet", this.$route.params.id));

      // Suppresson de l'image
      const storage = getStorage();
      // Référence du fichier de la photo
      let docRef = ref(storage, "ApercuProjet/" + this.Projet.photo);
      // Suppression du fichier
      deleteObject(docRef);

      this.$router.push("/Projets");
    },
  },
};
</script>
