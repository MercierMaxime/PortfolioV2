<template>
  <h1 class="font-museomoderno mb-20 mt-10 border-b-2 text-center text-2xl">Ajout d'un Projet</h1>

  <div class="relative mt-12 mb-20 flex flex-col gap-20 px-5">
    <section class="pb-6 mx-2 md:max-w-[70%] md:m-auto lg:max-w-[50%] lg:pb-14">
    <form enctype="multipart/form-data" @submit.prevent="CreateProjet">
        <div class="grid grid-cols-1 gap-4 lg:flex lg:w-[100%] lg:justify-center">
          <div class="m-auto">
          <img class="" :src="imageData" />
        </div>
        <div class="grid grid-cols-1 gap-14">
          <div class="flex h-10 overflow-hidden rounded-2xl text-black">
            <div class="flex items-center justify-center  bg-blue-700 px-5 text-white">Nom</div>
            <input class="font-museomoderno w-full border-2 bg-white p-5" type="text" placeholder="Nom du projet" v-model="Projet.nom" required />
          </div>

          <div class="flex h-12 overflow-hidden rounded-2xl text-black">
            <p class="font-museomoderno border-[1px] bg-blue-700 px-6 py-3 text-white">Description</p>
            <input
              class="font-museomoderno w-full border-2 bg-white p-5"
              type="text"
              placeholder="Description du projet"
              v-model="Projet.description"
              required
            />
          </div>
          <div class="flex h-12 overflow-hidden rounded-2xl text-black">
            <p class="font-museomoderno border-[1px] bg-blue-700 px-6 py-3 text-white">Description</p>
            <input
              class="font-museomoderno w-full border-2 bg-white p-5"
              type="text"
              placeholder="Description du projet en italique"
              v-model="Projet.descriptionitalique"
              required
            />
          </div>

          <div class="flex h-auto overflow-hidden rounded-2xl text-black">
            <p class="font-museomoderno border-[1px] bg-blue-700 px-6 py-3 text-white">Description détaillé</p>
            <textarea
              class="font-museomoderno w-full border-2 bg-white p-5"
              type="text"
              placeholder="Description du projet"
              v-model="Projet.description_detaille"
              required
            />
          </div>

          <div class="flex h-10 overflow-hidden rounded-sm text-black">
            <div class="font-museomoderno flex items-center justify-center border-[1px] bg-blue-700 px-5 text-white">Logo</div>
            <div class="custom-file">
              <input type="file" class="custom-file-input" ref="file" id="file" @change="previewImage" />
              <label class="custom-file-label" for="file">Sélectionner l'image</label>
            </div>
          </div>
        </div>
      </div>
      <div class="mt-16 flex w-full justify-center gap-5">
        <button
          class="font-rajdhani mb-20 rounded-2xl bg-blue-600 py-2 px-5 text-white"
          type="submit"
        >
          Ajouter
      </button>
        <button
          class="font-rajdhani mb-20 rounded-2xl bg-blue-600 py-2 px-5 text-white"
          type="button"
        >
          <RouterLink to="/">Annuler</RouterLink>
        </button>
      </div>
    </form>
  </section>
  </div>
</template>

<script>
import {
  getFirestore, // Obtenir le Firestore
  collection, // Utiliser une collection de documents
  doc, // Obtenir un document par son id
  getDocs, // Obtenir la liste des documents d'une collection
  addDoc, // Ajouter un document à une collection
  updateDoc, // Mettre à jour un document dans une collection
  deleteDoc, // Supprimer un document d'une collection
  onSnapshot, // Demander une liste de documents d'une collection, en les synchronisant
  query, // Permet d'effectuer des requêtes sur Firestore
  orderBy, // Permet de demander le tri d'une requête query
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// Cloud Storage : import des fonctions
import {
  getStorage, // Obtenir le Cloud Storage
  ref, // Pour créer une référence à un fichier à uploader
  getDownloadURL, // Permet de récupérer l'adress complète d'un fichier du Storage
  uploadString, // Permet d'uploader sur le Cloud Storage une image en Base64
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-storage.js";

export default {
  name: "CreateView",
  data() {
    return {
      imageData: null, // Image prévisualisée
      ListeProjet: [],
      Projet: {
        photo: null,
        nom: null, // son prénom
        description: null, // sa photo (nom du fichier)
        descriptionitalique: null, // sa photo (nom du fichier)
        description_detaille: null, // sa photo (nom du fichier)
      },
    };
  },
  mounted() {
    // Montage de la vue
    // Appel de la liste des pays
    this.getProjet();
  },
  methods: {
    async getProjet() {
      // Obtenir Firestore
      const firestore = getFirestore();

      const dbProjet = collection(firestore, "Projet");

      // query permet de faire une requête sur Firebase
      // notement pour filtrer, trier ... des données
      //orderBy permet de préciser sur quel élément trier, et dans quel ordre
      // ici le nom du pays par ordre croissant (asc)
      const q = query(dbProjet, orderBy("nom", "asc"));
      // Récupération de la liste des pays à partir de la query
      // La liste est synchronisée
      await onSnapshot(q, (snapshot) => {
        this.ListeProjet = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        console.log("Liste des Projet", this.ListeProjet);
      });
    },

    previewImage: function (event) {
      this.file = this.$refs.file.files[0];

      this.Projet.photo = this.file.name;
      // Reference to the DOM input element
      // Reference du fichier à prévisualiser
      var input = event.target;
      // On s'assure que l'on a au moins un fichier à lire
      if (input.files && input.files[0]) {
        // Creation d'un filereader
        // Pour lire l'image et la convertir en base 64
        var reader = new FileReader();
        // fonction callback appellée lors que le fichier a été chargé
        reader.onload = (e) => {
          // Read image as base64 and set to imageData
          // lecture du fichier pour mettre à jour
          // la prévisualisation
          this.imageData = e.target.result;
        };
        // Demarrage du reader pour la transformer en data URL (format base 64)
        reader.readAsDataURL(input.files[0]);
      }
    },

    async CreateProjet() {
      // Obtenir storage Firebase
      const storage = getStorage();
      // Référence de l'image à uploader
      const refStorage = ref(storage, "ApercuProjet/" + this.Projet.photo);
      // Upload de l'image sur le Cloud Storage
      await uploadString(refStorage, this.imageData, "data_url").then((snapshot) => {
        console.log("Uploaded a base64 string");

        const db = getFirestore();
        const docRef = addDoc(collection(db, "Projet"), this.Projet);
      });

      this.$router.push("/");
    },
  },
};
</script>
