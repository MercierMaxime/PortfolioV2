<template>
  <div class="bg-black">
  <h1 class="font-lato mb-20 border-b-2 text-center text-Blanc text-2xl">{{Projet.nom}}</h1>

  <div class="relative mt-12 flex flex-col gap-20 px-5">
    <form @submit.prevent="UpdateProjet">
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div class="grid place-items-center">
          <img :src="imageData" class="w-1/4" />  
        </div>
        <div class="grid grid-cols-1 gap-14">

          <div class=" text-Blanc">
           {{Projet.description_detaille}}
            <div class="mt-10">
            {{Projet.description_detaille_2}}
            </div>
            <div class="mt-10">
            {{Projet.description_detaille_3}}
            </div>
            <div class="mt-10">
            {{Projet.description_detaille_4}}
            </div>
            <div class="mt-10">
            {{Projet.description_detaille_5}}
            </div>
            <div class="mt-10 mb-10">
            {{Projet.description_detaille_6}}
            </div>
          </div>

        </div>
      </div>

    </form>
  </div>
</div>
</template>

<script>
import {
  getFirestore, // Obtenir le Firestore
  collection, // Utiliser une collection de documents
  doc, // Obtenir un document par son id
  getDoc, // Obtenir la liste des documents d'une collection
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
  uploadString,
  deleteObject, // Permet d'uploader sur le Cloud Storage une image en Base64
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-storage.js";

export default {
  name: "UpdateView",
  data() {
    return {
      imageData: null, // Image prévisualisée
      ListeProjet: [],
      Projet: {
        photo: null,
        competenceDesign: null,
        nom: null, // son prénom
        description: null, // sa photo (nom du fichier)
        description_detaille: null, // sa photo (nom du fichier)
      },

      refProjet: null,
      imgModifiee: false,
      photoActuelle: null,
    };
  },
  mounted() {
    // Montage de la vue
    // Récupération du id passé en paramètre
    // On utilise le id passé par la route
    // via la variable système $route de la vue
    console.log("id Projet", this.$route.params.id);

    this.getProjet(this.$route.params.id);
    // Appel de la liste des pays
  },

  methods: {
    previewImage: function (event) {
      this.file = this.$refs.file.files[0];
      this.Projet.photo = this.file.name;

      this.imgModifiee = true;

      var input = event.target;
      if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = (e) => {
          this.imageData = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
      }
    },

    async getProjet(id) {
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
          this.imageData = url;
        })
        .catch((error) => {
          console.log("erreur downloadUrl", error);
        });
    },

    previewImage: function (event) {
      this.file = this.$refs.file.files[0];

      this.Projet.photo = this.file.name;
      // Si cette fonction s'exécute, c'est que l'image est modifiée
      this.imgModifiee = true;
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

  },
};
</script>
