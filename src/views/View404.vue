<script>
import Logo from "../components/icones/Logo.vue"

export default {
    name:"App",
    components: { Logo },
}
</script>
<template>
<div class="flex items-center justify-center w-full h-screen font-algerian">
  <div class="px-4 lg:py-12">
    <div class="lg:gap-4 lg:flex">
      <div
        class="flex flex-col items-center justify-center md:py-24 lg:py-32"
      >
        <h1 class="font-bold text-blue-800 text-9xl">404</h1>
        <p
          class="mb-2 text-2xl font-bold text-center text-gray-800 md:text-3xl"
        >
          <span class="text-red-500">Oops!</span> Page non trouvée
        </p>
        <p class="mb-8 text-center text-gray-500 md:text-lg">
          La page que vous recherchez n'existe pas...
        </p>
        <RouterLink to="/" class="px-6 py-2 text-sm font-semibold text-blue-700 bg-blue-100"
          >Accueil</RouterLink>
              <p class="mb-8 text-center text-gray-500 md:text-lg">
          Vous cherchiez peut-être ?
        </p>
                <RouterLink to="/histoire" class="px-6 py-2 text-sm font-semibold text-blue-700 bg-blue-100"
          >Programmation ?</RouterLink>
          <br>
                <RouterLink to="/reglement" class="px-6 py-2 text-sm font-semibold text-blue-700 bg-blue-100"
          >Artistes ?</RouterLink>
          <br>
                <RouterLink to="/jeux" class="px-6 py-2 text-sm font-semibold text-blue-700 bg-blue-100"
          >Festival ?</RouterLink>
          <br>
                <RouterLink to="/inscription" class="px-6 py-2 text-sm font-semibold text-blue-700 bg-blue-100"
          >Billetterie ?</RouterLink>
          <br>
                <RouterLink to="/contact" class="px-6 py-2 text-sm font-semibold text-blue-700 bg-blue-100"
          >Contact ?</RouterLink>
                </div>
    </div>
  </div>
</div>
</template>