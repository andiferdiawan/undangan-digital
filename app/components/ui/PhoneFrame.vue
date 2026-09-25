<template>
  <!-- Di ponsel tampil tanpa bingkai (lebar penuh); bingkai ponsel mulai layar ≥ sm -->
  <div class="relative mx-auto w-full max-w-[390px] sm:rounded-[44px] sm:bg-brand-900 sm:p-3 sm:shadow-2xl sm:shadow-brand-900/30">
    <div class="absolute left-1/2 top-3 z-40 hidden h-6 w-28 -translate-x-1/2 rounded-b-2xl bg-brand-900 sm:block" />
    <div class="relative h-[calc(100svh-9.5rem)] overflow-y-auto overflow-x-hidden rounded-2xl bg-white ring-1 ring-brand-100 [scrollbar-width:none] sm:h-[760px] sm:max-h-[calc(100vh-10rem)] sm:rounded-[34px] sm:ring-0">
      <slot />
    </div>
  </div>
</template>
