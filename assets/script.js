(function () {
  "use strict";

  var W = window.WEDDING;
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };

  var DAYS = ["Ahad", "Senin", "Selasa", "Rabu", "Kamis", "Jum'at", "Sabtu"];
  var MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli",
    "Agustus", "September", "Oktober", "November", "Desember"];

  // Format tanggal sesuai zona waktu pada string ISO (bukan zona waktu perangkat)
  function formatDate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    var d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
    return DAYS[d.getUTCDay()] + ", " + (+m[3]) + " " + MONTHS[+m[2] - 1] + " " + m[1];
  }

  // ---------- Isi data ----------
  var data = Object.assign({}, W, {
    groomInitial: W.groomNick.charAt(0),
    brideInitial: W.brideNick.charAt(0),
    akadDateText: formatDate(W.akadStart),
    walimahDateText: formatDate(W.walimahStart)
  });

  $$("[data-bind]").forEach(function (el) {
    var v = data[el.getAttribute("data-bind")];
    if (v != null) el.textContent = v;
  });

  ["groomIg", "brideIg"].forEach(function (k) {
    $$('[data-bind-href="' + k + '"]').forEach(function (el) {
      if (W[k]) {
        el.href = "https://instagram.com/" + W[k];
        el.textContent = "@" + W[k];
      } else {
        el.remove();
      }
    });
  });
  ["akadMaps", "walimahMaps"].forEach(function (k) {
    $$('[data-bind-href="' + k + '"]').forEach(function (el) { el.href = W[k]; });
  });

  document.title = "Walimatul 'Urs — " + W.groomNick + " & " + W.brideNick;

  // ---------- Nama tamu dari URL ----------
  var params = new URLSearchParams(location.search);
  var guest = (params.get("to") || params.get("kepada") || "").trim();
  if (guest) {
    $("#guestName").textContent = guest.slice(0, 80);
    $("#rsvpName").value = guest.slice(0, 60);
  }

  // ---------- Buka undangan ----------
  $("#openBtn").addEventListener("click", function () {
    document.body.classList.remove("locked");
    $("#cover").classList.add("opened");
    $("#main").removeAttribute("aria-hidden");
    $("#bottomNav").classList.add("show");
    window.scrollTo(0, 0);
  });

  // ---------- Animasi muncul ----------
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
    $$(".reveal").forEach(function (el) { io.observe(el); });
  } else {
    $$(".reveal").forEach(function (el) { el.classList.add("visible"); });
  }

  // ---------- Countdown ----------
  var target = new Date(W.akadStart).getTime();
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function tick() {
    var diff = Math.max(0, target - Date.now());
    var s = Math.floor(diff / 1000);
    $("#cd-d").textContent = pad(Math.floor(s / 86400));
    $("#cd-h").textContent = pad(Math.floor(s % 86400 / 3600));
    $("#cd-m").textContent = pad(Math.floor(s % 3600 / 60));
    $("#cd-s").textContent = pad(s % 60);
    if (diff === 0) clearInterval(timer);
  }
  var timer = setInterval(tick, 1000);
  tick();

  // ---------- Google Calendar ----------
  function gcal(iso) { return new Date(iso).toISOString().replace(/[-:]|\.\d{3}/g, ""); }
  $("#calendarBtn").href = "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    "&text=" + encodeURIComponent("Pernikahan " + W.groomNick + " & " + W.brideNick) +
    "&dates=" + gcal(W.akadStart) + "/" + gcal(W.akadEnd) +
    "&location=" + encodeURIComponent(W.akadPlace + ", " + W.akadAddress) +
    "&details=" + encodeURIComponent("Akad Nikah " + W.groomNick + " & " + W.brideNick);

  // ---------- Toast ----------
  var toastTimer;
  function toast(msg) {
    var t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 2200);
  }

  // ---------- Amplop digital ----------
  var giftList = $("#giftList");
  W.gifts.forEach(function (g) {
    var card = document.createElement("div");
    card.className = "card gift";
    card.innerHTML =
      '<p class="gift-bank"></p><p class="gift-number"></p><p class="gift-holder"></p>' +
      '<button type="button" class="btn btn-outline small">Salin Nomor</button>';
    $(".gift-bank", card).textContent = g.bank;
    $(".gift-number", card).textContent = g.number;
    $(".gift-holder", card).textContent = "a.n. " + g.holder;
    $("button", card).addEventListener("click", function () { copy(g.number); });
    giftList.appendChild(card);
  });

  function copy(text) {
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); toast("Nomor rekening disalin"); }
      catch (e) { toast("Gagal menyalin"); }
      ta.remove();
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { toast("Nomor rekening disalin"); }, fallback);
    } else {
      fallback();
    }
  }

  // ---------- RSVP via WhatsApp ----------
  $("#rsvpForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var f = e.target;
    var nama = f.nama.value.trim();
    if (!nama) {
      $("#formError").textContent = "Mohon isi nama Anda.";
      f.nama.focus();
      return;
    }
    $("#formError").textContent = "";
    var msg =
      "Assalamu'alaikum warahmatullahi wabarakatuh.\n\n" +
      "Konfirmasi kehadiran walimah " + W.groomNick + " & " + W.brideNick + ":\n" +
      "Nama: " + nama + "\n" +
      "Jumlah: " + f.jumlah.value + " orang\n" +
      "Kehadiran: " + f.hadir.value + "\n" +
      (f.ucapan.value.trim() ? "\nDoa & ucapan:\n" + f.ucapan.value.trim() + "\n" : "");
    window.open("https://wa.me/" + W.whatsapp + "?text=" + encodeURIComponent(msg), "_blank", "noopener");
  });
})();
