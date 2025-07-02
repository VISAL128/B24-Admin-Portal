<template>
 <div class="h-full flex flex-col items-center justify-center gap-2">
    <div class="w-full h-[120px] ">
      <UCard class="w-full h-full">

      </UCard>
    </div>
   <div class="flex-1 w-full">
    <div class="w-full h-full flex flex-col sm:flex-row gap-2">
        <UCard class="h-1/3 sm:h-full">
          this is card 1
        </UCard>
        <UCard class="flex-1 h-1/3 sm:h-full">
          {{ t('go_to_login') }}
        </UCard>
    </div>

   </div>
 </div>
</template>
<script setup lang="ts">
import {useI18n} from "vue-i18n";

const { locale, t, setLocale } = useI18n();
</script>