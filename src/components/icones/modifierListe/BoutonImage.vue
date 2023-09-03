<template>
    <button class="bg-red-800 text-white font-algerian font-bold w-1/2 text-center">{{ Nom }}</button> 
</template>
<script>
export default{
    props : {
        Nom: String,
    }
};
</script>