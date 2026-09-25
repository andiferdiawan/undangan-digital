/*
 * ==========================================================
 *  DATA UNDANGAN — cukup ubah file ini untuk menyesuaikan.
 * ==========================================================
 *  Nama tamu diambil dari URL, contoh:
 *    https://domain-anda/?to=Bapak+Fulan
 */
window.WEDDING = {
  groomNick: "Ahmad",
  groomName: "Ahmad Fauzan, S.Pd.",
  groomParents: "Bapak Abdullah & Ibu Khadijah",
  groomIg: "",                // contoh: "ahmadfauzan" (kosongkan untuk menyembunyikan)

  brideNick: "Aisyah",
  brideName: "Aisyah Humaira, S.Kom.",
  brideParents: "Bapak Umar & Ibu Fatimah",
  brideIg: "",

  // Waktu dalam format ISO dengan zona waktu (+07:00 = WIB, +08:00 = WITA, +09:00 = WIT)
  akadStart: "2026-12-12T08:00:00+07:00",
  akadEnd: "2026-12-12T10:00:00+07:00",
  akadTime: "08.00 – 10.00 WIB",
  akadPlace: "Masjid Al-Ikhlas",
  akadAddress: "Jl. Contoh No. 1, Kota Anda",
  akadMaps: "https://maps.google.com/?q=Masjid+Al-Ikhlas",

  walimahStart: "2026-12-12T11:00:00+07:00",
  walimahTime: "11.00 – 14.00 WIB",
  walimahPlace: "Kediaman Mempelai Wanita",
  walimahAddress: "Jl. Contoh No. 2, Kota Anda",
  walimahMaps: "https://maps.google.com/?q=Monas+Jakarta",

  // Nomor WhatsApp penerima RSVP (format internasional tanpa +)
  whatsapp: "6281234567890",

  // Amplop digital
  gifts: [
    { bank: "Bank Syariah Indonesia", number: "1234567890", holder: "Ahmad Fauzan" },
    { bank: "Bank Muamalat", number: "0987654321", holder: "Aisyah Humaira" }
  ]
};
